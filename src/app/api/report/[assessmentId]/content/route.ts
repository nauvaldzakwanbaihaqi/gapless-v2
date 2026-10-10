import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { assessmentResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hasGapReport } from '@/lib/payment_service';
import { findCareerProfile } from '@/data/gaplessData';
import { getOrCreateReportContent } from '@/lib/report_generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId } = await params;

    // 1. Cek kepemilikan asesmen
    const assessment = await db.query.assessmentResults.findFirst({
      where: and(
        eq(assessmentResults.id, assessmentId),
        eq(assessmentResults.userId, session.user.id)
      ),
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Asesmen tidak ditemukan atau akses ditolak' }, { status: 404 });
    }

    const careerTitle = assessment.selectedCareer || 'General Career';
    const careerProfile = findCareerProfile(assessment.careerSlug || careerTitle);
    const careerSlug = assessment.careerSlug || careerProfile?.id || careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 2. Cek status pembelian Laporan Gap
    const isPurchased = await hasGapReport(session.user.id, careerSlug);
    if (!isPurchased) {
      return NextResponse.json(
        {
          error: 'Payment Required',
          message: 'Laporan Analisis Kesiapan Karier Komprehensif memerlukan pembelian Rp9.900.',
        },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const forceRegenerate = searchParams.get('force') === 'true';

    // 3. Ambil / Generate konten laporan
    const reportData = await getOrCreateReportContent({
      assessmentId,
      userId: session.user.id,
      forceRegenerate,
    });

    return NextResponse.json({
      success: true,
      report: reportData,
    });
  } catch (error: any) {
    console.error('Error fetching report content:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memuat konten laporan' },
      { status: 500 }
    );
  }
}
