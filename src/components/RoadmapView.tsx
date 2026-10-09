'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronDown, RotateCcw, Lock, Home, Sparkles } from 'lucide-react';
import { useGaplessContext } from '@/contexts/CareerContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';

import Link from 'next/link';
import type { CareerProfile } from '@/data/gaplessData';
import type { RoadmapNode } from '@/contexts/CareerContext';


import { SkillReadinessCard } from '@/components/SkillReadinessCard';

export interface RoadmapViewProps {
  overrideData?: {
    id?: string;
    selectedCareer: CareerProfile | null;
    roadmapWithProgress: RoadmapNode[];
    skillRatings?: Record<string, number>;
  };
  isPro?: boolean;
}

import { useRouter } from 'next/navigation';

export function RoadmapView({ overrideData, isPro: propIsPro }: RoadmapViewProps = {}) {
  const context = useGaplessContext();
  const selectedCareer = overrideData?.selectedCareer || context.selectedCareer;
  const roadmapWithProgress = overrideData?.roadmapWithProgress || context.roadmapWithProgress;
  const skillRatings = overrideData?.skillRatings || context.skillRatings || {};
  const resetProgress = context.resetProgress;
  const { session, status } = useAuthGuard();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setConfirmAction(() => async () => {
      setConfirmAction(null);
      if (overrideData?.id) {
        setIsResetting(true);
        try {
          const res = await fetch('/api/roadmap/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assessmentId: overrideData.id })
          });
          if (res.ok) {
            window.location.reload();
          } else {
            setAlertMessage('Gagal mereset progress.');
          }
        } catch {
          setAlertMessage('Terjadi kesalahan jaringan.');
        } finally {
          setIsResetting(false);
        }
      } else {
        resetProgress();
      }
    });
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleModuleClick = (mod: string, isLockedSeq: boolean) => {
    if (isLockedSeq) return;
    
    const slug = slugify(mod);
    const assessmentId = overrideData?.id || context.currentAssessmentId;
    
    if (assessmentId) {
      router.push(`/roadmap/${assessmentId}/modul/${slug}`);
    } else {
      context.setSelectedModuleSlug(slug);
      context.setView('module-detail');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!selectedCareer) return null;

  const userTier = (session?.user as { tier?: string })?.tier || 'Free';
  const isPro = Boolean(propIsPro);


  const totalModules = roadmapWithProgress.reduce(
    (sum, p) => sum + p.modules.length,
    0
  );
  const completedModules = roadmapWithProgress.reduce(
    (sum, p) => sum + p.completedModules.length,
    0
  );

  return (
    <div className="min-h-screen bg-space">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center px-5 py-2 rounded-full mb-4 bg-slate-100/80 border border-slate-200/50">
            <span className="text-sm font-semibold text-slate-700">
              Roadmap Belajar Terstruktur
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 mx-auto max-w-4xl leading-tight">
            Roadmap {selectedCareer.title}
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
            Jalur belajar personal 4 fase dengan metrik kesiapan kompetensi industri.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-8">
          {roadmapWithProgress.map((phase, phaseIdx) => {
            const isCompleted = phase.progress === 1;
            const isProLocked = !isPro && phaseIdx >= 2;
            // Prasyarat: Seluruh fase sebelumnya (fase 0 s.d. phaseIdx-1) wajib selesai 100%
            const isPrereqLocked = !isProLocked && phaseIdx > 0 && roadmapWithProgress.slice(0, phaseIdx).some(p => p.progress < 1);
            const isPhaseLocked = isProLocked || isPrereqLocked;
            const isActivePhase = !isCompleted && !isPhaseLocked && (phaseIdx === 0 || roadmapWithProgress[phaseIdx - 1].progress === 1);

            let isPreviousCompleted = !isPhaseLocked; // Hanya terbuka jika fase ini tidak terkunci

            return (
              <motion.div
                key={phase.phase || phaseIdx}
                id={`phase-card-${phaseIdx}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + phaseIdx * 0.15 }}
                className="relative scroll-mt-24"
              >
                {/* Phase Card */}
                <div
                  className={`bg-white rounded-4xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${
                    isActivePhase ? 'border-2 border-blue-600 ring-4 ring-blue-50 shadow-md' : 'border border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Pro Lock Overlay */}
                  {isProLocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs bg-white/50">
                      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md mb-4 text-white">
                          <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider mb-2 shadow-xs">
                          Khusus Gapless Pro
                        </span>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Fase {phase.phase || (phaseIdx + 1)} Terkunci</h4>
                        <p className="text-sm text-slate-600 mb-6 px-2 leading-relaxed">
                          Upgrade ke Gapless Pro untuk membuka fase kurikulum lanjutan 3 & 4 ini dan maksimalkan persiapan kariermu.
                        </p>
                        <Link href="/pricing" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg w-full">
                          Mulai Gapless Pro (Rp29.000)
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Prerequisite Sequential Lock Overlay (Beda tampilan dengan Pro) */}
                  {isPrereqLocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs bg-slate-50/40">
                      <div className="bg-white/95 backdrop-blur-md border border-amber-200/80 p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm">
                        <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center shadow-xs mb-4 text-amber-600">
                          <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider mb-2 border border-amber-200">
                          Prasyarat Belum Selesai
                        </span>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Fase {phase.phase || (phaseIdx + 1)} Terkunci</h4>
                        <p className="text-sm text-slate-600 mb-6 px-2 leading-relaxed">
                          Selesaikan seluruh modul pada <strong>Fase {phaseIdx} ({roadmapWithProgress[phaseIdx - 1]?.title || `Fase ${phaseIdx}`})</strong> terlebih dahulu untuk membuka materi pada fase ini.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const targetEl = document.getElementById(`phase-card-${phaseIdx - 1}`);
                            if (targetEl) {
                              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg w-full flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Lanjutkan Fase {phaseIdx}</span>
                          <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full font-semibold">
                            {Math.round((roadmapWithProgress[phaseIdx - 1]?.progress || 0) * 100)}%
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wide">
                          Fase {phase.phase || (phaseIdx + 1)}
                        </span>
                        <span className="text-sm font-medium text-slate-500">{phase.duration || 'Beberapa Minggu'}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{phase.title}</h3>
                      <p className="text-sm font-medium text-blue-600">{phase.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0 pt-1">
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.round(phase.progress * 100)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6 truncate max-w-3xl">
                    {phase.description}
                  </p>

                  {/* Phase Progress Bar */}
                  <div className="progress-track mb-6 h-2 bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.progress * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + phaseIdx * 0.15 }}
                      className="progress-fill h-full bg-blue-600"
                    />
                  </div>

                  {/* Modules */}
                  <div className="space-y-3">
                    {phase.modules.map((mod, modIdx) => {
                      const isModuleCompleted = phase.completedModules.includes(mod);
                      const isAvailable = !isPhaseLocked && !isModuleCompleted && isPreviousCompleted;
                      const isLockedSeq = !isModuleCompleted && !isAvailable;
                      
                      if (!isPhaseLocked) {
                        isPreviousCompleted = isModuleCompleted;
                      }

                      return (
                        <div key={mod}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + phaseIdx * 0.1 + modIdx * 0.04 }}
                          >
                            {(() => {
                              const slug = slugify(mod);
                              const assessmentId = overrideData?.id || context.currentAssessmentId;
                              const href = assessmentId ? `/roadmap/${assessmentId}/modul/${slug}` : undefined;
                              const isItemLocked = isLockedSeq || isPhaseLocked;
                              
                              const inner = (
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                  isModuleCompleted
                                    ? 'bg-blue-50/60 border-blue-100'
                                    : isAvailable
                                    ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300 cursor-pointer'
                                    : 'bg-slate-50 border-slate-100 cursor-not-allowed'
                                }`}>
                                  <div className="flex items-center gap-4">
                                    <div className="shrink-0 flex items-center justify-center">
                                      {isModuleCompleted ? (
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                          <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                      ) : isAvailable ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 ml-0.5" />
                                      ) : (
                                        <Lock className={`w-5 h-5 ${isPrereqLocked ? 'text-amber-500/70' : 'text-slate-400'}`} />
                                      )}
                                    </div>
                                    <span
                                      className={`font-semibold text-sm md:text-base ${
                                        isItemLocked ? 'text-slate-400' : 'text-slate-800'
                                      }`}
                                    >
                                      {mod}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {isModuleCompleted && (
                                      <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide">
                                        Terpenuhi
                                      </span>
                                    )}
                                    {isLockedSeq && !isPhaseLocked && (
                                      <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide">
                                        Selesaikan Modul Sebelumnya
                                      </span>
                                    )}
                                    {isPrereqLocked && !isModuleCompleted && (
                                      <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold tracking-wide border border-amber-200/50">
                                        Selesaikan Fase {phaseIdx}
                                      </span>
                                    )}
                                    
                                    <ChevronDown 
                                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                                        isItemLocked ? 'text-slate-300' : 'text-slate-500'
                                      } -rotate-90`} 
                                    />
                                  </div>
                                </div>
                              );

                              if (href && !isItemLocked) {
                                return (
                                  <Link href={href} className="block w-full">
                                    {inner}
                                  </Link>
                                );
                              }

                              return (
                                <div
                                  role={!isItemLocked ? "button" : undefined}
                                  tabIndex={!isItemLocked ? 0 : -1}
                                  onClick={() => !isItemLocked && handleModuleClick(mod, isItemLocked)}
                                  className="block w-full"
                                >
                                  {inner}
                                </div>
                              );
                            })()}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bagian Expert: Analisis Kesiapan Karier & Simulasi Proyek Industri (Tersedia di Fase 4; untuk Free ikut di bawah overlay lock) */}
                  {phaseIdx === 3 && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Tahap Expert • Evaluasi Kesiapan & Simulasi
                        </span>
                        <h4 className="text-xl font-bold text-slate-900">
                          Analisis Kesiapan & Sertifikasi Portofolio Industri
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Ukur kesiapan kompetensi riil kamu terhadap standar industri O*NET dan selesaikan simulasi studi kasus kerja untuk portofolio.
                        </p>
                      </div>

                      <SkillReadinessCard
                        career={selectedCareer}
                        skillRatings={skillRatings}
                        completedModulesCount={completedModules}
                        totalModulesCount={totalModules}
                        assessmentId={overrideData?.id || context.currentAssessmentId || undefined}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pb-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center shadow-sm relative z-30"
          >
            <Home size={18} /> Home
          </Link>
          
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center shadow-sm relative z-30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={18} className={isResetting ? "animate-spin" : ""} /> {isResetting ? "Mereset..." : "Reset Progress"}
          </button>
        </motion.div>

        {/* O*NET Attribution */}
        <div className="mt-12 text-center text-xs text-slate-400 max-w-3xl mx-auto border-t border-slate-200/50 pt-8 pb-4">
          <p>
            This page includes information from the <a href="https://www.onetcenter.org/database.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">O*NET 31.0 Database</a> by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">CC BY 4.0</a> license. O*NET® is a trademark of USDOL/ETA. Gapless has modified all or some of this information to generate personalized career roadmaps. USDOL/ETA has not approved, endorsed, or tested these modifications.
          </p>
        </div>
      </div>

      {/* MODAL RESET CONFIRMATION */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-2">Reset Progress?</h3>
              <p className="text-gray-400 mb-6 text-sm">
                Progress roadmap ini akan direset ke 0%. Hasil analisis dan riwayat tes kamu tidak akan terhapus. Lanjutkan?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Ya, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALERT MODAL */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pemberitahuan</h3>
              <p className="text-gray-400 mb-6 text-sm">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
