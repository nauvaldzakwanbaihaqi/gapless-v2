'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award, Shield, CheckCircle2, Clock, Sparkles, Lock,
  Share2, Download, ExternalLink, Copy, Check, Eye,
  TrendingUp, BarChart3, Briefcase, UserCheck, AlertCircle, FileText
} from 'lucide-react';
import Link from 'next/link';

interface MissionProgressItem {
  progress: {
    id: string;
    missionId: string;
    status: string;
    submissionUrl?: string | null;
    notes?: string | null;
    evidenceType?: string;
    completedAt?: Date | string | null;
  };
  mission: {
    id: string;
    title: string;
    competency: string;
    difficultyLevel?: string | null;
    difficulty?: string;
  };
}

interface ActivityEvidenceItem {
  evidence: {
    id: string;
    activityId: string;
    evidenceUrl: string;
    status: string;
    confirmedAt: Date | string | null;
  };
  activity: {
    id: string;
    title: string;
    type: string;
  };
}

interface SnapshotItem {
  id: string;
  snapshotDate: string;
  hardSkillScore: number | null;
  softSkillScore: number | null;
}

interface PublicProfile {
  id: string;
  publicToken: string;
  enabled: boolean;
}

interface Props {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  targetRole: string;
  hardSkillScore: number;
  softSkillScore: number;
  completedMissions: MissionProgressItem[];
  userActivities: ActivityEvidenceItem[];
  snapshots: SnapshotItem[];
  publicProfile: PublicProfile | null;
  isPlus: boolean;
}

const COMPETENCIES = [
  { id: 'komunikasi', name: 'Komunikasi & Negosiasi', base: 75, desc: 'Kemampuan menyampaikan ide, persuasi, dan mendengar aktif.' },
  { id: 'kerjasama', name: 'Kerjasama & Kolaborasi', base: 82, desc: 'Bekerja efektif dalam tim lintas fungsi dan resolusi konflik.' },
  { id: 'integritas', name: 'Integritas & Etika Kerja', base: 90, desc: 'Konsistensi moral, kejujuran data, dan komitmen profesional.' },
  { id: 'keandalan', name: 'Keandalan & Tanggung Jawab', base: 80, desc: 'Ketepatan deadline dan kepemilikan hasil kerja.' },
  { id: 'adaptabilitas', name: 'Adaptabilitas & Ketahanan', base: 72, desc: 'Kelincahan belajar hal baru dan merespons perubahan situasi.' },
];

export function PassportClient({
  user,
  targetRole,
  hardSkillScore,
  softSkillScore,
  completedMissions,
  userActivities,
  snapshots,
  publicProfile: initialPublicProfile,
  isPlus,
}: Props) {
  const [profile, setProfile] = useState<PublicProfile | null>(initialPublicProfile);
  const [isTogglingLink, setIsTogglingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTogglePublicLink = async () => {
    setIsTogglingLink(true);
    try {
      const res = await fetch('/api/passport/profile-link', {
        method: profile?.enabled ? 'DELETE' : 'POST',
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error('Failed to toggle public profile', e);
    } finally {
      setIsTogglingLink(false);
    }
  };

  const copyPublicUrl = () => {
    if (!profile?.publicToken) return;
    const url = `${window.location.origin}/p/${profile.publicToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Passport */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</h1>
                <span className="p-1 rounded-md bg-blue-50 text-blue-600" title="Terverifikasi Gapless">
                  <Shield className="w-4 h-4" />
                </span>
                {isPlus ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                    PLUS
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Target Karier: <span className="font-semibold text-slate-800">{targetRole}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
            {/* Share Public Link */}
            <button
              onClick={handleTogglePublicLink}
              disabled={isTogglingLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
                profile?.enabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              {profile?.enabled ? 'Tautan Aktif (Publik)' : 'Bagikan Tautan Profil'}
            </button>

            {/* Export CV (Disabled + Segera Hadir) */}
            <div className="relative group">
              <button
                disabled
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CV
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-medium ml-1">
                  Segera hadir
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Public URL Box if Enabled */}
        {profile?.enabled && (
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 overflow-hidden text-ellipsis">
              <Eye className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono text-[11px] text-slate-700 truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/p/${profile.publicToken}` : `/p/${profile.publicToken}`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyPublicUrl}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-[11px] font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Tersalin!' : 'Salin Tautan'}
              </button>
              <Link
                href={`/p/${profile.publicToken}`}
                target="_blank"
                className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-1 text-[11px] font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                Lihat Tampilan
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2 Readiness Score Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hard Skill Readiness */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hard Skill Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{hardSkillScore}%</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Siap Industri
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Berdasarkan penyelesaian modul terkurasi & kurikulum standar industri.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-blue-600 bg-blue-50 text-sm">
            {hardSkillScore}%
          </div>
        </div>

        {/* Soft Skill Readiness */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Soft Skill Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{softSkillScore}%</span>
              <span className="text-xs font-medium text-indigo-600 flex items-center">
                <UserCheck className="w-3 h-3 mr-0.5" /> 5 Kompetensi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Berdasarkan misi terselesaikan & bukti kegiatan terkonfirmasi.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 bg-indigo-50 text-sm">
            {softSkillScore}%
          </div>
        </div>
      </div>

      {/* 5 Kompetensi Soft Skill Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rincian 5 Kompetensi Soft Skill</h2>
            <p className="text-xs text-slate-500">Standar kompetensi kerja O*NET & industri terapan.</p>
          </div>
          {!isPlus && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Ringkasan (Plus untuk detail)
            </span>
          )}
        </div>

        <div className="space-y-4">
          {COMPETENCIES.map((comp) => {
            const score = isPlus ? comp.base : Math.round(comp.base * 0.9);
            return (
              <div key={comp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{comp.name}</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">— {comp.desc}</span>
                  </div>
                  <span className="font-bold text-slate-900">{score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {!isPlus && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-600 mb-2">
              Ingin melihat laporan analisis mendalam & saran perbaikan spesifik per kompetensi?
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Sparkles className="w-3 h-3" />
              Buka Analisis Lengkap di Plus
            </Link>
          </div>
        )}
      </div>

      {/* Portofolio Bukti & Kejujuran Klaim */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Portofolio Bukti & Rekam Jejak</h2>
            <p className="text-xs text-slate-500">
              Setiap pencapaian diverifikasi dengan label kejujuran klaim transparan.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Kegiatan Terkonfirmasi */}
          {userActivities.map(({ evidence, activity }) => (
            <div
              key={evidence.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">{activity.title}</span>
                  <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                    {activity.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Dikonfirmasi Penyelenggara
                  </span>
                </div>
              </div>
              <a
                href={evidence.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-xs font-medium"
              >
                Lihat Bukti
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}

          {/* Misi Soft Skill */}
          {completedMissions.map(({ progress, mission }) => (
            <div
              key={progress.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">{mission.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium capitalize">
                    {mission.competency}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    <Shield className="w-3 h-3 text-blue-600" />
                    Dinilai Lewat Misi
                  </span>
                </div>
              </div>
              {progress.submissionUrl ? (
                <a
                  href={progress.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-xs font-medium"
                >
                  Tautan Hasil
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] text-slate-500 italic">Terselesaikan</span>
              )}
            </div>
          ))}

          {userActivities.length === 0 && completedMissions.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">Belum ada bukti kegiatan atau misi yang tercatat.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selesaikan misi soft skill atau kirim bukti kegiatan untuk membangun Skill Passport kamu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
