import { hasActivePro } from '@/lib/payment_service';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import { getEntitlements } from '@/lib/entitlements';
import { db } from '@/db';
import {
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

  // Eksekusi semua query secara PARALEL (Promise.all) untuk mengurangi latency drastis
  // Penting: Sertifikat TIDAK mengambil kolom fileData (base64 bergiga-byte) agar loading secepat kilat
  const [
    isPro,
    userAssessments,
    completedMissions,
    userActivities,
    snapshots,
    publicProfile,
    userCertificates,
  ] = await Promise.all([
    hasActivePro(session.user.id),
    db
      .select({
        id: assessmentResults.id,
        quizType: assessmentResults.quizType,
        careerSlug: assessmentResults.careerSlug,
        selectedCareer: assessmentResults.selectedCareer,
        dominantTrait: assessmentResults.dominantTrait,
        isActive: assessmentResults.isActive,
        createdAt: assessmentResults.createdAt,
      })
      .from(assessmentResults)
      .where(eq(assessmentResults.userId, session.user.id))
      .orderBy(desc(assessmentResults.createdAt)),
    db
      .select({
        progress: userMissionProgress,
        mission: softSkillMissions,
      })
      .from(userMissionProgress)
      .innerJoin(softSkillMissions, eq(userMissionProgress.missionId, softSkillMissions.id))
      .where(eq(userMissionProgress.userId, session.user.id)),
    db
      .select({
        evidence: activityEvidence,
        activity: activities,
      })
      .from(activityEvidence)
      .innerJoin(activities, eq(activityEvidence.activityId, activities.id))
      .where(eq(activityEvidence.userId, session.user.id)),
    db
      .select()
      .from(readinessSnapshots)
      .where(eq(readinessSnapshots.userId, session.user.id))
      .orderBy(desc(readinessSnapshots.snapshotDate))
      .limit(10),
    db
      .select()
      .from(publicProfiles)
      .where(eq(publicProfiles.userId, session.user.id))
      .limit(1),
    db
      .select({
        id: certificates.id,
        judul: certificates.judul,
        penyelenggara: certificates.penyelenggara,
        tanggalTerbit: certificates.tanggalTerbit,
        kategoriSkill: certificates.kategoriSkill,
        sumber: certificates.sumber,
        catatanTambahan: certificates.catatanTambahan,
        fileMimeType: certificates.fileMimeType,
        fileSize: certificates.fileSize,
        status: certificates.status,
        adminNote: certificates.adminNote,
        readinessBoostApplied: certificates.readinessBoostApplied,
        aiAnalysis: certificates.aiAnalysis,
        aiSuggestedBoost: certificates.aiSuggestedBoost,
        source: certificates.source,
        createdAt: certificates.createdAt,
      })
      .from(certificates)
      .where(eq(certificates.userId, session.user.id))
      .orderBy(desc(certificates.createdAt)),
  ]);

  const ent = getEntitlements(isPro);

  const formattedAssessments = userAssessments.map((a) => {
    const matchedProfile = a.careerSlug ? CAREER_PROFILES.find((c) => c.id === a.careerSlug) : null;
    const careerTitle = a.selectedCareer && a.selectedCareer.trim().length > 0
      ? a.selectedCareer
      : (matchedProfile?.title || (a.careerSlug ? a.careerSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'General Career'));

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

  // Hitung Skor Sederhana Deterministik
  const baseHard = formattedAssessments.length ? 70 : 50;
  const completedMissionsCount = completedMissions.filter((m) => m.progress.status === 'completed').length;
  const confirmedActivitiesCount = userActivities.filter((a) => a.evidence.status === 'confirmed').length;
  const totalCertBoost = userCertificates
    .filter((c) => c.status === 'Tervalidasi')
    .reduce((sum, c) => sum + (c.readinessBoostApplied || 3), 0);

  const softScore = Math.min(98, 60 + completedMissionsCount * 1 + confirmedActivitiesCount * 2 + totalCertBoost);
  const hardScore = Math.min(95, baseHard + completedMissionsCount * 1 + totalCertBoost);

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
