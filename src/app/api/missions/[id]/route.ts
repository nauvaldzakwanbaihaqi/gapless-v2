import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { softSkillMissions } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { hasActivePro } from '@/lib/payment_service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: missionId } = await params;

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

    // Misi index >= 1 (misi ke-2 dan seterusnya) hanya untuk user Pro
    if (missionIndex > 0) {
      const isPro = await hasActivePro(session.user.id);
      if (!isPro) {
        return NextResponse.json(
          { error: 'Misi ini hanya tersedia untuk pengguna Gapless Pro' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ mission: currentMission });
  } catch (error) {
    console.error('Error fetching mission detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
