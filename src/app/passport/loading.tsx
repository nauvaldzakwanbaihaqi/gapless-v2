import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Navbar />
      <LearningTabsNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-8 flex items-center justify-center">
        <LoadingScreen message="Memuat Skill Passport..." />
      </main>
    </div>
  );
}
