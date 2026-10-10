'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, CheckCircle2, Clock, Lock, ChevronRight,
  Zap, Users, Shield, Handshake, RefreshCw, MessageSquare,
  TrendingUp, Star, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const COMPETENCY_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}> = {
  Communication: {
    label: 'Komunikasi',
    icon: MessageSquare,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  Cooperation: {
    label: 'Kolaborasi',
    icon: Users,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  Integrity: {
    label: 'Integritas',
    icon: Shield,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  Dependability: {
    label: 'Tanggung Jawab',
    icon: Handshake,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  Adaptability: {
    label: 'Adaptabilitas',
    icon: RefreshCw,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: 'Mudah', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  medium: { label: 'Sedang', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  hard: { label: 'Menantang', color: 'text-red-600 bg-red-50 border-red-200' },
};

interface Mission {
  id: string;
  title: string;
  competency: string;
  description: string | null;
  estimatedMinutes: number | null;
  difficultyLevel: string | null;
  difficultyOrder?: number | null;
  isSample: boolean;
  isLocked?: boolean;
}

interface MissionProgress {
  status: string;
  submissionText: string | null;
  completedAt: Date | null;
}

interface MisiClientProps {
  missions: Mission[];
  progressMap: Record<string, MissionProgress>;
  lockedCount: number;
  entitlements: {
    isPro: boolean;
    canSeeCompetencyBars: boolean;
    canSeeSuggestions: boolean;
  };
  showSampleLabel: boolean;
}

// Group misi per kompetensi
function groupByCompetency(missions: Mission[]) {
  const groups: Record<string, Mission[]> = {};
  for (const m of missions) {
    if (!groups[m.competency]) groups[m.competency] = [];
    groups[m.competency].push(m);
  }
  return groups;
}

export function MisiClient({ missions, progressMap, lockedCount, entitlements, showSampleLabel }: MisiClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedMissionModal, setLockedMissionModal] = useState<Mission | null>(null);

  const groups = groupByCompetency(missions);
  const allCompetencies = Object.keys(COMPETENCY_CONFIG);

  const completedCount = missions.filter(
    (m) => !m.isLocked && (progressMap[m.id]?.status === 'completed' || submittedId === m.id)
  ).length;

  async function handleSubmit(missionId: string) {
    const targetMission = missions.find((m) => m.id === missionId);
    if (targetMission?.isLocked) return;
    if (!submissionText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/missions/${missionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionText }),
      });
      if (res.ok) {
        setSubmittedId(missionId);
        setExpandedId(null);
        setSubmissionText('');
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Misi Soft Skill
          </h1>
          <p className="text-slate-500 text-sm">
            Kembangkan kompetensi profesionalmu lewat latihan berbasis skenario nyata.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-sm">
            <span className="text-slate-500">Selesai: </span>
            <span className="font-bold text-slate-900">{completedCount}/{missions.length}</span>
          </div>
          {showSampleLabel && (
            <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium">
              Data Contoh
            </span>
          )}
        </div>
      </div>

      {/* Kompetensi Bar (Plus only) */}
      {true && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Progress per Kompetensi
          </h2>
          <div className="space-y-3">
            {allCompetencies.map((comp) => {
              const cfg = COMPETENCY_CONFIG[comp];
              const Icon = cfg.icon;
              const misiList = groups[comp] || [];
              const done = misiList.filter((m) => {
                if (m.isLocked) return false;
                const p = progressMap[m.id];
                return p?.status === 'completed' || submittedId === m.id;
              }).length;
              const pct = misiList.length > 0 ? Math.round((done / misiList.length) * 100) : 0;
              return (
                <div key={comp} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{cfg.label}</span>
                      <span className="text-slate-500">{done}/{misiList.length}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Misi per Kompetensi */}
      {allCompetencies.map((comp) => {
        const misiList = groups[comp];
        if (!misiList || misiList.length === 0) return null;
        const cfg = COMPETENCY_CONFIG[comp];
        const Icon = cfg.icon;

        return (
          <section key={comp}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <h2 className="font-bold text-slate-800 text-base">{cfg.label}</h2>
            </div>

            <div className="space-y-3">
              {misiList.map((mission) => {
                const isLocked = Boolean(mission.isLocked);
                const isCompleted = !isLocked && (progressMap[mission.id]?.status === 'completed' || submittedId === mission.id);
                const isExpanded = expandedId === mission.id;
                const diffCfg = DIFFICULTY_CONFIG[mission.difficultyLevel || 'medium'];

                return (
                  <motion.div
                    key={mission.id}
                    layout
                    className={`border rounded-2xl overflow-hidden transition-shadow ${
                      isLocked
                        ? 'bg-slate-50/70 border-slate-200/80 hover:border-indigo-300'
                        : isCompleted
                        ? 'bg-white border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-blue-200'
                    } ${isExpanded ? 'shadow-md' : 'shadow-xs'}`}
                  >
                    <button
                      onClick={() => {
                        if (isLocked) {
                          setLockedMissionModal(mission);
                        } else {
                          setExpandedId(isExpanded ? null : mission.id);
                        }
                      }}
                      className="w-full text-left p-4 flex items-start gap-3 cursor-pointer"
                      id={`mission-${mission.id}`}
                    >
                      <div className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                        isLocked
                          ? 'bg-slate-200/70 text-slate-500'
                          : isCompleted
                          ? 'bg-emerald-100'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className={`font-semibold text-sm ${
                              isLocked
                                ? 'text-slate-700'
                                : isCompleted
                                ? 'text-emerald-800'
                                : 'text-slate-900'
                            }`}>
                              {mission.title}
                              {!isLocked && isCompleted && (
                                <span className="ml-2 text-xs font-normal text-emerald-600">✓ Selesai (Diisi sendiri)</span>
                              )}
                            </p>
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md mt-1">
                                <Lock className="w-2.5 h-2.5" />
                                Tersedia di Gapless Pro
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${diffCfg.color}`}>
                              {diffCfg.label}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              {mission.estimatedMinutes} mnt
                            </span>
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && !isCompleted && !isLocked && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {mission.description}
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>
                                Jawaban ini hanya dinilai oleh kamu sendiri — akan dicatat sebagai{' '}
                                <strong>"Diisi sendiri"</strong> di Skill Passport.
                              </span>
                            </div>
                            <textarea
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              placeholder="Tulis refleksi atau jawaban kamu di sini..."
                              rows={4}
                              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setExpandedId(null)}
                                className="text-sm text-slate-500 px-4 py-2 hover:text-slate-700 cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSubmit(mission.id)}
                                disabled={!submissionText.trim() || isSubmitting}
                                id={`submit-mission-${mission.id}`}
                                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                {isSubmitting ? 'Menyimpan...' : 'Kirim Hasil'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Modal Upgrade untuk Misi Terkunci */}
      <AnimatePresence>
        {lockedMissionModal && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLockedMissionModal(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                <Lock className="w-7 h-7" />
              </div>

              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-3 inline-block">
                Fitur Eksklusif Pro
              </span>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Upgrade ke Gapless Pro untuk Mengakses Semua Misi
              </h3>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Misi <strong className="text-slate-800">"{lockedMissionModal.title}"</strong> dan misi tingkat lanjut lainnya dirancang untuk melatih kompetensi dunia kerja riil. Dapatkan akses ke seluruh paket misi bulanan & feedback AI dengan Gapless Pro.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setLockedMissionModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Nanti Saja
                </button>
                <Link
                  href="/pricing"
                  className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Mulai Pro (Rp29k)</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
