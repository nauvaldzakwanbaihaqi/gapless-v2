'use client';

import { useState, useMemo, useEffect } from 'react';
import { CAREER_PROFILES as CAREERS, type CurriculumPhase } from '@/data/gaplessData';
import { RoadmapView } from '@/components/RoadmapView';
import type { RoadmapNode } from '@/contexts/CareerContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { isPlusUser } from '@/config/plan';
import { Navbar } from '@/components/Navbar';
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
  const isPro = serverIsPro !== undefined ? serverIsPro : isPlusUser(userTier);


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
        const profile = CAREERS.find((c: { title: string }) => c.title === selectedHistory.selectedCareer);
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

      <main className="flex-1">
        {/* Switcher Header - Tabs */}
        {history.length > 1 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-between relative z-10 gap-4">
              <div className="text-center">
                <h2 className="font-bold text-slate-800">Riwayat Roadmap Kamu</h2>
                <p className="text-sm text-slate-500">Pilih dari hasil asesmen aktif</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelectedId(h.id)}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      selectedId === h.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {h.quizType === 'belum_tahu_minat' ? 'Jalur Eksplorasi' : 'Jalur Terarah'}: {h.selectedCareer}
                  </button>
                ))}
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
          <div className="-mt-12">
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
