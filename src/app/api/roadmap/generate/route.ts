import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aiRoadmaps, assessmentResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { CAREER_PROFILES, findCareerProfile } from '@/data/gaplessData';
import { auth } from '@/auth';
import { z } from 'zod';
import { hasActivePro } from '@/lib/payment_service';

const RequestSchema = z.object({
  assessmentId: z.string().min(1, 'Missing assessmentId'),
});

function redactRoadmap(roadmap: any[]) {
  if (!Array.isArray(roadmap)) return roadmap;
  return roadmap.map((phase, idx) => {
    if (idx >= 2) {
      return {
        ...phase,
        title: `Fase ${idx + 1} (Khusus Gapless Pro)`,
        subtitle: 'Materi lanjutan & kurikulum industri terapan.',
        description: 'Upgrade ke Gapless Pro untuk membuka fase kurikulum lanjutan ini.',
        modules: phase.modules.map((_: any, i: number) => `Materi Khusus Pro ${i + 1}`),
      };
    }
    return phase;
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isPro = await hasActivePro(session.user.id);

    const rawBody = await req.json();
    const validationResult = RequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Bad Request', details: validationResult.error.format() }, { status: 400 });
    }

    const { assessmentId } = validationResult.data;

    // 1. Dapatkan assessment dan career pilihan user
    const assessment = await db.query.assessmentResults.findFirst({
      where: and(
        eq(assessmentResults.id, assessmentId),
        eq(assessmentResults.userId, session.user.id)
      )
    });

    if (!assessment || !assessment.selectedCareer) {
      return NextResponse.json({ error: 'Assessment not found or career not selected' }, { status: 404 });
    }

    const careerName = assessment.selectedCareer;
    const slug = assessment.careerSlug || careerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 2. Ambil kurikulum paten terstandarisasi dari CAREER_PROFILES (4 fase dari Mudah ke Ekspert)
    const profile = findCareerProfile(slug) || findCareerProfile(careerName) || CAREER_PROFILES[0];
    const standardizedRoadmap = profile.roadmap;

    // 3. Simpan/sinkronkan ke cache database (ai_roadmaps) secara deterministik
    try {
      await db.insert(aiRoadmaps).values({
        careerSlug: slug,
        careerName: careerName,
        roadmapData: standardizedRoadmap,
        onetData: { status: 'standardized_curriculum', sequence: 'mudah_to_ekspert' },
      }).onConflictDoUpdate({
        target: aiRoadmaps.careerSlug,
        set: {
          roadmapData: standardizedRoadmap,
          careerName: careerName,
          onetData: { status: 'standardized_curriculum', sequence: 'mudah_to_ekspert' },
        }
      });
    } catch (dbErr) {
      console.warn('[ROADMAP CACHE] Info on insert/update:', dbErr);
    }

    let finalRoadmap = standardizedRoadmap;
    if (!isPro) {
      finalRoadmap = redactRoadmap(standardizedRoadmap);
    }

    return NextResponse.json({
      success: true,
      source: 'standardized-curriculum',
      careerSlug: slug,
      careerName: careerName,
      roadmap: finalRoadmap
    });

  } catch (error) {
    console.error('Roadmap Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
