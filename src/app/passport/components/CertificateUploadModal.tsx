'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, AlertCircle, UploadCloud, FileCheck, X } from 'lucide-react';
import { CertificateData } from '../types';

interface CertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCertificate: CertificateData) => void;
}

export function CertificateUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: CertificateUploadModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formJudul, setFormJudul] = useState('');
  const [formPenyelenggara, setFormPenyelenggara] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formSumber, setFormSumber] = useState('Kegiatan di Gapless');
  const [formCatatan, setFormCatatan] = useState('');
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetForm = () => {
    setUploadFile(null);
    setFormJudul('');
    setFormPenyelenggara('');
    setFormTanggal('');
    setFormSumber('Kegiatan di Gapless');
    setFormCatatan('');
    setUploadError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !formJudul.trim() || !formPenyelenggara.trim() || !formTanggal) {
      setUploadError('Harap lengkapi semua bidang yang wajib diisi');
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }

    setIsSubmittingCert(true);
    setUploadError(null);

    const fd = new FormData();
    fd.append('judul', formJudul.trim());
    fd.append('penyelenggara', formPenyelenggara.trim());
    fd.append('tanggalTerbit', formTanggal);
    fd.append('sumber', formSumber);
    if (formCatatan.trim()) fd.append('catatanTambahan', formCatatan.trim());
    fd.append('file', uploadFile);
    fd.append('source', 'passport');

    try {
      const res = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.certificate) {
        onSuccess(data.certificate);
        handleClose();
      } else {
        setUploadError(data.error || 'Gagal mengunggah sertifikat');
      }
    } catch {
      setUploadError('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmittingCert(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">Unggah Sertifikat & Portofolio</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panduan Validasi AI Instan & Akumulasi Skor */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 border border-blue-200/80 text-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Verifikasi Instan via AI:</span>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-600 space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span><strong>100% Otomatis:</strong> Dokumen langsung diverifikasi secara otonom oleh AI dalam hitungan detik tanpa perlu antrean review!</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span><strong>Penilaian Bobot Dinamis:</strong> Prestasi juara lomba mendapat boost hingga +5%, volunteer +3%, dan kursus +2%.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span><strong>Khusus Gapless Pro:</strong> Analisis mendalam AI dan detail dampak skill per dokumen dapat diakses akun Pro.</span>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Sertifikat / Portofolio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sertifikat Juara 1 UI/UX Design Hackathon 2025"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penyelenggara / Penerbit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kementerian Kominfo / Dicoding / BEM UI"
                  value={formPenyelenggara}
                  onChange={(e) => setFormPenyelenggara(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sumber / Asal Sertifikat <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSumber}
                    onChange={(e) => setFormSumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                  >
                    <option value="Kegiatan di Gapless">Kegiatan di Gapless</option>
                    <option value="Kursus Eksternal">Kursus Eksternal</option>
                    <option value="Organisasi">Organisasi</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Juara 1 Nasional / Sertifikat kompetensi dengan predikat A"
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Sertifikat (JPG, PNG, PDF maks 5MB) <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 5 * 1024 * 1024) {
                          setUploadError('Ukuran file melebihi 5MB');
                          setUploadFile(null);
                        } else {
                          setUploadError(null);
                          setUploadFile(f);
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-semibold py-1">
                      <FileCheck className="w-4 h-4" />
                      <span className="truncate max-w-50">{uploadFile.name}</span>
                      <span className="text-slate-400 font-normal">({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-slate-500 flex flex-col items-center gap-1">
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                      <span>Pilih file atau seret ke sini</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCert || !uploadFile}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingCert ? 'Menganalisis dengan AI...' : 'Unggah & Verifikasi AI'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
