'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, HelpCircle, ArrowRight, Shield, FileText, Compass, Target, Calendar, Award } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PRODUCTS, CORE_PLATFORM_FEATURES } from '@/config/plan';
import Link from 'next/link';

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Apakah fitur belajar di Gapless benar-benar gratis?',
      a: 'Ya, 100% gratis! Seluruh fitur belajar inti—mulai dari Learning Roadmap lengkap 4 fase, bank misi soft skill, rekomendasi kegiatan, hingga Skill Passport—dapat diakses gratis tanpa biaya langganan bulanan.',
    },
    {
      q: 'Apa itu Laporan Analisis Skill Gap Rp9.900?',
      a: 'Ini adalah layanan a la carte sekali bayar (one-time purchase). Laporan ini membuka grafik radar interaktif, analisis narasi kesenjangan AI mendalam, prioritas perbaikan, dan dokumen PDF resmi yang dapat kamu simpan atau lampirkan.',
    },
    {
      q: 'Apakah Rp9.900 berlaku selamanya untuk karier tersebut?',
      a: 'Ya. Sekali kamu membeli laporan untuk suatu target karier (misalnya Frontend Developer), laporan tersebut akan terbuka selamanya untuk karier itu, bahkan jika kamu melakukan asesmen ulang pada karier yang sama.',
    },
    {
      q: 'Bagaimana jika saya memilih target karier yang berbeda di masa depan?',
      a: 'Fitur roadmap dan belajar tetap 100% gratis untuk semua karier. Jika kamu menginginkan laporan analisis gap mendalam baru untuk karier yang berbeda, kamu cukup membeli laporan untuk karier baru tersebut.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 pb-24">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Transparan & Tanpa Langganan Bulanan
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Akses Belajar Gratis, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Bayar Hanya untuk Laporan Khusus
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Semua roadmap, misi soft skill, dan kegiatan terbuka untuk semua orang. Dapatkan analisis mendalam dan dokumen PDF resmi saat kamu membutuhkannya.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-16">
          {/* Card 1: Core Platform Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase">
                  Akses Inti
                </span>
                <span className="text-xs text-slate-500 font-medium">Selamanya</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">Gapless Explorer</h2>
              <p className="text-xs text-slate-500 mb-6">
                Seluruh fitur belajar mandiri untuk eksplorasi dan pengembangan karier.
              </p>

              <div className="flex items-baseline mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Rp 0</span>
                <span className="text-slate-500 font-medium ml-2 text-xs">/ Gratis</span>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">Termasuk semua fitur berikut:</p>
                {CORE_PLATFORM_FEATURES.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-600 mt-0.5 shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-6">
              <Link
                href="/assessment"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                Mulai Asesmen Sekarang
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: A La Carte Gap Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl border border-indigo-900/50 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold tracking-wider uppercase shadow-sm">
                  A La Carte
                </span>
                <span className="text-xs text-indigo-200/80 font-medium">Sekali Bayar</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Laporan Gap & PDF</h2>
              <p className="text-xs text-indigo-200/80 mb-6">
                Laporan analisis mendalam, radar perbandingan interaktif, dan dokumen PDF resmi.
              </p>

              <div className="flex items-baseline mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {PRODUCTS.gap_report.priceWithCurrency}
                </span>
                <span className="text-indigo-200/70 font-medium ml-2 text-xs">/ per career path</span>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800">
                <p className="text-xs font-semibold text-indigo-100 mb-2">Yang kamu dapatkan:</p>
                {[
                  'Grafik Radar interaktif perbandingan level skill',
                  'Analisis kesenjangan mendalam berbasis AI',
                  'Daftar prioritas perbaikan kompetensi',
                  'Rencana aksi terstruktur 30/60/90 hari',
                  'Dokumen Laporan Resmi format PDF (siap unduh & cetak)',
                  'Akses selamanya untuk target karier yang dipilih',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-indigo-100">
                    <span className="p-0.5 rounded-full bg-indigo-500/30 text-indigo-300 mt-0.5 shrink-0 border border-indigo-400/30">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-6">
              <Link
                href="/results"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md"
              >
                Lihat Hasil & Buka Laporan
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Pertanyaan Umum (FAQ)</h3>
            <p className="text-xs text-slate-500 mt-1">Jawaban atas hal-hal yang sering ditanyakan seputar sistem akses Gapless.</p>
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
      </main>
    </div>
  );
}
