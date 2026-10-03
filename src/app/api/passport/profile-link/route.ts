import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { publicProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await db
      .select()
      .from(publicProfiles)
      .where(eq(publicProfiles.userId, session.user.id))
      .limit(1);

    let result;
    if (existing.length > 0) {
      const updated = await db
        .update(publicProfiles)
        .set({
          enabled: true,
          revokedAt: null,
        })
        .where(eq(publicProfiles.id, existing[0].id))
        .returning();
      result = updated[0];
    } else {
      const token = crypto.randomBytes(16).toString('hex');
      const inserted = await db
        .insert(publicProfiles)
        .values({
          userId: session.user.id,
          publicToken: token,
          enabled: true,
        })
        .returning();
      result = inserted[0];
    }

    return NextResponse.json({ success: true, profile: result });
  } catch (error) {
    console.error('Profile link toggle error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await db
      .select()
      .from(publicProfiles)
      .where(eq(publicProfiles.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(publicProfiles)
        .set({
          enabled: false,
          revokedAt: new Date(),
        })
        .where(eq(publicProfiles.id, existing[0].id))
        .returning();
      return NextResponse.json({ success: true, profile: updated[0] });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile link disable error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
