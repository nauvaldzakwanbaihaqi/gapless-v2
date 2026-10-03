/**
 * Seed data contoh untuk Misi & Kegiatan.
 * Dijalankan sekali via `npx tsx src/lib/seed-sample-data.ts`
 * Flag is_sample = true pada semua data.
 */
import { db } from '@/db';
import { softSkillMissions, activities } from '@/db/schema';

const SAMPLE_MISSIONS = [
  // Komunikasi
  {
    title: 'Presentasi 2 Menit: Perkenalan Diri ke Tim Baru',
    competency: 'Communication',
    description: 'Siapkan dan rekam presentasi 2 menit memperkenalkan diri dan nilai yang kamu bawa ke tim. Fokus pada kejelasan, struktur, dan kepercayaan diri. Tulis refleksi singkat setelah selesai.',
    estimatedMinutes: 20,
    difficultyLevel: 'easy',
    sortOrder: 1,
  },
  {
    title: 'Tulis Email Profesional untuk Situasi Sulit',
    competency: 'Communication',
    description: 'Kamu perlu memberi tahu klien bahwa deadline proyek mundur 3 hari. Tulis email yang jelas, empati, dan profesional — tanpa menyalahkan orang lain. Sertakan solusi konkret.',
    estimatedMinutes: 25,
    difficultyLevel: 'medium',
    sortOrder: 2,
  },
  // Kolaborasi
  {
    title: 'Proyek Tim Kecil: Brief Kampanye Sosial',
    competency: 'Cooperation',
    description: 'Bayangkan kamu bagian dari tim 4 orang yang harus membuat brief kampanye media sosial dalam 48 jam. Tulis peranmu, tantangan kolaborasi yang mungkin muncul, dan bagaimana kamu menanganinya.',
    estimatedMinutes: 40,
    difficultyLevel: 'medium',
    sortOrder: 3,
  },
  {
    title: 'Fasilitasi Diskusi dengan Anggota yang Tidak Setuju',
    competency: 'Cooperation',
    description: 'Dua anggota tim berselisih pendapat soal arah desain produk. Kamu diminta memfasilitasi resolusi dalam 30 menit. Tulis skenario bagaimana kamu menjalankan diskusi tersebut.',
    estimatedMinutes: 30,
    difficultyLevel: 'hard',
    sortOrder: 4,
  },
  // Integritas
  {
    title: 'Dilema Etika: Temuan yang Tidak Nyaman',
    competency: 'Integrity',
    description: 'Saat audit internal, kamu menemukan kesalahan pelaporan kecil yang dilakukan atasanmu — kemungkinan tidak disengaja. Apa yang kamu lakukan? Tulis langkah konkretmu dan alasannya.',
    estimatedMinutes: 20,
    difficultyLevel: 'hard',
    sortOrder: 5,
  },
  {
    title: 'Transparency Check: Laporan Progress Jujur',
    competency: 'Integrity',
    description: 'Tuliskan laporan progress mingguan yang jujur untuk proyek yang sedang kamu kerjakan — termasuk hal yang belum selesai dan kendalanya. Praktikkan transparansi tanpa defensif.',
    estimatedMinutes: 15,
    difficultyLevel: 'easy',
    sortOrder: 6,
  },
  // Tanggung Jawab
  {
    title: 'Simulasi 3 Tugas dengan Tenggat Berbenturan',
    competency: 'Dependability',
    description: 'Kamu punya 3 tugas penting dengan deadline di hari yang sama: laporan klien, presentasi internal, dan revisi dokumen urgent. Buat rencana prioritas detail dan bagaimana kamu memastikan semua selesai.',
    estimatedMinutes: 30,
    difficultyLevel: 'hard',
    sortOrder: 7,
  },
  {
    title: 'Ownership: Ambil Tanggung Jawab atas Kesalahan',
    competency: 'Dependability',
    description: 'Kamu mengirim laporan dengan data yang salah ke klien. Tulis langkah yang kamu ambil — mulai dari mengakui kesalahan, merevisi, hingga mencegah hal serupa terjadi lagi.',
    estimatedMinutes: 20,
    difficultyLevel: 'medium',
    sortOrder: 8,
  },
  // Adaptabilitas
  {
    title: 'Pivot Cepat: Strategi yang Tiba-tiba Berubah',
    competency: 'Adaptability',
    description: 'Di tengah proyek, manajemen memutuskan mengubah target pasar dari B2C ke B2B. Kamu punya 2 hari untuk menyesuaikan rencana. Tulis bagaimana kamu merespons dan apa yang kamu lakukan pertama.',
    estimatedMinutes: 25,
    difficultyLevel: 'hard',
    sortOrder: 9,
  },
  {
    title: 'Belajar Tool Baru dalam 24 Jam',
    competency: 'Adaptability',
    description: 'Tim baru saja beralih dari Notion ke Linear untuk project management. Kamu harus produktif menggunakannya dalam 24 jam pertama. Tulis strategi belajar cepatmu dan apa yang kamu prioritaskan.',
    estimatedMinutes: 20,
    difficultyLevel: 'easy',
    sortOrder: 10,
  },
];

