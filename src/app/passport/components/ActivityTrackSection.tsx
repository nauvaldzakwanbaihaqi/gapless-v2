'use client';

import { CheckCircle2, Shield, ExternalLink, FileText } from 'lucide-react';
import { ActivityEvidenceItem, MissionProgressItem } from '../types';

interface ActivityTrackSectionProps {
  userActivities: ActivityEvidenceItem[];
  completedMissions: MissionProgressItem[];
}

export function ActivityTrackSection({
  userActivities,
  completedMissions,
}: ActivityTrackSectionProps) {
  const isEmpty = userActivities.length === 0 && completedMissions.length === 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Rekam Jejak Misi & Kegiatan</h2>
          <p className="text-xs text-slate-500">
            Pencapaian misi soft skill dan partisipasi kegiatan terverifikasi.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Kegiatan Terkonfirmasi */}
        {userActivities.map(({ evidence, activity }) => (
          <div
            key={evidence.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900">{activity.title}</span>
                <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {activity.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Dikonfirmasi Penyelenggara
                </span>
              </div>
            </div>
            <a
              href={evidence.evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-xs font-medium"
            >
              Lihat Bukti
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}

        {/* Misi Soft Skill */}
        {completedMissions.map(({ progress, mission }) => (
          <div
            key={progress.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900">{mission.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium capitalize">
                  {mission.competency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  <Shield className="w-3 h-3 text-blue-600" />
                  Dinilai Lewat Misi (+1% Readiness)
                </span>
              </div>
            </div>
            {progress.submissionUrl ? (
              <a
                href={progress.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-xs font-medium"
              >
                Tautan Hasil
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-500 italic">Terselesaikan</span>
            )}
          </div>
        ))}

        {isEmpty && (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs">Belum ada rekam jejak kegiatan atau misi yang tercatat.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Selesaikan misi soft skill untuk membangun Skill Passport kamu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
