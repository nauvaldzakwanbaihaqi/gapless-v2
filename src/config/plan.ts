/**
 * Konfigurasi Produk & Model Akses Gapless
 * Model Baru: Platform Utama 100% Gratis + Tambahan A La Carte Rp9.900 per Career Path.
 */

export interface ProductConfig {
  key: string;
  name: string;
  price: number;
  priceFormatted: string;
  priceWithCurrency: string;
  description: string;
}

export const PRODUCTS: Record<string, ProductConfig> = {
  gap_report: {
    key: 'gap_report',
    name: 'Laporan Analisis Skill Gap & Rekomendasi Mendalam',
    price: 9900,
    priceFormatted: '9.900',
    priceWithCurrency: 'Rp 9.900',
    description: 'Buka grafik radar perbandingan skill, analisis kesenjangan AI lengkap, prioritas perbaikan, dan unduh laporan resmi PDF.',
  },
};

export const CORE_PLATFORM_FEATURES = [
  'Asesmen minat & rekomendasi role (2x per jalur)',
  'Learning Roadmap personal lengkap 4 fase terkurasi',
  'Seluruh misi soft skill (5 kompetensi O*NET)',
  'Rekomendasi kegiatan (organisasi, lomba, volunteer)',
  'Skill Passport terverifikasi dengan tautan profil publik',
];

/**
 * Helper kompatibilitas lama — selalu return true agar tidak ada fitur inti yang terkunci
 */
export function isPlusUser(_tier?: string | null): boolean {
  return true;
}
