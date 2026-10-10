import { hasActivePro } from '@/lib/payment_service';
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
  certificates,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PassportClient } from './PassportClient';
import { CAREER_PROFILES } from '@/data/gaplessData';

export const metadata = { title: 'Skill Passport | Gapless' };

export default async function PassportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=/passport');

  const isPro = await hasActivePro(session.user.id);
  const ent = getEntitlements(isPro);

  // Ambil user detail
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Ambil semua asesmen user (diurutkan terbaru)
  const userAssessments = await db
    .select()
    .from(assessmentResults)
    .where(eq(assessmentResults.userId, session.user.id))
    .orderBy(desc(assessmentResults.createdAt));

  const formattedAssessments = userAssessments.map((a) => {
    const matchedProfile = a.careerSlug ? CAREER_PROFILES.find((c) => c.id === a.careerSlug) : null;
    const careerTitle = a.selectedCareer && a.selectedCareer.trim().length > 0
      ? a.selectedCareer
      : (matchedProfile?.title || (a.careerSlug ? a.careerSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General Career'));

    return {
      id: a.id,
      quizType: a.quizType || 'belum_tahu_minat',
      careerSlug: a.careerSlug,
      careerTitle,
      dominantTrait: a.dominantTrait,
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
    };
  });

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

  // Ambil Sertifikat & Portofolio user
  const userCertificates = await db
    .select()
    .from(certificates)
    .where(eq(certificates.userId, session.user.id))
    .orderBy(desc(certificates.createdAt));

  // Hitung Skor Sederhana Deterministik
  // Hard skill baseline dari assessment atau 65% + bonus per milestone
  const baseHard = formattedAssessments.length ? 70 : 50;
  const completedMissionsCount = completedMissions.filter(m => m.progress.status === 'completed').length;
  const confirmedActivitiesCount = userActivities.filter(a => a.evidence.status === 'confirmed').length;
  const validatedCertCount = userCertificates.filter(c => c.status === 'Tervalidasi').length;

  const softScore = Math.min(98, 60 + completedMissionsCount * 1 + confirmedActivitiesCount * 2 + validatedCertCount * 3);
  const hardScore = Math.min(95, baseHard + completedMissionsCount * 1 + validatedCertCount * 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Navbar />
      <LearningTabsNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-8">
        <PassportClient
          user={{
            name: session.user.name || 'Pengguna Gapless',
            email: session.user.email || '',
            image: session.user.image || null,
          }}
          targetRole={formattedAssessments[0]?.careerTitle || 'General Career'}
          assessments={formattedAssessments}
          hardSkillScore={hardScore}
          softSkillScore={softScore}
          completedMissions={completedMissions}
          userActivities={userActivities}
          certificates={userCertificates}
          snapshots={snapshots}
          publicProfile={publicProfile[0] || null}
          isPro={ent.isPro}
        />
      </main>
    </div>
  );
}
