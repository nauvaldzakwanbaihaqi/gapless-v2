import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProSubscription } from '@/lib/payment_service';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ isPro: false, periodEnd: null, daysRemaining: 0 });
  }

  const status = await getProSubscription(session.user.id);
  return NextResponse.json(status);
}
