import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { activities, activityEvidence } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const proofSchema = z.object({
  evidenceUrl: z.string().url('Tautan bukti harus berupa URL valid'),
});

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
    const body = await req.json();
    const parsed = proofSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data tidak valid' },
        { status: 400 }
      );
    }

    const activity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (!activity.length) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah sudah ada evidence sebelumnya
    const existing = await db
      .select()
      .from(activityEvidence)
      .where(
        and(
          eq(activityEvidence.userId, session.user.id),
          eq(activityEvidence.activityId, activityId)
        )
      )
      .limit(1);

    let result;
    const isSample = activity[0].isSample;
    // Untuk data sample, konfirmasi bisa disimulasikan sebagai confirmed jika isSample
    const status = isSample ? 'confirmed' : 'pending';
    const now = new Date();

    if (existing.length > 0) {
      const updated = await db
        .update(activityEvidence)
        .set({
          evidenceUrl: parsed.data.evidenceUrl,
          status,
          isSampleConfirmation: isSample,
          confirmedAt: isSample ? now : existing[0].confirmedAt,
        })
        .where(eq(activityEvidence.id, existing[0].id))
        .returning();
      result = updated[0];
    } else {
      const inserted = await db
        .insert(activityEvidence)
        .values({
          userId: session.user.id,
          activityId,
          evidenceUrl: parsed.data.evidenceUrl,
          status,
          isSampleConfirmation: isSample,
          confirmedAt: isSample ? now : null,
        })
        .returning();
      result = inserted[0];
    }

    return NextResponse.json({ success: true, evidence: result });
  } catch (error) {
    console.error('Submit proof error:', error);
    return NextResponse.json({ error: 'Gagal mengirim bukti' }, { status: 500 });
  }
}
