import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { softSkillMissions, userMissionProgress } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { hasActivePro } from '@/lib/payment_service';
import { z } from 'zod';

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

    // Misi index !== 0 (misi ke-2 dan seterusnya) hanya untuk user Pro
    if (missionIndex !== 0) {
      const isPro = await hasActivePro(session.user.id);
      if (!isPro) {
        return NextResponse.json(
          { error: 'Misi ini hanya tersedia untuk pengguna Gapless Pro' },
          { status: 403 }
        );
      }
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

    return NextResponse.json({ success: true, progress: result });
  } catch (error) {
    console.error('Mission submit error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
