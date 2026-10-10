import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { softSkillMissions, userMissionProgress, missionFeedbacks, readinessEvents } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { hasActivePro } from '@/lib/payment_service';
import { MISSION_READINESS_BOOST } from '@/config/readiness';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const submitSchema = z.object({
  submissionText: z.string().max(4000).optional(),
  submissionUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: missionId } = await params;
    const body = await req.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.issues }, { status: 400 });
    }

    // Ambil misi untuk cek keberadaan
    const mission = await db
      .select()
      .from(softSkillMissions)
      .where(and(eq(softSkillMissions.id, missionId), eq(softSkillMissions.isActive, true)))
      .limit(1);

    if (!mission.length) {
      return NextResponse.json({ error: 'Misi tidak ditemukan' }, { status: 404 });
    }

    const currentMission = mission[0];

    // Ambil seluruh misi pada kompetensi yang sama, urutkan difficulty_order ASC
    const compMissions = await db
      .select({ id: softSkillMissions.id })
      .from(softSkillMissions)
      .where(and(
        eq(softSkillMissions.isActive, true),
        eq(softSkillMissions.competency, currentMission.competency)
      ))
      .orderBy(
        asc(softSkillMissions.difficultyOrder),
        asc(softSkillMissions.sortOrder)
      );

    const missionIndex = compMissions.findIndex((m) => m.id === missionId);
    const isPro = await hasActivePro(session.user.id);

    // Misi index !== 0 (misi ke-2 dan seterusnya) hanya untuk user Pro
    if (missionIndex !== 0 && !isPro) {
      return NextResponse.json(
        { error: 'Misi ini hanya tersedia untuk pengguna Gapless Pro' },
        { status: 403 }
      );
    }

    const userNotes = parsed.data.submissionText || parsed.data.notes || null;

    // Idempotent upsert progress
    const now = new Date();
    const existing = await db
      .select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.userId, session.user.id));

    const missionProgress = existing.find((p) => p.missionId === missionId);

    let result;
    if (missionProgress) {
      const updated = await db
        .update(userMissionProgress)
        .set({
          status: 'completed',
          submissionUrl: parsed.data.submissionUrl || missionProgress.submissionUrl,
          notes: userNotes || missionProgress.notes,
          evidenceType: 'self-report',
          completedAt: missionProgress.completedAt || now,
          updatedAt: now,
        })
        .where(eq(userMissionProgress.id, missionProgress.id))
        .returning();
      result = updated[0];
    } else {
      const inserted = await db
        .insert(userMissionProgress)
        .values({
          userId: session.user.id,
          missionId,
          status: 'completed',
          submissionUrl: parsed.data.submissionUrl || null,
          notes: userNotes,
          evidenceType: 'self-report',
          completedAt: now,
          updatedAt: now,
        })
        .returning();
      result = inserted[0];
    }

    // Catat ke readiness_events (idempotent, unique index mencegah duplicate boost)
    try {
      await db.insert(readinessEvents).values({
        userId: session.user.id,
        sourceType: 'mission',
        sourceId: missionId,
        boostAmount: MISSION_READINESS_BOOST,
      }).onConflictDoNothing();
    } catch (evtErr) {
      console.warn('Readiness event insert notice:', evtErr);
    }

    // Evaluasi AI Feedback khusus untuk pengguna Pro
    let aiFeedbackText: string | null = null;
    if (isPro) {
      // Cek apakah feedback sudah ada
      const existingFeedback = await db
        .select()
        .from(missionFeedbacks)
        .where(and(
          eq(missionFeedbacks.userId, session.user.id),
          eq(missionFeedbacks.missionId, missionId)
        ))
        .limit(1);

      if (existingFeedback.length > 0) {
        aiFeedbackText = existingFeedback[0].aiFeedback;
      } else if (userNotes && userNotes.trim().length > 0) {
        try {
          const systemPrompt = "Kamu adalah career coach. Berikan feedback singkat (maks 150 kata) atas hasil misi soft skill berikut. Fokus pada: 1 hal yang sudah baik, 1 hal yang perlu diperbaiki, 1 saran konkret. Gunakan bahasa Indonesia, nada profesional tapi ramah.";
          const userPrompt = `Judul misi: ${currentMission.title}. Kompetensi: ${currentMission.competency}.\nJawaban/hasil user: ${userNotes}`;

          let aiRes;
          try {
            aiRes = await generateText({
              model: google('gemini-3.5-flash-lite'),
              system: systemPrompt,
              prompt: userPrompt,
              abortSignal: AbortSignal.timeout(8000),
            });
          } catch {
            aiRes = await generateText({
              model: google('gemini-3.8-flash'),
              system: systemPrompt,
              prompt: userPrompt,
              abortSignal: AbortSignal.timeout(8000),
            });
          }

          aiFeedbackText = aiRes.text.trim();

          await db.insert(missionFeedbacks).values({
            userId: session.user.id,
            missionId,
            submissionText: userNotes,
            aiFeedback: aiFeedbackText,
          });
        } catch (aiErr) {
          console.error('Failed to generate mission AI feedback:', aiErr);
          aiFeedbackText = 'Refleksi kamu telah tercatat dengan baik! Terus kembangkan kompetensi ini melalui implementasi konsisten di lingkungan kerja.';
        }
      }
    }

    return NextResponse.json({
      success: true,
      progress: result,
      feedback: aiFeedbackText,
      isPro,
    });
  } catch (error) {
    console.error('Mission submit error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
