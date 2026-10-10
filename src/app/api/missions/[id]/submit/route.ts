import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { softSkillMissions, userMissionProgress, missionFeedbacks, readinessEvents } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { hasActivePro } from '@/lib/payment_service';
import { MISSION_READINESS_BOOST } from '@/config/readiness';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const submitSchema = z.object({
  submissionText: z.string().max(4000).optional(),
  submissionUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(2000).optional(),
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

    const { id: missionId } = await params;
    const body = await req.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.issues }, { status: 400 });
    }

    // Ambil misi untuk cek keberadaan
    const mission = await db
      .select()
      .from(softSkillMissions)
      .where(and(eq(softSkillMissions.id, missionId), eq(softSkillMissions.isActive, true)))
      .limit(1);

    if (!mission.length) {
      return NextResponse.json({ error: 'Misi tidak ditemukan' }, { status: 404 });
    }

    const currentMission = mission[0];

    // Ambil seluruh misi pada kompetensi yang sama, urutkan difficulty_order ASC
    const compMissions = await db
      .select({ id: softSkillMissions.id })
      .from(softSkillMissions)
      .where(and(
        eq(softSkillMissions.isActive, true),
        eq(softSkillMissions.competency, currentMission.competency)
      ))
      .orderBy(
        asc(softSkillMissions.difficultyOrder),
        asc(softSkillMissions.sortOrder)
      );

    const missionIndex = compMissions.findIndex((m) => m.id === missionId);
    const isPro = await hasActivePro(session.user.id);

    // Misi index !== 0 (misi ke-2 dan seterusnya) hanya untuk user Pro
    if (missionIndex !== 0 && !isPro) {
      return NextResponse.json(
        { error: 'Misi ini hanya tersedia untuk pengguna Gapless Pro' },
        { status: 403 }
      );
    }

    const userNotes = (parsed.data.submissionText || parsed.data.notes || '').trim();

    // =========================================================================
    // LAPIS 1: Validasi Server SEBELUM panggil AI (gratis, tanpa biaya LLM)
    // =========================================================================
    if (userNotes.length < 20) {
      return NextResponse.json(
        { error: 'Jawaban terlalu singkat. Ceritakan pengalamanmu lebih detail.' },
        { status: 400 }
      );
    }

    // =========================================================================
    // LAPIS 2: Validasi Relevansi via AI (format JSON terstruktur)
    // =========================================================================
    const systemPrompt = `Kamu adalah career coach yang mengevaluasi hasil misi soft skill mahasiswa. Tugasmu ada DUA: pertama, nilai apakah jawaban relevan dengan misi yang diberikan. Kedua, jika relevan, berikan feedback konstruktif.

Respons HARUS dalam format JSON:
{
  "is_relevant": true,
  "rejection_reason": null,
  "feedback": "feedback lengkap jika relevan, null jika tidak relevan"
}

Jawaban dianggap TIDAK relevan jika:
- Berisi karakter acak/spam (asdfasdf, 123, dll)
- Tidak ada hubungan dengan topik misi
- Terlalu singkat untuk dinilai (kurang dari 3 kata bermakna)
- Hanya berisi tanda baca atau simbol

Jika relevan, feedback mencakup:
- Yang sudah baik (1 poin)
- Yang perlu diperbaiki (1 poin)
- Saran konkret (1 poin)
Bahasa Indonesia, nada profesional tapi ramah. Maks 150 kata.`;

    const userPrompt = `Judul misi: ${currentMission.title}. Kompetensi: ${currentMission.competency}.\nInstruksi misi: ${currentMission.description || '-'}.\nJawaban user: ${userNotes}`;

    let aiRawText = '';
    try {
      let aiRes;
      try {
        aiRes = await generateText({
          model: google('gemini-3.5-flash-lite'),
          system: systemPrompt,
          prompt: userPrompt,
          maxOutputTokens: 500,
          abortSignal: AbortSignal.timeout(8000),
        });
      } catch {
        aiRes = await generateText({
          model: google('gemini-3.8-flash'),
          system: systemPrompt,
          prompt: userPrompt,
          maxOutputTokens: 500,
          abortSignal: AbortSignal.timeout(8000),
        });
      }
      aiRawText = aiRes.text.trim();
    } catch (aiErr) {
      console.error('AI validation error/timeout:', aiErr);
      // AI timeout/error: tidak mengubah status apapun, return 500
      return NextResponse.json(
        { error: 'Gagal memvalidasi, coba lagi.' },
        { status: 500 }
      );
    }

    // Parse JSON respons AI
    let parsedAi: {
      is_relevant: boolean;
      rejection_reason?: string | null;
      feedback?: string | null;
    };

    try {
      const cleaned = aiRawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
      parsedAi = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI JSON:', aiRawText, parseErr);
      return NextResponse.json(
        { error: 'Gagal memvalidasi, coba lagi.' },
        { status: 500 }
      );
    }

    // Jika is_relevant = false: jangan simpan status, jangan naikkan readiness
    if (!parsedAi.is_relevant) {
      const reason = parsedAi.rejection_reason || 'Jawaban tidak relevan dengan topik misi.';
      return NextResponse.json(
        { error: `Jawaban belum relevan: ${reason} Coba lagi.` },
        { status: 400 }
      );
    }

    // =========================================================================
    // TRANSAKSI ATOMIK: Status Selesai + Readiness Boost (+1%)
    // =========================================================================
    const now = new Date();
    let resultProgress;

    try {
      await db.transaction(async (tx) => {
        const existing = await tx
          .select()
          .from(userMissionProgress)
          .where(eq(userMissionProgress.userId, session.user.id));

        const missionProgress = existing.find((p) => p.missionId === missionId);

        if (missionProgress) {
          const updated = await tx
            .update(userMissionProgress)
            .set({
              status: 'completed',
              submissionUrl: parsed.data.submissionUrl || missionProgress.submissionUrl,
              submissionText: userNotes,
              notes: userNotes,
              evidenceType: 'self-report',
              completedAt: missionProgress.completedAt || now,
              updatedAt: now,
            })
            .where(eq(userMissionProgress.id, missionProgress.id))
            .returning();
          resultProgress = updated[0];
        } else {
          const inserted = await tx
            .insert(userMissionProgress)
            .values({
              userId: session.user.id,
              missionId,
              status: 'completed',
              submissionUrl: parsed.data.submissionUrl || null,
              submissionText: userNotes,
              notes: userNotes,
              evidenceType: 'self-report',
              completedAt: now,
              updatedAt: now,
            })
            .returning();
          resultProgress = inserted[0];
        }

        // Catat ke readiness_events (idempotent, unique index mencegah duplicate boost)
        await tx
          .insert(readinessEvents)
          .values({
            userId: session.user.id,
            sourceType: 'mission',
            sourceId: missionId,
            boostAmount: MISSION_READINESS_BOOST,
          })
          .onConflictDoNothing();

        // Simpan feedback AI khusus pengguna Gapless Pro
        if (isPro && parsedAi.feedback) {
          const existingFeedback = await tx
            .select()
            .from(missionFeedbacks)
            .where(and(
              eq(missionFeedbacks.userId, session.user.id),
              eq(missionFeedbacks.missionId, missionId)
            ))
            .limit(1);

          if (existingFeedback.length > 0) {
            await tx
              .update(missionFeedbacks)
              .set({
                submissionText: userNotes,
                aiFeedback: parsedAi.feedback,
                createdAt: now,
              })
              .where(eq(missionFeedbacks.id, existingFeedback[0].id));
          } else {
            await tx.insert(missionFeedbacks).values({
              userId: session.user.id,
              missionId,
              submissionText: userNotes,
              aiFeedback: parsedAi.feedback,
              createdAt: now,
            });
          }
        }
      });
    } catch (txErr) {
      console.error('Atomic transaction error on mission submit:', txErr);
      return NextResponse.json(
        { error: 'Gagal menyimpan status misi. Coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: resultProgress,
      feedback: isPro ? parsedAi.feedback : null,
      isPro,
    });
  } catch (error) {
    console.error('Mission submit error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
