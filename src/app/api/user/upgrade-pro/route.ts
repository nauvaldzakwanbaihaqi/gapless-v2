import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { subscribeProMock } from '@/lib/payment_service';

export async function POST() {
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
      tier: 'Student Pro',
      message: 'Selamat! Akun kamu berhasil di-upgrade ke Gapless Pro.',
      periodEnd: result.periodEnd,
    });
  } catch (error) {
    console.error('Error upgrading to Pro:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
