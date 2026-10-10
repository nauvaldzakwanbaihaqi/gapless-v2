'use client';

import { COMPETENCIES, CompetencyItem } from '../types';

interface SoftSkillCompetenciesProps {
  competencies?: CompetencyItem[];
}

export function SoftSkillCompetencies({
  competencies = COMPETENCIES,
}: SoftSkillCompetenciesProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Rincian 5 Kompetensi Soft Skill</h2>
          <p className="text-xs text-slate-500">Standar kompetensi kerja O*NET & industri terapan.</p>
        </div>
      </div>

      <div className="space-y-4">
        {competencies.map((comp) => {
          const score = comp.base;
          return (
            <div key={comp.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">{comp.name}</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">— {comp.desc}</span>
                </div>
                <span className="font-bold text-slate-900">{score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
