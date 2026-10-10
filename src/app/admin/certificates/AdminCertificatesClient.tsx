'use client';

import { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, FileText, ExternalLink, AlertCircle } from 'lucide-react';

interface CertificateItem {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
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
  createdAt: Date;
  reviewedAt: Date | null;
}

export function AdminCertificatesClient({ initialCertificates }: { initialCertificates: CertificateItem[] }) {
  const [certs, setCerts] = useState<CertificateItem[]>(initialCertificates);
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalCert, setRejectModalCert] = useState<CertificateItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredCerts = certs.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleApprove = async (id: string) => {
    if (!confirm('Validasi sertifikat ini dan berikan boost +3% Skill Readiness?')) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/certificates/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json();
      if (res.ok && data.certificate) {
        setCerts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'Tervalidasi', readinessBoostApplied: 3 } : item))
        );
      } else {
        alert(data.error || 'Gagal memvalidasi sertifikat');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalCert) return;

    setProcessingId(rejectModalCert.id);
    try {
      const res = await fetch(`/api/admin/certificates/${rejectModalCert.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          adminNote: rejectReason.trim() || 'Dokumen belum memenuhi kriteria validasi.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.certificate) {
        setCerts((prev) =>
          prev.map((item) =>
            item.id === rejectModalCert.id
              ? { ...item, status: 'Ditolak', adminNote: rejectReason.trim(), readinessBoostApplied: 0 }
              : item
          )
        );
        setRejectModalCert(null);
        setRejectReason('');
      } else {
        alert(data.error || 'Gagal menolak sertifikat');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Panel: Verifikasi Sertifikat</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Tinjau sertifikat dan portofolio yang diunggah pengguna untuk validasi poin Skill Readiness.
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'Menunggu Review', 'Tervalidasi', 'Ditolak'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'all' ? 'Semua' : tab}
            </button>
          ))}
        </div>
      </div>

      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada sertifikat dalam kategori ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCerts.map((cert) => {
            const isPending = cert.status === 'Menunggu Review';
            const isApproved = cert.status === 'Tervalidasi';
            const isRejected = cert.status === 'Ditolak';

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3 h-3" />}
                      {isRejected && <XCircle className="w-3 h-3" />}
                      {isPending && <Clock className="w-3 h-3" />}
                      {cert.status}
                    </span>

                    {cert.readinessBoostApplied > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        +{cert.readinessBoostApplied}% Readiness
                      </span>
                    )}

                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      Sumber: {cert.sumber || (cert.source === 'kegiatan' ? 'Kegiatan di Gapless' : 'Skill Passport')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{cert.judul}</h3>

                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Penerbit: <strong>{cert.penyelenggara}</strong>
                    </span>
                    <span>
                      Tanggal Terbit: <strong>{cert.tanggalTerbit}</strong>
                    </span>
                    {cert.kategoriSkill && (
                      <span>
                        Skill: <strong className="text-indigo-600">#{cert.kategoriSkill}</strong>
                      </span>
                    )}
                    <span>
                      User: <strong>{cert.userName || cert.userEmail}</strong> ({cert.userEmail})
                    </span>
                  </div>

                  {cert.catatanTambahan && (
                    <p className="text-xs text-indigo-700 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 mt-2">
                      Catatan User: {cert.catatanTambahan}
                    </p>
                  )}

                  {cert.adminNote && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                      Catatan Admin: <em>{cert.adminNote}</em>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <a
                    href={`/api/certificates/${cert.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Buka Dokumen
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(cert.id)}
                        disabled={processingId === cert.id}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validasi (+3%)
                      </button>

                      <button
                        onClick={() => {
                          setRejectModalCert(cert);
                          setRejectReason('');
                        }}
                        disabled={processingId === cert.id}
                        className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Alasan Tolak */}
      {rejectModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-base">Tolak Sertifikat</h3>
            </div>
            <p className="text-xs text-slate-600">
              Sertifikat <strong>{rejectModalCert.judul}</strong> akan ditolak. Berikan catatan evaluasi untuk pengguna:
            </p>
            <form onSubmit={handleReject} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Contoh: Dokumen tidak menampilkan nama lengkap pengguna atau foto sertifikat buram..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalCert(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectModalCert.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {processingId === rejectModalCert.id ? 'Memproses...' : 'Konfirmasi Tolak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
