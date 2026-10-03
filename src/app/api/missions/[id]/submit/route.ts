import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { softSkillMissions, userMissionProgress } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getEntitlements } from '@/lib/entitlements';
import { z } from 'zod';

const submitSchema = z.object({
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

    const tier = (session.user as any).tier;
    const ent = getEntitlements(tier);

    // Ambil misi untuk cek kuota Free
    const mission = await db
      .select()
      .from(softSkillMissions)
      .where(eq(softSkillMissions.id, missionId))
      .limit(1);

    if (!mission.length || !mission[0].isActive) {
      return NextResponse.json({ error: 'Misi tidak ditemukan' }, { status: 404 });
    }

    // Jika Free, pastikan misi ini masuk kuota N terdepan
    if (Number.isFinite(ent.missions.limit)) {
      const allActive = await db
        .select({ id: softSkillMissions.id })
        .from(softSkillMissions)
        .where(eq(softSkillMissions.isActive, true))
        .orderBy(asc(softSkillMissions.sortOrder))
        .limit(ent.missions.limit);

      const allowedIds = new Set(allActive.map((m) => m.id));
      if (!allowedIds.has(missionId)) {
        return NextResponse.json(
          { error: 'Misi ini hanya tersedia untuk anggota Plus' },
          { status: 403 }
        );
      }
    }

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
          notes: parsed.data.notes || missionProgress.notes,
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
          notes: parsed.data.notes || null,
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
