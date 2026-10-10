'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, Shield, CheckCircle2, Clock, Sparkles, Lock,
  Share2, Download, ExternalLink, Copy, Check, Eye,
  TrendingUp, BarChart3, Briefcase, UserCheck, AlertCircle, FileText,
  Crown, Compass, Target, UploadCloud, Plus, X, XCircle, FileCheck
} from 'lucide-react';
import Link from 'next/link';
import { TRAIT_META, Trait, formatShortCareer, CAREER_PROFILES, findCareerProfile } from '@/data/gaplessData';

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

export interface AssessmentInfo {
  id: string;
  quizType: string;
  careerSlug: string | null;
  careerTitle: string;
  dominantTrait?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CertificateData {
  id: string;
  judul: string;
  penyelenggara: string;
  tanggalTerbit: string;
  kategoriSkill: string | null;
  sumber?: string;
  catatanTambahan?: string | null;
  fileMimeType: string;
  fileSize: number;
  status: string;
  adminNote: string | null;
  readinessBoostApplied: number;
  source: string;
  createdAt: string | Date;
}

interface Props {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  targetRole: string;
  assessments?: AssessmentInfo[];
  hardSkillScore: number;
  softSkillScore: number;
  completedMissions: MissionProgressItem[];
  userActivities: ActivityEvidenceItem[];
  certificates?: CertificateData[];
  snapshots: SnapshotItem[];
  publicProfile: PublicProfile | null;
  isPro: boolean;
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
  assessments = [],
  hardSkillScore,
  softSkillScore,
  completedMissions,
  userActivities,
  certificates: initialCertificates = [],
  snapshots,
  publicProfile: initialPublicProfile,
  isPro,
}: Props) {
  const [profile, setProfile] = useState<PublicProfile | null>(initialPublicProfile);
  const [isTogglingLink, setIsTogglingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments.find(a => a.isActive)?.id || assessments[0]?.id || ''
  );

  // State untuk Sertifikat & Portofolio
  const [certs, setCerts] = useState<CertificateData[]>(initialCertificates);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formJudul, setFormJudul] = useState('');
  const [formPenyelenggara, setFormPenyelenggara] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formSkill, setFormSkill] = useState('');
  const [formSumber, setFormSumber] = useState('Kegiatan di Gapless');
  const [formCatatan, setFormCatatan] = useState('');
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentAssessment = assessments.find(a => a.id === selectedAssessmentId) || assessments[0];
  const traitMeta = currentAssessment?.dominantTrait && (currentAssessment.dominantTrait in TRAIT_META)
    ? TRAIT_META[currentAssessment.dominantTrait as Trait]
    : null;

  const careerProfile = findCareerProfile(currentAssessment?.careerSlug || currentAssessment?.careerTitle);
  const availableSkills = careerProfile?.skills.map((s) => s.name) || [
    'Komunikasi', 'Problem Solving', 'Leadership', 'Teknis / Coding', 'Manajemen Proyek'
  ];

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !formJudul.trim() || !formPenyelenggara.trim() || !formTanggal) {
      setUploadError('Harap lengkapi semua bidang yang wajib diisi');
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }

    setIsSubmittingCert(true);
    setUploadError(null);

    const fd = new FormData();
    fd.append('judul', formJudul.trim());
    fd.append('penyelenggara', formPenyelenggara.trim());
    fd.append('tanggalTerbit', formTanggal);
    if (formSkill) fd.append('kategoriSkill', formSkill);
    fd.append('sumber', formSumber);
    if (formCatatan.trim()) fd.append('catatanTambahan', formCatatan.trim());
    fd.append('file', uploadFile);
    fd.append('source', 'passport');

    try {
      const res = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.certificate) {
        setCerts((prev) => [data.certificate, ...prev]);
        setIsUploadOpen(false);
        setUploadFile(null);
        setFormJudul('');
        setFormPenyelenggara('');
        setFormTanggal('');
        setFormSkill('');
        setFormSumber('Kegiatan di Gapless');
        setFormCatatan('');
      } else {
        setUploadError(data.error || 'Gagal mengunggah sertifikat');
      }
    } catch {
      setUploadError('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmittingCert(false);
    }
  };

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

        </div>

        <div className="space-y-4">
          {COMPETENCIES.map((comp) => {
            const score = comp.base;
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
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>


      </div>

      {/* SECTION: Sertifikat & Portofolio (Konversi Poin Readiness) */}
      <div id="sertifikat" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Award className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">Sertifikat & Portofolio</h2>
              {certs.filter((c) => c.status === 'Tervalidasi').length > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  +{certs.filter((c) => c.status === 'Tervalidasi').length * 3}% Readiness Didapat
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Unggah sertifikat terverifikasi untuk meningkatkan Skill Readiness kamu (+3% per sertifikat tervalidasi).
            </p>
          </div>

          <button
            onClick={() => {
              setIsUploadOpen(true);
              setUploadError(null);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Unggah Sertifikat
          </button>
        </div>

        {certs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Sertifikat yang Diunggah</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Unggah sertifikat pelatihan, lomba, atau kegiatan terverifikasi untuk menambah rekam jejak dan mendongkrak poin Skill Readiness.
              </p>
            </div>
            <button
              onClick={() => {
                setIsUploadOpen(true);
                setUploadError(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Unggah Sertifikat Pertamamu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {certs.map((cert) => {
              const isApproved = cert.status === 'Tervalidasi';
              const isRejected = cert.status === 'Ditolak';
              const isPending = cert.status === 'Menunggu Review';

              return (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRejected
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                        {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                        {cert.status}
                      </span>

                      {isApproved && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          +3% Skill Readiness
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{cert.judul}</h4>
                    <p className="text-slate-600 text-xs">Penerbit: <strong>{cert.penyelenggara}</strong></p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 flex-wrap">
                      <span>Terbit: {cert.tanggalTerbit}</span>
                      {cert.kategoriSkill && (
                        <span className="text-blue-600 font-medium">#{cert.kategoriSkill}</span>
                      )}
                    </div>

                    {cert.adminNote && (
                      <p className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200/80 mt-1.5">
                        Catatan Admin: <em>{cert.adminNote}</em>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 capitalize">
                      Sumber: {cert.sumber || (cert.source === 'kegiatan' ? 'Kegiatan di Gapless' : 'Passport')}
                    </span>
                    <a
                      href={`/api/certificates/${cert.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 text-[11px] font-medium"
                    >
                      Buka Dokumen
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portofolio Bukti & Kejujuran Klaim */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rekam Jejak Misi & Kegiatan</h2>
            <p className="text-xs text-slate-500">
              Pencapaian misi soft skill dan partisipasi kegiatan terverifikasi.
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
                    Dinilai Lewat Misi (+1% Readiness)
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
              <p className="text-xs">Belum ada rekam jejak kegiatan atau misi yang tercatat.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selesaikan misi soft skill untuk membangun Skill Passport kamu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL UPLOAD SERTIFIKAT */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Award className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Unggah Sertifikat & Portofolio</h3>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadCertificate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Sertifikat / Portofolio <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sertifikat Juara 1 UI/UX Design Hackathon 2025"
                    value={formJudul}
                    onChange={(e) => setFormJudul(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penyelenggara / Penerbit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kementerian Kominfo / Dicoding / BEM UI"
                    value={formPenyelenggara}
                    onChange={(e) => setFormPenyelenggara(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Terbit <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kategori Skill Relevan
                    </label>
                    <select
                      value={formSkill}
                      onChange={(e) => setFormSkill(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                    >
                      <option value="">Pilih kategori skill...</option>
                      {availableSkills.map((sk) => (
                        <option key={sk} value={sk}>
                          {sk}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sumber / Asal Sertifikat <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSumber}
                    onChange={(e) => setFormSumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                  >
                    <option value="Kegiatan di Gapless">Kegiatan di Gapless</option>
                    <option value="Kursus Eksternal">Kursus Eksternal</option>
                    <option value="Organisasi">Organisasi</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Juara 1 Nasional / Sertifikat kompetensi dengan predikat A"
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    File Sertifikat (JPG, PNG, PDF maks 5MB) <span className="text-rose-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      required
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (f.size > 5 * 1024 * 1024) {
                            setUploadError('Ukuran file melebihi 5MB');
                            setUploadFile(null);
                          } else {
                            setUploadError(null);
                            setUploadFile(f);
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-semibold py-1">
                        <FileCheck className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{uploadFile.name}</span>
                        <span className="text-slate-400 font-normal">({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-slate-500 flex flex-col items-center gap-1">
                        <UploadCloud className="w-6 h-6 text-slate-400" />
                        <span>Pilih file atau seret ke sini</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCert || !uploadFile}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50"
                  >
                    {isSubmittingCert ? 'Mengunggah...' : 'Unggah & Ajukan Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
