import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/auth';
import { db } from '@/db';
import { assessmentResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hasGapReport } from '@/lib/payment_service';
import { findCareerProfile } from '@/data/gaplessData';
import { getOrCreateReportContent } from '@/lib/report_generator';
import { PdfDocument } from '@/lib/pdf_document';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // 1. Validasi kepemilikan asesmen
    const assessment = await db.query.assessmentResults.findFirst({
      where: and(
        eq(assessmentResults.id, assessmentId),
        eq(assessmentResults.userId, session.user.id)
      ),
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Asesmen tidak ditemukan atau akses ditolak' },
        { status: 404 }
      );
    }

    const careerTitle = assessment.selectedCareer || 'General Career';
    const careerProfile = findCareerProfile(assessment.careerSlug || careerTitle);
    const careerSlug =
      assessment.careerSlug ||
      careerProfile?.id ||
      careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 2. Validasi pembayaran Laporan Gap (Rp9.900)
    const isPurchased = await hasGapReport(session.user.id, careerSlug);
    if (!isPurchased) {
      return NextResponse.json(
        {
          error: 'Payment Required',
          message: 'Laporan Analisis Kesiapan Karier Eksekutif memerlukan pembelian Rp9.900.',
        },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const forceRegenerate = searchParams.get('force') === 'true';

    // 3. Ambil data laporan (dari cache DB atau generate AI baru jika belum ada)
    const reportData = await getOrCreateReportContent({
      assessmentId,
      userId: session.user.id,
      forceRegenerate,
    });

    // 4. Render ke PDF binary buffer via @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      React.createElement(PdfDocument, { report: reportData }) as any
    );

    // 5. Nama file bersih dan profesional
    const cleanRole = (reportData.targetRole || careerTitle)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `Gapless-Laporan-${cleanRole}-${reportData.reportNumber}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error rendering PDF report:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal membuat dokumen PDF laporan' },
      { status: 500 }
    );
  }
}
