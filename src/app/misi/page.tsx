import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import { getEntitlements, ENTITLEMENT_CONFIG } from '@/lib/entitlements';
import { db } from '@/db';
import { softSkillMissions, userMissionProgress } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { MisiClient } from './MisiClient';

export const metadata = { title: 'Misi Soft Skill | Gapless' };

export default async function MisiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=/misi');

  const tier = (session.user as any).tier;
  const ent = getEntitlements(tier);

  // Ambil semua misi aktif, sort by order
  const allMissions = await db
    .select()
    .from(softSkillMissions)
    .where(eq(softSkillMissions.isActive, true))
    .orderBy(asc(softSkillMissions.sortOrder));

  // Ambil progress user
  const progressRows = await db
    .select()
    .from(userMissionProgress)
    .where(eq(userMissionProgress.userId, session.user.id));

  const progressMap = Object.fromEntries(
    progressRows.map((p) => [p.missionId, p])
  );

  // Gating: Free hanya lihat N misi pertama (tanpa data misi di atas limit)
  const limit = ent.missions.limit;
  const openMissions = Number.isFinite(limit)
    ? allMissions.slice(0, limit)
    : allMissions;
  const lockedCount = allMissions.length - openMissions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Navbar />
      <LearningTabsNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pb-28 md:pb-8">
        <MisiClient
          missions={openMissions}
          progressMap={progressMap}
          lockedCount={lockedCount}
          entitlements={{
            isPlusUser: ent.isPlusUser,
            canSeeCompetencyBars: ent.missions.canSeeCompetencyBars,
            canSeeSuggestions: ent.missions.canSeeSuggestions,
          }}
          showSampleLabel={true}
        />
      </main>
    </div>
  );
}
