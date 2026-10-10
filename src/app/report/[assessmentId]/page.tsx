import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { assessmentResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hasGapReport } from '@/lib/payment_service';
import { findCareerProfile } from '@/data/gaplessData';
import { getOrCreateReportContent } from '@/lib/report_generator';
import { ReportDocumentClient } from './ReportDocumentClient';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Laporan Analisis Kesiapan Karier | Gapless Advisory',
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const session = await auth();
  const { assessmentId } = await params;

  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/report/${assessmentId}`);
  }

  // 1. Ambil data asesmen
  const assessment = await db.query.assessmentResults.findFirst({
    where: and(
      eq(assessmentResults.id, assessmentId),
      eq(assessmentResults.userId, session.user.id)
    ),
  });

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="p-8 max-w-md w-full bg-white rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Laporan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Hasil asesmen tidak ditemukan atau kamu tidak memiliki hak akses ke dokumen ini.
          </p>
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Riwayat Asesmen</span>
          </Link>
        </div>
      </div>
    );
  }

  const careerTitle = assessment.selectedCareer || 'General Career';
  const careerProfile = findCareerProfile(assessment.careerSlug || careerTitle);
  const careerSlug =
    assessment.careerSlug ||
    careerProfile?.id ||
    careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 2. Cek status kepemilikan / pembelian
  const isPurchased = await hasGapReport(session.user.id, careerSlug);
  if (!isPurchased) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="p-8 max-w-md w-full bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Laporan Komprehensif Terkunci</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Laporan Analisis Kesiapan Karier format konsultan (9 halaman lengkap) memerlukan akses Laporan Gap Mendalam untuk peran <strong>{careerTitle}</strong>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/hasil/${assessmentId}`}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Buka di Halaman Hasil (Rp9.900)
            </Link>
            <Link
              href="/results"
              className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Ambil / Generate isi laporan secara otonom & tersimpan di DB
  const reportData = await getOrCreateReportContent({
    assessmentId,
    userId: session.user.id,
  });

  return (
    <ReportDocumentClient report={reportData} assessmentId={assessmentId} />
  );
}
