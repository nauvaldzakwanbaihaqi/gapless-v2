import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export interface CertificateEvaluationInput {
  judul: string;
  penyelenggara: string;
  tanggalTerbit: string;
  sumber: string;
  kategoriSkill?: string | null;
  catatanTambahan?: string | null;
  fileBuffer?: Buffer;
  fileMimeType?: string;
}

export interface CertificateAIAnalysis {
  isValidDocument: boolean;
  confidenceScore: number;
  detectedTitle: string;
  detectedIssuer: string;
  achievementLevel: 'Juara 1 / Prestasi Tinggi' | 'Finalis / Prestasi Menengah' | 'Volunteer / Organisasi' | 'Partisipan / Kelulusan Kursus' | 'Lainnya';
  suggestedBoost: number; // 1 - 5
  relevantSkill: string;
  aiNotes: string;
  evaluatedAt: string;
}

/**
 * Evaluasi berkas portofolio / sertifikat mahasiswa menggunakan AI
 * Menentukan tingkatan pencapaian (misal Juara 1 = 5%, Volunteer = 3%)
 * dan relevansi kompetensi skill secara otomatis.
 */
export async function evaluateCertificateWithAI(
  input: CertificateEvaluationInput
): Promise<CertificateAIAnalysis> {
  const fallbackResult: CertificateAIAnalysis = {
    isValidDocument: true,
    confidenceScore: 80,
    detectedTitle: input.judul,
    detectedIssuer: input.penyelenggara,
    achievementLevel:
      input.sumber === 'Lomba'
        ? 'Finalis / Prestasi Menengah'
        : input.sumber === 'Organisasi'
        ? 'Volunteer / Organisasi'
        : 'Partisipan / Kelulusan Kursus',
    suggestedBoost: input.sumber === 'Lomba' ? 4 : input.sumber === 'Organisasi' ? 3 : 2,
    relevantSkill: input.kategoriSkill || 'Keterampilan Umum',
    aiNotes: 'Dokumen diidentifikasi berdasarkan metadata kurasi awal.',
    evaluatedAt: new Date().toISOString(),
  };

  try {
    const systemPrompt = `Kamu adalah AI Verifikator Sertifikat & Portofolio Profesional untuk platform akselerasi karier "Gapless".
Tugasmu adalah menganalisis dokumen atau portofolio mahasiswa untuk menentukan bobot kenaikan Skill Readiness secara objektif dan adil.

ATURAN PENENTUAN TIER & BOBOT SKOR (SUGGESTED BOOST):
- 5%: "Juara 1 / Prestasi Tinggi" -> Juara 1, Juara 2, Juara 3 lomba/kompetisi, Best Speaker, Hackathon winner, atau sertifikasi profesional berlisensi tinggi.
- 4%: "Finalis / Prestasi Menengah" -> Finalis lomba, Juara Harapan, nominasi karya terbaik, atau portofolio proyek industri skala menengah.
- 3%: "Volunteer / Organisasi" -> Pengurus/anggota aktif organisasi, kepanitiaan, kegiatan sosial/volunteer, magang/internship.
- 1% - 2%: "Partisipan / Kelulusan Kursus" -> Peserta webinar, seminar, workshop singkat, atau kelulusan modul kursus mandiri online.

Respons HARUS berupa JSON murni dengan format:
{
  "isValidDocument": true/false,
  "confidenceScore": 85,
  "detectedTitle": "Judul terdeteksi atau judul user",
  "detectedIssuer": "Penyelenggara terdeteksi",
  "achievementLevel": "Juara 1 / Prestasi Tinggi" | "Finalis / Prestasi Menengah" | "Volunteer / Organisasi" | "Partisipan / Kelulusan Kursus" | "Lainnya",
  "suggestedBoost": 5,
  "relevantSkill": "Skill yang diasah (misal: UI/UX Design, Leadership, Komunikasi, Problem Solving, dll.)",
  "aiNotes": "Ringkasan analisis mengapa diberikan bobot tersebut (1-2 kalimat ringkas bahasa Indonesia)."
}`;

    const textPrompt = `Berikut data sertifikat yang diunggah pengguna:
- Judul yang diinput: "${input.judul}"
- Penyelenggara: "${input.penyelenggara}"
- Tanggal Terbit: "${input.tanggalTerbit}"
- Sumber: "${input.sumber}"
- Kategori Skill: "${input.kategoriSkill || 'Belum dipilih'}"
- Catatan Tambahan User: "${input.catatanTambahan || '-'}"

Silakan analisis data di atas (dan lampiran visual dokumen jika ada) dan berikan penilaian JSON.`;

    const contentParts: any[] = [{ type: 'text', text: textPrompt }];

    // Jika ada file buffer gambar atau PDF, lampirkan ke AI Multimodal
    if (input.fileBuffer && input.fileMimeType) {
      // Batasi payload visual di bawah 4MB untuk latensi cepat
      if (input.fileBuffer.length <= 4 * 1024 * 1024) {
        contentParts.push({
          type: 'file',
          data: input.fileBuffer,
          mediaType: input.fileMimeType,
        });
      }
    }

    let aiRes;
    try {
      aiRes = await generateText({
        model: google('gemini-3.8-flash'),
        system: systemPrompt,
        messages: [{ role: 'user', content: contentParts }],
        maxOutputTokens: 600,
        abortSignal: AbortSignal.timeout(9000),
      });
    } catch {
      // Fallback ke flash-lite jika timeout/busy
      aiRes = await generateText({
        model: google('gemini-3.5-flash-lite'),
        system: systemPrompt,
        messages: [{ role: 'user', content: [{ type: 'text', text: textPrompt }] }],
        maxOutputTokens: 600,
        abortSignal: AbortSignal.timeout(8000),
      });
    }

    const cleanedJson = aiRes.text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      isValidDocument: typeof parsed.isValidDocument === 'boolean' ? parsed.isValidDocument : true,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 85,
      detectedTitle: parsed.detectedTitle || input.judul,
      detectedIssuer: parsed.detectedIssuer || input.penyelenggara,
      achievementLevel: parsed.achievementLevel || fallbackResult.achievementLevel,
      suggestedBoost: Math.min(10, Math.max(1, Number(parsed.suggestedBoost) || 3)),
      relevantSkill: parsed.relevantSkill || input.kategoriSkill || 'Keterampilan Umum',
      aiNotes: parsed.aiNotes || 'Dokumen tervalidasi oleh sistem kurasi.',
      evaluatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('AI certificate evaluation fallback notice:', error);
    return fallbackResult;
  }
}
