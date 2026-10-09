import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buyGapReportMock } from '@/lib/payment_service';
import { z } from 'zod';

const schema = z.object({
  careerSlug: z.string().min(1, 'Career slug wajib diisi'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.issues }, { status: 400 });
    }

    const result = await buyGapReportMock({
      userId: session.user.id,
      careerSlug: parsed.data.careerSlug,
      userEmail: session.user.email,
      userName: session.user.name,
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyPurchased
        ? 'Laporan gap untuk karier ini sudah pernah dibeli.'
        : 'Pembayaran berhasil! Laporan gap mendalam telah terbuka.',
      alreadyPurchased: result.alreadyPurchased,
    });
  } catch (error) {
    console.error('Gap report purchase error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
