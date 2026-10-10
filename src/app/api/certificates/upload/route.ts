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
    const { storageKey, size, base64Data } = await saveCertificateFile(
      session.user.id,
      certId,
      file,
      validation.ext,
      validation.mimeType
    );

    // Ambil buffer untuk evaluasi AI
    let fileBuffer: Buffer | undefined;
    try {
      const arr = await file.arrayBuffer();
      fileBuffer = Buffer.from(arr);
    } catch {
      fileBuffer = undefined;
    }

    // Evaluasi AI untuk mendeteksi pencapaian (misal Juara 1 = 5%, Volunteer = 3%)
    const { evaluateCertificateWithAI } = await import('@/lib/certificate_evaluator');
    const aiAnalysis = await evaluateCertificateWithAI({
      judul,
      penyelenggara,
      tanggalTerbit,
      sumber,
      kategoriSkill,
      catatanTambahan,
      fileBuffer,
      fileMimeType: validation.mimeType,
    });

    // Jika AI mendeteksi dokumen palsu/spam/tidak valid
    if (!aiAnalysis.isValidDocument) {
      return NextResponse.json(
        {
          error:
            aiAnalysis.aiNotes ||
            'Berkas yang diunggah tidak teridentifikasi sebagai sertifikat atau bukti portofolio yang valid. Pastikan mengunggah dokumen resmi.',
        },
        { status: 400 }
      );
    }

    const boostAmount = aiAnalysis.suggestedBoost || 3;
    const now = new Date();

    // Tulis ke database langsung berstatus Tervalidasi (Full Autonomous AI Verification)
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
        fileData: base64Data,
        fileMimeType: validation.mimeType,
        fileSize: size,
        status: 'Tervalidasi',
        adminNote: aiAnalysis.aiNotes,
        readinessBoostApplied: boostAmount,
        aiAnalysis,
        aiSuggestedBoost: boostAmount,
        reviewedBy: session.user.id,
        reviewedAt: now,
        source,
        activityId,
      })
      .returning();

    // Idempotent logging ke readiness_events (+boostAmount%)
    const { readinessEvents } = await import('@/db/schema');
    try {
      await db
        .insert(readinessEvents)
        .values({
          userId: session.user.id,
          sourceType: 'certificate',
          sourceId: certId,
          boostAmount,
        })
        .onConflictDoNothing();
    } catch (evtErr) {
      console.warn('Readiness event insert notice:', evtErr);
    }

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
              status: 'confirmed',
              confirmedAt: now,
            })
            .where(eq(activityEvidence.id, existingEvidence[0].id));
        } else {
          await db.insert(activityEvidence).values({
            userId: session.user.id,
            activityId,
            evidenceUrl: `/api/certificates/${certId}/file`,
            status: 'confirmed',
            confirmedAt: now,
          });
        }
      } catch (err) {
        console.warn('Sync activity evidence notice:', err);
      }
    }

    const { fileData: _fileData, ...certResponse } = inserted[0];
    return NextResponse.json({
      success: true,
      certificate: certResponse,
      boostAmount,
      message: `Portofolio berhasil divalidasi instan oleh AI! Skor Skill Readiness bertambah +${boostAmount}%.`,
    });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    return NextResponse.json({ error: 'Gagal mengunggah sertifikat' }, { status: 500 });
  }
}
