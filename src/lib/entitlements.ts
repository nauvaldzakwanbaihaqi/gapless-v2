export const ENTITLEMENT_CONFIG = {
  FREE_MISSIONS_LIMIT: Infinity,
  FREE_ACTIVITIES_LIMIT: Infinity,
  FREE_ROADMAP_MAX_PHASE: Infinity,
} as const;

import { isPlusUser } from '@/config/plan';

export interface Entitlements {
  isPlusUser: boolean;
  isPlus: boolean;
  roadmap: {
    maxOpenPhase: number;
    canSeePartnerCourses: boolean;
    canSeeProjects: boolean;
    autoUpdateAfterRetake: boolean;
  };
  missions: {
    limit: number;
    canSeeCompetencyBars: boolean;
    canSeeSuggestions: boolean;
  };
  activities: {
    limit: number;
    sortBy: 'gap-match' | 'deadline';
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
 * getEntitlements — Semua user mendapatkan akses 100% gratis ke seluruh fitur inti.
 * Model baru bersifat A La Carte (pembelian per produk tertentu seperti gap report).
 */
export function getEntitlements(_tier?: string | null): Entitlements {
  return {
    isPlusUser: true,
    isPlus: true,
    roadmap: {
      maxOpenPhase: Infinity,
      canSeePartnerCourses: true,
      canSeeProjects: true,
      autoUpdateAfterRetake: true,
    },
    missions: {
      limit: Infinity,
      canSeeCompetencyBars: true,
      canSeeSuggestions: true,
    },
    activities: {
      limit: Infinity,
      sortBy: 'gap-match',
      canSeeMatchPercent: true,
    },
    passport: {
      showDetailedScores: true,
      showTrend: true,
      showProjectEvidence: true,
      canShareProfile: true,
    },
  };
}

export type ClientEntitlements = Omit<Entitlements, never>;
