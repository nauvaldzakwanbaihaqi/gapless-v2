export interface PlanCardFeature {
  text: string;
  isUpcoming?: boolean;
}

export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    displayName: 'Gapless Free',
    badge: 'FREE',
    price: 0,
    priceFormatted: '0',
    priceWithCurrency: 'Rp 0',
    period: '/Bulan',
    description: 'Esensi untuk eksplorasi awal minat dan potensi karier.',
    includedFeatures: [
      { text: 'Asesmen minat & rekomendasi role (2x per jalur)' },
      { text: 'Skor ringkasan skill gap & soft skill' },
      { text: 'Roadmap dasar, sumber gratis (Fase 1 & 2)' },
      { text: 'Skill Passport profil dasar' },
      { text: 'Beberapa misi soft skill contoh', isUpcoming: true },
      { text: 'Rekomendasi kegiatan terbatas, 3 per bulan', isUpcoming: true },
    ] as PlanCardFeature[],
    lockedFeatures: [
      { text: 'Fase 3 & 4 Roadmap' },
      { text: 'Laporan mendalam & riwayat tren progres' },
    ] as PlanCardFeature[],
  },
  plus: {
    name: 'Plus',
    displayName: 'Gapless Plus',
    badge: 'PLUS',
    price: 29000,
    priceFormatted: '29.000',
    priceWithCurrency: 'Rp 29.000',
    period: '/Bulan',
    description: 'Akselerasi karier dengan AI: laporan mendalam dan roadmap personal lengkap.',
    includedFeatures: [
      { text: 'Laporan skill gap mendalam per topik' },
      { text: 'Skor soft skill per kompetensi + saran perbaikan' },
      { text: 'Roadmap personal lengkap, 4 fase terkurasi' },
      { text: 'Asesmen berkala & riwayat tren progres' },
      { text: 'Skill Passport: skor, tren progres & portofolio proyek' },
      { text: 'Semua misi soft skill', isUpcoming: true },
      { text: 'Rekomendasi kegiatan lengkap, urut sesuai gap', isUpcoming: true },
    ] as PlanCardFeature[],
  },
};

/**
 * Helper untuk mengecek apakah user memiliki hak akses tier Plus/Pro/Premium.
 * Menjaga kompatibilitas penuh dengan nilai DB lama ("Student Pro", "PREMIUM", "PRO")
 * maupun nilai baru ("Plus", "PLUS").
 */
export function isPlusUser(tier?: string | null): boolean {
  if (!tier) return false;
  const normalized = tier.toLowerCase().trim();
  return (
    normalized.includes('plus') ||
    normalized.includes('pro') ||
    normalized.includes('premium')
  );
}
