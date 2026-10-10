'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Layers, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGaplessContext } from '@/contexts/CareerContext';
import { quizBank } from '@/data/quizBank';
import { TRAIT_META } from '@/data/gaplessData';

// Simple slugify to match DB roleName to quizBank keys (e.g. 'Software Engineer' -> 'software-engineer')
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export function CaseStudyQuizView() {
    const { 
        selectedRole, 
        selectedCareer, 
        setSkillRating, 
        setView,
        skillGapData,
        fetchGapInsight,
        isLoadingGapAi,
        gapInsight,
        syncResultNow
    } = useGaplessContext();
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);
    
    // Map DB role slugs to quizBank keys if they don't match exactly
    const ROLE_ALIASES: Record<string, string> = {
        'graphic-designer-digital-creative-product-designer': 'graphic-designer',
        'content-creator-social-media-specialist': 'content-creator',
        'software-engineer-front-back-full-stack': 'software-engineer',
        'ai-ml-engineer-machine-learning-engineer': 'ai-ml-engineer',
        'devops-engineer-qa-automation-engineer': 'devops-qa-engineer',
        'data-analyst-business-intelligence': 'data-analyst',
        'data-researcher-strategy-analyst': 'data-researcher',
        'digital-marketing-specialist': 'digital-marketing',
        'business-development-account-executive': 'business-development',
        'e-commerce-dropship-specialist': 'ecommerce-specialist',
    };

    // Attempt to get the quiz questions
    let roleSlug = selectedRole ? slugify(selectedRole.roleName) : '';
    
    // Apply alias if exists
    if (ROLE_ALIASES[roleSlug]) {
        roleSlug = ROLE_ALIASES[roleSlug];
    }
    
    const questions = quizBank[roleSlug] || [];

    const [step, setStep] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [questionScores, setQuestionScores] = useState<number[]>([]);
    const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
      if (step === 2) {
        const syncAndRedirect = async () => {
          setIsSyncing(true);
          try {
            const assessmentId = await syncResultNow();
            if (assessmentId) {
              router.push(`/hasil/${assessmentId}`);
            } else {
              setIsSyncing(false);
              // Fallback for guest mode
              setView('roadmap');
            }
          } catch (e) {
            setIsSyncing(false);
            alert('Gagal menyimpan hasil asesmen. Silakan coba lagi.');
            setStep(1);
          }
        };
        syncAndRedirect();
      }
    }, [step, syncResultNow, router, setView]);

    // If no questions are found for this role, we can just skip or show a placeholder.
    if (!questions || questions.length === 0) {
        return (
            <div className="min-h-screen bg-space flex items-center justify-center px-4">
                <div className="max-w-md w-full glass-card p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Quiz Case Study</h2>
                    <p className="mb-6 text-gray-500">Modul kuis untuk peran ini sedang disiapkan.</p>
                    <button 
                        onClick={() => {
                            // Assign default level 1 so roadmap works
                            selectedCareer?.skills.forEach(skill => {
                                setSkillRating(skill.name, 1);
                            });
                            setView('roadmap');
                        }}
                        className="btn-primary w-full"
                    >
                        Lanjut ke Roadmap →
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    
    const handleSelectOption = (idx: number) => {
        setSelectedOptionIdx(idx);
    };

    const handleConfirmNext = () => {
        if (selectedOptionIdx === null || !currentQuestion) return;
        const optionScore = currentQuestion.options[selectedOptionIdx].score;
        const newScores = [...questionScores, optionScore];
        
        if (currentIndex < questions.length - 1) {
            setQuestionScores(newScores);
            setCurrentIndex(currentIndex + 1);
            setSelectedOptionIdx(null);
        } else {
            if (selectedCareer) {
                const totalSkills = selectedCareer.skills.length;
                const totalQs = questions.length;
                
                selectedCareer.skills.forEach((skill, skillIdx) => {
                    let skillPoints = 0;
                    let maxSkillPoints = 0;
                    
                    for (let qIdx = 0; qIdx < totalQs; qIdx++) {
                         if (qIdx % totalSkills === skillIdx) {
                             skillPoints += newScores[qIdx];
                             maxSkillPoints += 10; // assuming each Q is max 10
                         }
                    }
                    
                    const pct = maxSkillPoints > 0 ? skillPoints / maxSkillPoints : 0;
                    
                    let finalLevel = 1;
                    if (pct >= 0.8) {
                        finalLevel = 3; // Lanjutan
                    } else if (pct >= 0.4) {
                        finalLevel = 2; // Menengah
                    } else {
                        finalLevel = 1; // Dasar
                    }
                    
                    setSkillRating(skill.name, finalLevel);
                });
            }
            
            setStep(2);
        }
    };

    const radarData = skillGapData.map((s) => ({
      name: s.name.split(' ').slice(0, 2).join(' '),
      required: s.required,
      current: s.current,
    }));

    const traitMeta = selectedCareer ? TRAIT_META[selectedCareer.trait] : { color: '#3b82f6' };
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-space flex flex-col items-center justify-center px-4 sm:px-6 py-12">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-2xl"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Case Study: {selectedRole?.roleName}</h2>
                            <p className="text-gray-500">Pertanyaan {currentIndex + 1} dari {questions.length}</p>
                        </div>

                        <div className="w-full bg-gray-200 h-2 rounded-full mb-10 overflow-hidden">
                            <motion.div 
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #22d3ee)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="glass-card p-6 sm:p-8"
                            >
                                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-8 leading-relaxed">
                                    {currentQuestion.question}
                                </h3>

                                <div className="space-y-4">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedOptionIdx === idx;
                                        return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(idx)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all group flex items-start gap-4 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                                                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'
                                            }`}>
                                                {option.label}
                                            </div>
                                            <span className={`mt-1 transition-colors ${
                                                isSelected ? 'text-slate-900 font-medium' : 'text-gray-600 group-hover:text-slate-900'
                                            }`}>
                                                {option.text}
                                            </span>
                                        </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleConfirmNext}
                                        disabled={selectedOptionIdx === null}
                                        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        {currentIndex === questions.length - 1 ? 'Lihat Hasil' : 'Selanjutnya'}
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mb-6">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Menyimpan Hasilmu...</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Mohon tunggu sebentar, kami sedang menyiapkan laporan analisis gap skill kamu.
                        </p>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </div>
    );
}
