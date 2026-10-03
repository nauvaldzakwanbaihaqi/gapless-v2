'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Lock, 
  CreditCard, 
  Crown, 
  Loader2,
  Clock
} from 'lucide-react';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { PLAN_CONFIG, isPlusUser } from '@/config/plan';

function PricingContent() {
  const { session } = useAuthGuard();
  const searchParams = useSearchParams();

  const userTier = (session?.user as { tier?: string })?.tier || 'Free';
  const isPro = isPlusUser(userTier);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: idle, 1: processing, 2: success
  const [invoiceId, setInvoiceId] = useState('');

  // Handle auto-upgrade if redirected from login
  useEffect(() => {
    if (searchParams.get('upgrade') === 'auto' && session?.user && !isPro) {
      handleUpgradeClick();
    }
  }, [searchParams, session, isPro]);

  const handleUpgradeClick = async () => {
    if (!session?.user) {
      signIn('google', { callbackUrl: '/pricing?upgrade=auto' });
      return;
    }

    if (isPro) return;

    setIsProcessing(true);
    setProcessStep(1);
    setInvoiceId(`GAP-INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

    // Simulate realistic payment processing
    try {
      await new Promise((r) => setTimeout(r, 1800));

      const res = await fetch('/api/user/upgrade-pro', {
        method: 'POST',
      });

      if (res.ok) {
        setProcessStep(2);
      } else {
        alert('Gagal mengaktifkan paket. Silakan coba lagi.');
        setIsProcessing(false);
        setProcessStep(0);
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan jaringan.');
      setIsProcessing(false);
      setProcessStep(0);
    }
  };

  const handleFinishAndExplore = () => {
    setIsProcessing(false);
    setProcessStep(0);
    window.location.href = '/roadmap';
  };

  const itemFadeBlur: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-space flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Main Container */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative z-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.12,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {/* Header Section */}
        <div className="text-center max-w-2xl mb-12">
          <motion.h1
            variants={itemFadeBlur}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3"
          >
            Investasi Untuk <br />
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Masa Depan Kariermu.
            </span>
          </motion.h1>
          <motion.p variants={itemFadeBlur} className="text-slate-500 text-sm md:text-base">
            Pilih paket yang sesuai dengan tahap akselerasi karier impianmu saat ini.
          </motion.p>
        </div>

        {/* Pricing Cards Container */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto w-full mb-12">
          {/* Free Tier Card */}
          <motion.div
            variants={itemFadeBlur}
            className="flex-1 w-full max-w-md bg-white/80 backdrop-blur-md rounded-4xl p-8 sm:p-10 flex flex-col relative border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{PLAN_CONFIG.free.name}</h2>
              <p className="text-slate-500 text-xs">{PLAN_CONFIG.free.description}</p>
            </div>

            <div className="flex items-baseline mb-8">
              <span className="text-slate-500 font-medium mr-1.5 text-sm">Rp</span>
              <span className="text-6xl font-black text-slate-900 tracking-tight">{PLAN_CONFIG.free.priceFormatted}</span>
              <span className="text-slate-400 font-medium ml-2 text-xs">{PLAN_CONFIG.free.period}</span>
            </div>

            <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-700">
              {PLAN_CONFIG.free.includedFeatures.map((item, idx) => (
                <li key={`inc-${idx}`} className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span>{item.text}</span>
                    {item.isUpcoming && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                        <Clock className="w-3 h-3" />
                        Segera hadir
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {PLAN_CONFIG.free.lockedFeatures.map((item, idx) => (
                <li key={`lock-${idx}`} className="flex items-start gap-3 text-slate-400">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center mt-0.5">
                    <Lock className="w-3 h-3 text-slate-300" />
                  </div>
                  <span className="line-through">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              {!isPro ? (
                <div className="w-full bg-slate-100 text-slate-500 text-center py-3.5 rounded-2xl font-bold text-xs sm:text-sm cursor-default">
                  Paket Dasar Aktif
                </div>
              ) : (
                <Link
                  href="/"
                  className="block w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-center py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors"
                >
                  Kembali ke Home
                </Link>
              )}
            </div>
          </motion.div>

          {/* Plus Tier Card (Highlighted) */}
          <motion.div
            variants={itemFadeBlur}
            className={`flex-1 w-full max-w-md bg-white rounded-4xl p-8 sm:p-10 flex flex-col relative transition-all duration-300 ${
              isPro
                ? 'border-2 border-emerald-500 shadow-lg ring-4 ring-emerald-50'
                : 'border-2 border-blue-600 shadow-xl ring-4 ring-blue-50/50 hover:shadow-2xl'
            }`}
          >
            {/* Top Badge */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full whitespace-nowrap shadow-md flex items-center gap-1 ${
              isPro ? 'bg-emerald-600' : 'bg-linear-to-r from-blue-600 to-indigo-600'
            }`}>
              {isPro ? (
                <>
                  <Crown className="w-3 h-3" />
                  <span>Paket Aktif Kamu</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Rekomendasi Paket Pilihan</span>
                </>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                {PLAN_CONFIG.plus.name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
                  {PLAN_CONFIG.plus.badge}
                </span>
              </h2>
              <p className="text-slate-500 text-xs">{PLAN_CONFIG.plus.description}</p>
            </div>

            <div className="flex items-baseline mb-8">
              <span className="text-slate-500 font-medium mr-1.5 text-sm">Rp</span>
              <span className="text-6xl font-black text-slate-900 tracking-tight">{PLAN_CONFIG.plus.priceFormatted}</span>
              <span className="text-slate-400 font-medium ml-2 text-xs">{PLAN_CONFIG.plus.period}</span>
            </div>

            <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-800 font-medium">
              {PLAN_CONFIG.plus.includedFeatures.map((item, idx) => (
                <li key={`plus-inc-${idx}`} className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span>{item.text}</span>
                    {item.isUpcoming && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                        <Clock className="w-3 h-3" />
                        Segera hadir
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              {isPro ? (
                <Link
                  href="/roadmap"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Buka Roadmap {PLAN_CONFIG.plus.name} Kamu</span>
                </Link>
              ) : (
                <button
                  onClick={handleUpgradeClick}
                  disabled={isProcessing}
                  className="w-full bg-linear-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white text-center py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>Upgrade ke {PLAN_CONFIG.plus.name} (Instan)</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center text-xs text-slate-400 max-w-lg">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Garansi akses fitur seketika & batalkan kapan saja tanpa komitmen.</span>
          </p>
        </div>
      </motion.div>

      {/* HIGH-DELIGHT SIMULATED CHECKOUT & SUCCESS MODAL */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Step 1: Processing Animation */}
            {processStep === 1 && (
              <motion.div
                key="step-processing"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 relative">
                  <CreditCard className="w-8 h-8" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 animate-ping" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Memproses Pembayaran...
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Menghubungkan ke payment gateway & mengaktifkan paket {PLAN_CONFIG.plus.name} untuk <strong>{session?.user?.name}</strong>
                </p>

                <div className="space-y-2 mb-6">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.6, ease: 'easeInOut' }}
                      className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Enkripsi 256-bit aman &bull; No: {invoiceId}</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi hak akses...</span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Success Celebration Screen with Confetti */}
            {processStep === 2 && (
              <motion.div
                key="step-success"
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-emerald-100 relative overflow-hidden"
              >
                {/* Confetti Explosion */}
                <ConfettiEffect count={60} />

                {/* Animated Success Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2 inline-block">
                    Pembayaran Berhasil
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">
                    Selamat Datang di {PLAN_CONFIG.plus.displayName}! 🎉
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Status akunmu kini telah aktif sebagai <strong>{PLAN_CONFIG.plus.name}</strong>. Semua materi, fase lanjutan, dan laporan mendalam telah terbuka penuh.
                  </p>
                </motion.div>

                {/* Order Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-left text-xs mb-6 space-y-2"
                >
                  <div className="flex justify-between text-slate-500">
                    <span>No. Invoice:</span>
                    <span className="font-mono font-bold text-slate-800">{invoiceId}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Paket:</span>
                    <span className="font-bold text-blue-600">{PLAN_CONFIG.plus.displayName} (Akses Penuh)</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Total Pembayaran:</span>
                    <span className="font-bold text-emerald-600 text-sm">{PLAN_CONFIG.plus.priceWithCurrency} (Lunas)</span>
                  </div>
                </motion.div>

                {/* Features Unlocked List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2 mb-8 text-left text-xs font-semibold text-slate-700 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100"
                >
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Semua 4 Fase Learning Roadmap Terbuka</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Laporan Skill-Gap & Rekomendasi AI Mendalam</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Asesmen Minat & Skill Berkala</span>
                  </div>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleFinishAndExplore}
                  className="w-full py-4 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mulai Eksplorasi Fitur {PLAN_CONFIG.plus.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-space flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PricingContent />
    </React.Suspense>
  );
}
