import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { assessmentResults, roadmapProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { CAREER_PROFILES } from '@/data/gaplessData';
import { getSimulationForCareer } from '@/data/industrySimulations';
import { Navbar } from '@/components/Navbar';
import CertificateClient from './CertificateClient';
import Link from 'next/link';

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/roadmap');
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

  const credentialId = `GAP-${assessmentId.slice(0, 8).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <div className="print:hidden">
        <Navbar variant="dark" />
      </div>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <CertificateClient
          assessmentId={assessmentId}
          userName={session.user.name || 'Peserta Gapless'}
          userEmail={session.user.email || ''}
          careerTitle={careerTitle}
          companyName={simulationData.companyName}
          badgeLabel={simulationData.badgeLabel}
          skillsValidated={simulationData.skillsValidated}
          credentialId={credentialId}
          issueDate={issueDate}
        />
      </main>
    </div>
  );
}
