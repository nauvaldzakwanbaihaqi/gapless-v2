import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { assessmentResults, roadmapProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { CAREER_PROFILES } from '@/data/gaplessData';
import { getSimulationForCareer } from '@/data/industrySimulations';
import { hasActivePro } from '@/lib/payment_service';
import { Navbar } from '@/components/Navbar';
import SimulationClient from './SimulationClient';
import Link from 'next/link';

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/roadmap');
  }

  const isPro = await hasActivePro(session.user.id);
  if (!isPro) {
    redirect('/pricing');
  }

  const { assessmentId } = await params;

  // 1. Ambil assessment result dari DB
  const rawResult = await db.query.assessmentResults.findFirst({
    where: eq(assessmentResults.id, assessmentId),
  });

  const result = rawResult?.userId === session.user.id ? rawResult : null;

  if (!result || !result.selectedCareer) {
    return (
      <div className="min-h-screen bg-space flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Asesmen Tidak Ditemukan</h2>
            <p className="text-slate-500 text-sm mb-6">Silakan pilih karier aktif dari riwayat roadmap kamu.</p>
            <Link href="/roadmap" className="btn-primary inline-flex">Kembali ke Roadmap</Link>
          </div>
        </main>
      </div>
    );
  }

  const profile = CAREER_PROFILES.find((c) => 
    c.title === result.selectedCareer || 
    c.id === result.careerSlug ||
    (result.selectedCareer && c.title.toLowerCase().includes(result.selectedCareer.toLowerCase())) ||
    (result.careerSlug && c.id.toLowerCase().includes(result.careerSlug.toLowerCase()))
  );

  const careerTitle = result.selectedCareer || profile?.title || 'Profesional Karier';
  const slug = result.careerSlug || profile?.id || 'general-career';
  const simulationData = getSimulationForCareer(careerTitle, slug);

  // Cek apakah sudah pernah menyelesaikan simulasi
  const progressRecord = await db.query.roadmapProgress.findFirst({
    where: and(
      eq(roadmapProgress.careerSlug, slug),
      eq(roadmapProgress.userId, session.user.id)
    ),
  });

  const moduleStatuses = (progressRecord?.moduleStatuses as Record<string, boolean>) || {};
  const isSimulationCompleted = !!moduleStatuses['industry-simulation'];

  return (
    <div className="min-h-screen flex flex-col bg-space">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <SimulationClient
          assessmentId={assessmentId}
          careerTitle={careerTitle}
          careerSlug={slug}
          simulation={simulationData}
          isInitiallyCompleted={isSimulationCompleted}
          userName={session.user.name || 'Peserta Gapless'}
        />
      </main>
    </div>
  );
}
