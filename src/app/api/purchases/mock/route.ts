import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { subscribeProMock, buyGapReportMock, PRODUCTS_CONFIG } from '@/lib/payment_service';
import { z } from 'zod';

const purchaseSchema = z.object({
  productKey: z.enum(['pro_monthly', 'gap_report']).default('gap_report'),
  careerSlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data pembelian tidak valid', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { productKey, careerSlug } = parsed.data;

    if (productKey === 'pro_monthly') {
      const result = await subscribeProMock(
        session.user.id,
        session.user.email,
        session.user.name
      );
      return NextResponse.json({
        success: true,
        message: 'Langganan Gapless Pro berhasil diaktifkan!',
        periodEnd: result.periodEnd,
        purchase: result.purchase,
      });
    }

    if (productKey === 'gap_report') {
      if (!careerSlug) {
        return NextResponse.json({ error: 'Career slug wajib diisi untuk laporan gap' }, { status: 400 });
      }

      const result = await buyGapReportMock({
        userId: session.user.id,
        careerSlug,
        userEmail: session.user.email,
        userName: session.user.name,
      });

      return NextResponse.json({
        success: true,
        message: result.alreadyPurchased
          ? 'Laporan gap untuk karier ini sudah pernah dibeli.'
          : 'Pembayaran berhasil dikonfirmasi! Laporan gap mendalam telah terbuka.',
        alreadyPurchased: result.alreadyPurchased,
        purchase: result.purchase,
      });
    }

    return NextResponse.json({ error: 'Produk tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Mock purchase error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
