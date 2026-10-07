import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { auth } from '@/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { db } from '@/db';
import { aiModuleInsights, learningResources } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const RequestSchema = z.object({
  moduleName: z.string().min(1, "Module name tidak boleh kosong"),
  roleName: z.string().min(1, "Role name tidak boleh kosong"),
  moduleSlug: z.string().min(1, "Module slug tidak boleh kosong"),
  careerSlug: z.string().min(1, "Career slug tidak boleh kosong")
});

const ModuleInsightAiSchema = z.object({
  target: z.string().describe("Target kompetensi yang dicapai setelah menyelesaikan modul"),
  duration: z.string().describe("Estimasi durasi belajar, misal: 'Estimasi 2-4 Jam'"),
  breakdown: z.array(z.object({
    title: z.string().describe("Judul sub-topik"),
    description: z.string().describe("Ringkasan esensi materi")
  })).min(2),
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
    // A. Auth Guard
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Origin Check
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host');
    const isAllowedOrigin = (origin && origin.includes(host as string)) || (referer && referer.includes(host as string));
    
    if (!isAllowedOrigin && (origin || referer)) {
       return NextResponse.json({ error: 'Forbidden Origin' }, { status: 403 });
    }

    const rawBody = await req.json();
    
    // Validasi Zod
    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Bad Request', details: validationResult.error.format() }, { status: 400 });
    }

    const { moduleName, roleName, moduleSlug, careerSlug } = validationResult.data;

    // E. Cek Cache di Database
    const cachedInsight = await db.query.aiModuleInsights.findFirst({
      where: and(
        eq(aiModuleInsights.moduleSlug, moduleSlug),
        eq(aiModuleInsights.careerSlug, careerSlug)
      )
    });

    // Ambil sumber belajar statis
    const matchedResources = await fetchMatchedResources(moduleName, roleName);

    if (cachedInsight) {
      console.log(`[CACHE HIT] Mengambil module insight untuk ${moduleSlug} (${careerSlug})`);
      const insightData = cachedInsight.insightData as any;
      // Timpa sumber belajar dengan sumber statis terverifikasi terbaru
      return NextResponse.json({
        ...insightData,
        resources: matchedResources,
      });
    }

    // Rate Limit Check
    if (!checkRateLimit(session.user.id, 15, 60000)) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    console.log(`[CACHE MISS] Generating module breakdown untuk ${moduleSlug} (${careerSlug})...`);

    const prompt = `
      Anda adalah pakar kurikulum dan karier untuk profesi ${roleName}.
      Saya sedang belajar modul: "${moduleName}".
      
      Tolong buatkan detail kurikulum (target kompetensi, durasi, dan 2-3 poin breakdown materi inti).
      JANGAN sertakan link/sumber belajar eksternal (sumber belajar akan diinjeksi secara statis).
    `;

    let aiBreakdownData: any;
    try {
      if (process.env.GEMINI_API_KEY) {
        const { object } = await generateObject({
          model: google('gemini-3.6-flash'),
          schema: ModuleInsightAiSchema,
          prompt: prompt,
          temperature: 0.7,
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(8000),
        });
        aiBreakdownData = object;
      } else {
        throw new Error('GEMINI_API_KEY not configured');
      }
    } catch (geminiErr: any) {
      console.warn(`[MODULE INSIGHT FALLBACK] Menggunakan kurikulum standar untuk ${moduleName}...`);
      aiBreakdownData = {
        target: `Menguasai konsep esensial dan penerapan praktis dari ${moduleName} untuk peran ${roleName}.`,
        duration: 'Estimasi 2-4 Jam',
        breakdown: [
          {
            title: `Konsep Dasar ${moduleName}`,
            description: `Mempelajari fondasi teoritis dan prinsip inti yang mendasari ${moduleName}.`
          },
          {
            title: `Implementasi Praktis`,
            description: `Latihan studi kasus langsung dan implementasi teknik ${moduleName} di industri.`
          }
        ]
      };
    }

    const fullResult = {
      ...aiBreakdownData,
      resources: matchedResources,
    };

    // Simpan ke Cache
    try {
      await db.insert(aiModuleInsights).values({
        moduleSlug,
        careerSlug,
        insightData: fullResult,
      }).onConflictDoNothing();
      console.log(`[CACHE SET] Sukses menyimpan module insight untuk ${moduleSlug}`);
    } catch (dbErr) {
      console.error('[CACHE ERROR] Gagal menyimpan module insight ke database:', dbErr);
    }

    return NextResponse.json(fullResult);
  } catch (error) {
    console.error('Failed to generate module insight:', error);
    return NextResponse.json({ error: 'Failed to generate module insight' }, { status: 500 });
  }
}
