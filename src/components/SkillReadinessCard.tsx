'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Sparkles, 
  ArrowUpRight, 
  HelpCircle,
  RotateCcw,
  Layers,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { CareerProfile } from '@/data/gaplessData';
import { computeSkillReadiness } from '@/lib/skillReadiness';
import { getSimulationForCareer } from '@/data/industrySimulations';

interface SkillReadinessCardProps {
  career: CareerProfile;
  skillRatings: Record<string, number>;
  completedModulesCount: number;
  totalModulesCount: number;
  assessmentId?: string;
}

export function SkillReadinessCard({
  career,
  skillRatings,
  completedModulesCount,
  totalModulesCount,
  assessmentId,
}: SkillReadinessCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const simulation = getSimulationForCareer(career.title, career.id);

  const breakdown = computeSkillReadiness(career, skillRatings);
  const {
    readinessPercentage,
    skillsMet,
    skillsGap,
    statusLabel,
    statusColor,
  } = breakdown;

  const completionPercentage = totalModulesCount > 0
    ? Math.round((completedModulesCount / totalModulesCount) * 100)
    : 0;

  const isCompletionFull = completionPercentage >= 100;
  const isReadinessNotFull = readinessPercentage < 100;
  const showBgYudaGapNotice = isCompletionFull && isReadinessNotFull;

  return (
    <div className="w-full mt-3">
      {/* Main Container Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Highlight Banner */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-sky-600 px-6 py-3 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Analisis Kesiapan Karier: {career.title}</span>
          </div>
          <button
            onClick={() => setShowExplanationModal(true)}
            className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Bedanya Kesiapan vs Progres?</span>
          </button>
        </div>

        {/* Dual Metric Header */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Metric 1: Skill Readiness (Prominent 7 cols) */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                      Skill Readiness
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor.badgeBg} ${statusColor.badgeText} ${statusColor.badgeBorder}`}>
                        {statusLabel}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Penguasaan kompetensi aktual vs standar industri
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {readinessPercentage}%
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Tingkat Kesiapan</span>
                </div>
              </div>

              {/* Progress Bar for Readiness */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${readinessPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${statusColor.progressBar}`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    <strong>{skillsMet.length}</strong> dari {breakdown.totalSkills} skill memenuhi target
                  </span>
                  <span>
                    Target: <strong>100%</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2: Roadmap Completion (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg">
                      Progres Materi
                    </h3>
                    <p className="text-xs text-slate-500">
                      Modul pembelajaran yang selesai
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight">
                    {completionPercentage}%
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Selesai Dibaca</span>
                </div>
              </div>

              {/* Progress Bar for Content Completion */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    <strong>{completedModulesCount}</strong> dari {totalModulesCount} modul
                  </span>
                  <span>Kurikulum 4 Fase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Educational Notice: 100% Completion but <100% Readiness (Bg Yuda Scenario) */}
          {showBgYudaGapNotice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-slate-800 relative overflow-hidden"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-950 text-sm md:text-base mb-1">
                    Semua Modul Telah Selesai, Namun Skill Readiness Masih {readinessPercentage}%?
                  </h4>
                  <p className="text-xs md:text-sm text-amber-900/90 leading-relaxed mb-3">
                    Progres materi kurikulum kamu sudah <strong>100% Selesai</strong> karena kamu telah mempelajari seluruh materi modul. Namun, <strong>Skill Readiness ({readinessPercentage}%)</strong> menunjukkan tingkat kompetensi awal berdasarkan asesmen skill. Membuka materi adalah langkah awal; untuk menguasai kompetensi secara nyata, pastikan kamu:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs font-medium text-amber-950 mb-3">
                    <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg border border-amber-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      <span>1. Terapkan materi ke dalam <strong>proyek portofolio nyata</strong>.</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg border border-amber-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      <span>2. Lakukan <strong>asesmen ulang</strong> untuk validasi kenaikan level skill.</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      href={assessmentId ? `/hasil/${assessmentId}` : '/assessment'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors shadow-xs"
                    >
                      <span>Lihat Rincian Gap Analysis AI</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/career-test"
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tes Ulang Level Skill</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full Readiness Notice */}
          {isCompletionFull && !isReadinessNotFull && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm md:text-base mb-1">
                  🎉 Kesiapan Sempurna! Kamu Sudah Memenuhi Standar Industri
                </h4>
                <p className="text-xs md:text-sm text-emerald-800 leading-relaxed">
                  Kamu telah menyelesaikan seluruh materi belajar dan memiliki tingkat kesiapan skill 100% untuk berkarier sebagai <strong>{career.title}</strong>. Terus asah portofoliomu dan mulai lamar pekerjaan impian!
                </p>
              </div>
            </motion.div>
          )}
          {/* Virtual Job Simulation & LinkedIn Certificate Banner */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden shadow-md border border-slate-800">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center justify-center shrink-0 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                    Sertifikasi Portofolio
                  </span>
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <span>In Collaboration with</span>
                    <strong className="text-white underline decoration-amber-400/60">{simulation.companyName}</strong>
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white mb-1">
                  {simulation.simulationTitle}
                </h4>
                <p className="text-xs text-slate-300/90 leading-relaxed max-w-xl">
                  Buktikan penguasaan kompetensi kerjamu lewat studi kasus praktis dan klaim sertifikat resmi ber-badge mitra untuk profil LinkedIn kamu.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto relative z-10">
              <Link
                href={assessmentId ? `/roadmap/${assessmentId}/simulasi` : '#'}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs md:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Mulai Simulasi Kerja</span>
              </Link>
            </div>
          </div>

          {/* Skill Breakdown Toggle & Details */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900 font-bold text-xs md:text-sm py-1 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Rincian Penguasaan Skill ({skillsMet.length} Memenuhi, {skillsGap.length} Perlu Ditingkatkan)</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
                <span>{showBreakdown ? 'Sembunyikan' : 'Lihat Detail'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {/* Skills Met */}
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Memenuhi Target ({skillsMet.length})</span>
                      </div>
                      {skillsMet.length > 0 ? (
                        <div className="space-y-2.5">
                          {skillsMet.map((s) => (
                            <div key={s.name} className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-xs md:text-sm text-slate-800 truncate">{s.name}</p>
                                <p className="text-[11px] text-emerald-600 font-medium">
                                  Level Kamu: {s.currentLabel} (Target: {s.requiredLabel})
                                </p>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                Sesuai
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Belum ada skill yang mencapai level target.</p>
                      )}
                    </div>

                    {/* Skills with Gap */}
                    <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
                      <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-xs uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Perlu Ditingkatkan / Gap ({skillsGap.length})</span>
                      </div>
                      {skillsGap.length > 0 ? (
                        <div className="space-y-2.5">
                          {skillsGap.map((s) => (
                            <div key={s.name} className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-xs md:text-sm text-slate-800 truncate">{s.name}</p>
                                <p className="text-[11px] text-amber-600 font-medium">
                                  Level Kamu: {s.currentLabel} &rarr; Target: {s.requiredLabel}
                                </p>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                Gap: -{s.gap} Level
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Semua skill sudah memenuhi target industri!
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MODAL EXPLANATION: READINESS VS COMPLETION */}
      <AnimatePresence>
        {showExplanationModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Memahami Dua Metrik Progres Gapless
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mb-6 leading-relaxed">
                Di Gapless, kami memisahkan antara <strong>aktivitas belajar</strong> dengan <strong>tingkat penguasaan nyata</strong> agar kamu memiliki gambaran karier yang transparan dan akurat.
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="flex items-center gap-2 font-bold text-blue-900 text-sm mb-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>1. Skill Readiness (%) — Kesiapan Kompetensi</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dihitung dari perbandingan level skill aktualmu terhadap standar requirement industri untuk posisi <strong>{career.title}</strong>. Angka ini hanya naik jika kamu memvalidasi peningkatan kemampuan melalui evaluasi atau asesmen ulang.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm mb-1">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>2. Progres Materi Belajar (%) — Roadmap Completion</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menghitung berapa banyak modul kurikulum yang telah kamu buka dan tandai selesai. Modul yang 100% selesai berarti kamu sudah menuntaskan seluruh materi panduan belajar.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowExplanationModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
