import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import { getEntitlements } from '@/lib/entitlements';
import { db } from '@/db';
import {
  users,
  userMissionProgress,
  softSkillMissions,
  activityEvidence,
  activities,
  readinessSnapshots,
  publicProfiles,
  assessmentResults,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PassportClient } from './PassportClient';

export const metadata = { title: 'Skill Passport | Gapless' };

export default async function PassportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=/passport');

  const tier = (session.user as any).tier;
  const ent = getEntitlements(tier);

  // Ambil user detail
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Ambil asesmen terakhir untuk target career
  const latestAssessment = await db
    .select()
    .from(assessmentResults)
    .where(eq(assessmentResults.userId, session.user.id))
    .orderBy(desc(assessmentResults.createdAt))
    .limit(1);

  // Ambil Misi selesai
  const completedMissions = await db
    .select({
      progress: userMissionProgress,
      mission: softSkillMissions,
    })
    .from(userMissionProgress)
    .innerJoin(softSkillMissions, eq(userMissionProgress.missionId, softSkillMissions.id))
    .where(eq(userMissionProgress.userId, session.user.id));

  // Ambil Kegiatan bukti
  const userActivities = await db
    .select({
      evidence: activityEvidence,
      activity: activities,
    })
    .from(activityEvidence)
    .innerJoin(activities, eq(activityEvidence.activityId, activities.id))
    .where(eq(activityEvidence.userId, session.user.id));

  // Ambil Snapshot tren
  const snapshots = await db
    .select()
    .from(readinessSnapshots)
    .where(eq(readinessSnapshots.userId, session.user.id))
    .orderBy(desc(readinessSnapshots.snapshotDate))
    .limit(10);

  // Ambil status Profil Publik
  const publicProfile = await db
    .select()
    .from(publicProfiles)
    .where(eq(publicProfiles.userId, session.user.id))
    .limit(1);

  // Hitung Skor Sederhana Deterministik
  // Hard skill baseline dari assessment atau 65% + bonus per milestone
  const baseHard = latestAssessment.length ? 70 : 50;
  const completedMissionsCount = completedMissions.filter(m => m.progress.status === 'completed').length;
  const confirmedActivitiesCount = userActivities.filter(a => a.evidence.status === 'confirmed').length;

  const softScore = Math.min(95, 60 + completedMissionsCount * 4 + confirmedActivitiesCount * 7);
  const hardScore = Math.min(92, baseHard + completedMissionsCount * 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Navbar />
      <LearningTabsNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-28 md:pb-8">
        <PassportClient
          user={{
            name: session.user.name || 'Pengguna Gapless',
            email: session.user.email || '',
            image: session.user.image || null,
          }}
          targetRole={latestAssessment[0]?.careerSlug ? latestAssessment[0].careerSlug.replace(/-/g, ' ').toUpperCase() : 'General Career'}
          hardSkillScore={hardScore}
          softSkillScore={softScore}
          completedMissions={completedMissions}
          userActivities={userActivities}
          snapshots={snapshots}
          publicProfile={publicProfile[0] || null}
          isPlus={ent.isPlus}
        />
      </main>
    </div>
  );
}
