import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { recordPurchase, PRODUCTS_CONFIG } from '@/lib/payment_service';
import { z } from 'zod';

const purchaseSchema = z.object({
  productKey: z.string().default('gap_report'),
  careerSlug: z.string().min(1, 'Career slug wajib diisi'),
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
    const product = PRODUCTS_CONFIG[productKey];

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const result = await recordPurchase({
      userId: session.user.id,
      productKey,
      careerSlug,
      amount: product.price,
      isMockPayment: true,
      metadata: {
        purchasedByEmail: session.user.email,
        purchasedByName: session.user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyPurchased
        ? 'Akses untuk produk ini sudah aktif.'
        : 'Pembayaran berhasil dikonfirmasi! Laporan lengkap telah terbuka.',
      purchase: result.purchase,
    });
  } catch (error) {
    console.error('Mock purchase error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
