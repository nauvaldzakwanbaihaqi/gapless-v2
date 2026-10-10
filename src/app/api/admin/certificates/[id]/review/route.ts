import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { certificates, users, readinessEvents, activityEvidence } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CERT_READINESS_BOOST } from '@/config/readiness';
import { z } from 'zod';

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().max(1000).optional(),
}).refine((data) => {
  if (data.action === 'reject') {
    return !!data.adminNote && data.adminNote.trim().length > 0;
  }
  return true;
}, {
  message: 'Catatan alasan penolakan wajib diisi',
  path: ['adminNote'],
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Guard: hanya role ADMIN, isAdmin, atau email admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    const isAdmin = currentUser?.isAdmin || currentUser?.role === 'ADMIN' || session.user.email === 'nauvaldzakwanbaihaqi@gmail.com';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Hanya admin yang dapat mereview sertifikat' }, { status: 403 });
    }

    const { id: certId } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Data review tidak valid', details: parsed.error.issues }, { status: 400 });
    }

    const certRows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, certId))
      .limit(1);

    if (certRows.length === 0) {
      return NextResponse.json({ error: 'Sertifikat tidak ditemukan' }, { status: 404 });
    }

    const cert = certRows[0];
    const now = new Date();
    const { action, adminNote } = parsed.data;

    let updatedCert;

    if (action === 'approve') {
      const isAlreadyApproved = cert.status === 'Tervalidasi' && cert.readinessBoostApplied > 0;
      const boostAmount = isAlreadyApproved ? cert.readinessBoostApplied : CERT_READINESS_BOOST;

      // Update certificate
      const updated = await db
        .update(certificates)
        .set({
          status: 'Tervalidasi',
          adminNote: adminNote || null,
          readinessBoostApplied: boostAmount,
          reviewedBy: session.user.id,
          reviewedAt: now,
        })
        .where(eq(certificates.id, certId))
        .returning();

      updatedCert = updated[0];

      // Idempotent logging ke readiness_events
      if (!isAlreadyApproved) {
        try {
          await db.insert(readinessEvents).values({
            userId: cert.userId,
            sourceType: 'certificate',
            sourceId: cert.id,
            boostAmount: CERT_READINESS_BOOST,
          }).onConflictDoNothing();
        } catch (evtErr) {
          console.warn('Readiness event insert notice:', evtErr);
        }
      }

      // Sinkronisasi status kegiatan bila terkait
      if (cert.activityId) {
        try {
          await db
            .update(activityEvidence)
            .set({ status: 'confirmed' })
            .where(eq(activityEvidence.activityId, cert.activityId));
        } catch (actErr) {
          console.warn('Sync confirmed activity error:', actErr);
        }
      }
    } else {
      // action === 'reject'
      const updated = await db
        .update(certificates)
        .set({
          status: 'Ditolak',
          adminNote: adminNote?.trim(),
          readinessBoostApplied: 0,
          reviewedBy: session.user.id,
          reviewedAt: now,
        })
        .where(eq(certificates.id, certId))
        .returning();

      updatedCert = updated[0];

      if (cert.activityId) {
        try {
          await db
            .update(activityEvidence)
            .set({ status: 'rejected' })
            .where(eq(activityEvidence.activityId, cert.activityId));
        } catch (actErr) {
          console.warn('Sync rejected activity error:', actErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      certificate: updatedCert,
      message: action === 'approve'
        ? `Sertifikat berhasil divalidasi! Poin Skill Readiness (+${CERT_READINESS_BOOST}%) telah ditambahkan.`
        : 'Sertifikat telah ditolak dengan catatan evaluasi.',
    });
  } catch (error) {
    console.error('Error reviewing certificate:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
