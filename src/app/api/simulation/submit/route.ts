import { NextResponse } from 'next/server';
import { db } from '@/db';
import { roadmapProgress, assessmentResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { hasActivePro } from '@/lib/payment_service';
import { z } from 'zod';

const RequestSchema = z.object({
  assessmentId: z.string().min(1, 'Missing assessmentId'),
  careerSlug: z.string().min(1, 'Missing careerSlug'),
  answers: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isPro = await hasActivePro(session.user.id);
    if (!isPro) {
      return NextResponse.json({ error: 'Fitur Simulasi Kerja hanya tersedia untuk pengguna Gapless Pro' }, { status: 403 });
    }

    const rawBody = await req.json();
    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Bad Request', details: validationResult.error.format() }, { status: 400 });
    }

    const { assessmentId, careerSlug } = validationResult.data;

    // Verify assessment belongs to user
    const assessmentResult = await db.query.assessmentResults.findFirst({
      where: and(
        eq(assessmentResults.id, assessmentId),
        eq(assessmentResults.userId, session.user.id)
      )
    });

    if (!assessmentResult) {
      return NextResponse.json({ error: 'Assessment result not found' }, { status: 404 });
    }

    // Get or create roadmap progress record
    let existingProgress = await db.query.roadmapProgress.findFirst({
      where: and(
        eq(roadmapProgress.careerSlug, careerSlug),
        eq(roadmapProgress.userId, session.user.id)
      )
    });

    const currentStatuses = (existingProgress?.moduleStatuses as Record<string, boolean>) || {};
    const updatedStatuses = {
      ...currentStatuses,
      'industry-simulation': true,
      simulationCompletedAt: new Date().toISOString() as any,
    };

    if (existingProgress) {
      await db.update(roadmapProgress)
        .set({
          moduleStatuses: updatedStatuses,
          updatedAt: new Date(),
        })
        .where(eq(roadmapProgress.id, existingProgress.id));
    } else {
      await db.insert(roadmapProgress).values({
        userId: session.user.id,
        careerSlug: careerSlug,
        moduleStatuses: updatedStatuses,
      });
    }

    const certificateId = `GAP-${assessmentId.slice(0, 8).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      certificateId,
      completedAt: new Date().toISOString(),
      message: 'Simulasi industri berhasil diselesaikan! Sertifikat resmi telah diterbitkan.'
    });

  } catch (error) {
    console.error('Error submitting simulation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
