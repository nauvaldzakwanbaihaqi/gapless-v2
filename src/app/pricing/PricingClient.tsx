'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, Sparkles, Lock, ArrowRight, Crown, Shield, FileText,
  HelpCircle, Calendar, Zap, CheckCircle2, Clock, X, AlertCircle
} from 'lucide-react';
import { PLAN_CONFIG, PRODUCTS } from '@/config/plan';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

interface Props {
  isLoggedIn: boolean;
  isPro: boolean;
  periodEnd: string | null;
  daysRemaining: number;
}

export function PricingClient({ isLoggedIn, isPro: initialIsPro, periodEnd: initialPeriodEnd, daysRemaining: initialDaysRemaining }: Props) {
  const [isPro, setIsPro] = useState(initialIsPro);
  const [periodEnd, setPeriodEnd] = useState<string | null>(initialPeriodEnd);
  const [daysRemaining, setDaysRemaining] = useState(initialDaysRemaining);
  const [showProModal, setShowProModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribePro = async () => {
    if (!isLoggedIn) {
      signIn('google', { callbackUrl: '/pricing' });
      return;
    }

    setIsSubscribing(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/purchases/pro/mock', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setIsPro(true);
        if (data.periodEnd) {
          setPeriodEnd(data.periodEnd);
          setDaysRemaining(30);
        }
        setSuccessMsg('Langganan Gapless Pro berhasil diaktifkan!');
        setTimeout(() => {
          setShowProModal(false);
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (e) {
      console.error('Failed to subscribe', e);
    } finally {
      setIsSubscribing(false);
    }
  };

  const formattedEndDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const faqs = [
    {
      q: 'Apa perbedaan Gapless Pro dan Laporan Gap Mendalam?',
      a: 'Gapless Pro adalah paket langganan bulanan (Rp29.000/bulan) untuk membuka fitur akselerasi seperti re-assessment unlimited, kurikulum 4 fase lengkap, seluruh rekomendasi kegiatan & filter, serta misi berkala. Sedangkan Laporan Gap Mendalam (Rp9.900) adalah produk satu kali bayar per target karier untuk membuka radar chart dan narasi analisis kesenjangan AI lengkap beserta dokumen PDF resmi.',
    },
    {
      q: 'Apakah pengguna Gapless Pro otomatis mendapat Laporan Gap Mendalam?',
      a: 'Tidak. Kedua produk ini berdiri sendiri. User Gapless Pro tetap membeli Laporan Gap Mendalam seharga Rp9.900 per target karier yang ingin dianalisis secara mendalam dan diunduh dokumen PDF-nya.',
    },
    {
      q: 'Bagaimana jika masa langganan Gapless Pro saya berakhir?',
      a: 'Akun kamu akan kembali ke fitur Free. Seluruh riwayat hasil asesmen dan Laporan Gap yang pernah kamu beli tetap tersimpan dan dapat diakses selamanya.',
    },
    {
      q: 'Apakah bisa perpanjang langganan Gapless Pro sebelum masa aktif habis?',
      a: 'Bisa! Jika kamu memperpanjang langganan saat Pro masih aktif, masa aktif akan otomatis bertambah 30 hari dari tanggal berakhir sebelumnya tanpa hangus.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Investasi Terjangkau untuk Masa Depan Kariermu
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Pilihan Paket Belajar & <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500">
            Akselerasi Karier Impian
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Mulai eksplorasi minat kariermu secara gratis, atau tingkatkan ke Gapless Pro untuk kurikulum lengkap dan bimbingan berkala.
        </p>
      </div>

      {/* 2 Main Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Card 1: Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition relative"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase">
                {PLAN_CONFIG.free.badge}
              </span>
              <span className="text-xs text-slate-500 font-medium">Selamanya</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">{PLAN_CONFIG.free.displayName}</h2>
            <p className="text-xs text-slate-500 mb-6">{PLAN_CONFIG.free.description}</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Rp 0</span>
              <span className="text-slate-500 font-medium ml-2 text-xs">/ Gratis</span>
            </div>

            {/* Fitur Termasuk */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">Fitur yang didapatkan:</p>
              {PLAN_CONFIG.free.includedFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-600 mt-0.5 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{feat.text}</span>
                </div>
              ))}

              {/* Fitur Terkunci di Free */}
              <div className="pt-3 space-y-2.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Terkunci di Free:</p>
                {PLAN_CONFIG.free.lockedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-400">
                    <span className="p-0.5 rounded-full bg-slate-100 text-slate-400 mt-0.5 shrink-0">
                      <Lock className="w-3 h-3" />
                    </span>
                    <span>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6">
            {!isLoggedIn ? (
              <button
                onClick={() => signIn('google', { callbackUrl: '/assessment' })}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                Mulai Gratis Sekarang
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : !isPro ? (
              <div className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold text-center">
                ✓ Paket Aktif Kamu Saat Ini
              </div>
            ) : (
              <Link
                href="/roadmap"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                Buka Learning Roadmap
              </Link>
            )}
          </div>
        </motion.div>

        {/* Card 2: Gapless Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-2xl border-2 border-indigo-500/40 flex flex-col justify-between relative overflow-hidden ring-4 ring-blue-500/10"
        >
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-linear-to-br from-blue-500/30 to-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3.5 py-1 rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-sky-400 text-white text-xs font-extrabold tracking-wider uppercase shadow-sm flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                {PLAN_CONFIG.pro.displayName}
              </span>
              {isPro ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Langganan Aktif
                </span>
              ) : (
                <span className="text-xs text-indigo-200/80 font-medium">Rekomendasi</span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{PLAN_CONFIG.pro.displayName}</h2>
            <p className="text-xs text-indigo-200/80 mb-6">{PLAN_CONFIG.pro.description}</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {PLAN_CONFIG.pro.priceWithCurrency}
              </span>
              <span className="text-indigo-200/70 font-medium ml-2 text-xs">{PLAN_CONFIG.pro.period}</span>
            </div>

            {/* Active subscription info if already Pro */}
            {isPro && formattedEndDate && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-xs mb-6 space-y-1">
                <div className="flex justify-between text-indigo-200">
                  <span>Masa Aktif:</span>
                  <span className="font-bold text-white">{formattedEndDate}</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>Sisa Hari:</span>
                  <span className="font-bold text-emerald-400">{daysRemaining} Hari</span>
                </div>
              </div>
            )}

            {/* Fitur Termasuk Pro */}
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <p className="text-xs font-semibold text-indigo-100 mb-2">Seluruh keuntungan Gapless Pro:</p>
              {PLAN_CONFIG.pro.includedFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-indigo-100">
                  <span className="p-0.5 rounded-full bg-indigo-500/30 text-indigo-300 mt-0.5 shrink-0 border border-indigo-400/30">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-6">
            <button
              onClick={() => setShowProModal(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-sky-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              {isPro ? 'Perpanjang Pro (+30 Hari)' : 'Mulai Gapless Pro (Rp 29.000)'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Section Terpisah: Laporan Gap Mendalam (Rp9.900) */}
      <div className="max-w-4xl mx-auto bg-linear-to-r from-blue-50 via-indigo-50/60 to-slate-50 rounded-3xl p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold border border-blue-200">
              <FileText className="w-3.5 h-3.5" />
              Produk Satuan A La Carte
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Laporan Gap Mendalam — {PRODUCTS.gap_report.priceWithCurrency}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produk one-time per <em>career path</em> untuk membuka grafik radar interaktif, narasi kesenjangan AI lengkap, detail per kompetensi, dan dokumen PDF resmi.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              *Dibeli terpisah dan berlaku selamanya untuk karier yang dipilih (user Gapless Pro maupun Free dapat membeli langsung dari halaman hasil asesmen).
            </p>
          </div>

          <Link
            href="/results"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition whitespace-nowrap shrink-0"
          >
            Lihat di Halaman Hasil Asesmen
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-slate-900">Pertanyaan Umum (FAQ)</h3>
          <p className="text-xs text-slate-500 mt-1">Penjelasan lengkap seputar paket Gapless Pro dan Laporan Gap.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 transition"
              >
                <span>{faq.q}</span>
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Langganan Pro (Mock Payment Dialog) */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setShowProModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Crown className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isPro ? 'Perpanjang Gapless Pro' : 'Aktifkan Gapless Pro'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Akses penuh ke seluruh kurikulum dan fitur akselerasi karier
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Paket:</span>
                  <span className="font-semibold text-slate-900">Gapless Pro (Bulanan)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Durasi:</span>
                  <span className="font-semibold text-slate-900">30 Hari</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                  <span>Total Tagihan:</span>
                  <span className="text-blue-600">Rp 29.000</span>
                </div>
              </div>

              {successMsg ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-center font-bold text-xs flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {successMsg}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubscribePro}
                    disabled={isSubscribing}
                    className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 hover:opacity-95 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubscribing ? 'Memproses...' : 'Konfirmasi Bayar'}
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
