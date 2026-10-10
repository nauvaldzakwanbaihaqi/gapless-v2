import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { certificates, activityEvidence } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateCertificateFile, saveCertificateFile } from '@/lib/certificate_storage';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const judul = formData.get('judul')?.toString().trim();
    const penyelenggara = formData.get('penyelenggara')?.toString().trim();
    const tanggalTerbit = formData.get('tanggalTerbit')?.toString().trim();
    const kategoriSkill = formData.get('kategoriSkill')?.toString().trim();
    const sumber = formData.get('sumber')?.toString().trim() || 'Kegiatan di Gapless';
    const catatanTambahan = formData.get('catatanTambahan')?.toString().trim() || null;
    const source = (formData.get('source')?.toString().trim() || 'passport') as 'passport' | 'kegiatan';
    const activityId = formData.get('activityId')?.toString().trim() || null;
    const file = formData.get('file') as File | null;

    if (!judul || !penyelenggara || !tanggalTerbit) {
      return NextResponse.json(
        { error: 'Judul, penyelenggara, dan tanggal terbit wajib diisi' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: 'File sertifikat wajib diunggah' }, { status: 400 });
    }

    // Validasi file (ukuran & MIME magic bytes)
    const validation = await validateCertificateFile(file);
    if (!validation.valid || !validation.ext || !validation.mimeType) {
      return NextResponse.json({ error: validation.error || 'File tidak valid' }, { status: 400 });
    }

    const certId = crypto.randomUUID();

    // Simpan file ke storage privat yang aman
    const { storageKey, size } = await saveCertificateFile(
      session.user.id,
      certId,
      file,
      validation.ext,
      validation.mimeType
    );

    // Tulis ke database
    const inserted = await db
      .insert(certificates)
      .values({
        id: certId,
        userId: session.user.id,
        judul,
        penyelenggara,
        tanggalTerbit,
        kategoriSkill: kategoriSkill || null,
        sumber,
        catatanTambahan,
        fileStorageKey: storageKey,
        fileMimeType: validation.mimeType,
        fileSize: size,
        status: 'Menunggu Review',
        readinessBoostApplied: 0,
        source,
        activityId,
      })
      .returning();

    // Sinkronisasi otomatis ke kegiatan jika sumbernya dari kegiatan
    if (source === 'kegiatan' && activityId) {
      try {
        const existingEvidence = await db
          .select()
          .from(activityEvidence)
          .where(
            and(
              eq(activityEvidence.userId, session.user.id),
              eq(activityEvidence.activityId, activityId)
            )
          )
          .limit(1);

        if (existingEvidence.length > 0) {
          await db
            .update(activityEvidence)
            .set({
              evidenceUrl: `/api/certificates/${certId}/file`,
              status: 'pending',
            })
            .where(eq(activityEvidence.id, existingEvidence[0].id));
        } else {
          await db.insert(activityEvidence).values({
            userId: session.user.id,
            activityId,
            evidenceUrl: `/api/certificates/${certId}/file`,
            status: 'pending',
          });
        }
      } catch (err) {
        console.warn('Sync activity evidence notice:', err);
      }
    }

    return NextResponse.json({
      success: true,
      certificate: inserted[0],
      message: 'Sertifikat berhasil diunggah dan sedang menunggu review admin.',
    });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    return NextResponse.json({ error: 'Gagal mengunggah sertifikat' }, { status: 500 });
  }
}
