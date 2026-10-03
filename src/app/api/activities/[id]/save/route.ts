import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { savedActivities } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: activityId } = await params;
  try {
    await db
      .insert(savedActivities)
      .values({
        userId: session.user.id,
        activityId,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save activity error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: activityId } = await params;
  try {
    await db
      .delete(savedActivities)
      .where(
        and(
          eq(savedActivities.userId, session.user.id),
          eq(savedActivities.activityId, activityId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete saved activity error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
