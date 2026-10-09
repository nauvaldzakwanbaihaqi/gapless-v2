'use client';

import { useState, useMemo, useEffect } from 'react';
import { CAREER_PROFILES as CAREERS, findCareerProfile, formatShortCareer, type CurriculumPhase } from '@/data/gaplessData';
import { RoadmapView } from '@/components/RoadmapView';
import type { RoadmapNode } from '@/contexts/CareerContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';

import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import Link from 'next/link';

type AssessmentResult = {
  id: string;
  createdAt: Date | null;
  selectedCareer: string | null;
  skillRatings: unknown;
  quizType: string;
  careerSlug: string | null;
  moduleStatuses?: unknown;
};

interface RoadmapClientProps {
  history: AssessmentResult[];
  initialAssessmentId?: string;
  serverUserTier?: string;
  serverIsPro?: boolean;
}

export default function RoadmapClient({ history, initialAssessmentId, serverUserTier, serverIsPro }: RoadmapClientProps) {
  const { session, status } = useAuthGuard();
  const userTier = (session?.user as { tier?: string })?.tier || serverUserTier || 'Free';
  const isPro = Boolean(serverIsPro);


  // Default to initialAssessmentId if valid, else most recent
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialAssessmentId && history.find(h => h.id === initialAssessmentId)) {
      return initialAssessmentId;
    }
    return history[0]?.id;
  });

  const selectedHistory = useMemo(() => {
    return history.find(h => h.id === selectedId) || history[0];
  }, [history, selectedId]);

  const [overrideData, setOverrideData] = useState<{ 
    id: string; 
    selectedCareer: any; 
    roadmapWithProgress: RoadmapNode[];
    skillRatings?: Record<string, number>;
  } | undefined>(undefined);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);

  useEffect(() => {
    async function fetchRoadmap() {
      if (!selectedHistory || !selectedHistory.selectedCareer) {
        setOverrideData(undefined);
        return;
      }

      setIsLoadingRoadmap(true);
      try {
        const profile = findCareerProfile(selectedHistory.selectedCareer) || findCareerProfile(selectedHistory.careerSlug) || CAREERS.find((c: { title: string }) => c.title === selectedHistory.selectedCareer);
        if (!profile) {
          setOverrideData(undefined);
          return;
        }

        const rawSkillRatings = (selectedHistory.skillRatings as Record<string, number>) || {};

        const buildRoadmap = (rawRoadmap: CurriculumPhase[]) => {
          return rawRoadmap.map((phase: CurriculumPhase, phaseIdx: number) => {
            const isLockedPhase = !isPro && phaseIdx >= 2;
            if (isLockedPhase) {
              return {
                ...phase,
                title: 'Lanjutan',
                subtitle: 'Materi lanjutan untuk memaksimalkan potensimu.',
                description: 'Pelajari materi lebih dalam dengan praktik industri nyata.',
                modules: phase.modules.map((_: unknown, i: number) => `Materi Premium ${i + 1}`),
                completedModules: [],
                progress: 0,
              };
            }

            const moduleStatuses: Record<string, boolean> = (selectedHistory.moduleStatuses as Record<string, boolean>) || {};
            const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

            const completedModules = phase.modules.filter((_module: string, idx: number) => {
              const moduleSlug = slugify(_module);
              if (moduleStatuses[moduleSlug]) return true;

              const skill = profile.skills[idx % profile.skills.length];
              if (!skill) return false;
              const userLevel = rawSkillRatings[skill.name] ?? 0;
              return userLevel >= skill.required;
            });

            return {
              ...phase,
              completedModules,
              progress: phase.modules.length > 0 ? completedModules.length / phase.modules.length : 0,
            };
          });
        };

        const res = await fetch('/api/roadmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId: selectedHistory.id })
        });
        
        if (res.ok) {
          const data = await res.json();
          setOverrideData({
            id: selectedHistory.id,
            selectedCareer: profile,
            roadmapWithProgress: buildRoadmap(data.roadmap),
            skillRatings: rawSkillRatings,
          });
        } else if (profile.roadmap) {
          console.warn('API roadmap error, fallback to static profile roadmap');
          setOverrideData({
            id: selectedHistory.id,
            selectedCareer: profile,
            roadmapWithProgress: buildRoadmap(profile.roadmap),
            skillRatings: rawSkillRatings,
          });
        } else {
          setOverrideData(undefined);
        }
      } catch (e) {
        console.error('Failed to fetch roadmap:', e);
        const profile = CAREERS.find((c: { title: string }) => c.title === selectedHistory.selectedCareer);
        if (profile && profile.roadmap) {
          const rawSkillRatings = (selectedHistory.skillRatings as Record<string, number>) || {};
          const moduleStatuses: Record<string, boolean> = (selectedHistory.moduleStatuses as Record<string, boolean>) || {};
          const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

          const fallbackNodes = profile.roadmap.map((phase: CurriculumPhase, phaseIdx: number) => {
            const isLockedPhase = !isPro && phaseIdx >= 2;
            if (isLockedPhase) {
              return {
                ...phase,
                title: 'Lanjutan',
                subtitle: 'Materi lanjutan untuk memaksimalkan potensimu.',
                description: 'Pelajari materi lebih dalam dengan praktik industri nyata.',
                modules: phase.modules.map((_: unknown, i: number) => `Materi Premium ${i + 1}`),
                completedModules: [],
                progress: 0,
              };
            }

            const completedModules = phase.modules.filter((_module: string, idx: number) => {
              const moduleSlug = slugify(_module);
              if (moduleStatuses[moduleSlug]) return true;

              const skill = profile.skills[idx % profile.skills.length];
              if (!skill) return false;
              const userLevel = rawSkillRatings[skill.name] ?? 0;
              return userLevel >= skill.required;
            });

            return {
              ...phase,
              completedModules,
              progress: phase.modules.length > 0 ? completedModules.length / phase.modules.length : 0,
            };
          });

          setOverrideData({
            id: selectedHistory.id,
            selectedCareer: profile,
            roadmapWithProgress: fallbackNodes,
            skillRatings: rawSkillRatings,
          });
        } else {
          setOverrideData(undefined);
        }
      } finally {
        setIsLoadingRoadmap(false);
      }
    }
    
    fetchRoadmap();
  }, [selectedHistory, isPro]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-space">
      <Navbar />
      <LearningTabsNav />

      <main className="flex-1">
        {/* Switcher Header - Tabs */}
        {history.length > 1 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-3.5">
              <div>
                <h2 className="font-bold text-slate-900 text-base sm:text-lg">Riwayat Roadmap Kamu</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Pilih hasil asesmen untuk melihat roadmap pembelajaran:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-full">
                {history.map((h) => {
                  const isSelected = selectedId === h.id;
                  const isExploration = h.quizType === 'belum_tahu_minat';
                  const careerTitle = h.selectedCareer || 'Karier';
                  const shortCareer = formatShortCareer(careerTitle);

                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedId(h.id)}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer max-w-full ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                      }`}
                      title={careerTitle}
                    >
                      <span className="shrink-0">{isExploration ? '🧭' : '🎯'}</span>
                      <span className="truncate max-w-[200px] sm:max-w-[320px]">
                        {isExploration ? 'Eksplorasi' : 'Terarah'} • {shortCareer}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {history.length === 1 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 shadow-sm">
              <div>
                <h3 className="font-bold text-blue-900 text-sm">Eksplorasi Jalur Lain</h3>
                <p className="text-xs text-blue-700 mt-1">
                  {history[0].quizType === 'belum_tahu_minat' 
                    ? 'Punya target karier spesifik di benakmu? Coba ambil jalur "Sudah Tahu Minat".'
                    : 'Masih ragu dengan pilihanmu? Temukan rekomendasi AI lewat jalur "Belum Tahu Minat".'}
                </p>
              </div>
              <Link 
                href={history[0].quizType === 'belum_tahu_minat' ? '/career-test' : '/assessment'}
                className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors"
              >
                Coba Sekarang
              </Link>
            </div>
          </div>
        )}

        {isLoadingRoadmap ? (
          <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : overrideData ? (
          <div>
            <RoadmapView overrideData={overrideData} isPro={isPro} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <p className="text-slate-600">Terjadi kesalahan saat memuat data roadmap.</p>
          </div>
        )}
      </main>
    </div>
  );
}
