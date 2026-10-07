import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { hasPurchased } from '@/lib/payment_service';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const RequestSchema = z.object({
  roleName: z.string().min(1, "Role name tidak boleh kosong"),
  careerSlug: z.string().optional(),
  skillGapData: z.array(z.object({
    name: z.string(),
    current: z.number().min(0).max(10),
    required: z.number().min(0).max(10)
  })).min(1, "Skill gap data tidak boleh kosong")
});

const GapInsightSchema = z.object({
  basis_penilaian: z.string().describe("Sumber data atau dasar evaluasi skill ini. Harus persis atau setara dengan kalimat: 'Berdasarkan profil role yang kamu pilih'"),
  kesesuaian: z.array(z.string()).describe("Daftar 2-4 poin ringkas skill yang sudah match atau melebihi ekspektasi"),
  kekurangan: z.array(z.string()).describe("Daftar 2-4 poin ringkas skill yang masih kurang dan menjadi area pengembangan"),
  catatan_singkat: z.string().describe("Satu kalimat motivasi/catatan ringkas yang personal berdasarkan hasil gap"),
});

export async function POST(request: Request) {
  try {
    // A. Auth Guard
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Origin Check
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    const isAllowedOrigin = (origin && origin.includes(host as string)) || (referer && referer.includes(host as string));
    
    if (!isAllowedOrigin && (origin || referer)) {
       return NextResponse.json({ error: 'Forbidden Origin' }, { status: 403 });
    }

    const rawBody = await request.json();
    
    // Validasi Zod
    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Bad Request', details: validationResult.error.format() }, { status: 400 });
    }

    const { skillGapData, roleName, careerSlug: rawSlug } = validationResult.data;
    const careerSlug = rawSlug || roleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Cek apakah user telah membeli Laporan Gap untuk career path ini
    const isPurchased = await hasPurchased(session.user.id, 'gap_report', careerSlug);

    // 🔒 GATING: Jika belum bayar, return 402 + Ringkasan Teks Gratis Saja (Tanpa Nilai Skor & Tanpa Radar Data)
    if (!isPurchased) {
      const summaryMatching = skillGapData
        .filter((s) => s.current >= s.required)
        .map((s) => s.name);
      
      const summaryDevelopment = skillGapData
        .filter((s) => s.current < s.required)
        .map((s) => s.name);

      return NextResponse.json(
        {
          isPurchased: false,
          error: 'Payment Required',
          message: 'Laporan analisis kesenjangan mendalam & grafik radar terkunci. Beli seharga Rp9.900 untuk membuka akses permanen.',
          productKey: 'gap_report',
          careerSlug,
          price: 9900,
          priceFormatted: 'Rp 9.900',
          freeSummary: {
            matchingSkills: summaryMatching,
            developmentSkills: summaryDevelopment,
          },
        },
        { status: 402 }
      );
    }

    // Rate Limit Check untuk AI Call
    if (!checkRateLimit(session.user.id, 15, 60000)) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const gapSummary = skillGapData
      .map(gap => `${gap.name}: User Level ${gap.current}, Required Level ${gap.required}`)
      .join(', ');

    const systemPrompt = `You are an expert career counselor. Analyze the user's skill levels against the required skills for the role of "${roleName}".
IMPORTANT: Write all content in Indonesian (Bahasa Indonesia).
The data is based on the selected role profile (profil role yang kamu pilih).
Create a balanced and highly personalized skill gap reasoning based exactly on the provided gap summary.
If a user is lacking in some skills, explicitly connect that to the idea that these can be developed through a structured learning roadmap.`;

    const userPrompt = `ROLE: ${roleName}
SKILL GAP DATA: ${gapSummary}

Berikan analisis terstruktur menggunakan Bahasa Indonesia yang profesional dan memotivasi.`;

    // Eksekusi AI dengan Multi-Tier Fallback
    let object;
    let engineUsed = 'gemini-3.6-flash';

    try {
      if (process.env.GEMINI_API_KEY) {
        const result = await generateObject({
          model: google('gemini-3.6-flash'),
          schema: GapInsightSchema,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.5,
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(8000),
        });
        object = result.object;
      } else {
        throw new Error('GEMINI_API_KEY missing');
      }
    } catch (primaryError: any) {
      console.warn('⚠️ Gemini 3.6 Flash terkendala, menggunakan analisis kesenjangan terstruktur...', primaryError?.message);
      
      const matching = skillGapData
        .filter(s => s.current >= s.required)
        .map(s => `Pemahaman kompetensi pada ${s.name} sudah memenuhi standar yang diharapkan.`);
      const gaps = skillGapData
        .filter(s => s.current < s.required)
        .map(s => `Perlu peningkatan pada ${s.name} (level saat ini: ${s.current} dari target ${s.required}).`);

      object = {
        basis_penilaian: 'Berdasarkan profil role yang kamu pilih',
        kesesuaian: matching.length > 0 ? matching.slice(0, 3) : [`Fondasi awal yang baik untuk memulai pemahaman peran ${roleName}.`],
        kekurangan: gaps.length > 0 ? gaps.slice(0, 3) : [`Pertajam keterampilan teknis melalui pengerjaan proyek studi kasus nyata.`],
        catatan_singkat: `Tingkatkan kompetensimu secara terarah melalui modul-modul roadmap ${roleName} yang telah dirancang.`
      };
      engineUsed = 'structured-heuristic';
    }

    return NextResponse.json({
      isPurchased: true,
      careerSlug,
      ai_engine_used: engineUsed,
      ...object
    });
  } catch (error: unknown) {
    console.error('Gap AI Analysis Error Detail:', error); 
    return NextResponse.json(
      { error: 'Gagal menghasilkan analisis AI untuk skill gap', details: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
