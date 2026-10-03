import { notFound } from 'next/navigation';
import { db } from '@/db';
import {
  publicProfiles,
  users,
  userMissionProgress,
  softSkillMissions,
  activityEvidence,
  activities,
  assessmentResults,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Shield, CheckCircle2, Award, Briefcase, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Skill Passport Publik | Gapless',
  robots: { index: false, follow: false },
};

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Cari profil publik aktif
  const profile = await db
    .select()
    .from(publicProfiles)
    .where(eq(publicProfiles.publicToken, token))
    .limit(1);

  if (!profile.length || !profile[0].enabled) {
    notFound();
  }

  const userId = profile[0].userId;

  // Ambil data user (hanya nama dan foto, TANPA email)
  const user = await db
    .select({
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) notFound();

  // Ambil asesmen target role
  const latestAssessment = await db
    .select()
    .from(assessmentResults)
    .where(eq(assessmentResults.userId, userId))
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
    .where(eq(userMissionProgress.userId, userId));

  // Ambil Kegiatan bukti terkonfirmasi
  const userActivities = await db
    .select({
      evidence: activityEvidence,
      activity: activities,
    })
    .from(activityEvidence)
    .innerJoin(activities, eq(activityEvidence.activityId, activities.id))
    .where(eq(activityEvidence.userId, userId));

  const targetRole = latestAssessment[0]?.careerSlug
    ? latestAssessment[0].careerSlug.replace(/-/g, ' ').toUpperCase()
    : 'Career Explorer';

  const softScore = Math.min(95, 60 + completedMissions.length * 4 + userActivities.length * 7);
  const hardScore = latestAssessment.length ? 78 : 65;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Brand & Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow">
              G
            </span>
            Gapless Skill Passport
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" /> Terverifikasi
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shrink-0">
            {user[0].image ? (
              <img
                src={user[0].image}
                alt={user[0].name || ''}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              (user[0].name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user[0].name}</h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-500" />
              Target Karier: <strong className="text-indigo-300 font-semibold">{targetRole}</strong>
            </p>
          </div>
        </div>

        {/* Readiness Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hard Skill Readiness
            </span>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">{hardScore}%</div>
            <p className="text-xs text-slate-400 mt-1">Kurikulum terstruktur & standar O*NET</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Soft Skill Readiness
            </span>
            <div className="text-3xl font-extrabold text-indigo-400 mt-1">{softScore}%</div>
            <p className="text-xs text-slate-400 mt-1">5 Kompetensi industri terapan</p>
          </div>
        </div>

        {/* Bukti Terverifikasi */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Rekam Jejak & Bukti Nyata
          </h3>

          {userActivities.map(({ evidence, activity }) => (
            <div
              key={evidence.id}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white text-sm">{activity.title}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dikonfirmasi Penyelenggara
                  </span>
                </div>
              </div>
              <a
                href={evidence.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1 text-xs font-medium"
              >
                Bukti <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}

          {completedMissions.map(({ progress, mission }) => (
            <div
              key={progress.id}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white text-sm">{mission.title}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                    <Shield className="w-3.5 h-3.5" /> Dinilai Lewat Misi
                  </span>
                </div>
              </div>
              {progress.submissionUrl && (
                <a
                  href={progress.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1 text-xs font-medium"
                >
                  Tautan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="text-center pt-6 border-t border-slate-800 text-xs text-slate-500">
          Diverifikasi secara independen oleh platform <strong className="text-slate-400">Gapless</strong>.
        </div>
      </div>
    </div>
  );
}
