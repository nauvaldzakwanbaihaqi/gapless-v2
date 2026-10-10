import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { db } from '@/db';
import { learningResources, learningTimeEstimates, reportContents, assessmentResults, userPurchases, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { findCareerProfile, CareerProfile, SkillRequirement } from '@/data/gaplessData';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export interface SkillGapItem {
  name: string;
  current: number;
  required: number;
  gap: number; // current - required
  priority: 'Kritis' | 'Penting' | 'Sesuai';
  priorityIcon: '🔴' | '🟡' | '🟢';
  hoursMin: number;
  hoursMax: number;
  weeksMin: number;
  weeksMax: number;
  explanation?: string;
}

export interface SkillInterpretation {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  canDo: string[];
  cannotDo: string[];
  industryExample: string;
}

export interface ActionPlanPhase {
  phaseTitle: string;
  focusSkills: string[];
  weeksFirstHalf: string;
  weeksSecondHalf: string;
  milestone: string;
  resources?: {
    title: string;
    provider: string;
    isFree: boolean;
    url: string;
    type: string;
  }[];
}

export interface ActionPlan306090 {
  day30: ActionPlanPhase;
  day60: ActionPlanPhase;
  day90: ActionPlanPhase;
}

export interface ComprehensiveReportData {
  reportNumber: string;
  generatedAt: string;
  userName: string;
  userEmail: string;
  targetRole: string;
  careerSlug: string;
  dominantTrait: string;
  readinessScore: number;
  overallStatus: 'Siap Kerja Dasar' | 'Perlu Pengembangan Terarah' | 'Dalam Tahap Awal';
  keyStrengths: string[];
  priorityGaps: string[];
  firstActionRecommendation: string;
  totalEstHoursMin: number;
  totalEstHoursMax: number;
  totalEstWeeksMin: number;
  totalEstWeeksMax: number;
  radarData: { name: string; current: number; required: number }[];
  skillGapTable: SkillGapItem[];
  skillInterpretations: SkillInterpretation[];
  priorityList: {
    rank: number;
    skillName: string;
    reason: string;
    consequenceIfNotClosed: string;
  }[];
  actionPlan: ActionPlan306090;
  skillResources: Record<string, {
    title: string;
    provider: string;
    isFree: boolean;
    url: string;
    type: string;
  }[]>;
}

/**
 * Generate nomor unik laporan konsultan (GL-{YYYYMM}-{6 KARAKTER RANDOM ALFANUMERIK})
 */
export function generateReportNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GL-${year}${month}-${rand}`;
}

/**
 * Hitung prioritas skill gap secara deterministik & terstandar
 */
export function calculateSkillGapItems(
  skills: SkillRequirement[],
  skillRatings: Record<string, number>
): SkillGapItem[] {
  return skills.map((req) => {
    const current = Math.min(3, Math.max(0, skillRatings[req.name] ?? 1));
    const required = req.required;
    const gap = current - required; // 0, -1, -2, -3, or +1

    let priority: 'Kritis' | 'Penting' | 'Sesuai' = 'Sesuai';
    let priorityIcon: '🔴' | '🟡' | '🟢' = '🟢';

    if (gap <= -2 || (gap <= -1 && required >= 3)) {
      priority = 'Kritis';
      priorityIcon = '🔴';
    } else if (gap === -1) {
      priority = 'Penting';
      priorityIcon = '🟡';
    } else {
      priority = 'Sesuai';
      priorityIcon = '🟢';
    }

    // Estimasi jam belajar deterministik berdasarkan gap size
    const gapSize = Math.max(0, -gap);
    let hoursMin = 0;
    let hoursMax = 0;
    let weeksMin = 0;
    let weeksMax = 0;

    if (gapSize === 1) {
      hoursMin = 15;
      hoursMax = 25;
      weeksMin = 3;
      weeksMax = 5;
    } else if (gapSize === 2) {
      hoursMin = 35;
      hoursMax = 50;
      weeksMin = 7;
      weeksMax = 10;
    } else if (gapSize >= 3) {
      hoursMin = 60;
      hoursMax = 90;
      weeksMin = 12;
      weeksMax = 18;
    }

    return {
      name: req.name,
      current,
      required,
      gap,
      priority,
      priorityIcon,
      hoursMin,
      hoursMax,
      weeksMin,
      weeksMax,
    };
  });
}

/**
 * Ambil sumber belajar terkurasi dari database yang cocok dengan skill gap
 */
export async function fetchMatchedResourcesForSkills(skillNames: string[]) {
  const allResources = await db
    .select()
    .from(learningResources)
    .where(eq(learningResources.isVerified, true));

  const result: Record<string, typeof allResources> = {};

  for (const skill of skillNames) {
    const tokens = skill.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean);
    const matched = allResources.filter((res) => {
      const tags = (res.skillTags || []).map((t) => t.toLowerCase());
      const titleLower = res.title.toLowerCase();
      return (
        tokens.some((token) => tags.includes(token)) ||
        tokens.some((token) => titleLower.includes(token))
      );
    });

    // Urutkan gratis terlebih dahulu
    matched.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    result[skill] = matched.slice(0, 3);
  }

  return result;
}

/**
 * Panggil AI satu kali untuk menghasilkan konten mendalam (Interpretasi Skill + Rencana 30/60/90 Hari)
 */
export async function generateAiReportAnalysis(params: {
  userName: string;
  roleTitle: string;
  gaps: SkillGapItem[];
  dominantTrait: string;
}): Promise<{
  aiSkillInterpretations: SkillInterpretation[];
  aiActionPlan306090: ActionPlan306090;
  priorityList: { rank: number; skillName: string; reason: string; consequenceIfNotClosed: string }[];
}> {
  const gapSkillsToAnalyze = params.gaps.filter((g) => g.gap < 0);

  const fallbackSkillsInterpretations: SkillInterpretation[] = gapSkillsToAnalyze.map((s) => ({
    skillName: s.name,
    currentLevel: s.current,
    targetLevel: s.required,
    canDo: [
      `Memahami terminologi dasar dan konsep teoretis materi ${s.name}.`,
      `Mampu menjalankan instruksi teknis terpandu dengan contoh yang sudah ada.`,
    ],
    cannotDo: [
      `Belum mampu menyelesaikan problem solving mandiri pada tingkat kesulitan tinggi di industri.`,
      `Belum terbiasa mengambil keputusan arsitektur/strategis tanpa arahan senior.`,
    ],
    industryExample: `Mengerjakan task implementasi terarah pada proyek industri nyata untuk peran ${params.roleTitle}.`,
  }));

  const fallbackActionPlan: ActionPlan306090 = {
    day30: {
      phaseTitle: 'Fondasi Esensial & Penutupan Gap Kritis',
      focusSkills: gapSkillsToAnalyze.slice(0, 2).map((s) => s.name),
      weeksFirstHalf: 'Mempelajari modul teoretis dan framework kerja standar industri.',
      weeksSecondHalf: 'Pengerjaan latihan mandiri terstruktur dan telaah studi kasus nyata.',
      milestone: 'Mampu mereplikasi 1 studi kasus industri standar dengan benar secara mandiri.',
    },
    day60: {
      phaseTitle: 'Pengembangan Kompetensi Lanjutan & Integrasi',
      focusSkills: gapSkillsToAnalyze.slice(2, 4).map((s) => s.name),
      weeksFirstHalf: 'Eksplorasi teknik lanjutan dan praktik integrasi lintas-fitur.',
      weeksSecondHalf: 'Membangun mini-proyek mandiri untuk memvalidasi pemahaman teknis.',
      milestone: 'Menghasilkan 1 mini-proyek teruji yang mendemonstrasikan skill target.',
    },
    day90: {
      phaseTitle: 'Konsolidasi & Kesiapan Kerja Profesional',
      focusSkills: [params.roleTitle],
      weeksFirstHalf: 'Simulasi skenario kerja tim dan pemecahan kendala (troubleshooting).',
      weeksSecondHalf: 'Dokumentasi portofolio komprehensif dan persiapan wawancara teknis.',
      milestone: 'Portofolio siap presentasi dengan bukti kesiapan kerja level entry-level.',
    },
  };

  const fallbackPriorityList = gapSkillsToAnalyze.map((s, idx) => ({
    rank: idx + 1,
    skillName: s.name,
    reason: `Prioritas ${s.priority.toLowerCase()} karena memiliki selisih ${Math.abs(s.gap)} level dari standar kompetensi ${params.roleTitle}.`,
    consequenceIfNotClosed: `Berisiko mengalami kendala saat mengerjakan tugas mandiri di industri tanpa supervisi ketat.`,
  }));

  // Jika tidak ada gap, return fallback langsung
  if (gapSkillsToAnalyze.length === 0) {
    return {
      aiSkillInterpretations: [],
      aiActionPlan306090: fallbackActionPlan,
      priorityList: [],
    };
  }

  const promptInput = {
    userName: params.userName,
    roleTitle: params.roleTitle,
    dominantTrait: params.dominantTrait,
    gaps: gapSkillsToAnalyze.map((g) => ({
      skill: g.name,
      currentLevel: g.current,
      requiredLevel: g.required,
      priority: g.priority,
    })),
  };

  const systemPrompt = `Kamu adalah Konsultan Karier & Asesmen Industri Senior (gaya McKinsey/BCG).
Tugasmu adalah menyusun konten mendalam laporan kesiapan karier untuk profesional/mahasiswa.
Gunakan Bahasa Indonesia profesional, presisi, berbobot, dan aplikatif (bukan motivasi klise).

Output WAJIB berupa JSON murni dengan skema:
{
  "skillInterpretations": [
    {
      "skillName": "nama skill",
      "currentLevel": 1,
      "targetLevel": 2,
      "canDo": [
        "hal konkret spesifik 1 yang sudah bisa dilakukan di level saat ini",
        "hal konkret spesifik 2 yang sudah bisa dilakukan di level saat ini"
      ],
      "cannotDo": [
        "hal konkret spesifik 1 yang belum bisa (butuh target level)",
        "hal konkret spesifik 2 yang belum bisa (butuh target level)"
      ],
      "industryExample": "contoh tugas konkret di industri nyata yang membutuhkan target level tersebut (1-2 kalimat jelas)"
    }
  ],
  "priorityList": [
    {
      "rank": 1,
      "skillName": "nama skill",
      "reason": "alasan mengapa harus dikembangkan pertama berbasis urgensi entry-level role ini",
      "consequenceIfNotClosed": "konsekuensi riil di lingkungan kerja jika gap ini tidak segera ditutup"
    }
  ],
  "actionPlan306090": {
    "day30": {
      "phaseTitle": "Fondasi Esensial & Penutupan Gap Kritis",
      "focusSkills": ["skill 1", "skill 2"],
      "weeksFirstHalf": "aktivitas spesifik minggu 1-2",
      "weeksSecondHalf": "aktivitas spesifik minggu 3-4",
      "milestone": "hal konkret yang bisa dicek sendiri oleh user di akhir 30 hari"
    },
    "day60": {
      "phaseTitle": "Pengembangan Kompetensi & Studi Kasus Terapan",
      "focusSkills": ["skill 3"],
      "weeksFirstHalf": "aktivitas spesifik minggu 5-6",
      "weeksSecondHalf": "aktivitas spesifik minggu 7-8",
      "milestone": "hal konkret yang bisa dicek sendiri di akhir 60 hari"
    },
    "day90": {
      "phaseTitle": "Konsolidasi & Kesiapan Kerja Profesional",
      "focusSkills": ["proyek portofolio terpadu"],
      "weeksFirstHalf": "aktivitas spesifik minggu 9-10",
      "weeksSecondHalf": "aktivitas spesifik minggu 11-12",
      "milestone": "hal konkret bukti kesiapan kerja di akhir 90 hari"
    }
  }
}`;

  try {
    let aiRes;
    try {
      aiRes = await generateText({
        model: google('gemini-3.5-flash-lite'),
        system: systemPrompt,
        messages: [{ role: 'user', content: JSON.stringify(promptInput) }],
        maxOutputTokens: 2500,
        abortSignal: AbortSignal.timeout(12000),
      });
    } catch {
      aiRes = await generateText({
        model: google('gemini-3.8-flash'),
        system: systemPrompt,
        messages: [{ role: 'user', content: JSON.stringify(promptInput) }],
        maxOutputTokens: 2500,
        abortSignal: AbortSignal.timeout(12000),
      });
    }

    const cleaned = aiRes.text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      aiSkillInterpretations: parsed.skillInterpretations || fallbackSkillsInterpretations,
      aiActionPlan306090: parsed.actionPlan306090 || fallbackActionPlan,
      priorityList: parsed.priorityList || fallbackPriorityList,
    };
  } catch (err) {
    console.warn('AI report generation fallback triggered:', err);
    return {
      aiSkillInterpretations: fallbackSkillsInterpretations,
      aiActionPlan306090: fallbackActionPlan,
      priorityList: fallbackPriorityList,
    };
  }
}

/**
 * Get or create report contents (Cached di DB Neon agar tidak boros token AI)
 */
export async function getOrCreateReportContent(params: {
  assessmentId: string;
  userId: string;
  forceRegenerate?: boolean;
}): Promise<ComprehensiveReportData> {
  const { assessmentId, userId, forceRegenerate } = params;

  // 1. Ambil data asesmen
  const assessmentRow = await db.query.assessmentResults.findFirst({
    where: and(
      eq(assessmentResults.id, assessmentId),
      eq(assessmentResults.userId, userId)
    ),
  });

  if (!assessmentRow) {
    throw new Error('Hasil asesmen tidak ditemukan');
  }

  // 2. Ambil user info
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const userName = userRow?.name || 'Pengguna Gapless';
  const userEmail = userRow?.email || '';

  const careerTitle = assessmentRow.selectedCareer || 'General Career';
  const careerProfile = findCareerProfile(assessmentRow.careerSlug || careerTitle);
  const careerSlug = assessmentRow.careerSlug || careerProfile?.id || careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const dominantTrait = assessmentRow.dominantTrait || 'The Thinker';
  const skillRatings = (assessmentRow.skillRatings as Record<string, number>) || {};

  // 3. Cek apakah report_contents sudah ada di DB
  if (!forceRegenerate) {
    const existing = await db.query.reportContents.findFirst({
      where: and(
        eq(reportContents.assessmentResultId, assessmentId),
        eq(reportContents.userId, userId)
      ),
    });

    if (existing && !existing.isStale) {
      // Reconstruct comprehensive data dari DB
      return buildReportDataFromDb({
        existingRecord: existing,
        careerProfile,
        careerTitle,
        careerSlug,
        dominantTrait,
        skillRatings,
        userName,
        userEmail,
      });
    }
  }

  // 4. Jika belum ada atau forceRegenerate:
  // Hitung skill gaps deterministik
  const requiredSkills = careerProfile?.skills || [
    { name: 'Pemrograman Web', required: 2 },
    { name: 'Problem Solving', required: 3 },
    { name: 'Manajemen Waktu', required: 2 },
  ];

  const skillGapTable = calculateSkillGapItems(requiredSkills, skillRatings);

  // Ambil data AI
  const aiResult = await generateAiReportAnalysis({
    userName,
    roleTitle: careerTitle,
    gaps: skillGapTable,
    dominantTrait,
  });

  const reportNumber = generateReportNumber();

  // Simpan ke Neon DB (report_contents)
  const [saved] = await db
    .insert(reportContents)
    .values({
      assessmentResultId: assessmentId,
      userId,
      careerSlug,
      reportNumber,
      aiSkillInterpretations: aiResult.aiSkillInterpretations,
      aiActionPlan306090: aiResult.aiActionPlan306090,
      isStale: false,
    })
    .onConflictDoUpdate({
      target: [reportContents.reportNumber],
      set: {
        aiSkillInterpretations: aiResult.aiSkillInterpretations,
        aiActionPlan306090: aiResult.aiActionPlan306090,
        generatedAt: new Date(),
        isStale: false,
      },
    })
    .returning();

  return buildReportDataFromDb({
    existingRecord: saved,
    careerProfile,
    careerTitle,
    careerSlug,
    dominantTrait,
    skillRatings,
    userName,
    userEmail,
  });
}

async function buildReportDataFromDb(params: {
  existingRecord: typeof reportContents.$inferSelect;
  careerProfile?: CareerProfile;
  careerTitle: string;
  careerSlug: string;
  dominantTrait: string;
  skillRatings: Record<string, number>;
  userName: string;
  userEmail: string;
}): Promise<ComprehensiveReportData> {
  const {
    existingRecord,
    careerProfile,
    careerTitle,
    careerSlug,
    dominantTrait,
    skillRatings,
    userName,
    userEmail,
  } = params;

  const requiredSkills = careerProfile?.skills || [
    { name: 'Pemrograman Web', required: 2 },
    { name: 'Problem Solving', required: 3 },
    { name: 'Manajemen Waktu', required: 2 },
  ];

  const skillGapTable = calculateSkillGapItems(requiredSkills, skillRatings);

  // Hitung Skill Readiness Score (0-100)
  // Berdasarkan persentase pencapaian skill terhadap level target
  let totalAchieved = 0;
  let totalTarget = 0;
  for (const s of skillGapTable) {
    totalAchieved += Math.min(s.current, s.required);
    totalTarget += s.required;
  }
  const readinessScore = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 70;

  let overallStatus: 'Siap Kerja Dasar' | 'Perlu Pengembangan Terarah' | 'Dalam Tahap Awal' =
    readinessScore >= 80
      ? 'Siap Kerja Dasar'
      : readinessScore >= 60
      ? 'Perlu Pengembangan Terarah'
      : 'Dalam Tahap Awal';

  // Kekuatan & Gap
  const keyStrengths = skillGapTable
    .filter((s) => s.gap >= 0)
    .sort((a, b) => b.current - a.current)
    .slice(0, 2)
    .map((s) => s.name);

  const priorityGaps = skillGapTable
    .filter((s) => s.gap < 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 2)
    .map((s) => s.name);

  const firstActionRecommendation =
    priorityGaps.length > 0
      ? `Fokus menutup gap prioritas utama pada kompetensi "${priorityGaps[0]}" melalui latihan proyek terarah.`
      : `Pertajam portofolio proyek terintegrasi untuk menunjukkan kesiapan profesionalmu.`;

  // Total estimasi waktu belajar
  const totalEstHoursMin = skillGapTable.reduce((sum, s) => sum + s.hoursMin, 0);
  const totalEstHoursMax = skillGapTable.reduce((sum, s) => sum + s.hoursMax, 0);
  const totalEstWeeksMin = Math.ceil(totalEstHoursMin / 5);
  const totalEstWeeksMax = Math.ceil(totalEstHoursMax / 5);

  // Radar chart data
  const radarData = skillGapTable.map((s) => ({
    name: s.name,
    current: s.current,
    required: s.required,
  }));

  // Interpretations dari DB
  const skillInterpretations = (existingRecord.aiSkillInterpretations as SkillInterpretation[]) || [];
  const actionPlan = (existingRecord.aiActionPlan306090 as ActionPlan306090) || {
    day30: {
      phaseTitle: 'Fondasi Esensial & Penutupan Gap Kritis',
      focusSkills: priorityGaps,
      weeksFirstHalf: 'Mempelajari modul teoretis dan framework kerja standar industri.',
      weeksSecondHalf: 'Pengerjaan latihan mandiri terstruktur dan telaah studi kasus nyata.',
      milestone: 'Mampu mereplikasi 1 studi kasus industri standar dengan benar secara mandiri.',
    },
    day60: {
      phaseTitle: 'Pengembangan Kompetensi Lanjutan & Integrasi',
      focusSkills: skillGapTable.filter((s) => s.gap < 0).slice(2, 4).map((s) => s.name),
      weeksFirstHalf: 'Eksplorasi teknik lanjutan dan praktik integrasi lintas-fitur.',
      weeksSecondHalf: 'Membangun mini-proyek mandiri untuk memvalidasi pemahaman teknis.',
      milestone: 'Menghasilkan 1 mini-proyek teruji yang mendemonstrasikan skill target.',
    },
    day90: {
      phaseTitle: 'Konsolidasi & Kesiapan Kerja Profesional',
      focusSkills: [careerTitle],
      weeksFirstHalf: 'Simulasi skenario kerja tim dan pemecahan kendala (troubleshooting).',
      weeksSecondHalf: 'Dokumentasi portofolio komprehensif dan persiapan wawancara teknis.',
      milestone: 'Portofolio siap presentasi dengan bukti kesiapan kerja level entry-level.',
    },
  };

  // Ambil sumber belajar terkurasi dari tabel learning_resources
  const gapSkillNames = skillGapTable.filter((s) => s.gap < 0).map((s) => s.name);
  const skillResources = await fetchMatchedResourcesForSkills(gapSkillNames);

  // Priority list per skill
  const priorityList = skillGapTable
    .filter((s) => s.gap < 0)
    .sort((a, b) => a.gap - b.gap)
    .map((s, idx) => ({
      rank: idx + 1,
      skillName: s.name,
      reason: `Memiliki gap ${Math.abs(s.gap)} level dengan status ${s.priority.toLowerCase()} untuk standar industri peran ${careerTitle}.`,
      consequenceIfNotClosed: `Menjadi hambatan utama saat dihadapkan pada tugas industri tingkat menengah ke atas.`,
    }));

  return {
    reportNumber: existingRecord.reportNumber,
    generatedAt: existingRecord.generatedAt
      ? new Date(existingRecord.generatedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
    userName,
    userEmail,
    targetRole: careerTitle,
    careerSlug,
    dominantTrait,
    readinessScore,
    overallStatus,
    keyStrengths,
    priorityGaps,
    firstActionRecommendation,
    totalEstHoursMin,
    totalEstHoursMax,
    totalEstWeeksMin,
    totalEstWeeksMax,
    radarData,
    skillGapTable,
    skillInterpretations,
    priorityList,
    actionPlan,
    skillResources,
  };
}
