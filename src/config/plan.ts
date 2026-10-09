/**
 * Konfigurasi Paket & Produk Gapless
 * Model Final:
 * 1. Gapless Pro — Rp29.000/bulan (Langganan)
 * 2. Laporan Gap Mendalam — Rp9.900/karier (One-time, dibeli terpisah)
 */

export interface PlanFeature {
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
    description: 'Esensi eksplorasi minat karier dan pembelajaran dasar.',
    includedFeatures: [
      { text: 'Asesmen minat & rekomendasi role (1x per 30 hari)' },
      { text: 'Roadmap dasar (Fase 1 & 2)' },
      { text: 'Misi soft skill dasar & refleksi mandiri (4 misi)' },
      { text: 'Rekomendasi kegiatan terdekat (3 per bulan)' },
      { text: 'Skill Passport entri dasar' },
      { text: 'Unggah bukti kegiatan (2x)' },
    ] as PlanFeature[],
    lockedFeatures: [
      { text: 'Re-assessment berkala tanpa batas' },
      { text: 'Skor tiap kompetensi & urutan prioritas perbaikan' },
      { text: 'Roadmap personal 4 fase lengkap & rencana 4 minggu' },
      { text: 'Katalog kegiatan lengkap + filter + alasan kecocokan gap' },
      { text: 'Misi soft skill bulanan terarah dengan umpan balik' },
      { text: 'Skill Passport badge terverifikasi & tautan profil publik' },
    ] as PlanFeature[],
  },
  pro: {
    name: 'Pro',
    displayName: 'Gapless Pro',
    badge: 'PRO',
    price: 29000,
    priceFormatted: '29.000',
    priceWithCurrency: 'Rp 29.000',
    period: '/Bulan',
    description: 'Akselerasi karier lengkap: asesmen unlimited, rekomendasi kegiatan personal, dan misi berkala.',
    includedFeatures: [
      { text: 'Re-assessment berkala tanpa batas (unlimited)' },
      { text: 'Skor tiap kompetensi (current vs required & besar gap)' },
      { text: 'Urutan prioritas perbaikan dengan alasan terstruktur' },
      { text: 'Roadmap semua gap + rencana belajar 4 minggu' },
      { text: 'Katalog kegiatan lengkap + filter gap/deadline/level' },
      { text: 'Penjelasan personal "kenapa kegiatan cocok untuk gap kamu"' },
      { text: 'Misi soft skill paket bulanan dengan umpan balik' },
      { text: 'Skill Passport badge terverifikasi & tautan profil publik' },
      { text: 'Unggah bukti kegiatan lebih banyak & validasi' },
    ] as PlanFeature[],
  },
};

export const PRODUCTS = {
  pro_monthly: {
    key: 'pro_monthly',
    name: 'Gapless Pro',
    price: 29000,
    priceFormatted: '29.000',
    priceWithCurrency: 'Rp 29.000/bulan',
    description: 'Langganan bulanan fitur lanjutan: re-assessment berkala, prioritas perbaikan, rekomendasi kegiatan lengkap, dan misi soft skill.',
  },
  gap_report: {
    key: 'gap_report',
    name: 'Laporan Gap Mendalam',
    price: 9900,
    priceFormatted: '9.900',
    priceWithCurrency: 'Rp 9.900/karier',
    description: 'Buka grafik radar interaktif, narasi kesenjangan AI lengkap, prioritas perbaikan, dan unduh laporan resmi format PDF.',
  },
};
