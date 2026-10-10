'use client';

import { Award, Sparkles, Plus, UploadCloud, CheckCircle2, XCircle, Clock, Lock, ExternalLink } from 'lucide-react';
import { CertificateData } from '../types';

interface CertificatesSectionProps {
  certs: CertificateData[];
  isPro: boolean;
  onOpenUpload: () => void;
}

export function CertificatesSection({
  certs,
  isPro,
  onOpenUpload,
}: CertificatesSectionProps) {
  const verifiedCount = certs.filter((c) => c.status === 'Tervalidasi').length;

  return (
    <div id="sertifikat" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Sertifikat & Portofolio</h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Verifikasi AI Instan
            </span>
            {verifiedCount > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {verifiedCount} Dokumen Tervalidasi
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Unggah sertifikat atau bukti portofolio untuk diverifikasi instan oleh AI dan langsung mendongkrak skor Skill Readiness kamu.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
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
            type="button"
            onClick={onOpenUpload}
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
                      isPro ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          +{cert.readinessBoostApplied || 3}% Skill Readiness
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1" title="Detail persentase peningkatan skill dapat dilihat di akun Gapless Pro">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Detail % (Khusus Pro)</span>
                        </span>
                      )
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{cert.judul}</h4>
                  <p className="text-slate-600 text-xs">Penerbit: <strong>{cert.penyelenggara}</strong></p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 flex-wrap">
                    <span>Terbit: {cert.tanggalTerbit}</span>
                  </div>

                  {isPro && cert.aiAnalysis && (
                    <div className="text-[11px] text-blue-900 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 mt-2 space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-blue-950">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>Analisis AI ({cert.aiAnalysis.achievementLevel}):</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {cert.aiAnalysis.aiNotes}
                      </p>
                    </div>
                  )}

                  {!cert.aiAnalysis && cert.adminNote && (
                    <p className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200/80 mt-1.5">
                      Catatan Evaluasi: <em>{cert.adminNote}</em>
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
  );
}
