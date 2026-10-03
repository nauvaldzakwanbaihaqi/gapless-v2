export interface PlanFeature {
  name: string;
  free: string;
  plus: string;
  status: 'active' | 'partial' | 'upcoming';
  badge?: string;
  description?: string;
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
    summaryFeatures: [
      '2x Kesempatan Asesmen Minat',
      'Eksplorasi Profil Karier Standar',
      'Learning Roadmap (Fase 1 & 2)',
      'Akses Modul Dasar Gratis',
    ],
  },
  plus: {
    name: 'Plus',
    displayName: 'Gapless Plus',
    badge: 'PLUS',
    price: 29000,
    priceFormatted: '29.000',
    priceWithCurrency: 'Rp 29.000',
    period: '/Bulan',
    description: 'Akselerasi karier dengan AI, roadmap kurikulum personal, dan simulasi industri penuh.',
    summaryFeatures: [
      'Akses Asesmen Minat & Skill Berkala',
      'Buka Semua 4 Fase Learning Roadmap',
      'Virtual Job Simulation & Studi Kasus Industri',
      'Sertifikat Penyelesaian Resmi (Share ke LinkedIn)',
      'AI Skill-Gap Analytics Mendalam',
    ],
  },
};

export const COMPARISON_FEATURES: PlanFeature[] = [
  {
    name: 'Asesmen minat dan rekomendasi role',
    free: 'Ya',
    plus: 'Ya',
    status: 'active',
  },
  {
    name: 'Skill gap hard skill',
    free: 'Skor ringkasan',
    plus: 'Laporan mendalam per topik',
    status: 'partial',
  },
  {
    name: 'Asesmen soft skill',
    free: 'Skor ringkasan',
    plus: 'Skor per kompetensi beserta saran perbaikan',
    status: 'partial',
  },
  {
    name: 'Learning roadmap',
    free: 'Dasar, sumber gratis (Fase 1-2)',
    plus: 'Personal lengkap, 4 fase terkurasi',
    status: 'active',
  },
  {
    name: 'Misi soft skill di platform',
    free: 'Beberapa misi contoh',
    plus: 'Semua misi',
    status: 'upcoming',
    badge: 'Segera hadir',
  },
  {
    name: 'Rekomendasi kegiatan (organisasi, lomba, volunteer)',
    free: 'Terbatas (3 per bulan)',
    plus: 'Semua yang aktif, diurutkan sesuai gap',
    status: 'upcoming',
    badge: 'Segera hadir',
  },
  {
    name: 'Asesmen ulang dan tren progres',
    free: 'Terbatas (2x per jalur)',
    plus: 'Akses berkala & riwayat tren progres',
    status: 'partial',
  },
  {
    name: 'Skill Passport',
    free: 'Profil dasar',
    plus: 'Skor, tren progres, dan portofolio proyek',
    status: 'partial',
  },
];

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
