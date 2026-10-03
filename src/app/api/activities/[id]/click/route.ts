import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { affiliateClicks } from '@/db/schema';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: activityId } = await params;

  try {
    await db.insert(affiliateClicks).values({
      userId: session?.user?.id || null,
      targetType: 'activity',
      targetId: activityId,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 200 }); // silent
  }
}
