import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiModuleInsights, learningResources } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { MODULE_DETAILS } from '@/data/gaplessData';

const RequestSchema = z.object({
  moduleName: z.string().min(1, "Module name tidak boleh kosong"),
  roleName: z.string().min(1, "Role name tidak boleh kosong"),
  moduleSlug: z.string().min(1, "Module slug tidak boleh kosong"),
  careerSlug: z.string().min(1, "Career slug tidak boleh kosong")
});

/**
 * Mencari sumber belajar statis terverifikasi dari database secara deterministik
 */
async function fetchMatchedResources(moduleName: string, roleName: string) {
  try {
    const allResources = await db
      .select()
      .from(learningResources)
      .where(eq(learningResources.isBroken, false))
      .orderBy(desc(learningResources.isFree), asc(learningResources.sortOrder));

    const keywords = `${moduleName} ${roleName}`.toLowerCase().split(/[^a-z0-9]+/);

    // Scoring kecocokan tag
    const scored = allResources.map((res) => {
      let score = 0;
      const tags = (res.skillTags || []).map((t) => t.toLowerCase());
      for (const kw of keywords) {
        if (!kw || kw.length < 2) continue;
        if (tags.some((t) => t.includes(kw) || kw.includes(t))) score += 3;
        if (res.title.toLowerCase().includes(kw)) score += 2;
      }
      return { res, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Ambil top 3-4 resources
    const selected = scored.filter(s => s.score > 0).slice(0, 4).map(s => s.res);
    
    if (selected.length >= 2) {
      return selected.map(r => ({
        title: r.title,
        provider: r.provider,
        type: r.type,
        isFree: r.isFree,
        url: r.url,
      }));
    }

    // Fallback kurasi default jika tag sangat spesifik
    return allResources.slice(0, 3).map(r => ({
      title: r.title,
      provider: r.provider,
      type: r.type,
      isFree: r.isFree,
      url: r.url,
    }));
  } catch (error) {
    console.error('Failed to fetch static learning resources:', error);
    return [
      {
        title: 'MDN Web Docs — Dokumentasi & Panduan Resmi',
        provider: 'MDN Web Docs',
        type: 'Dokumentasi',
        isFree: true,
        url: 'https://developer.mozilla.org/id/',
      },
      {
        title: 'freeCodeCamp — Belajar Pemrograman & Sertifikasi Gratis',
        provider: 'freeCodeCamp',
        type: 'Course',
        isFree: true,
        url: 'https://www.freecodecamp.org/learn',
      },
    ];
  }
}

export async function POST(req: Request) {
  try {
    // 1. Auth Guard
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.json();
    
    // 2. Validasi Zod
    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Bad Request', details: validationResult.error.format() }, { status: 400 });
    }

    const { moduleName, roleName, moduleSlug, careerSlug } = validationResult.data;

    // 3. Ambil sumber belajar terverifikasi dari DB secara deterministik
    const matchedResources = await fetchMatchedResources(moduleName, roleName);

    // 4. Siapkan breakdown materi paten/statis
    const manualCuration = MODULE_DETAILS[moduleSlug];

    const breakdownData = manualCuration ? {
      target: manualCuration.target,
      duration: manualCuration.duration,
      breakdown: manualCuration.breakdown,
    } : {
      target: `Menguasai konsep esensial, teknik terapan, dan standar implementasi materi "${moduleName}" untuk peran ${roleName}.`,
      duration: 'Estimasi 2–4 Jam',
      breakdown: [
        {
          title: '1. Fondasi Teori & Konsep Inti',
          description: `Mempelajari prinsip fundamental, arsitektur dasar, dan terminologi penting dari ${moduleName}.`
        },
        {
          title: '2. Implementasi Terapan & Studi Kasus',
          description: `Latihan langsung menerapkan ${moduleName} melalui skenario nyata yang relevan dengan kebutuhan industri.`
        },
        {
          title: '3. Best Practice & Standar Industri',
          description: `Mengevaluasi teknik optimasi, penanganan kendala umum, dan standar profesional saat menggunakan ${moduleName}.`
        }
      ]
    };

    const fullResult = {
      ...breakdownData,
      resources: manualCuration?.resources && manualCuration.resources.length > 0
        ? manualCuration.resources
        : matchedResources,
    };

    // 5. Simpan/sinkronkan ke cache database
    try {
      await db.insert(aiModuleInsights).values({
        moduleSlug,
        careerSlug,
        insightData: fullResult,
      }).onConflictDoNothing();
    } catch (dbErr) {
      // Ignored if duplicate key exists
    }

    return NextResponse.json(fullResult);
  } catch (error) {
    console.error('Failed to generate module insight:', error);
    return NextResponse.json({ error: 'Failed to generate module insight' }, { status: 500 });
  }
}
