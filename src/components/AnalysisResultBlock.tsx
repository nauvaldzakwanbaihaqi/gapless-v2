'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Radar, Legend } from 'recharts';
import { Sparkles, CheckCircle2, AlertTriangle, Lock, FileDown, Check, ShieldCheck, ArrowRight, X, Printer } from 'lucide-react';
import { GapInsight } from '@/contexts/CareerContext';
import Link from 'next/link';

interface FreeSummary {
  matchingSkills: string[];
  developmentSkills: string[];
}

interface AnalysisResultBlockProps {
  radarData: Record<string, unknown>[];
  traitMetaColor: string;
  chartReady: boolean;
  isLoadingGapAi: boolean;
  gapInsight: GapInsight | null;
  isPurchased?: boolean;
  freeSummary?: FreeSummary | null;
  careerName?: string;
  careerSlug?: string;
  onPurchaseSuccess?: () => void;
  onNext?: () => void;
  onRetry?: () => void;
  nextLabel?: string;
  showBackHome?: boolean;
  roadmapHref?: string;
}

export function AnalysisResultBlock({
  radarData,
  traitMetaColor,
  chartReady,
  isLoadingGapAi,
  gapInsight,
  isPurchased = true,
  freeSummary,
  careerName = 'Target Karier',
  careerSlug = '',
  onPurchaseSuccess,
  onNext,
  onRetry,
  nextLabel = 'Buat Roadmap',
  showBackHome = false,
  roadmapHref,
}: AnalysisResultBlockProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMockPayment = async () => {
    setIsProcessingPayment(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/purchases/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey: 'gap_report',
          careerSlug,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          if (onPurchaseSuccess) onPurchaseSuccess();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Gagal memproses pembayaran');
      }
    } catch (e) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col print:p-0">
      {/* Top Banner when purchased */}
      {isPurchased && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Laporan Lengkap Terbuka</h4>
              <p className="text-xs text-slate-600">Akses permanen untuk profil {careerName}.</p>
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition shrink-0"
          >
            <Printer className="w-4 h-4" />
            Cetak / Unduh PDF
          </button>
        </div>
      )}

      {/* Grid: Radar Chart + Narasi AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
        {/* Kolom Kiri: Radar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center h-full relative overflow-hidden">
          <div className="flex items-center justify-between w-full mb-2">
            <h2 className="text-xl font-bold text-slate-900">Radar Perbandingan</h2>
            {!isPurchased && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Lock className="w-3 h-3" /> Terkunci
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-6 self-start">
            Diperlukan (garis putus) vs. Level Kamu Saat Ini (isi)
          </p>

          <div className="relative w-full flex items-center justify-center min-h-[320px]">
            {/* Chart Area (Blurred if not purchased) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: chartReady ? 1 : 0,
                scale: chartReady ? 1 : 0.8,
              }}
              className={`w-full transition-all duration-500 ${
                !isPurchased ? 'blur-md opacity-40 select-none pointer-events-none' : ''
              }`}
              style={{ maxWidth: 450, aspectRatio: '1' }}
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.08)" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 3]} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      color: '#1e293b',
                      fontSize: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Radar
                    name="Diperlukan"
                    dataKey="required"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="transparent"
                  />
                  <Radar
                    name="Level Kamu"
                    dataKey="current"
                    stroke={traitMetaColor}
                    strokeWidth={2}
                    fill={traitMetaColor}
                    fillOpacity={0.4}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }}
                    iconType="circle"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Overlay CTA if locked */}
            {!isPurchased && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Buka Radar & Analisis Lengkap
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mb-4 leading-relaxed">
                  Lihat rincian grafik radar interaktif, narasi AI, dan unduh dokumen laporan resmi.
                </p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Beli Laporan — Rp9.900
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Narasi Analisis Kesenjangan AI */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-xl font-bold text-slate-900">Analisis Kesenjangan AI</h2>
              </div>
              {isPurchased && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Resmi Terbuka
                </span>
              )}
            </div>

            {/* Jika Terkunci: Tampilkan Ringkasan Teks Gratis */}
            {!isPurchased && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Berdasarkan evaluasi awal terhadap profil <strong>{careerName}</strong>:
                </p>

                {freeSummary?.matchingSkills && freeSummary.matchingSkills.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Kompetensi yang Sudah Baik:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {freeSummary.matchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {freeSummary?.developmentSkills && freeSummary.developmentSkills.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Area Kesenjangan untuk Dikembangkan:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {freeSummary.developmentSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 mb-3">
                    Ingin melihat analisis narasi mendalam AI, skor numerik detail, dan strategi 30/60/90 hari?
                  </p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                  >
                    Buka Laporan Lengkap (Rp9.900)
                  </button>
                </div>
              </div>
            )}

            {/* Jika Terbuka (Purchased): Tampilkan Narasi AI Penuh */}
            {isPurchased && (
              <div className="space-y-4">
                {isLoadingGapAi ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                  </div>
                ) : gapInsight ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Kompetensi Unggul & Sesuai:
                      </div>
                      <ul className="space-y-1.5 text-emerald-950">
                        {gapInsight.kesesuaian.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Area Fokus Pengembangan:
                      </div>
                      <ul className="space-y-1.5 text-amber-950">
                        {gapInsight.kekurangan.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {gapInsight.catatan_singkat && (
                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-950 leading-relaxed italic">
                        &quot;{gapInsight.catatan_singkat}&quot;
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Memuat analisis kesenjangan...</p>
                )}
              </div>
            )}
          </div>

          {/* Navigation Action Buttons (Hidden during Print) */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between print:hidden">
            {roadmapHref ? (
              <Link
                href={roadmapHref}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                Buka Learning Roadmap
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : onNext ? (
              <button
                onClick={onNext}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                {nextLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal Pembayaran (Mock Payment Dialog) */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Buka Laporan Analisis Gap</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Target Karier: <strong className="text-slate-800">{careerName}</strong>
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Produk:</span>
                  <span className="font-semibold text-slate-900">Laporan Gap & PDF</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Masa Berlaku:</span>
                  <span className="font-semibold text-slate-900">Permanen (Selamanya)</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                  <span>Total Pembayaran:</span>
                  <span className="text-blue-600">Rp 9.900</span>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl mb-4 text-center">
                  {errorMsg}
                </p>
              )}

              {paymentSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-center font-bold text-xs flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Pembayaran Berhasil! Membuka laporan...
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleMockPayment}
                    disabled={isProcessingPayment}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {isProcessingPayment ? 'Memproses...' : 'Konfirmasi Bayar'}
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center mt-4">
                Simulasi Pembayaran Mock untuk Hackathon/Demo. Langsung aktif seketika.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