const SAMPLE_ACTIVITIES = [
  {
    title: 'Volunteer Pengajar Coding untuk Siswa SMA — Kode Kebaikan',
    type: 'volunteer',
    description: 'Jadi pengajar sukarela untuk program literasi digital 6 minggu. Ajarkan dasar HTML/CSS/Python ke siswa SMA di daerah terpencil via Zoom.',
    competencyTags: ['Communication', 'Cooperation', 'Dependability'],
    skillTags: ['HTML', 'CSS', 'Python', 'teaching'],
    matchPercent: 78,
    registrationUrl: 'https://kode-kebaikan.example.com/daftar',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 hari lagi
    sortOrder: 1,
  },
  {
    title: 'Lomba Ide Bisnis Mahasiswa — GEN Z Innovates 2025',
    type: 'lomba',
    description: 'Kompetisi bisnis plan dengan tema keberlanjutan. Dibagi per tim 2-4 orang. Ada sesi mentoring dari mentor industri sebelum pitching final.',
    competencyTags: ['Communication', 'Cooperation', 'Adaptability'],
    skillTags: ['business-plan', 'presentation', 'market-analysis'],
    matchPercent: 65,
    registrationUrl: 'https://genz-innovates.example.com',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 hari lagi
    sortOrder: 2,
  },
  {
    title: 'Staff Divisi Media — Himpunan Mahasiswa Teknik',
    type: 'organisasi',
    description: 'Bergabung sebagai staff divisi media dan komunikasi. Buat konten Instagram, kelola komunitas Discord, dan koordinasi dengan divisi lain untuk event bulanan.',
    competencyTags: ['Communication', 'Cooperation', 'Integrity'],
    skillTags: ['social-media', 'content-creation', 'coordination'],
    matchPercent: 82,
    registrationUrl: 'https://hmti.example.com/open-recruitment',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari lagi
    sortOrder: 3,
  },
  {
    title: 'Volunteer Data Entry — Yayasan Pendidikan Nusantara',
    type: 'volunteer',
    description: 'Bantu digitalisasi data siswa penerima beasiswa. Remote-friendly, 5-10 jam/minggu selama 1 bulan. Butuh ketelitian tinggi dan komitmen jadwal.',
    competencyTags: ['Dependability', 'Integrity'],
    skillTags: ['data-entry', 'Excel', 'attention-to-detail'],
    matchPercent: 55,
    registrationUrl: 'https://yayasan-nusantara.example.com/volunteer',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    sortOrder: 4,
  },
  {
    title: 'Kompetisi UI/UX Design — DesignFest Campus 2025',
    type: 'lomba',
    description: 'Kompetisi desain antarmuka dengan tema "Inklusi Digital". Peserta mengerjakan kasus nyata dari perusahaan sponsor. Hadiah: magang + uang tunai.',
    competencyTags: ['Communication', 'Adaptability'],
    skillTags: ['Figma', 'UX-research', 'prototyping'],
    matchPercent: 71,
    registrationUrl: 'https://designfest.example.com',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    sortOrder: 5,
  },
  {
    title: 'Tim Inti Panitia Seminar Nasional Teknologi',
    type: 'organisasi',
    description: 'Cari tim inti untuk seminar nasional 500+ peserta. Divisi terbuka: acara, publikasi, dan sponsorship. Komitmen 3 bulan, 8 jam/minggu.',
    competencyTags: ['Cooperation', 'Dependability', 'Communication'],
    skillTags: ['event-management', 'coordination', 'negotiation'],
    matchPercent: 60,
    registrationUrl: 'https://semnas-tech.example.com/open-committee',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    sortOrder: 6,
  },
];

async function seed() {
  console.log('🌱 Seeding sample missions...');
  for (const mission of SAMPLE_MISSIONS) {
    await db.insert(softSkillMissions).values({
      ...mission,
      isSample: true,
      isActive: true,
    }).onConflictDoNothing();
  }
  console.log(`✅ ${SAMPLE_MISSIONS.length} missions seeded`);

  console.log('🌱 Seeding sample activities...');
  for (const activity of SAMPLE_ACTIVITIES) {
    await db.insert(activities).values({
      ...activity,
      isSample: true,
      isActive: true,
    }).onConflictDoNothing();
  }
  console.log(`✅ ${SAMPLE_ACTIVITIES.length} activities seeded`);
}

seed().catch(console.error).finally(() => process.exit(0));
