'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Share2, Download, ExternalLink, Copy, Check, Eye,
  TrendingUp, Briefcase, UserCheck, Crown, Compass, Target
} from 'lucide-react';
import { TRAIT_META, Trait, formatShortCareer } from '@/data/gaplessData';
import {
  PassportProps,
  CertificateData,
  PublicProfile,
  AssessmentInfo,
  MissionProgressItem,
  ActivityEvidenceItem,
  SnapshotItem
} from './types';
import { SoftSkillCompetencies } from './components/SoftSkillCompetencies';
import { CertificatesSection } from './components/CertificatesSection';
import { ActivityTrackSection } from './components/ActivityTrackSection';
import { CertificateUploadModal } from './components/CertificateUploadModal';

export type {
  PassportProps,
  CertificateData,
  PublicProfile,
  AssessmentInfo,
  MissionProgressItem,
  ActivityEvidenceItem,
  SnapshotItem
};

export function PassportClient({
  user,
  targetRole,
  assessments = [],
  hardSkillScore,
  softSkillScore,
  completedMissions,
  userActivities,
  certificates: initialCertificates = [],
  publicProfile: initialPublicProfile,
  isPro,
}: PassportProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(initialPublicProfile);
  const [isTogglingLink, setIsTogglingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments.find((a) => a.isActive)?.id || assessments[0]?.id || ''
  );

  // State untuk Sertifikat & Portofolio
  const [certs, setCerts] = useState<CertificateData[]>(initialCertificates);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const currentAssessment = assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];
  const traitMeta = currentAssessment?.dominantTrait && (currentAssessment.dominantTrait in TRAIT_META)
    ? TRAIT_META[currentAssessment.dominantTrait as Trait]
    : null;

  // Perhitungan skor dinamis real-time saat sertifikat baru tervalidasi AI
  const initialCertBoost = initialCertificates
    .filter((c) => c.status === 'Tervalidasi')
    .reduce((sum, c) => sum + (c.readinessBoostApplied || 3), 0);
  const currentCertBoost = certs
    .filter((c) => c.status === 'Tervalidasi')
    .reduce((sum, c) => sum + (c.readinessBoostApplied || 3), 0);
  const certBoostDiff = currentCertBoost - initialCertBoost;

  const currentHardScore = Math.min(95, hardSkillScore + certBoostDiff);
  const currentSoftScore = Math.min(98, softSkillScore + certBoostDiff);

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

  const handleCertificateAdded = (newCert: CertificateData) => {
    setCerts((prev) => [newCert, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Passport */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-linear-to-br from-blue-100/50 to-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md border-2 border-white ring-1 ring-slate-200/80 shrink-0 overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{user.name}</h1>
                <span className="p-1 rounded-md bg-blue-50 text-blue-600" title="Terverifikasi Gapless">
                  <Shield className="w-4 h-4" />
                </span>
                {isPro ? (
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    PRO
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    FREE
                  </span>
                )}
              </div>

              {/* Badges: Jalur & Arketipe */}
              {currentAssessment ? (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {currentAssessment.quizType === 'belum_tahu_minat' ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Compass className="w-3 h-3 text-indigo-600" />
                        Jalur Eksplorasi Minat
                      </span>
                      {currentAssessment.dominantTrait && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                          Arketipe: <strong className="font-semibold text-slate-900">{currentAssessment.dominantTrait} {traitMeta?.emoji || ''}</strong>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Target className="w-3 h-3 text-blue-600" />
                      Jalur Terarah
                    </span>
                  )}
                </div>
              ) : null}

              {/* Target / Rekomendasi Karier */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 pt-0.5 flex-wrap">
                <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-500 font-medium">
                  {currentAssessment?.quizType === 'belum_tahu_minat' ? 'Rekomendasi Karier:' : 'Target Karier:'}
                </span>
                <span className="font-bold text-slate-900">
                  {currentAssessment ? currentAssessment.careerTitle : targetRole}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={handleTogglePublicLink}
              disabled={isTogglingLink}
              className={`h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                profile?.enabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{profile?.enabled ? 'Tautan Aktif (Publik)' : 'Bagikan Tautan Profil'}</span>
            </button>

            <button
              type="button"
              disabled
              className="h-10 px-4 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CV</span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                Segera hadir
              </span>
            </button>
          </div>
        </div>

        {/* Dedicated Bottom Bar: Jalur Asesmen Switcher */}
        {assessments && assessments.length > 1 && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-slate-700 text-xs">Pilih Hasil Asesmen:</span>
              <span className="text-[11px] text-slate-400">({assessments.length} tersimpan)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {assessments.map((a) => {
                const isSelected = currentAssessment?.id === a.id;
                const isExploration = a.quizType === 'belum_tahu_minat';
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAssessmentId(a.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{isExploration ? '🧭' : '🎯'}</span>
                    <span>{isExploration ? 'Eksplorasi' : 'Terarah'} • {formatShortCareer(a.careerTitle)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                type="button"
                onClick={copyPublicUrl}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
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
              <span className="text-3xl font-extrabold text-slate-900">{currentHardScore}%</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Siap Industri
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Berdasarkan penyelesaian modul terkurasi & kurikulum standar industri.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-blue-600 bg-blue-50 text-sm">
            {currentHardScore}%
          </div>
        </div>

        {/* Soft Skill Readiness */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Soft Skill Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{currentSoftScore}%</span>
              <span className="text-xs font-medium text-indigo-600 flex items-center">
                <UserCheck className="w-3 h-3 mr-0.5" /> 5 Kompetensi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Berdasarkan misi terselesaikan & bukti kegiatan terkonfirmasi.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 bg-indigo-50 text-sm">
            {currentSoftScore}%
          </div>
        </div>
      </div>

      {/* 5 Kompetensi Soft Skill Breakdown */}
      <SoftSkillCompetencies />

      {/* SECTION: Sertifikat & Portofolio */}
      <CertificatesSection
        certs={certs}
        isPro={isPro}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Portofolio Bukti & Kejujuran Klaim */}
      <ActivityTrackSection
        userActivities={userActivities}
        completedMissions={completedMissions}
      />

      {/* MODAL UPLOAD SERTIFIKAT */}
      <CertificateUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleCertificateAdded}
      />
    </div>
  );
}
