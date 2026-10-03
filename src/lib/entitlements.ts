import { isPlusUser } from '@/config/plan';

/**
 * Konstanta konfigurasi paket — satu sumber kebenaran untuk gating.
 * Ubah di sini saja untuk mengubah batas Free.
 */
export const ENTITLEMENT_CONFIG = {
  FREE_MISSIONS_LIMIT: 4,       // N misi gratis
  FREE_ACTIVITIES_LIMIT: 3,     // kuota kegiatan gratis
  FREE_ROADMAP_MAX_PHASE: 2,    // fase 0-1 terbuka (0-indexed), fase 2+ terkunci
} as const;

export interface Entitlements {
  isPlusUser: boolean;
  isPlus: boolean;
  roadmap: {
    maxOpenPhase: number;       // fase terakhir yang terbuka (0-indexed)
    canSeePartnerCourses: boolean;
    canSeeProjects: boolean;
    autoUpdateAfterRetake: boolean;
  };
  missions: {
    limit: number;              // berapa misi yang bisa diakses
    canSeeCompetencyBars: boolean;
    canSeeSuggestions: boolean; // saran perbaikan per kompetensi
  };
  activities: {
    limit: number;              // berapa kegiatan yang terbuka
    sortBy: 'deadline' | 'gap-match'; // urutan untuk Free vs Plus
    canSeeMatchPercent: boolean;
  };
  passport: {
    showDetailedScores: boolean;
    showTrend: boolean;
    showProjectEvidence: boolean;
    canShareProfile: boolean;
  };
}

/**
 * getEntitlements — Satu-satunya sumber kebenaran untuk hak akses user.
 * Dipanggil di server-side; hasil dikirim ke client hanya sebagai boolean/limit.
 * Konten terkunci TIDAK dikirim ke client Free.
 */
export function getEntitlements(tier?: string | null): Entitlements {
  const isPlus = isPlusUser(tier);

  return {
    isPlusUser: isPlus,
    isPlus: isPlus,
    roadmap: {
      maxOpenPhase: isPlus ? Infinity : ENTITLEMENT_CONFIG.FREE_ROADMAP_MAX_PHASE - 1,
      canSeePartnerCourses: isPlus,
      canSeeProjects: isPlus,
      autoUpdateAfterRetake: isPlus,
    },
    missions: {
      limit: isPlus ? Infinity : ENTITLEMENT_CONFIG.FREE_MISSIONS_LIMIT,
      canSeeCompetencyBars: isPlus,
      canSeeSuggestions: isPlus,
    },
    activities: {
      limit: isPlus ? Infinity : ENTITLEMENT_CONFIG.FREE_ACTIVITIES_LIMIT,
      sortBy: isPlus ? 'gap-match' : 'deadline',
      canSeeMatchPercent: isPlus,
    },
    passport: {
      showDetailedScores: isPlus,
      showTrend: isPlus,
      showProjectEvidence: isPlus,
      canShareProfile: isPlus,
    },
  };
}

/**
 * Tipe ringkasan yang aman dikirim ke client (tanpa data sensitif).
 */
export type ClientEntitlements = Omit<Entitlements, never>;
