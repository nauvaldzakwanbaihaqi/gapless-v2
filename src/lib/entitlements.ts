export interface Entitlements {
  isPro: boolean;
  roadmap: {
    maxOpenPhase: number;
    canSeeAllGaps: boolean;
    canSeeWeeklyPlan: boolean;
  };
  missions: {
    limit: number;
    canSeeMonthlyPackage: boolean;
    canSeeFeedback: boolean;
    canSeeCompetencyBars: boolean;
  };
  activities: {
    limit: number;
    canSeeFilters: boolean;
    canSeeFitReason: boolean;
    canSeeDeadlines: boolean;
    sortBy: 'gap-match' | 'deadline';
  };
  passport: {
    canShareProfile: boolean;
    showVerifiedBadge: boolean;
    showDetailedScores: boolean;
    maxEvidenceUploads: number;
  };
  assessment: {
    isUnlimited: boolean;
  };
}

/**
 * getEntitlements — Sumber kebenaran hak akses user berdasarkan status Gapless Pro
 */
export function getEntitlements(isPro: boolean): Entitlements {
  return {
    isPro,
    roadmap: {
      maxOpenPhase: isPro ? 4 : 2,
      canSeeAllGaps: isPro,
      canSeeWeeklyPlan: isPro,
    },
    missions: {
      limit: isPro ? Infinity : 4,
      canSeeMonthlyPackage: isPro,
      canSeeFeedback: isPro,
      canSeeCompetencyBars: isPro,
    },
    activities: {
      limit: isPro ? Infinity : 3,
      canSeeFilters: isPro,
      canSeeFitReason: isPro,
      canSeeDeadlines: isPro,
      sortBy: isPro ? 'gap-match' : 'deadline',
    },
    passport: {
      canShareProfile: isPro,
      showVerifiedBadge: isPro,
      showDetailedScores: isPro,
      maxEvidenceUploads: isPro ? 20 : 2,
    },
    assessment: {
      isUnlimited: isPro,
    },
  };
}
