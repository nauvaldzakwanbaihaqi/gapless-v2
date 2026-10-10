'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, ShieldCheck, Sparkles, CheckCircle2, Clock, BookOpen, AlertTriangle, FileText } from 'lucide-react';
import { ComprehensiveReportData } from '@/lib/report_generator';
import { ReportSvgRadar } from '@/components/ReportSvgRadar';
import { downloadBlobFile } from '@/lib/download-helper';

interface Props {
  report: ComprehensiveReportData;
  assessmentId: string;
}

export function ReportDocumentClient({ report, assessmentId }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await fetch(`/api/report/${assessmentId}/pdf`);
      if (!res.ok) throw new Error('Gagal mengunduh file PDF');
      const blob = await res.blob();
      const filename = `Gapless-Laporan-${(report.targetRole || 'Executive').replace(/[^a-zA-Z0-9_-]/g, '_')}-${report.reportNumber}.pdf`;
      downloadBlobFile(blob, filename);
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Reusable Page Header
  const PageHeader = () => (
    <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-300 text-[10px] text-slate-500 font-medium">
      <div className="flex items-center gap-2">
        <img src="/Asset 1.png" alt="Gapless Logo" className="h-4.5 w-auto" />
        <span className="font-bold text-slate-800 tracking-wider">GAPLESS ADVISORY</span>
        <span className="text-slate-300">|</span>
        <span>Laporan Analisis Kesiapan Karier</span>
      </div>
      <div className="flex items-center gap-3 text-slate-600 font-mono">
        <span>No: <strong>{report.reportNumber}</strong></span>
        <span>•</span>
        <span>{report.generatedAt}</span>
      </div>
    </div>
  );

  // Reusable Page Footer
  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between text-[9.5px] text-slate-400">
      <span>Dokumen ini bersifat rahasia & eksklusif untuk <strong>{report.userName}</strong></span>
      <span>Halaman {pageNum} dari 9</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200/70 py-6 sm:py-10 print:bg-white print:py-0 text-slate-900 font-sans">
      {/* ── Screen Floating Action Toolbar ── */}
      <div className="max-w-[210mm] mx-auto px-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <Link
          href={`/hasil/${assessmentId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Hasil</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terverifikasi: {report.reportNumber}</span>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingPdf ? 'Menyiapkan...' : 'Unduh File PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#1a1a2e] hover:bg-[#2d4a8a] text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Menyiapkan...' : 'Cetak (Browser)'}</span>
          </button>
        </div>
      </div>

      {/* ── Document Container (A4 Sheets) ── */}
      <div className="max-w-[210mm] mx-auto space-y-8 print:space-y-0 print:max-w-none print:w-full">

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 1 — COVER
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border relative overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1a1a2e] via-[#2d4a8a] to-[#0e7490]" />

          {/* Top Logo & Org Branding */}
          <div className="pt-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
              <img src="/Asset 1.png" alt="Gapless Logo" className="h-12 w-auto" />
            </div>
            <p className="text-[11px] tracking-widest font-semibold uppercase text-slate-500">
              Gapless Career Readiness Institute
            </p>
          </div>

          {/* Title & Target Role Block */}
          <div className="text-center my-auto py-10 space-y-6">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1a2e] font-bold tracking-tight leading-tight">
                Laporan Analisis Kesiapan Karier
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                Penilaian Komprehensif Kompetensi Industri & Rencana Pengembangan Terarah
              </p>
            </div>

            <div className="inline-block w-24 h-0.5 bg-[#2d4a8a] mx-auto" />

            <div className="space-y-2 pt-2">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Disusun Khusus Untuk</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
                {report.userName}
              </h2>
              {report.userEmail && (
                <p className="text-xs text-slate-500 font-mono">{report.userEmail}</p>
              )}
            </div>

            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-sm font-bold shadow-xs">
                <span>🎯 Target Peran:</span>
                <span className="text-[#2d4a8a]">{report.targetRole}</span>
              </div>
            </div>
          </div>

          {/* Metadata & Legal Disclaimer */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="grid grid-cols-2 text-xs text-slate-600 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nomor Registrasi Laporan</span>
                <strong className="font-mono text-slate-800">{report.reportNumber}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tanggal Diterbitkan</span>
                <strong className="text-slate-800">{report.generatedAt}</strong>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 leading-relaxed text-justify">
              <strong>Disclaimer:</strong> Laporan ini di-generate berdasarkan asesmen mandiri terstruktur dan tolok ukur standar data O*NET (Occupational Information Network, U.S. Department of Labor). Hasil merupakan estimasi awal kesiapan kompetensi industri dan rencana pengembangan karier edukatif, bukan hasil psikotes klinis.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 2 — RINGKASAN EKSEKUTIF
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 1</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Ringkasan Eksekutif</h2>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Kolom Kiri: Gauge & Status */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Skor Kesiapan Karier (Skill Readiness)
                  </span>
                  {/* Gauge SVG Inline */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="58"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="58"
                        stroke="#2d4a8a"
                        strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 58}
                        strokeDashoffset={2 * Math.PI * 58 * (1 - report.readinessScore / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-[#1a1a2e] font-mono">{report.readinessScore}%</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Readiness</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Status Kesiapan Keseluruhan</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    report.readinessScore >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : report.readinessScore >= 60
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {report.overallStatus}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-left text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Archetype Dominan:</span>
                    <strong className="text-slate-900">{report.dominantTrait}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Target Peran:</span>
                    <strong className="text-slate-900">{report.targetRole}</strong>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: 3 Poin Kunci & Estimasi Jam */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2d4a8a]" />
                    <span>3 Temuan Kunci Asesmen:</span>
                  </h3>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div>
                        <strong>Kekuatan Utama:</strong>{' '}
                        {report.keyStrengths.length > 0 ? report.keyStrengths.join(', ') : 'Fondasi awal kepribadian kerja yang baik.'}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <div>
                        <strong>Gap Prioritas:</strong>{' '}
                        {report.priorityGaps.length > 0 ? report.priorityGaps.join(', ') : 'Tidak ada gap kritis terdeteksi.'}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div>
                        <strong>Rekomendasi Pertama:</strong>{' '}
                        {report.firstActionRecommendation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Waktu Estimasi */}
                <div className="p-4 rounded-xl bg-[#1a1a2e] text-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Estimasi Waktu Menuju Siap Kerja</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {report.totalEstHoursMin} – {report.totalEstHoursMax} Jam Belajar
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Setara dengan <strong>{report.totalEstWeeksMin} – {report.totalEstWeeksMax} minggu</strong> pembelajaran terstruktur (asumsi komitmen 5 jam/minggu, kombinasi modul teori dan studi kasus terapan).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={2} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 3 — ANALISIS SKILL GAP DETAIL
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-4">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 2</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Analisis Kesenjangan Kompetensi (Skill Gap)</h2>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            {/* Tabel Detail */}
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3">Kompetensi (Skill)</th>
                    <th className="py-2.5 px-2 text-center">Level Kamu</th>
                    <th className="py-2.5 px-2 text-center">Level Target</th>
                    <th className="py-2.5 px-2 text-center">Gap</th>
                    <th className="py-2.5 px-3 text-center">Prioritas</th>
                    <th className="py-2.5 px-3 text-right">Est. Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.skillGapTable.map((item, idx) => (
                    <tr key={item.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2 px-2 text-center font-mono">Level {item.current}</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-600">Level {item.required}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">
                        <span className={item.gap < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {item.gap > 0 ? `+${item.gap}` : item.gap}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          item.priority === 'Kritis'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'Penting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span>{item.priorityIcon}</span>
                          <span>{item.priority}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 text-[11px]">
                        {item.hoursMin > 0 ? `${item.weeksMin}–${item.weeksMax} minggu` : 'Tercapai'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Keterangan Tolok Ukur Prioritas */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between gap-2 mb-4">
              <span><strong>🔴 Kritis:</strong> Selisih ≥ 2 level atau skill berbobot tinggi.</span>
              <span><strong>🟡 Penting:</strong> Selisih 1 level pada target menengah.</span>
              <span><strong>🟢 Sesuai:</strong> Telah memenuhi atau melampaui level industri.</span>
            </div>

            {/* Radar Chart Visual (SVG Inline Vektor) */}
            <div className="pt-2">
              <div className="text-center mb-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pemetaan Visual Radar Kompetensi Terhadap Standar Industri
                </span>
              </div>
              <ReportSvgRadar data={report.radarData} size={360} />
            </div>
          </div>

          <PageFooter pageNum={3} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 4 — INTERPRETASI MENDALAM PER SKILL
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 3</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Interpretasi Mendalam Kompetensi</h2>
              <p className="text-xs text-slate-500 mt-1">
                Dekomposisi kapabilitas praktis: apa yang sudah dikuasai vs ekspektasi nyata dunia kerja.
              </p>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            <div className="space-y-4">
              {report.skillInterpretations.length > 0 ? (
                report.skillInterpretations.map((item) => (
                  <div
                    key={item.skillName}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <h3 className="font-bold text-sm text-[#1a1a2e]">{item.skillName}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-mono text-[11px] font-semibold">
                        Level {item.currentLevel} dari Target Level {item.targetLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                          ✓ Di Level {item.currentLevel} Kamu Sudah Mampu:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                          {item.canDo.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-rose-800 block mb-1">
                          ✗ Yang Belum Dikuasai (Kebutuhan Level {item.targetLevel}):
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                          {item.cannotDo.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-slate-800">
                      <strong>Contoh Kasus Nyata di Industri:</strong>{' '}
                      <em>{item.industryExample}</em>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800">
                  Seluruh kompetensi inti telah berada pada atau melampaui level standar industri yang disyaratkan.
                </div>
              )}
            </div>
          </div>

          <PageFooter pageNum={4} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 5 — URUTAN PRIORITAS DENGAN ALASAN
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 4</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Urutan Prioritas Pengembangan</h2>
              <p className="text-xs text-slate-500 mt-1">
                Alasan strategis mengapa skill tertentu wajib dituntaskan terlebih dahulu.
              </p>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            {/* List Bernomor dengan Alasan */}
            <div className="space-y-3 mb-6">
              {report.priorityList.map((item) => (
                <div
                  key={item.rank}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3 text-xs shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#2d4a8a] text-white flex items-center justify-center font-bold font-mono shrink-0">
                    {item.rank}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.skillName}</h3>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong>Kenapa Diutamakan:</strong> {item.reason}
                    </p>
                    <p className="text-rose-700 leading-relaxed text-[11px]">
                      <strong>Dampak Jika Tidak Ditutup:</strong> {item.consequenceIfNotClosed}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Matriks Prioritas 2x2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 text-center">
                Matriks Pengambilan Keputusan Belajar (Impact vs. Gap Size)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="font-bold text-rose-900 block mb-1">Prioritas 1: Kritis (High Impact, Big Gap)</span>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Wajib ditutup segera pada 30 hari pertama karena memblokir alur pengerjaan tugas mandiri.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">Prioritas 2: Quick Win (High Impact, Small Gap)</span>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Dapat ditingkatkan dengan cepat untuk mendongkrak kepercayaan diri dan portofolio awal.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="font-bold text-indigo-900 block mb-1">Prioritas 3: Pertimbangkan (Medium Impact)</span>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    Dipelajari setelah fondasi utama stabil untuk menambah nilai kompetitif profil.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Prioritas 4: Opsional (Maintenance)</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Kompetensi pelengkap yang dapat diasah seiring berjalannya proyek nyata di industri.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={5} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 6 — ESTIMASI WAKTU BELAJAR
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 5</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Estimasi Waktu Belajar Komprehensif</h2>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            {/* Tabel Estimasi Jam */}
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3">Kompetensi</th>
                    <th className="py-2.5 px-2 text-center">Gap Level</th>
                    <th className="py-2.5 px-3 text-center">Jam / Minggu Ideal</th>
                    <th className="py-2.5 px-3 text-center">Total Jam Belajar</th>
                    <th className="py-2.5 px-3 text-right">Estimasi Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.skillGapTable.map((item, idx) => (
                    <tr key={item.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-600">
                        {item.gap < 0 ? item.gap : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">5 jam/minggu</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1a1a2e]">
                        {item.hoursMin > 0 ? `${item.hoursMin} – ${item.hoursMax} jam` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 font-semibold">
                        {item.weeksMin > 0 ? `${item.weeksMin} – ${item.weeksMax} minggu` : 'Tercapai'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Asumsi Eksplisit Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 mb-6">
              <h4 className="font-bold text-[#1a1a2e] uppercase text-[11px] tracking-wider">
                Asumsi Perhitungan Waktu Belajar:
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                "Estimasi di atas disusun berdasarkan metodologi pembelajaran terstruktur 5 jam/minggu dengan rasio 40% pemahaman teori konsep dan 60% pengerjaan studi kasus praktik langsung. Kecepatan penyelesaian aktual dapat bervariasi bergantung pada intensitas harian, latar belakang akademis, serta konsistensi mahasiswa."
              </p>
            </div>

            {/* Total Waktu Card */}
            <div className="p-5 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-300 uppercase tracking-wider block font-medium">
                  Total Estimasi Waktu Penutupan Seluruh Gap:
                </span>
                <span className="text-2xl font-extrabold font-mono text-white">
                  {report.totalEstHoursMin} – {report.totalEstHoursMax} Jam
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-300 font-semibold block">Target Kalender</span>
                <span className="text-lg font-bold font-mono text-white">
                  ~{report.totalEstWeeksMin} – {report.totalEstWeeksMax} Minggu
                </span>
              </div>
            </div>
          </div>

          <PageFooter pageNum={6} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 7 — RENCANA BELAJAR 30/60/90 HARI
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 6</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Rencana Tindakan 30 / 60 / 90 Hari</h2>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            <div className="space-y-4 text-xs">
              {/* 30 Hari Pertama */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-bold font-mono text-[10px]">30 HARI</span>
                    <strong className="text-blue-950 text-xs sm:text-sm">{report.actionPlan.day30.phaseTitle}</strong>
                  </div>
                  <span className="text-[10px] text-blue-700 font-medium">Fokus: {report.actionPlan.day30.focusSkills.join(', ')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 text-[11px]">
                  <div>
                    <span className="font-semibold block text-slate-900">Minggu 1 – 2:</span>
                    <p>{report.actionPlan.day30.weeksFirstHalf}</p>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">Minggu 3 – 4:</span>
                    <p>{report.actionPlan.day30.weeksSecondHalf}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200/80 text-[11px] text-blue-900 font-medium">
                  🎯 <strong>Milestone Akhir 30 Hari:</strong> {report.actionPlan.day30.milestone}
                </div>
              </div>

              {/* 60 Hari */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-700 text-white font-bold font-mono text-[10px]">60 HARI</span>
                    <strong className="text-indigo-950 text-xs sm:text-sm">{report.actionPlan.day60.phaseTitle}</strong>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-medium">Fokus: {report.actionPlan.day60.focusSkills.join(', ')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 text-[11px]">
                  <div>
                    <span className="font-semibold block text-slate-900">Minggu 5 – 6:</span>
                    <p>{report.actionPlan.day60.weeksFirstHalf}</p>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">Minggu 7 – 8:</span>
                    <p>{report.actionPlan.day60.weeksSecondHalf}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-indigo-200/80 text-[11px] text-indigo-900 font-medium">
                  🎯 <strong>Milestone Akhir 60 Hari:</strong> {report.actionPlan.day60.milestone}
                </div>
              </div>

              {/* 90 Hari */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold font-mono text-[10px]">90 HARI</span>
                    <strong className="text-emerald-950 text-xs sm:text-sm">{report.actionPlan.day90.phaseTitle}</strong>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Fokus: {report.actionPlan.day90.focusSkills.join(', ')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 text-[11px]">
                  <div>
                    <span className="font-semibold block text-slate-900">Minggu 9 – 10:</span>
                    <p>{report.actionPlan.day90.weeksFirstHalf}</p>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">Minggu 11 – 12:</span>
                    <p>{report.actionPlan.day90.weeksSecondHalf}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-900 font-medium">
                  🎯 <strong>Milestone Akhir 90 Hari:</strong> {report.actionPlan.day90.milestone}
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={7} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 8 — REKOMENDASI SUMBER BELAJAR TERKURASI
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 7</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Rekomendasi Sumber Belajar Terkurasi</h2>
              <p className="text-xs text-slate-500 mt-1">
                Katalog materi resmi dan terverifikasi untuk menutup setiap gap kompetensi secara mandiri.
              </p>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            <div className="space-y-4">
              {Object.keys(report.skillResources).length > 0 ? (
                Object.entries(report.skillResources).map(([skill, resources]) => (
                  <div key={skill} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <h3 className="font-bold text-xs text-[#1a1a2e] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#2d4a8a]" />
                      <span>{skill}</span>
                    </h3>

                    {resources.length > 0 ? (
                      <div className="space-y-1.5">
                        {resources.map((res, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                          >
                            <div>
                              <strong className="text-slate-800">{res.title}</strong>{' '}
                              <span className="text-slate-400">({res.provider} • {res.type})</span>
                              {/* Teks URL agar terbaca saat diprint fisik */}
                              <div className="text-[10px] font-mono text-blue-700 truncate max-w-[400px]">
                                {res.url}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                              res.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {res.isFree ? 'Gratis' : 'Berbayar'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Akses Learning Roadmap di platform Gapless untuk materi terarah peran ini.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Materi kurikulum lengkap dapat diakses interaktif pada halaman Learning Roadmap akun Gapless kamu.
                </div>
              )}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-100 border border-slate-200 text-[10.5px] text-slate-600">
              💡 <strong>Catatan:</strong> Daftar kurikulum dan materi sumber belajar terus diperbarui secara berkala oleh tim pakar industri Gapless. Kunjungi <code>gapless.id/roadmap</code> untuk modul interaktif dan latihan mandiri.
            </div>
          </div>

          <PageFooter pageNum={8} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HALAMAN 9 — PENUTUP & METODOLOGI
        ═══════════════════════════════════════════════════════════════ */}
        <section className="a4-page bg-white p-[20mm] shadow-lg print:shadow-none flex flex-col justify-between min-h-[297mm] box-border page-break">
          <PageHeader />

          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#2d4a8a] uppercase tracking-wider">Bagian 8</span>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e]">Penutup & Metodologi Asesmen</h2>
              <div className="w-12 h-0.5 bg-[#2d4a8a] mt-1.5" />
            </div>

            {/* Paragraf Ringkasan Penutup */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-3 leading-relaxed mb-6">
              <h3 className="font-bold text-sm text-[#1a1a2e]">Kesimpulan Akhir & Langkah Lanjutan</h3>
              <p className="text-justify">
                Berdasarkan evaluasi menyeluruh terhadap profil kompetensimu saat ini, fokus utama akselerasi karier kamu sebagai <strong>{report.targetRole}</strong> adalah penutupan kesenjangan pada skill teknis prioritas melalui pembelajaran berbasis praktik dan pembuktian karya nyata. Menguasai fondasi dasar dalam 30 hari pertama akan membuka jalan bagi penguasaan proyek yang lebih kompleks pada tahap berikutnya.
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Lanjutkan Eksekusi Pembelajaran:</span>
                <span className="px-3 py-1 rounded-lg bg-[#2d4a8a] text-white font-bold text-xs font-mono">
                  gapless.id/roadmap
                </span>
              </div>
            </div>

            {/* Metodologi Lengkap */}
            <div className="space-y-3 text-xs text-slate-600 mb-6">
              <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                Metodologi & Landasan Analisis:
              </h4>
              <p className="text-justify text-[11px] leading-relaxed">
                Laporan ini disusun secara komprehensif menggunakan tiga pilar metodologi:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-justify leading-relaxed">
                <li>
                  <strong>Asesmen Mandiri Terstruktur:</strong> Refleksi pengalaman dan jawaban situasi kerja yang kamu isi secara objektif pada platform Gapless.
                </li>
                <li>
                  <strong>O*NET (Occupational Information Network) Database:</strong> Standar rujukan taksonomi kompetensi kerja resmi dari U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Data ini memberikan benchmark empiris kebutuhan skill entry-level hingga spesialis.
                </li>
                <li>
                  <strong>Sistem Inferensi Model Bahasa Cerdas:</strong> Analisis kesenjangan, dekomposisi kapabilitas praktis, serta perancangan rencana bertahap 30/60/90 hari yang dipersonalisasi sesuai profilmu.
                </li>
              </ol>
              <p className="text-[10px] text-slate-400 italic pt-1">
                *Catatan Metodologis: Data O*NET berbasis pasar kerja global; penyesuaian bobot industri lokal di Indonesia diintegrasikan melalui kurasi praktisi kurikulum Gapless.
              </p>
            </div>

            {/* Tanda Tangan & Verifikasi Dokumen */}
            <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Diterbitkan Secara Digital Oleh</span>
                <strong className="text-slate-800 text-sm">Gapless Advisory System</strong>
                <p className="text-[11px] text-slate-500">Accelerating Career Readiness</p>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-400">
                <span>Dokumen ID: {report.reportNumber}</span>
                <div className="text-[9px] text-slate-400">Status: Verified Official Report</div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="py-2 text-center text-[10px] text-slate-400 border-t border-slate-200">
              © {new Date().getFullYear()} Gapless. Laporan ini dibuat eksklusif untuk <strong>{report.userName}</strong> dan tidak diperkenankan untuk disebarluaskan tanpa izin.
            </div>
            <PageFooter pageNum={9} />
          </div>
        </section>

      </div>
    </div>
  );
}
