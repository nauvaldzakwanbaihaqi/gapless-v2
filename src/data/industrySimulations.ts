export interface SimulationTask {
  id: number;
  title: string;
  duration: string;
  scenario: string;
  instructions: string[];
  deliverableType: 'text' | 'choice' | 'analysis';
  sampleQuestion?: string;
  options?: { label: string; text: string; isBest: boolean; feedback: string }[];
  placeholderAnswer?: string;
  hint?: string;
}

export interface IndustrySimulation {
  careerTitle: string;
  careerSlug: string;
  companyName: string;
  companyLogoText: string;
  companyColor: string;
  companyTagline: string;
  badgeLabel: string;
  simulationTitle: string;
  estimatedHours: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  backgroundStory: string;
  skillsValidated: string[];
  tasks: SimulationTask[];
}

export const INDUSTRY_SIMULATIONS: Record<string, IndustrySimulation> = {
  'content-creator-social-media-specialist': {
    careerTitle: 'Content Creator / Social Media Specialist',
    careerSlug: 'content-creator-social-media-specialist',
    companyName: 'Tokopedia',
    companyLogoText: '🟢 Tokopedia',
    companyColor: '#03AC0E',
    companyTagline: 'Pusat Ekosistem Belanja & Kreator Digital Indonesia',
    badgeLabel: 'Tokopedia Creator Partner',
    simulationTitle: 'Simulasi Hari Pertama: Menyusun Strategi Konten Viral Kampanye Mega Sale',
    estimatedHours: '1.5 - 2 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai Social Media Strategist baru di tim Marketing Tokopedia, tugas pertamamu adalah merancang konten kampanye interaktif untuk menaikkan engagement dan conversion rate gen-Z.',
    backgroundStory: 'Selamat datang di tim Social Media Marketing Tokopedia! Bulan depan Tokopedia akan meluncurkan kampanye diskon besar-besaran untuk audiens Gen-Z. Tim kamu ditugaskan menyusun rencana konten Reels/TikTok, hook video, serta strategi storytelling yang mampu menghasilkan engagement tinggi dan konversi transaksi.',
    skillsValidated: ['Content Strategy', 'Social Media Analytics', 'Copywriting & Scripting', 'Trend Research'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Analisis Target Audiens & Riset Tren TikTok',
        duration: '25 Menit',
        scenario: 'Data engagement bulan lalu menunjukkan audiens usia 18-24 tahun paling menyukai format konten "POV belanja hemat" dan "Review jujur humoris" dengan durasi 30-45 detik.',
        instructions: [
          'Tentukan 1 pilar konten utama yang paling efektif untuk menggaet audiens 18-24 tahun.',
          'Pilih sound/nada penyampaian (Tone of Voice) yang relevan dengan Gen-Z.',
          'Jelaskan alasan pemilihannya dalam 2-3 kalimat.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Format hook visual dan narasi mana yang paling potensial menaikkan retensi 3 detik pertama?',
        options: [
          {
            label: 'A',
            text: 'Visual cepat "Jangan tonton kalau gak mau checkout!" dengan musik up-beat kekinian & teks tebal di tengah layar.',
            isBest: true,
            feedback: 'Sangat tepat! Hook paradoks/larangan dengan kontras teks terbukti meningkatkan retensi 3 detik pertama hingga 40% di TikTok/Reels.'
          },
          {
            label: 'B',
            text: 'Pengenalan profil Tokopedia secara formal dan membacakan syarat & ketentuan promo selama 10 detik.',
            isBest: false,
            feedback: 'Kurang efektif untuk Gen-Z. Penonton kemungkinan besar akan langsung skip di detik ke-2 karena terlalu formal.'
          },
          {
            label: 'C',
            text: 'Video monolog panjang tanpa teks subtitle menjelaskan detail katalog produk.',
            isBest: false,
            feedback: 'Mayoritas audiens menonton video tanpa suara aktif, subtitle tebal sangat krusial.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Penulisan Script Video Pendek (Short-Form Video Script)',
        duration: '35 Menit',
        scenario: 'Tuliskan draft script video berdurasi 30 detik untuk mempromosikan fitur Flash Sale Tokopedia dengan gaya santai dan relate dengan mahasiswa.',
        instructions: [
          'Sertakan [Hook 0-3 detik], [Problem/Pain Point 4-15 detik], [Solusi & Demo 16-25 detik], dan [Call-to-Action 26-30 detik].',
          'Pastikan ada ajakan spesifik untuk membuka aplikasi.'
        ],
        deliverableType: 'text',
        placeholderAnswer: '[Hook 0-3 detik]: "Trik rahasia anak kos tetap bisa makan enak tanggal tua..."\n\n[Pain Point 4-15 detik]: ...\n\n[Solusi 16-25 detik]: ...\n\n[CTA 26-30 detik]: "Klik link di bio buat klaim voucher gratis ongkir sekarang!"',
        hint: 'Fokuskan pada masalah konkret audiens (misal: dompet menipis di akhir bulan) sebelum menawarkan solusi voucher diskon.'
      },
      {
        id: 3,
        title: 'Task 3: Metrik Evaluasi & Rencana Optimasi',
        duration: '20 Menit',
        scenario: 'Setelah konten di-publish selama 24 jam, video tersebut mendapatkan 50.000 views, 4.500 likes, 320 shares, dan 150 klik link aplikasi.',
        instructions: [
          'Hitung Engagement Rate (ER) konten tersebut.',
          'Berikan 1 rekomendasi konkret untuk eksperimen konten berikutnya.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Analisis Metrik:\n- Engagement Total = (Likes + Shares + Comments) = ...\n- Evaluasi CTR link aplikasi: ...\n- Rekomendasi konten lanjutan: ...',
        hint: 'Tingginya share menunjukkan konten relate, namun perhatikan rasio klik link ke aplikasi.'
      }
    ]
  },

  'ui-ux-designer': {
    careerTitle: 'UI/UX Designer',
    careerSlug: 'ui-ux-designer',
    companyName: 'Grab',
    companyLogoText: '🟢 Grab',
    companyColor: '#00B14F',
    companyTagline: 'Everyday Everything App di Asia Tenggara',
    badgeLabel: 'Grab Design Studio Partner',
    simulationTitle: 'Simulasi Hari Pertama: Redesign Alur Pembatalan Pesanan & Retensi Pengemudi',
    estimatedHours: '2 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai Product Designer baru di Grab, kamu akan menyelesaikan tantangan UX riil: mengurangi frustrasi pengguna saat pengemudi terlambat tanpa mengorbankan kepuasan mitra pengemudi.',
    backgroundStory: 'Tim Product Operations Grab menemukan bahwa 18% pembatalan pesanan GrabFood terjadi karena estimasi waktu pengantaran yang tidak jelas saat cuaca hujan. Kamu ditugaskan merancang solusi UI/UX yang memberikan transparansi status pesanan dan opsi solusi alternatif yang ramah bagi pengguna dan mitra pengemudi.',
    skillsValidated: ['User Research', 'Wireframing & Prototyping', 'Usability Principles', 'Design System Compliance'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Analisis User Journey & Friction Point',
        duration: '30 Menit',
        scenario: 'User mengeluhkan status pesanan yang hanya bertuliskan "Restoran sedang menyiapkan makanan" selama 20 menit tanpa update visual progres.',
        instructions: [
          'Identifikasi 2 titik friksi utama pada alur status pesanan saat ini.',
          'Pilih strategi informasi arsitektur (Information Architecture) terbaik untuk meredakan kecemasan pengguna.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Komponen visual apa yang paling efektif mengkomunikasikan alasan keterlambatan secara empatik?',
        options: [
          {
            label: 'A',
            text: 'Live-timeline dengan indikator real-time cuaca, estimasi waktu dinamis, dan banner mini ramah "Driver berhati-hati karena hujan deras di area restoran".',
            isBest: true,
            feedback: 'Tepat sekali! Transparansi kontekstual (konteks cuaca + keselamatan driver) terbukti menurunkan angka komplain hingga 35%.'
          },
          {
            label: 'B',
            text: 'Menyembunyikan estimasi waktu dan hanya menampilkan tombol batal pesanan berukuran besar.',
            isBest: false,
            feedback: 'Ini justru memicu lonjakan pembatalan yang merugikan restoran dan driver.'
          },
          {
            label: 'C',
            text: 'Pop-up error merah bertuliskan "Pesanan Anda tertunda" tanpa penjelasan penyebab.',
            isBest: false,
            feedback: 'Warna error merah memicu alarm kepanikan pengguna.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Rancang Wireframe & Copywriting Solusi UX',
        duration: '40 Menit',
        scenario: 'Deskripsikan rancangan layout baru pada halaman status pesanan saat terjadi keterlambatan.',
        instructions: [
          'Jelaskan susunan hierarchy layout (Header, Map Card, Status Widget, Action Button).',
          'Tuliskan microcopy UX yang ramah dan menenangkan bagi pengguna.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Hierarchy Layout Baru:\n1. Top Header: Status Ringkas\n2. Live Status Card: Visual Progress Bar Dinamis\n3. Microcopy UX: "Pesananmu sedang dalam perjalanan aman bersama Pak Budi..."\n4. Secondary Action: Tombol Hubungi Driver / Bantuan GrabSupport',
        hint: 'Gunakan prinsip visual hierarchy dan tone of voice yang empatis.'
      },
      {
        id: 3,
        title: 'Task 3: Metrik Keberhasilan UX (Success Metrics)',
        duration: '20 Menit',
        scenario: 'Tentukan indikator kuantitatif dan kualitatif untuk mengukur keberhasilan desain baru yang kamu rancang.',
        instructions: [
          'Sebutkan minimal 2 metrik kuantitatif (misal: Cancellation Rate, CSAT, Support Tickets).',
          'Sebutkan 1 metode pengujian kualitatif (misal: Usability Testing / Heatmap Analysis).'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Metrik Kuantitatif:\n- Penurunan Cancellation Rate sebesar ...%\n- Peningkatan skor CSAT pemesanan dari ... ke ...\n\nMetode Kualitatif: Usability Testing dengan 5 responden pengguna aktif.',
        hint: 'Hubungkan metrik langsung dengan masalah bisnis awal.'
      }
    ]
  },

  'software-engineer-front-back-full-stack': {
    careerTitle: 'Software Engineer (Front / Back / Full Stack)',
    careerSlug: 'software-engineer-front-back-full-stack',
    companyName: 'GoTo Tech',
    companyLogoText: '🟢 GoTo Engineering',
    companyColor: '#002E6E',
    companyTagline: 'Ekosistem Digital Terbesar di Indonesia',
    badgeLabel: 'GoTo Engineering Fellow',
    simulationTitle: 'Simulasi Hari Pertama: Refactoring API Gateway & Arsitektur Transaksi Resilient',
    estimatedHours: '2 Jam',
    difficulty: 'Advanced',
    summary: 'Sebagai Software Engineer di tim Backend Platform GoTo, kamu ditugaskan mengatasi bottleneck performa database transaksi saat momen flash sale gajian.',
    backgroundStory: 'Saat momen flash sale, sistem pembayaran GoTo mengalami lonjakan traffic 10x lipat. Query transaksi ke database mengalami dead-lock dan latency meningkat hingga 4.5 detik. Kamu bertugas mengimplementasikan strategi caching, idempotency key, dan circuit breaker.',
    skillsValidated: ['Backend Architecture', 'Database Optimization', 'System Design', 'API Security & Reliability'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Penanganan Concurrency & Idempotency',
        duration: '30 Menit',
        scenario: 'Pengguna menekan tombol "Bayar Sekarang" berkali-kali karena internet lambat, menyebabkan request POST /pay terkirim 3 kali dalam 1 detik.',
        instructions: [
          'Pilih arsitektur teknis yang paling tepat untuk mencegah pemotongan saldo ganda (double-spending).'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Mekanisme apa yang wajib diterapkan pada API transaksi finansial ini?',
        options: [
          {
            label: 'A',
            text: 'Menggunakan Idempotency Key (UUID) yang disimpan di Redis dengan TTL 60 detik + Database Transaction Isolation Level READ COMMITTED / SERIALIZABLE.',
            isBest: true,
            feedback: 'Sempurna! Idempotency key memastikan request berulang dengan payload yang sama hanya dieksekusi 1 kali, sisanya mengembalikan respon cached.'
          },
          {
            label: 'B',
            text: 'Hanya mendisabled tombol submit di frontend JavaScript tanpa validasi sisi server.',
            isBest: false,
            feedback: 'Sangat berbahaya. User bisa bypass frontend via network inspector atau curl script.'
          },
          {
            label: 'C',
            text: 'Menghapus validasi saldo dan membiarkan database menampung semua saldo negatif.',
            isBest: false,
            feedback: 'Ini adalah bug fatal finansial.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Perancangan Skema Database & Strategi Caching',
        duration: '40 Menit',
        scenario: 'Rancang arsitektur caching Redis di depan database PostgreSQL untuk query data katalog produk yang sering dibaca (High Read).',
        instructions: [
          'Jelaskan pola caching (misal: Cache-Aside / Write-Through).',
          'Bagaimana strategi Cache Invalidation saat harga produk berubah?'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Arsitektur Caching:\n1. Pola: Cache-Aside Pattern\n- Backend cek Redis terlebih dahulu...\n2. Invalidation Strategy:\n- Saat admin update harga -> Publish event ke Redis PUB/SUB untuk DEL cache key `product:{id}`...',
        hint: 'Pertimbangkan masalah Cache Stampede dan Time-To-Live (TTL).'
      },
      {
        id: 3,
        title: 'Task 3: Error Handling & Observability',
        duration: '20 Menit',
        scenario: 'Layanan payment gateway pihak ketiga tiba-tiba timeout (504 Gateway Timeout). Bagaimana fallback sistem agar pengguna tidak stuck di loading screen?',
        instructions: [
          'Tuliskan langkah circuit breaker dan pesan error graceful untuk client.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Strategi Circuit Breaker:\n- Jika error rate > 50% dalam 10 detik, buka sirkuit (State: OPEN)...\n- Respon HTTP 503 dengan payload JSON terstruktur:\n  { "status": "retry_later", "message": "Sistem perbankan sedang sibuk..." }',
        hint: 'Pastikan status transaksi ditandai PENDING_VERIFICATION, bukan langsung gagal.'
      }
    ]
  },

  'data-analyst-business-intelligence': {
    careerTitle: 'Data Analyst / Business Intelligence',
    careerSlug: 'data-analyst-business-intelligence',
    companyName: 'Shopee Indonesia',
    companyLogoText: '🟠 Shopee Analytics',
    companyColor: '#EE4D2D',
    companyTagline: 'Leading E-commerce Platform in Southeast Asia',
    badgeLabel: 'Shopee Data Insight Partner',
    simulationTitle: 'Simulasi Hari Pertama: Analisis Retensi Pengguna & Optimasi Voucher Toko',
    estimatedHours: '2 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai Junior Data Analyst di Shopee, kamu akan menganalisis data churn pengguna dan menyajikan visualisasi data untuk tim manajemen.',
    backgroundStory: 'Tim Growth Shopee menemukan terjadi penurunan retensi bulan ke-2 (Month-2 Retention) sebesar 12% pada kategori fashion. Kamu diminta menganalisis dataset transaksi, merumuskan query SQL, dan memberikan rekomendasi strategis.',
    skillsValidated: ['SQL Data Wrangling', 'Cohort Analysis', 'Business Intelligence Dashboard', 'Data Storytelling'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Query SQL Segmentasi Cohort Pengguna',
        duration: '35 Menit',
        scenario: 'Tuliskan logika SQL untuk mengelompokkan pengguna berdasarkan bulan transaksi pertama mereka dan menghitung jumlah repeat order di bulan berikutnya.',
        instructions: [
          'Gunakan fungsi DATE_TRUNC atau FORMAT_DATE untuk membuat cohort bulan.',
          'Hitung persentase user yang kembali belanja di bulan ke-2.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'SELECT \n  first_month,\n  COUNT(DISTINCT user_id) AS total_users,\n  COUNT(DISTINCT CASE WHEN order_month = first_month + 1 THEN user_id END) AS retained_users\nFROM user_orders\nGROUP BY 1;',
        hint: 'Gunakan CTE (WITH clause) untuk mencari tanggal transaksi pertama per user.'
      },
      {
        id: 2,
        title: 'Task 2: Identifikasi Anomali & Temuan Utama (Insight)',
        duration: '30 Menit',
        scenario: 'Hasil data menunjukkan user yang memakai voucher gratis ongkir tanpa minimum belanja memiliki retensi 65%, sedangkan user dengan voucher diskon 50% hanya memiliki retensi 22%.',
        instructions: [
          'Berikan interpretasi bisnis mengapa voucher gratis ongkir menghasilkan retensi jangka panjang yang lebih tinggi.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Hipotesis bisnis apa yang paling tepat menjelaskan fenomena data tersebut?',
        options: [
          {
            label: 'A',
            text: 'Voucher diskon 50% menarik "bargain hunters" yang hanya belanja sekali saat ada promo ekstrem, sedangkan gratis ongkir menciptakan kebiasaan belanja harian berulang (habitual buying).',
            isBest: true,
            feedback: 'Analisis yang tajam! Gratis ongkir menurunkan batas psikologis belanja berulang sehingga membangun Customer Lifetime Value (CLV) lebih sehat.'
          },
          {
            label: 'B',
            text: 'Data tersebut pasti salah karena diskon persentase besar selalu lebih disukai semua orang.',
            isBest: false,
            feedback: 'Data analitik mencerminkan perilaku riil, bukan sekadar intuisi.'
          },
          {
            label: 'C',
            text: 'Pengguna fashion tidak peduli dengan ongkos kirim.',
            isBest: false,
            feedback: 'Biaya ongkir adalah faktor nomor satu pemicu abandoned cart di e-commerce Indonesia.'
          }
        ]
      },
      {
        id: 3,
        title: 'Task 3: Rekomendasi Eksekutif untuk Manajemen',
        duration: '25 Menit',
        scenario: 'Susun 3 rekomendasi actionable dalam bentuk bullet points untuk diajukan ke Head of Marketing.',
        instructions: [
          'Sertakan alokasi budget, target audience, dan proyeksi dampak.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Rekomendasi Strategis:\n1. Realokasi 40% budget voucher diskon besar ke subsidi Gratis Ongkir Bertingkat.\n2. Otomasi push notification di hari ke-14 setelah pembelian pertama.\n3. Proyeksi peningkatan MoM retention sebesar 5-8% dalam kuartal depan.',
        hint: 'Gunakan prinsip MECE (Mutually Exclusive, Collectively Exhaustive) dalam penyusunan poin.'
      }
    ]
  },

  'startup-founder': {
    careerTitle: 'Startup Founder',
    careerSlug: 'startup-founder',
    companyName: 'East Ventures',
    companyLogoText: '💼 East Ventures',
    companyColor: '#1E3A8A',
    companyTagline: 'Venture Capital & Akselerator Ekosistem Startup Terbesar Asia Tenggara',
    badgeLabel: 'East Ventures Founder Fellow',
    simulationTitle: 'Simulasi Hari Pertama: Validasi Unit Economics, Peluncuran MVP, & Pitching Seed Round',
    estimatedHours: '2 Jam',
    difficulty: 'Advanced',
    summary: 'Sebagai Founder yang sedang menginkubasi startup tahap awal, kamu dihadapkan pada keputusan krusial: menguji Product-Market Fit, menghitung runway keuangan, dan meyakinkan VC untuk pendanaan awal.',
    backgroundStory: 'Startup kamu baru saja merilis prototipe aplikasi SaaS B2B untuk UMKM dengan modal bootstrapping tersisa 4 bulan. Kamu harus mengevaluasi metrik retensi pengguna awal, memperbaiki perbandingan CAC terhadap LTV, serta menyusun ringkasan pitch deck untuk dipresentasikan di hadapan partner East Ventures.',
    skillsValidated: ['Product-Market Fit Validation', 'Unit Economics (CAC/LTV)', 'Pitching & Investor Relations', 'Strategic Decision Making'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Analisis Masalah Pasar & Validasi Hipotesis MVP',
        duration: '25 Menit',
        scenario: 'Dari 50 pengguna awal (early adopters), hanya 12 yang kembali menggunakan aplikasi di minggu kedua. Namun, ke-12 pengguna tersebut aktif menggunakan fitur "Pencatatan Piutang Otomatis" setiap hari.',
        instructions: [
          'Tentukan langkah paling strategis untuk memvalidasi apakah produk sudah mencapai Product-Market Fit atau butuh pivot fitur.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Keputusan strategis apa yang paling tepat diambil oleh founder pada fase ini?',
        options: [
          {
            label: 'A',
            text: 'Wawancara mendalam ke-12 pengguna aktif untuk memahami alasan utama mereka bertahan, lakukan doubling-down pada fitur piutang, dan eliminasi fitur lain yang tidak terpakai.',
            isBest: true,
            feedback: 'Tepat sekali! Fokus pada "super-users" yang mencintai fitur spesifik adalah kunci menemukan value proposition inti sebelum scale-up.'
          },
          {
            label: 'B',
            text: 'Segera membakar uang iklan (ads) besar-besaran untuk mencari 1.000 pengguna baru tanpa memperbaiki retensi.',
            isBest: false,
            feedback: 'Kurang tepat karena akan membuang modal (leaky bucket problem).'
          },
          {
            label: 'C',
            text: 'Mengubah seluruh produk menjadi marketplace baru tanpa mengolah data pengguna yang ada.',
            isBest: false,
            feedback: 'Pivot terburu-buru tanpa data validasi pelanggan sangat berisiko.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Perhitungan Unit Economics & Manajemen Burn Rate',
        duration: '35 Menit',
        scenario: 'Hitung kesehatan finansial: Biaya akuisisi pelanggan (CAC) saat ini Rp 150.000, rata-rata langganan per bulan Rp 50.000 dengan churn rate 10% per bulan (Customer Lifetime = 10 bulan, LTV = Rp 500.000). Kas saat ini Rp 120.000.000 dengan monthly burn rate Rp 30.000.000.',
        instructions: [
          'Evaluasi rasio LTV:CAC apakah sehat untuk startup tahap awal.',
          'Hitung sisa runway dalam bulan dan berikan 2 strategi memperpanjang runway.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Analisis Unit Economics:\n1. Rasio LTV:CAC = 500.000 / 150.000 = 3.33x (Sehat, standar VC > 3x)\n2. Sisa Runway = 120jt / 30jt = 4 Bulan\n3. Strategi Optimasi Runway:\n- Mengurangi biaya server dengan beralih ke cloud credits startup...\n- Menawarkan diskon pembayaran tahunan di muka (upfront annual billing) untuk mendongkrak cash flow positif...',
        hint: 'Rasio LTV:CAC > 3x umumnya dianggap benchmark ideal oleh investor tahap awal.'
      },
      {
        id: 3,
        title: 'Task 3: 3-Minute Elevator Pitch untuk Investor Seed Round',
        duration: '20 Menit',
        scenario: 'Tuliskan naskah Elevator Pitch ringkas (3 paragraf) untuk membuka sesi presentasi di depan Partner East Ventures.',
        instructions: [
          'Paragraf 1: Problem riil di pasar dan besaran peluang (TAM).',
          'Paragraf 2: Solusi unik produk kamu dan traksi yang sudah dicapai.',
          'Paragraf 3: Kebutuhan pendanaan (The Ask) dan target milestone berikutnya.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Elevator Pitch:\n"Di Indonesia, lebih dari 64 juta UMKM kehilangan rata-rata 15% pendapatan akibat pencatatan piutang manual yang tercecer. Kami hadir dengan sistem pembukuan piutang otomatis yang memangkas waktu rekonsiliasi hingga 80%...\nDalam 3 bulan pengujian, kami telah memproses transaksi lebih dari Rp 1,5 Miliar dengan retensi pengguna aktif bulanan 70%...\nKami mencari pendanaan awal sebesar $150.000 untuk memperluas tim teknologi dan mencapai 5.000 UMKM berbayar dalam 9 bulan ke depan."',
        hint: 'Jelaskan angka traksi dan keunikan produk secara lugas dan percaya diri.'
      }
    ]
  },

  'product-manager': {
    careerTitle: 'Product Manager',
    careerSlug: 'product-manager',
    companyName: 'GoTo Platform',
    companyLogoText: '🟢 GoTo Product Org',
    companyColor: '#00AA13',
    companyTagline: 'Ekosistem Layanan On-Demand, Finansial & E-Commerce Terbesar',
    badgeLabel: 'GoTo Product Specialist',
    simulationTitle: 'Simulasi Hari Pertama: Prioritas Backlog RICE & Penyusunan PRD Fitur Baru',
    estimatedHours: '2 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai Product Manager baru di GoTo, kamu memimpin inisiatif peningkatan efisiensi checkout dengan menyeimbangkan kebutuhan bisnis, pengalaman pengguna, dan kapasitas tim engineering.',
    backgroundStory: 'Data analitik menunjukkan tingkat drop-off di halaman checkout mencapai 24% karena metode pembayaran gagal loading. Tim Bisnis menginginkan fitur Buy-Now-Pay-Later baru, tim UX ingin penyederhanaan alur, sedangkan tim Engineering memiliki kendala technical debt. Tugasmu adalah menyusun skoring prioritas dan membuat Product Requirement Document (PRD) yang solid.',
    skillsValidated: ['RICE Framework Prioritization', 'Product Requirement Document (PRD)', 'Cross-Functional Stakeholder Management', 'North Star Metric Tracking'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Prioritas Backlog Menggunakan Metode RICE',
        duration: '25 Menit',
        scenario: 'Terdapat 3 kandidat fitur kuartal ini: (1) One-Click Checkout [Reach: 80k, Impact: 3, Conf: 80%, Effort: 2], (2) Gamifikasi Poin [Reach: 20k, Impact: 2, Conf: 50%, Effort: 4], (3) Dark Mode [Reach: 50k, Impact: 1, Conf: 90%, Effort: 1].',
        instructions: [
          'Gunakan rumus RICE = (Reach * Impact * Confidence) / Effort untuk menentukan fitur urutan teratas.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Fitur mana yang memiliki skor RICE tertinggi dan wajib dieksekusi pertama pada sprint mendatang?',
        options: [
          {
            label: 'A',
            text: 'One-Click Checkout (Skor RICE: 96.000) — Memberikan dampak bisnis dan jangkauan terbesar terhadap peningkatan conversion rate.',
            isBest: true,
            feedback: 'Tepat sekali! One-Click Checkout menghasilkan skor RICE tertinggi (96.000) dan menjawab langsung masalah drop-off checkout.'
          },
          {
            label: 'B',
            text: 'Dark Mode (Skor RICE: 45.000) — Karena paling cepat dikerjakan meskipun dampaknya minim terhadap metrik transaksi.',
            isBest: false,
            feedback: 'Kurang tepat karena dampak bisnisnya sangat kecil dibandingkan checkout drop-off.'
          },
          {
            label: 'C',
            text: 'Gamifikasi Poin (Skor RICE: 5.000) — Membutuhkan effort tinggi dengan tingkat keyakinan rendah.',
            isBest: false,
            feedback: 'Fitur ini memiliki skor RICE terendah dan menyita kapasitas engineering.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Penulisan User Story & Kriteria Penerimaan (Acceptance Criteria)',
        duration: '35 Menit',
        scenario: 'Tuliskan User Story dan Kriteria Penerimaan lengkap untuk fitur "Penyimpanan Kartu & 1-Click Pay" bagi pengguna yang sudah terverifikasi.',
        instructions: [
          'Gunakan format: As a [User], I want to [Action], So that [Benefit].',
          'Tuliskan minimal 3 Acceptance Criteria dengan format Given-When-Then.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'User Story:\n"Sebagai pengguna aktif GoTo yang sering bertransaksi, saya ingin menyimpan metode pembayaran utama dan menyelesaikan pembelian dengan 1 klik, sehingga saya tidak perlu memasukkan ulang OTP/detail pembayaran setiap belanja."\n\nAcceptance Criteria:\n1. Given pengguna telah memverifikasi biometrik/PIN, When memilih 1-Click Pay, Then transaksi langsung diproses dalam waktu < 2 detik.\n2. Given saldo tidak mencukupi, When tombol ditekan, Then muncul modal konfirmasi top-up instan tanpa menutup keranjang.\n3. Given terjadi kegagalan jaringan, When transaksi timeout, Then status transaksi ditandai pending dan tidak mendebit saldo ganda.',
        hint: 'Pastikan edge case seperti saldo tidak cukup dan timeout jaringan tertulis jelas.'
      },
      {
        id: 3,
        title: 'Task 3: Penentuan North Star Metric & Peluncuran Rollout Bertahap',
        duration: '20 Menit',
        scenario: 'Tentukan 1 North Star Metric utama untuk fitur ini dan rancang fase peluncuran (A/B testing rollout) untuk memitigasi risiko bug.',
        instructions: [
          'Sebutkan North Star Metric dan guardrail metric (metrik pengaman).',
          'Jelaskan fase alokasi traffic (misal 5% -> 25% -> 100%).'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Metrik & Strategi Rollout:\n- North Star Metric: Checkout Conversion Rate (target naik dari 76% menjadi 83%).\n- Guardrail Metric: Transaction Error Rate (< 0.1%) dan Customer Support Ticket Rate.\n- Fase Rollout:\n  * Hari 1-3: Internal Dogfooding (karyawan GoTo)\n  * Hari 4-7: 5% random users untuk observasi error monitoring\n  * Minggu ke-2: 25% traffic jika crash rate normal\n  * Minggu ke-3: 100% full release ke seluruh pengguna.',
        hint: 'Guardrail metric penting agar PM tidak hanya mengejar pertumbuhan namun juga menjaga stabilitas sistem.'
      }
    ]
  },

  'ai-ml-engineer': {
    careerTitle: 'AI/ML Engineer / Machine Learning Engineer',
    careerSlug: 'ai-ml-engineer',
    companyName: 'DANA AI Lab',
    companyLogoText: '⚡ DANA Fintech Lab',
    companyColor: '#118EEA',
    companyTagline: 'Pusat Inovasi AI & Dompet Digital Terpercaya Indonesia',
    badgeLabel: 'DANA AI Engineer Certified',
    simulationTitle: 'Simulasi Hari Pertama: Optimasi Latensi Model Deteksi Fraud & MLOps Pipeline',
    estimatedHours: '2 Jam',
    difficulty: 'Advanced',
    summary: 'Sebagai AI/ML Engineer di DANA, kamu ditugaskan memperbarui model deteksi transaksi mencurigakan agar mampu memproses 20.000 transaksi/detik dengan latensi di bawah 50ms tanpa meningkatkan false positive.',
    backgroundStory: 'Sistem deteksi fraud rule-based lama mulai kewalahan menghadapi pola serangan bot baru. Kamu ditugaskan mendeploy model klasifikasi ke production, menyeimbangkan trade-off Precision vs Recall, serta membangun pipeline monitoring data drift otomatis.',
    skillsValidated: ['Model Performance Optimization', 'MLOps & Inference Latency', 'Feature Engineering for Fraud Detection', 'Explainable AI (SHAP/LIME)'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Evaluasi Metrik & Penentuan Threshold Klasifikasi Fraud',
        duration: '25 Menit',
        scenario: 'Dalam sistem pembayaran digital, meloloskan transaksi fraud (False Negative) menyebabkan kerugian finansial langsung bagi nasabah, sedangkan memblokir transaksi nasabah sah (False Positive) merusak reputasi aplikasi.',
        instructions: [
          'Tentukan metrik evaluasi utama dan strategi penentuan threshold probabilitas model.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Metrik evaluasi mana yang wajib diutamakan pada model fraud detection dengan class imbalance 99.8% transaksi normal : 0.2% fraud?',
        options: [
          {
            label: 'A',
            text: 'Mengoptimalkan PR-AUC (Precision-Recall AUC) dengan prioritas Recall tinggi (misal 95%), lalu menerapkan secondary challenge (verifikasi biometrik/OTP) pada zona probabilitas abu-abu untuk menekan dampak False Positive.',
            isBest: true,
            feedback: 'Sangat tepat! Pada data sangat imbalanced, akurasi umum menyesatkan. PR-AUC dan Recall tinggi didukung step-up authentication menjaga keamanan dan kenyamanan.'
          },
          {
            label: 'B',
            text: 'Hanya melihat Accuracy score 99.8% karena model yang menebak semua normal sudah memiliki akurasi tinggi.',
            isBest: false,
            feedback: 'Ini adalah jebakan akurasi (accuracy paradox) yang mematikan pada data imbalance.'
          },
          {
            label: 'C',
            text: 'Menolak semua transaksi di atas Rp 500.000 tanpa menggunakan model ML.',
            isBest: false,
            feedback: 'Ini pendekatan naif yang menghancurkan transaksi e-wallet.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Arsitektur Model Serving Rendah Latensi & Monitoring Drift',
        duration: '35 Menit',
        scenario: 'Model XGBoost saat ini memiliki waktu inferensi 140ms, melampaui SLA payment gateway yang mewajibkan respon < 50ms.',
        instructions: [
          'Jelaskan 2 teknik optimasi model (misal: quantization, model compilation ONNX/TensorRT, caching feature store).',
          'Bagaimana cara mendeteksi jika pola transaksi di bulan depan mengalami Data Drift?'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Arsitektur Serving & Monitoring:\n1. Optimasi Latensi Inferensi:\n- Mengonversi model ke ONNX Runtime dengan optimasi graf C++ untuk memangkas latensi menjadi < 25ms.\n- Pre-computing fitur agregasi pengguna di Redis Feature Store (Feast) sehingga inferensi tidak melakukan query lambat ke database relational.\n2. Deteksi Data Drift:\n- Menerapkan uji Kolmogorov-Smirnov (KS-Test) dan Population Stability Index (PSI) harian pada distribusi fitur input.\n- Jika nilai PSI > 0.2, trigger alert dan jalankan pipeline re-training otomatis dengan dataset 14 hari terakhir.',
        hint: 'Gunakan terminologi Feature Store, ONNX Runtime, dan Population Stability Index (PSI).'
      },
      {
        id: 3,
        title: 'Task 3: Strategi Mitigasi Kasus False Positive bagi Nasabah VIP',
        duration: '20 Menit',
        scenario: 'Seorang nasabah setia berbelanja dalam jumlah besar di luar negeri dan transaksinya sempat diblokir oleh model. Bagaimana strategi Explainable AI (SHAP value) untuk memberikan penjelasan transparan?',
        instructions: [
          'Jelaskan bagaimana SHAP value membantu tim Risk Operations memahami alasan model mengambil keputusan dalam hitungan detik.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Penerapan Explainable AI:\n- Sistem menampilkan waterfall chart SHAP values pada dashboard agen Customer Service: "Alasan pemblokiran sementara: Transaksi dari IP negara baru berkontribusi +42% terhadap skor risiko, nominal transaksi 5x di atas rata-rata berkontribusi +30%".\n- Agen CS dapat mengonfirmasi ke nasabah dan memasukkan device ke whitelist terpercaya dengan 1 klik, memulihkan akses tanpa merusak kredibilitas sistem keamanan.',
        hint: 'Jelaskan bagaimana interpretasi model meningkatkan kecepatan respon tim operasional.'
      }
    ]
  },

  'data-scientist': {
    careerTitle: 'Data Scientist',
    careerSlug: 'data-scientist',
    companyName: 'Bank Mandiri Digital',
    companyLogoText: '🏦 Mandiri Analytics',
    companyColor: '#003D79',
    companyTagline: 'Transformasi Perbankan Digital Terdepan Indonesia',
    badgeLabel: 'Mandiri Data Science Fellow',
    simulationTitle: 'Simulasi Hari Pertama: Membangun Model Prediksi Churn Nasabah & Evaluasi Lift Curve',
    estimatedHours: '2 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai Data Scientist di Bank Mandiri, kamu membedah pola transaksi jutaan nasabah tabungan digital untuk memprediksi probabilitas nasabah yang akan berhenti aktif (churn) dalam 60 hari ke depan.',
    backgroundStory: 'Tingkat retensi nasabah aplikasi digital menurun 3.2% pada kuartal lalu. Tim CRM membutuhkan skor risiko churn per nasabah agar promo cashback dapat disalurkan secara tepat sasaran ke nasabah yang berisiko tinggi beralih, bukan disebar acak.',
    skillsValidated: ['Predictive Modeling', 'Feature Engineering', 'Model Evaluation (AUC-ROC/Lift)', 'Business Impact Estimation'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Penanganan Imbalanced Dataset & Pemilihan Algoritma Model',
        duration: '25 Menit',
        scenario: 'Data menunjukkan rasio nasabah churn sebesar 8% berbanding 92% nasabah aktif. Kamu perlu menyiapkan teknik sampling dan algoritma yang tahan terhadap skewness data.',
        instructions: [
          'Pilih teknik sampling dan model prediktif yang paling tepat.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Kombinasi metode data science apa yang paling efektif untuk memprediksi churn nasabah?',
        options: [
          {
            label: 'A',
            text: 'Menerapkan SMOTE / Class Weights tuning pada LightGBM dengan Stratified K-Fold Cross Validation dan evaluasi metrik AUC-ROC serta Top-Decile Lift.',
            isBest: true,
            feedback: 'Sangat tepat! LightGBM efisien menangani data tabular jutaan baris, dan Stratified K-Fold memastikan proporsi churn terjaga di tiap fold validasi.'
          },
          {
            label: 'B',
            text: 'Menggunakan K-Means Clustering tanpa label dan membagi nasabah menjadi 2 kluster secara acak.',
            isBest: false,
            feedback: 'Kurang tepat karena clustering adalah unsupervised learning yang tidak dioptimalkan untuk prediksi klasifikasi terarah.'
          },
          {
            label: 'C',
            text: 'Menghapus 90% data nasabah aktif agar jumlahnya sama dengan data churn.',
            isBest: false,
            feedback: 'Random undersampling ekstrem membuang informasi berharga dari mayoritas data.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Feature Selection & Validasi Lintas Silang',
        duration: '35 Menit',
        scenario: 'Sebutkan 3 fitur turunan (engineered features) dari data riwayat transaksi bank yang memiliki daya prediksi terkuat terhadap risiko churn nasabah.',
        instructions: [
          'Tuliskan definisi matematis/logika dari ketiga fitur tersebut.',
          'Jelaskan mengapa fitur tersebut mengindikasikan penurunan minat nasabah.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Fitur Prediktif Utama:\n1. RFM Score (Recency, Frequency, Monetary): Jumlah hari sejak transaksi terakhir (Recency) di aplikasi Livin\'. Jika Recency > 30 hari, korelasi churn sangat kuat.\n2. Balance Depletion Velocity: Rasio rata-rata saldo 30 hari terakhir dibanding 90 hari sebelumnya (Saldo Akhir / Saldo Awal). Nilai < 0.3 menandakan pemindahan dana ke bank lain.\n3. Bill Payment Variety Drop: Penurunan jenis transaksi rutin (misal token PLN, pulsa, e-wallet top up) dari biasanya 4 variasi menjadi 0.',
        hint: 'Fokuskan pada perubahan kebiasaan bertransaksi (trend of usage decline).'
      },
      {
        id: 3,
        title: 'Task 3: Konversi Skor Model Menjadi Strategi Penawaran CRM Terarah',
        duration: '20 Menit',
        scenario: 'Model telah menghasilkan probabilitas churn (0.0 s.d. 1.0) untuk 1.000.000 nasabah. Tim Marketing memiliki anggaran promo terbatas untuk 100.000 nasabah.',
        instructions: [
          'Bagaimana cara mengalokasikan anggaran promosi agar menghasilkan return on investment (ROI) terbesar berdasarkan output model?'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Strategi Penyaluran Berbasis Uplift:\n- Urutkan nasabah berdasarkan probabilitas churn (decile 1 s.d. 10).\n- Targetkan desil ke-2 dan ke-3 (probabilitas churn 40-70% / zona "dapat diselamatkan"), bukan desil ke-1 yang sudah pasti pindah (lost causes) atau desil 9-10 yang pasti loyal (sure things).\n- Jalankan A/B test (50k treatment promo vs 50k control) untuk mengukur incremental retention lift secara akurat.',
        hint: 'Jelaskan konsep Uplift Modeling (Persuadables vs Sure Things).'
      }
    ]
  },

  'community-manager': {
    careerTitle: 'Community Manager / Digital Marketing Specialist',
    careerSlug: 'community-manager',
    companyName: 'Dicoding Indonesia',
    companyLogoText: '🌐 Dicoding Community',
    companyColor: '#2D3E50',
    companyTagline: 'Komunitas Developer & Jaringan Talenta Digital Terbesar di Indonesia',
    badgeLabel: 'Dicoding Community Champion',
    simulationTitle: 'Simulasi Hari Pertama: Manajemen Krisis Komunitas & Re-Engagement Member Dorman',
    estimatedHours: '1.5 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai Community Manager di Dicoding, kamu bertanggung jawab menjaga atmosfer diskusi yang sehat, menyelesaikan isu miskomunikasi publik, dan meningkatkan aktivitas anggota komunitas belajar teknologi.',
    backgroundStory: 'Di kanal Discord dan grup Telegram dengan 150.000 anggota, muncul perdebatan panas seputar perubahan silabus beasiswa coding yang memicu komentar negatif dari sebagian peserta. Selain menangani krisis komunikasi, kamu harus merancang program aktivasi bulanan yang memicu keterlibatan aktif.',
    skillsValidated: ['Community Crisis Management', 'Empathetic Communication', 'Event & Activation Design', 'Community Health Metrics (NPS/Retention)'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Penanganan Krisis Komunikasi & Moderasi Konflik Publik',
        duration: '25 Menit',
        scenario: 'Beberapa member vokal memprotes pengumuman kelulusan di kanal publik dan mulai memprovokasi anggota lain untuk memboikot acara komunitas.',
        instructions: [
          'Pilih langkah de-eskalasi yang paling tepat sesuai kode etik community management.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Tindakan apa yang pertama kali harus dilakukan oleh Community Manager?',
        options: [
          {
            label: 'A',
            text: 'Merespon cepat di kanal publik dengan nada empatik, akui keresahan peserta tanpa defensif, sediakan FAQ transparan, dan ajak perwakilan member berdiskusi langsung di kanal privat untuk mendengarkan masukan.',
            isBest: true,
            feedback: 'Sangat profesional! Menghapus pesan secara sepihak hanya memicu kemarahan, sedangkan transparansi dan empati meredakan ketegangan.'
          },
          {
            label: 'B',
            text: 'Langsung membanned semua anggota yang mengkritik dan mengunci chat room selama 1 bulan.',
            isBest: false,
            feedback: 'Langkah ini otoriter dan akan merusak kepercayaan komunitas secara permanen.'
          },
          {
            label: 'C',
            text: 'Mengabaikan protes dan berharap percakapan akan mereda dengan sendirinya.',
            isBest: false,
            feedback: 'Mengabaikan isu krisis membuat sentimen negatif menyebar ke media sosial luar.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Desain Program Re-Engagement Anggota Dorman',
        duration: '35 Menit',
        scenario: 'Sebanyak 60% member komunitas tergolong pasif (dorman) dan tidak pernah mengirim pesan dalam 60 hari terakhir. Rancang 1 program inisiatif aktivasi interaktif 14 hari.',
        instructions: [
          'Sebutkan nama program, konsep kegiatan, dan insentif yang ditawarkan.',
          'Bagaimana cara memfasilitasi interaksi antar sesama member?'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Program Aktivasi Komunitas:\n- Nama Program: "14-Day Code & Share Sprint"\n- Konsep: Tantangan harian mini 30 menit (misal: "Share baris kode favoritmu", "Review portofolio teman sebelah").\n- Mekanisme: Dibuat grup belajar kecil (study pods 5 orang) agar anggota pemalu merasa nyaman berdiskusi di lingkaran mini.\n- Insentif: Badge eksklusif Discord "Active Sprinter" + e-certificate partisipasi resmi Dicoding bagi yang konsisten 10 hari.',
        hint: 'Program kelompok kecil (peer study pods) terbukti efektif mengaktifkan anggota yang pasif.'
      },
      {
        id: 3,
        title: 'Task 3: Dashboard Metrik Kesehatan Komunitas & Laporan Bulanan',
        duration: '20 Menit',
        scenario: 'Tuliskan ringkasan metrik kesehatan komunitas yang akan kamu laporkan kepada VP of Growth.',
        instructions: [
          'Sertakan metrik Daily Active Members (DAM), Net Promoter Score (NPS), dan rasio User Generated Content (UGC).'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Laporan Kesehatan Komunitas Bulanan:\n1. Engagement: DAM naik 18% (mencapai 14.200 member aktif harian).\n2. Konten Mandiri: Rasio pertanyaan yang dijawab oleh sesama member (peer-to-peer resolution) mencapai 68%, mengurangi beban fasilitator internal.\n3. Kepuasan Komunitas: Net Promoter Score (NPS) berada di angka +62 (kategori Excellent).\n4. Rekomendasi: Membuka program Community Ambassador untuk melatih 20 moderator sukarela dari member teraktif.',
        hint: 'Fokuskan pada kemampuan komunitas untuk saling membantu secara mandiri (organic self-sustenance).'
      }
    ]
  },

  'hr-business-partner': {
    careerTitle: 'HR Business Partner',
    careerSlug: 'hr-business-partner',
    companyName: 'Astra International',
    companyLogoText: '🏢 Astra People & Culture',
    companyColor: '#0A4DA2',
    companyTagline: 'Inspirasi Bangsa melalui Keunggulan Manajemen Talenta Korporasi',
    badgeLabel: 'Astra HRBP Partner',
    simulationTitle: 'Simulasi Hari Pertama: Analisis Retensi Karyawan Kunci & Perancangan Succession Plan',
    estimatedHours: '2 Jam',
    difficulty: 'Intermediate',
    summary: 'Sebagai HR Business Partner di Astra, kamu mendampingi pimpinan divisi operasional untuk mendiagnosis tingginya perputaran (turnover) talenta teknologi dan merancang rencana suksesi karier jangka panjang.',
    backgroundStory: 'Dalam 6 bulan terakhir, 15% engineer level senior mengundurkan diri ke perusahaan kompetitor. Hasil exit interview menunjukkan isu bukan hanya gaji, melainkan kejelasan jenjang karier dan burnout. Kamu diminta menyusun audit masalah orang (people analytics) dan solusi terintegrasi.',
    skillsValidated: ['People Analytics & Turnover Diagnosis', 'Succession Planning', 'Talent Retention Strategy', 'Executive Stakeholder Consultation'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Diagnosis Akar Masalah Turnover Karyawan (9-Box Grid Analysis)',
        duration: '25 Menit',
        scenario: 'Manajer Divisi mengusulkan menaikkan gaji semua orang sebesar 20% tanpa melihat evaluasi performa, namun anggaran HRBP terbatas.',
        instructions: [
          'Gunakan kerangka matriks 9-Box Grid (Performance vs Potential) untuk mengalokasikan anggaran retensi secara efektif.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Kelompok talenta mana yang wajib diprioritaskan untuk intervensi retensi dan succession planning?',
        options: [
          {
            label: 'A',
            text: 'Fokuskan paket retensi strategis (Retention Bonus & Fast-track Career Path) pada kuadran "High Performance - High Potential" (Star Talent) dan siapkan mentoring bagi calon suksesor peran kritikal.',
            isBest: true,
            feedback: 'Sangat tepat! Menaikkan gaji merata tidak menyelesaikan akar masalah, sedangkan memprioritaskan Star Talent melindungi kontinuitas proyek vital bisnis.'
          },
          {
            label: 'B',
            text: 'Memberikan seluruh bonus retensi kepada karyawan berkinerja rendah agar mereka termotivasi.',
            isBest: false,
            feedback: 'Salah sasaran dan akan menciptakan rasa ketidakadilan (demotivasi) bagi karyawan berprestasi tinggi.'
          },
          {
            label: 'C',
            text: 'Membiarkan karyawan kunci mengundurkan diri dan langsung merekrut fresh graduate pengganti.',
            isBest: false,
            feedback: 'Kehilangan institutional knowledge senior engineer menimbulkan biaya rekrutmen dan onboarding yang jauh lebih mahal.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Penyusunan Intervensi Retensi & Jalur Karier Dual-Ladder',
        duration: '35 Menit',
        scenario: 'Banyak technical specialist enggan dipromosikan ke jabatan struktural manajerial karena tidak ingin mengurus administrasi dan rapat seharian. Rancang jalur karier dual-track (Individual Contributor vs Management Path).',
        instructions: [
          'Rancang skema jenjang karier paralel (IC Track: Staff -> Principal -> Fellow vs Management Track: Lead -> Manager -> Director).',
          'Sertakan benefit non-finansial untuk meredakan burnout (misal flexible working arrangement, budget konferensi tahunan).'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Skema Jalur Karier Ganda (Dual-Ladder Career Track):\n1. Individual Contributor (IC) Path: Memberikan kompensasi dan pengakuan setara manajerial (Senior Engineer -> Staff Engineer setara Manager -> Principal Engineer setara GM) tanpa beban birokrasi people-management.\n2. Work-Life Balance & Wellness:\n- Kebijakan Core Working Hours (10.00 - 16.00) dan No-Meeting Friday Afternoon.\n- Tunjangan pengembangan diri Rp 10jt/tahun untuk sertifikasi industri global.\n3. Transparent Promotion Criteria: Rubrik penilaian kompetensi transparan yang dapat diakses seluruh karyawan.',
        hint: 'Jelaskan bagaimana jalur IC mempertahankan pakar teknis terbaik tanpa memaksakan peran manajerial.'
      },
      {
        id: 3,
        title: 'Task 3: Konsultasi dan Penyelarasan Strategi Bersama Kepala Divisi',
        duration: '20 Menit',
        scenario: 'Susun ringkasan rekomendasi 3 poin yang akan kamu sampaikan dalam rapat 1-on-1 dengan Division Head untuk menyepakati target retensi kuartal depan.',
        instructions: [
          'Tuliskan poin aksi konkret, penanggung jawab, dan metrik keberhasilan (Key Success Metric).'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Ringkasan Konsultasi Eksekutif HRBP:\n1. Peluncuran Dual-Ladder Career Framework paling lambat akhir bulan depan (PIC: HRBP & Tech Lead).\n2. Stay Interview terjadwal setiap 3 bulan untuk 25 karyawan Star Talent guna memantau aspirasi secara proaktif.\n3. Metrik Sukses: Penurunan turnover karyawan senior dari 15% menjadi di bawah 5% dalam 12 bulan ke depan, dengan Employee Engagement Index naik minimal 10 poin.',
        hint: 'Sebagai HRBP, tunjukkan pemahaman bisnis yang kuat dan solusi berorientasi dampak terukur.'
      }
    ]
  },

  'research-scientist': {
    careerTitle: 'Research & Development Scientist',
    careerSlug: 'research-scientist',
    companyName: 'Kalbe Farma R&D',
    companyLogoText: '🔬 Kalbe Innovation Center',
    companyColor: '#58A618',
    companyTagline: 'Inovasi Sains & Teknologi Terdepan untuk Kesehatan Indonesia',
    badgeLabel: 'Kalbe Research Fellow',
    simulationTitle: 'Simulasi Hari Pertama: Desain Metodologi Eksperimen & Validasi Signifikansi Data',
    estimatedHours: '2 Jam',
    difficulty: 'Advanced',
    summary: 'Sebagai Research Scientist di laboratorium R&D Kalbe, kamu merancang protokol uji laboratorium untuk memvalidasi stabilitas dan efektivitas formulasi bahan aktif baru.',
    backgroundStory: 'Tim riset menemukan kandidat formulasi suplemen herbal yang menjanjikan, namun diperlukan uji stabilitas dipercepat (accelerated stability testing) dan validasi statistik sebelum melangkah ke tahap uji klinis dan pengajuan paten.',
    skillsValidated: ['Experimental Design (DoE)', 'Statistical Hypothesis Testing', 'Regulatory Compliance & SOP', 'Scientific Data Interpretation'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Perumusan Hipotesis Nol dan Desain Kontrol Eksperimen',
        duration: '25 Menit',
        scenario: 'Kamu menguji apakah formulasi baru X memiliki laju degradasi senyawa aktif yang lebih lambat dibanding formulasi standar pada suhu 40°C dan kelembaban 75% RH selama 6 bulan.',
        instructions: [
          'Pilih perumusan hipotesis statistik dan desain eksperimen (Design of Experiments) yang valid secara ilmiah.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Desain eksperimen laboratorium mana yang memenuhi standar Good Laboratory Practice (GLP)?',
        options: [
          {
            label: 'A',
            text: 'Menyusun kelompok kontrol negatif (placebo), kontrol positif (standar industri), dan replikasi pengujian triplo (n=3) secara acak (Randomized Block Design) untuk mengontrol variasi instrumen.',
            isBest: true,
            feedback: 'Sempurna! Replikasi triplo dan adanya kontrol positif/negatif adalah fondasi validitas ilmiah untuk menghindari bias instrumen.'
          },
          {
            label: 'B',
            text: 'Hanya menguji 1 sampel formulasi baru tanpa pembanding kontrol untuk menghemat bahan reagen.',
            isBest: false,
            feedback: 'Hasil tidak akan dapat divalidasi karena tidak memiliki standar komparasi kontrol ilmiah.'
          },
          {
            label: 'C',
            text: 'Mengubah parameter suhu pengujian setiap hari secara acak tanpa pencatatan logbook.',
            isBest: false,
            feedback: 'Melanggar SOP GLP dan merusak validitas data stabilitas sediaan.'
          }
        ]
      },
      {
        id: 2,
        title: 'Task 2: Analisis Signifikansi Statistik (p-value, ANOVA) & Penarikan Kesimpulan',
        duration: '35 Menit',
        scenario: 'Data uji menunjukkan rata-rata sisa kandungan aktif formulasi baru adalah 94.2% (SD 0.8%) vs kontrol 88.1% (SD 1.1%). Nilai uji Two-Sample T-Test menghasilkan t = 7.82 dengan p-value = 0.0014 (alpha = 0.05).',
        instructions: [
          'Tafsirkan signifikansi statistik dari nilai p-value tersebut.',
          'Tuliskan kesimpulan ilmiah formal dalam 2 kalimat.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Interpretasi Statistik:\n1. Karena p-value (0.0014) jauh lebih kecil dari nilai signifikansi alpha (0.05), maka Hipotesis Nol (H0) ditolak secara meyakinkan.\n2. Kesimpulan Ilmiah: Terdapat perbedaan retensi senyawa aktif yang signifikan secara statistik antara formulasi baru X dengan kontrol standar. Formulasi baru terbukti secara meyakinkan mempertahankan stabilitas kimia yang lebih superior di bawah kondisi uji dipercepat.',
        hint: 'Jelaskan dasar penolakan hipotesis nol berdasarkan nilai p < 0.05.'
      },
      {
        id: 3,
        title: 'Task 3: Penyusunan Laporan Ringkasan Riset & Rekomendasi Hilirisasi Paten',
        duration: '20 Menit',
        scenario: 'Tuliskan ringkasan eksekutif 1 halaman untuk komite paten dan pimpinan divisi manufaktur.',
        instructions: [
          'Sertakan ringkasan temuan kunci, keunggulan kompetitif, dan rekomendasi langkah uji lanjutan.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Laporan Kajian Hilirisasi:\n- Temuan Kunci: Formulasi baru meningkatkan shelf-life produk dari perkiraan 12 bulan menjadi 24 bulan pada suhu ruang tropis.\n- Rekomendasi HKI: Daftarkan klaim paten formulasi komposisi bahan ke DJKI paling lambat kuartal ini sebelum publikasi jurnal ilmiah.\n- Langkah Lanjutan: Lanjutkan ke tahap pilot batch scale-up pada skala pabrik 100 liter dan uji bioavailabilitas in vivo.',
        hint: 'Pastikan perlindungan hak paten ditekankan sebelum hasil dipublikasikan ke publik.'
      }
    ]
  }
};

// Aliases dictionary mapping user slugs / variations to canonical simulations
export const SIMULATION_ALIASES: Record<string, string> = {
  // UX / Design
  'ux-designer': 'ui-ux-designer',
  'ui-ux-designer': 'ui-ux-designer',
  'ui-ux': 'ui-ux-designer',
  'product-designer': 'ui-ux-designer',

  // Content & Marketing
  'content-strategist': 'content-creator-social-media-specialist',
  'content-creator-social-media-specialist': 'content-creator-social-media-specialist',
  'digital-marketing-specialist': 'community-manager',
  'digital-marketing': 'community-manager',
  'social-media-specialist': 'content-creator-social-media-specialist',

  // Engineering & Tech
  'software-engineer': 'software-engineer-front-back-full-stack',
  'software-engineer-front-back-full-stack': 'software-engineer-front-back-full-stack',
  'devops-engineer-qa-automation-engineer': 'software-engineer-front-back-full-stack',
  'devops-engineer': 'software-engineer-front-back-full-stack',
  'frontend-engineer': 'software-engineer-front-back-full-stack',
  'backend-engineer': 'software-engineer-front-back-full-stack',

  // Data & AI
  'data-analyst': 'data-analyst-business-intelligence',
  'data-analyst-business-intelligence': 'data-analyst-business-intelligence',
  'ai-ml-engineer': 'ai-ml-engineer',
  'machine-learning-engineer': 'ai-ml-engineer',
  'data-scientist': 'data-scientist',
  'data-researcher-strategy-analyst': 'research-scientist',
  'research-scientist': 'research-scientist',

  // Business, Product & HR
  'startup-founder': 'startup-founder',
  'product-manager': 'product-manager',
  'community-manager': 'community-manager',
  'hr-business-partner': 'hr-business-partner',
  'business-development-account-executive': 'startup-founder',
  'business-development': 'startup-founder',
};

// Helper to get or fallback simulation for any career profile
export function getSimulationForCareer(careerTitle: string, careerSlug?: string): IndustrySimulation {
  // 1. Prioritize careerTitle matching (since careerTitle is what the user actually chose)
  if (careerTitle) {
    const titleSlug = careerTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (INDUSTRY_SIMULATIONS[titleSlug]) {
      return INDUSTRY_SIMULATIONS[titleSlug];
    }
    const titleAlias = SIMULATION_ALIASES[titleSlug];
    if (titleAlias && INDUSTRY_SIMULATIONS[titleAlias]) {
      return INDUSTRY_SIMULATIONS[titleAlias];
    }

    const lower = careerTitle.toLowerCase();
    if (lower.includes('software engineer') || lower.includes('full-stack') || lower.includes('developer') || lower.includes('programmer')) {
      return INDUSTRY_SIMULATIONS['software-engineer-front-back-full-stack'];
    }
    if (lower.includes('devops') || lower.includes('qa automation')) {
      return INDUSTRY_SIMULATIONS['software-engineer-front-back-full-stack'];
    }
    if (lower.includes('data analyst') || lower.includes('business intelligence')) {
      return INDUSTRY_SIMULATIONS['data-analyst-business-intelligence'];
    }
    if (lower.includes('ui/ux') || lower.includes('ux designer') || lower.includes('product designer')) {
      return INDUSTRY_SIMULATIONS['ui-ux-designer'];
    }
    if (lower.includes('content creator') || lower.includes('content strategist') || lower.includes('social media')) {
      return INDUSTRY_SIMULATIONS['content-creator-social-media-specialist'];
    }
    if (lower.includes('digital marketing') || lower.includes('community')) {
      return INDUSTRY_SIMULATIONS['community-manager'];
    }
    if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml engineer')) {
      return INDUSTRY_SIMULATIONS['ai-ml-engineer'];
    }
    if (lower.includes('data scientist')) {
      return INDUSTRY_SIMULATIONS['data-scientist'];
    }
    if (lower.includes('researcher') || lower.includes('scientist') || lower.includes('strategy analyst')) {
      return INDUSTRY_SIMULATIONS['research-scientist'];
    }
    if (lower.includes('business development') || lower.includes('account executive')) {
      return INDUSTRY_SIMULATIONS['hr-business-partner'];
    }
    if (lower.includes('startup') || lower.includes('founder')) {
      return INDUSTRY_SIMULATIONS['startup-founder'];
    }
    if (lower.includes('product manager')) {
      return INDUSTRY_SIMULATIONS['product-manager'];
    }
    if (lower.includes('hr') || lower.includes('human resources')) {
      return INDUSTRY_SIMULATIONS['hr-business-partner'];
    }
  }

  // 2. Direct slug match if provided
  if (careerSlug) {
    const rawSlug = careerSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (INDUSTRY_SIMULATIONS[rawSlug]) {
      return INDUSTRY_SIMULATIONS[rawSlug];
    }
    const aliasMatch = SIMULATION_ALIASES[rawSlug];
    if (aliasMatch && INDUSTRY_SIMULATIONS[aliasMatch]) {
      return INDUSTRY_SIMULATIONS[aliasMatch];
    }
  }

  // 3. Normalized slug from either
  const rawSlug = (careerSlug || careerTitle)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  // 4. Fuzzy title keyword search
  const lowerTitle = (careerTitle || '').toLowerCase();
  for (const [key, sim] of Object.entries(INDUSTRY_SIMULATIONS)) {
    if (
      lowerTitle.includes(sim.careerTitle.toLowerCase()) ||
      sim.careerTitle.toLowerCase().includes(lowerTitle) ||
      lowerTitle.includes(key.replace(/-/g, ' '))
    ) {
      return sim;
    }
  }

  // 5. Fallback template simulation
  return {
    careerTitle: careerTitle,
    careerSlug: rawSlug,
    companyName: 'Telkom Digital Ecosystem',
    companyLogoText: '🔴 Telkom Indonesia',
    companyColor: '#E60012',
    companyTagline: 'Membangun Kedaulatan Digital Indonesia',
    badgeLabel: 'Telkom Innovation Partner',
    simulationTitle: `Simulasi Hari Pertama: Studi Kasus Praktik Nyata Industri (${careerTitle})`,
    estimatedHours: '1.5 - 2 Jam',
    difficulty: 'Intermediate',
    summary: `Sebagai talenta profesional baru di divisi transformasi digital Telkom, kamu akan menyelesaikan studi kasus implementasi proyek ${careerTitle} secara terstruktur.`,
    backgroundStory: `Divisi Digital Platform Telkom sedang mempercepat digitalisasi layanan publik. Kamu bergabung sebagai tenaga ahli ${careerTitle} untuk menganalisis kebutuhan operasional, merancang solusi yang scalable, dan menyusun laporan pertanggungjawaban proyek.`,
    skillsValidated: ['Industry Problem Solving', 'Strategic Execution', 'Domain Competency', 'Professional Reporting'],
    tasks: [
      {
        id: 1,
        title: 'Task 1: Memahami Problem Statement & Batasan Proyek',
        duration: '25 Menit',
        scenario: `Klien memerlukan percepatan transformasi proses kerja untuk peran ${careerTitle} dengan target penyelesaian dalam 3 bulan dan kepatuhan standar industri yang ketat.`,
        instructions: [
          'Tentukan prioritas utama dari 3 opsi pendekatan yang tersedia.',
          'Pastikan solusi efisien dan minim risiko.'
        ],
        deliverableType: 'choice',
        sampleQuestion: 'Langkah awal apa yang paling krusial diambil pada minggu pertama proyek?',
        options: [
          {
            label: 'A',
            text: 'Melakukan stakeholder mapping, audit proses kerja saat ini, dan menyusun roadmap implementasi modular berbasis prioritas tinggi.',
            isBest: true,
            feedback: 'Sangat tepat! Audit dan pemetaan menyeluruh di awal mencegah pembengkakan biaya (scope creep) di kemudian hari.'
          },
          {
            label: 'B',
            text: 'Langsung membuat implementasi tanpa berdiskusi dengan pengguna akhir.',
            isBest: false,
            feedback: 'Kurang tepat karena berisiko menghasilkan produk yang tidak sesuai kebutuhan lapangan.'
          },
          {
            label: 'C',
            text: 'Menunggu arahan pasif tanpa inisiatif audit data.',
            isBest: false,
            feedback: 'Industri membutuhkan talenta yang proaktif dan memiliki ownership.'
          }
        ]
      },
      {
        id: 2,
        title: `Task 2: Eksekusi Solusi Praktis ${careerTitle}`,
        duration: '35 Menit',
        scenario: `Tuliskan rancangan solusi konkret untuk mengatasi kendala operasional terbesar yang dihadapi dalam peran ${careerTitle}.`,
        instructions: [
          'Jelaskan tools atau metodologi yang kamu gunakan.',
          'Tuliskan langkah-langkah implementasinya secara terstruktur.'
        ],
        deliverableType: 'text',
        placeholderAnswer: `Rancangan Solusi Praktis:\n1. Metodologi: Agile Framework\n2. Tools yang Digunakan: ...\n3. Langkah Implementasi:\n   - Tahap 1: ...\n   - Tahap 2: ...`,
        hint: 'Jelaskan dengan bahasa teknis yang jelas dan mudah dipahami.'
      },
      {
        id: 3,
        title: 'Task 3: Presentasi Hasil & Rekomendasi Lanjutan',
        duration: '20 Menit',
        scenario: 'Susun ringkasan eksekutif 1 paragraf untuk mempresentasikan hasil kerja kamu kepada Business Director.',
        instructions: [
          'Sertakan ringkasan hasil, manfaat bisnis nyata, dan langkah berikutnya.'
        ],
        deliverableType: 'text',
        placeholderAnswer: 'Ringkasan Eksekutif:\n"Proyek ini berhasil memetakan dan mengoptimalkan proses kerja dengan efisiensi waktu sebesar 30%. Langkah selanjutnya adalah mengintegrasikan sistem ke seluruh divisi..."',
        hint: 'Fokuskan pada dampak bisnis (business value) yang dihasilkan.'
      }
    ]
  };
}
