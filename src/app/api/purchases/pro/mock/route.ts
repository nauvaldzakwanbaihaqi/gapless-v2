import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { subscribeProMock } from '@/lib/payment_service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await subscribeProMock(
      session.user.id,
      session.user.email,
      session.user.name
    );

    return NextResponse.json({
      success: true,
      message: 'Langganan Gapless Pro berhasil diaktifkan!',
      periodEnd: result.periodEnd,
    });
  } catch (error) {
    console.error('Pro subscription error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
