'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Award, Bookmark, ExternalLink, Filter,
  CheckCircle2, Clock, Sparkles, Lock, ArrowUpRight,
  Search, Users, Trophy, HeartHandshake, FileCheck, X
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  description: string | null;
  competencyTags: string[] | null;
  skillTags: string[] | null;
  deadline: Date | string | null;
  registrationUrl: string | null;
  matchPercent: number | null;
  isSample: boolean;
}

interface EvidenceItem {
  id: string;
  activityId: string;
  evidenceUrl: string;
  status: string;
  confirmedAt: Date | string | null;
  isSampleConfirmation: boolean | null;
}

interface Props {
  activities: ActivityItem[];
  savedIds: string[];
  evidenceMap: Record<string, EvidenceItem>;
  isPlus: boolean;
  lockedCount: number;
  monthlyQuota: number;
}

export function KegiatanClient({
  activities,
  savedIds: initialSavedIds,
  evidenceMap: initialEvidenceMap,
  isPlus,
  lockedCount,
  monthlyQuota,
}: Props) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));
  const [evidenceMap, setEvidenceMap] = useState<Record<string, EvidenceItem>>(initialEvidenceMap);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const toggleSave = async (activityId: string) => {
    const isSaved = savedIds.has(activityId);
    const nextSaved = new Set(savedIds);
    if (isSaved) {
      nextSaved.delete(activityId);
    } else {
      nextSaved.add(activityId);
    }
    setSavedIds(nextSaved);

    try {
      await fetch(`/api/activities/${activityId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });
    } catch (e) {
      console.error('Failed to toggle save', e);
    }
  };

  const handleRegisterClick = (activityId: string, url: string | null) => {
    if (!url) return;
    // Log affiliate / outgoing click
    fetch(`/api/activities/${activityId}/click`, { method: 'POST' }).catch(() => {});
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEvidenceModal = (activityId: string) => {
    setSubmittingId(activityId);
    setEvidenceUrl(evidenceMap[activityId]?.evidenceUrl || '');
    setFeedbackMsg(null);
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingId || !evidenceUrl.trim()) return;

    setIsSubmittingProof(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/activities/${submittingId}/submit-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceUrl }),
      });

      const data = await res.json();
      if (res.ok && data.evidence) {
        setEvidenceMap((prev) => ({
          ...prev,
          [submittingId]: data.evidence,
        }));
        setFeedbackMsg('Bukti berhasil dikirim! Status telah dicatat di Skill Passport.');
        setTimeout(() => {
          setSubmittingId(null);
        }, 1200);
      } else {
        setFeedbackMsg(data.error || 'Gagal mengirim bukti.');
      }
    } catch (err) {
      setFeedbackMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Filter list
  const filtered = activities.filter((act) => {
    if (selectedType === 'saved' && !savedIds.has(act.id)) return false;
    if (selectedType !== 'all' && selectedType !== 'saved' && act.type !== selectedType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description?.toLowerCase().includes(q) || false;
      const matchTags = act.competencyTags?.some((t) => t.toLowerCase().includes(q)) ||
                        act.skillTags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'organisasi':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'lomba':
        return <Trophy className="w-4 h-4 text-amber-600" />;
      case 'volunteer':
        return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'organisasi':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lomba':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'volunteer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDeadline = (d: Date | string | null) => {
    if (!d) return 'Terbuka';
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Rekomendasi Kegiatan</h1>
            {isPlus ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                Plus Aktif
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Free: {monthlyQuota} Kegiatan Terdekat
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">
            {isPlus
              ? 'Katalog kegiatan terkurasi yang dicocokkan deterministik dengan skill gap & target kariermu.'
              : 'Eksplorasi kegiatan terdekat untuk mengasah kepemimpinan, kerja tim, dan portofolio nyata.'}
          </p>
        </div>

        {!isPlus && (
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs shadow hover:opacity-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Buka Semua Kegiatan di Plus
          </Link>
        )}
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'organisasi', label: 'Organisasi' },
            { id: 'lomba', label: 'Lomba / Kompetisi' },
            { id: 'volunteer', label: 'Volunteer' },
            { id: 'saved', label: `Tersimpan (${savedIds.size})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedType === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan atau skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Grid of Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((act) => {
          const isSaved = savedIds.has(act.id);
          const evidence = evidenceMap[act.id];

          return (
            <motion.div
              key={act.id}
              layout
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${getTypeBadge(
                        act.type
                      )}`}
                    >
                      {getTypeIcon(act.type)}
                      <span className="capitalize">{act.type}</span>
                    </span>

                    {isPlus && act.matchPercent && act.matchPercent > 0 ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {act.matchPercent}% Cocok
                      </span>
                    ) : null}

                    {evidence && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          evidence.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {evidence.status === 'confirmed' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Dikonfirmasi Penyelenggara
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Bukti Terkirim (Verifikasi)
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleSave(act.id)}
                    title={isSaved ? 'Hapus dari simpanan' : 'Simpan kegiatan'}
                    className={`p-1.5 rounded-lg border transition ${
                      isSaved
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-600 transition">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                  {act.description}
                </p>

                {/* Skill & Competency Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {act.competencyTags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {act.skillTags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50/70 text-blue-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Deadline & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Tenggat: <strong className="text-slate-700 font-semibold">{formatDeadline(act.deadline)}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEvidenceModal(act.id)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    {evidence ? 'Update Bukti' : 'Kirim Bukti'}
                  </button>

                  <button
                    onClick={() => handleRegisterClick(act.id, act.registrationUrl)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1 transition shadow-sm"
                  >
                    Daftar
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800 mb-1">Tidak ada kegiatan yang cocok</h4>
          <p className="text-xs text-slate-500">
            Coba ubah filter atau kata kunci pencarian.
          </p>
        </div>
      )}

      {/* Locked Teaser for Free Users */}
      {!isPlus && lockedCount > 0 && (
        <div className="relative rounded-2xl p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden shadow-lg border border-indigo-900/50">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium border border-indigo-400/30 mb-2">
                <Lock className="w-3 h-3" />
                +{lockedCount} Kegiatan Lainnya Tersedia di Plus
              </div>
              <h3 className="text-lg font-bold">Buka Semua Rekomendasi Kegiatan & Urutan Gap</h3>
              <p className="text-xs text-indigo-200/90 max-w-xl mt-1 leading-relaxed">
                Di paket Plus, kamu bisa melihat seluruh katalog kegiatan aktif, diurutkan berdasarkan kecocokan terbesar terhadap skill gap kariermu.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-md transition whitespace-nowrap"
            >
              Upgrade ke Plus (Rp29.000)
            </Link>
          </div>
        </div>
      )}

      {/* Modal Submit Evidence */}
      <AnimatePresence>
        {submittingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Kirim Bukti Kegiatan</h3>
                </div>
                <button
                  onClick={() => setSubmittingId(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitEvidence} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tautan Bukti Keikutsertaan / Sertifikat
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... atau https://linkedin.com/..."
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tautan akan diverifikasi dan dicatat ke Skill Passport kamu sebagai bukti terkonfirmasi.
                  </p>
                </div>

                {feedbackMsg && (
                  <p className="text-xs font-medium text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                    {feedbackMsg}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingId(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProof}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {isSubmittingProof ? 'Menyimpan...' : 'Simpan & Kirim'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
