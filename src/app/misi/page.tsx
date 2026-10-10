import { hasActivePro } from '@/lib/payment_service';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import { getEntitlements } from '@/lib/entitlements';
import { db } from '@/db';
import { softSkillMissions, userMissionProgress, missionFeedbacks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { MisiClient } from './MisiClient';

export const metadata = { title: 'Misi Soft Skill | Gapless' };

export default async function MisiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=/misi');

  // Jalankan query secara paralel via Promise.all
  const [isPro, allMissions, progressRows, userFeedbacks] = await Promise.all([
    hasActivePro(session.user.id),
    db
      .select({
        id: softSkillMissions.id,
        title: softSkillMissions.title,
        competency: softSkillMissions.competency,
        description: softSkillMissions.description,
        estimatedMinutes: softSkillMissions.estimatedMinutes,
        difficultyLevel: softSkillMissions.difficultyLevel,
        difficultyOrder: softSkillMissions.difficultyOrder,
        isSample: softSkillMissions.isSample,
      })
      .from(softSkillMissions)
      .where(eq(softSkillMissions.isActive, true))
      .orderBy(
        asc(softSkillMissions.competency),
        asc(softSkillMissions.difficultyOrder),
        asc(softSkillMissions.sortOrder)
      ),
    db
      .select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.userId, session.user.id)),
    db
      .select()
      .from(missionFeedbacks)
      .where(eq(missionFeedbacks.userId, session.user.id)),
  ]);

  const ent = getEntitlements(isPro);

  const progressMap = Object.fromEntries(
    progressRows.map((p) => [p.missionId, p])
  );

  const feedbackMap = Object.fromEntries(
    userFeedbacks.map((f) => [f.missionId, f.aiFeedback])
  );

  // Gating per grup kompetensi:
  // - Misi ke-1 (Mudah): Terbuka untuk semua (Free & Pro)
  // - Misi ke-2 dan seterusnya: Terkunci untuk Free, terbuka untuk Pro
  const seenPerComp: Record<string, number> = {};
  const processedMissions = allMissions.map((m) => {
    const count = seenPerComp[m.competency] || 0;
    seenPerComp[m.competency] = count + 1;
    const isLocked = !isPro && count >= 1;

    return {
      id: m.id,
      title: m.title,
      competency: m.competency,
      description: isLocked ? null : m.description,
      estimatedMinutes: m.estimatedMinutes,
      difficultyLevel: m.difficultyLevel,
      difficultyOrder: m.difficultyOrder,
      isSample: m.isSample,
      isLocked,
    };
  });

  const lockedCount = processedMissions.filter((m) => m.isLocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Navbar />
      <LearningTabsNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-8">
        <MisiClient
          missions={processedMissions}
          progressMap={progressMap}
          feedbackMap={feedbackMap}
          isPro={isPro}
          lockedCount={lockedCount}
          entitlements={{
            isPro,
            canSeeCompetencyBars: ent.missions.canSeeCompetencyBars,
            canSeeSuggestions: ent.missions.canSeeFeedback,
          }}
          showSampleLabel={true}
        />
      </main>
    </div>
  );
}
