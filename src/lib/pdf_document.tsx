import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ComprehensiveReportData } from './report_generator';

// McKinsey / BCG inspired subtle executive palette
const colors = {
  primary: '#1a1a2e',      // Dark executive navy
  secondary: '#2d4a8a',    // Deep classic blue
  accent: '#0e7490',       // Teal / Slate accent
  textDark: '#1e293b',     // Slate 800
  textMuted: '#64748b',    // Slate 500
  textLight: '#94a3b8',    // Slate 400
  border: '#cbd5e1',       // Slate 300
  borderLight: '#e2e8f0',  // Slate 200
  bgLight: '#f8fafc',      // Slate 50
  badgeRedBg: '#ffe4e6',
  badgeRedText: '#9f1239',
  badgeAmberBg: '#fef3c7',
  badgeAmberText: '#92400e',
  badgeGreenBg: '#dcfce7',
  badgeGreenText: '#166534',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.textDark,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerOrg: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerMeta: {
    fontSize: 8,
    color: colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.textLight,
  },
  sectionBadge: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Times-Bold', // Serif for executive feel
    color: colors.primary,
    marginBottom: 4,
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: colors.secondary,
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
  },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  tdText: {
    fontSize: 8,
    color: colors.textDark,
  },
});

interface PdfDocumentProps {
  report: ComprehensiveReportData;
}

export function PdfDocument({ report }: PdfDocumentProps) {
  const Header = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerOrg}>GAPLESS ADVISORY • LAPORAN KESIAPAN KARIER</Text>
      <Text style={styles.headerMeta}>{report.reportNumber} • {report.generatedAt}</Text>
    </View>
  );

  const Footer = ({ page }: { page: number }) => (
    <View style={styles.footerRow}>
      <Text style={styles.footerText}>Rahasia & Eksklusif untuk {report.userName}</Text>
      <Text style={styles.footerText}>Halaman {page} dari 9</Text>
    </View>
  );

  return (
    <Document title={`Gapless-Laporan-${report.careerSlug}-${report.reportNumber}`}>

      {/* ── HALAMAN 1: COVER ── */}
      <Page size="A4" style={[styles.page, { paddingVertical: 60, paddingHorizontal: 50 }]}>
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: colors.secondary, letterSpacing: 2, marginBottom: 4 }}>
            GAPLESS ADVISORY
          </Text>
          <Text style={{ fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
            Career Readiness & Competency Advisory
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 'auto', paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 24, fontFamily: 'Times-Bold', color: colors.primary, textAlign: 'center', marginBottom: 6 }}>
            Laporan Analisis Kesiapan Karier
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 20 }}>
            Penilaian Komprehensif Kompetensi Industri & Rencana Pengembangan Terarah
          </Text>

          <View style={{ width: 40, height: 2, backgroundColor: colors.secondary, marginBottom: 25 }} />

          <Text style={{ fontSize: 8.5, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Disusun Khusus Untuk
          </Text>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.primary, textAlign: 'center', marginBottom: 4 }}>
            {report.userName}
          </Text>
          {report.userEmail ? (
            <Text style={{ fontSize: 8.5, color: colors.textMuted, marginBottom: 16 }}>
              {report.userEmail}
            </Text>
          ) : null}

          <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight }}>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: colors.secondary }}>
              Target Peran: {report.targetRole}
            </Text>
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View>
              <Text style={{ fontSize: 7.5, color: colors.textLight, textTransform: 'uppercase' }}>Nomor Registrasi Laporan</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.primary }}>{report.reportNumber}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 7.5, color: colors.textLight, textTransform: 'uppercase' }}>Tanggal Diterbitkan</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.primary }}>{report.generatedAt}</Text>
            </View>
          </View>

          <Text style={{ fontSize: 7, color: colors.textLight, textAlign: 'justify', lineHeight: 1.3 }}>
            Disclaimer: Laporan ini di-generate berdasarkan asesmen mandiri terstruktur dan tolok ukur standar data O*NET (Occupational Information Network, U.S. Department of Labor). Hasil merupakan estimasi awal kesiapan kompetensi industri untuk kebutuhan edukasi karier terarah, bukan hasil psikotes klinis terstandar.
          </Text>
        </View>
      </Page>

      {/* ── HALAMAN 2: RINGKASAN EKSEKUTIF ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 1</Text>
          <Text style={styles.sectionTitle}>Ringkasan Eksekutif</Text>
          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 12 }}>
            {/* Kolom Kiri */}
            <View style={[styles.card, { flex: 1, alignItems: 'center', paddingVertical: 14 }]}>
              <Text style={{ fontSize: 8.5, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>
                Skor Kesiapan Karier
              </Text>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: colors.secondary, marginBottom: 4 }}>
                {report.readinessScore}%
              </Text>
              <View style={{ backgroundColor: report.readinessScore >= 80 ? colors.badgeGreenBg : report.readinessScore >= 60 ? colors.badgeAmberBg : colors.badgeRedBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 12 }}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: report.readinessScore >= 80 ? colors.badgeGreenText : report.readinessScore >= 60 ? colors.badgeAmberText : colors.badgeRedText }}>
                  {report.overallStatus}
                </Text>
              </View>

              <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 8 }}>
                <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 2 }}>
                  Archetype: <Text style={{ fontFamily: 'Helvetica-Bold', color: colors.primary }}>{report.dominantTrait}</Text>
                </Text>
                <Text style={{ fontSize: 8, color: colors.textMuted }}>
                  Target Role: <Text style={{ fontFamily: 'Helvetica-Bold', color: colors.primary }}>{report.targetRole}</Text>
                </Text>
              </View>
            </View>

            {/* Kolom Kanan */}
            <View style={{ flex: 1.3, gap: 10 }}>
              <View style={[styles.card, { marginBottom: 0 }]}>
                <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 6 }}>
                  Temuan Kunci Asesmen:
                </Text>
                <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 4 }}>
                  • <Text style={{ fontFamily: 'Helvetica-Bold' }}>Kekuatan Utama:</Text> {report.keyStrengths.join(', ') || 'Fondasi kerja yang baik.'}
                </Text>
                <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 4 }}>
                  • <Text style={{ fontFamily: 'Helvetica-Bold' }}>Gap Prioritas:</Text> {report.priorityGaps.join(', ') || 'Semua skill telah memenuhi standar.'}
                </Text>
                <Text style={{ fontSize: 8, color: colors.textDark }}>
                  • <Text style={{ fontFamily: 'Helvetica-Bold' }}>Rekomendasi Pertama:</Text> {report.firstActionRecommendation}
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.primary, marginBottom: 0 }]}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#93c5fd', marginBottom: 2 }}>
                  Estimasi Total Waktu Belajar
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 2 }}>
                  {report.totalEstHoursMin} – {report.totalEstHoursMax} Jam
                </Text>
                <Text style={{ fontSize: 7.5, color: '#cbd5e1', lineHeight: 1.3 }}>
                  Dapat diselesaikan dalam kurun {report.totalEstWeeksMin} – {report.totalEstWeeksMax} minggu dengan alokasi 5 jam/minggu (modul terstruktur dan studi kasus terapan).
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Footer page={2} />
      </Page>

      {/* ── HALAMAN 3: ANALISIS SKILL GAP DETAIL ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 2</Text>
          <Text style={styles.sectionTitle}>Analisis Kesenjangan Kompetensi</Text>
          <View style={styles.divider} />

          {/* Tabel Skill Gap */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, { flex: 2 }]}>Kompetensi (Skill)</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Level Kamu</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Level Target</Text>
              <Text style={[styles.thText, { flex: 0.8, textAlign: 'center' }]}>Gap</Text>
              <Text style={[styles.thText, { flex: 1.2, textAlign: 'center' }]}>Prioritas</Text>
              <Text style={[styles.thText, { flex: 1.3, textAlign: 'right' }]}>Est. Durasi</Text>
            </View>

            {report.skillGapTable.map((item, idx) => (
              <View key={item.name} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tdText, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{item.name}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>Lvl {item.current}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>Lvl {item.required}</Text>
                <Text style={[styles.tdText, { flex: 0.8, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: item.gap < 0 ? '#b91c1c' : '#15803d' }]}>
                  {item.gap > 0 ? `+${item.gap}` : item.gap}
                </Text>
                <Text style={[styles.tdText, { flex: 1.2, textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                  {item.priority === 'Kritis' ? '🔴 Kritis' : item.priority === 'Penting' ? '🟡 Penting' : '🟢 Sesuai'}
                </Text>
                <Text style={[styles.tdText, { flex: 1.3, textAlign: 'right', color: colors.textMuted }]}>
                  {item.hoursMin > 0 ? `${item.weeksMin}–${item.weeksMax} minggu` : 'Tercapai'}
                </Text>
              </View>
            ))}
          </View>

          {/* Penjelasan Ringkas Kritis & Penting */}
          <View style={[styles.card, { marginTop: 4 }]}>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4 }}>
              Keterangan Penilaian Prioritas:
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, marginBottom: 2 }}>
              • 🔴 <Text style={{ fontFamily: 'Helvetica-Bold' }}>Kritis:</Text> Memiliki selisih gap ≥ 2 level atau skill dengan bobot esensial tinggi di industri.
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, marginBottom: 2 }}>
              • 🟡 <Text style={{ fontFamily: 'Helvetica-Bold' }}>Penting:</Text> Selisih gap 1 level pada target menengah yang perlu ditingkatkan untuk efisiensi kerja.
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted }}>
              • 🟢 <Text style={{ fontFamily: 'Helvetica-Bold' }}>Sesuai:</Text> Telah memenuhi standar minimum yang dipersyaratkan peran entry-level.
            </Text>
          </View>
        </View>

        <Footer page={3} />
      </Page>

      {/* ── HALAMAN 4: INTERPRETASI MENDALAM PER SKILL ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 3</Text>
          <Text style={styles.sectionTitle}>Interpretasi Mendalam Per Skill</Text>
          <View style={styles.divider} />

          {report.skillInterpretations.map((item) => (
            <View key={item.skillName} style={[styles.card, { marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.primary }}>{item.skillName}</Text>
                <Text style={{ fontSize: 8, color: colors.secondary, fontFamily: 'Helvetica-Bold' }}>
                  Level {item.currentLevel} dari Target Level {item.targetLevel}
                </Text>
              </View>

              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#15803d', marginTop: 2 }}>
                ✓ Di Level {item.currentLevel} Sudah Mampu:
              </Text>
              {item.canDo.map((c, i) => (
                <Text key={i} style={{ fontSize: 7.5, color: colors.textDark, marginLeft: 6 }}>• {c}</Text>
              ))}

              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#b91c1c', marginTop: 4 }}>
                ✗ Yang Belum Dikuasai (Kebutuhan Level {item.targetLevel}):
              </Text>
              {item.cannotDo.map((c, i) => (
                <Text key={i} style={{ fontSize: 7.5, color: colors.textDark, marginLeft: 6 }}>• {c}</Text>
              ))}

              <View style={{ backgroundColor: '#f1f5f9', padding: 4, borderRadius: 3, marginTop: 4 }}>
                <Text style={{ fontSize: 7.5, color: colors.textDark }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Contoh Tugas di Industri:</Text> {item.industryExample}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Footer page={4} />
      </Page>

      {/* ── HALAMAN 5: URUTAN PRIORITAS DENGAN ALASAN ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 4</Text>
          <Text style={styles.sectionTitle}>Urutan Prioritas Pengembangan</Text>
          <View style={styles.divider} />

          <Text style={{ fontSize: 8.5, color: colors.textMuted, marginBottom: 8 }}>
            Urutan kompetensi yang sebaiknya dituntaskan pertama berdasarkan urgensi peran {report.targetRole}:
          </Text>

          {report.priorityList.map((item) => (
            <View key={item.rank} style={[styles.card, { paddingVertical: 6, marginBottom: 6 }]}>
              <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: colors.primary }}>
                {item.rank}. {item.skillName}
              </Text>
              <Text style={{ fontSize: 8, color: colors.textDark, marginTop: 2 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Kenapa Pertama:</Text> {item.reason}
              </Text>
              <Text style={{ fontSize: 8, color: '#b91c1c', marginTop: 2 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Dampak Jika Tidak Ditutup:</Text> {item.consequenceIfNotClosed}
              </Text>
            </View>
          ))}

          {/* Matriks 2x2 */}
          <View style={[styles.card, { marginTop: 6 }]}>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 6 }}>
              Matriks Prioritas Keputusan Belajar
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={{ flex: 1, backgroundColor: '#fff1f2', padding: 6, borderRadius: 4 }}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9f1239' }}>Prioritas 1: Kritis</Text>
                <Text style={{ fontSize: 7, color: '#4c0519', marginTop: 2 }}>Gap besar pada fungsi vital. Wajib diselesaikan pada 30 hari pertama.</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#fef3c7', padding: 6, borderRadius: 4 }}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400e' }}>Prioritas 2: Quick Win</Text>
                <Text style={{ fontSize: 7, color: '#78350f', marginTop: 2 }}>Gap kecil pada skill berdampak tinggi. Peningkatannya cepat teramati.</Text>
              </View>
            </View>
          </View>
        </View>

        <Footer page={5} />
      </Page>

      {/* ── HALAMAN 6: ESTIMASI WAKTU BELAJAR ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 5</Text>
          <Text style={styles.sectionTitle}>Estimasi Waktu Belajar</Text>
          <View style={styles.divider} />

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, { flex: 2 }]}>Skill</Text>
              <Text style={[styles.thText, { flex: 0.8, textAlign: 'center' }]}>Gap</Text>
              <Text style={[styles.thText, { flex: 1.2, textAlign: 'center' }]}>Jam / Minggu</Text>
              <Text style={[styles.thText, { flex: 1.2, textAlign: 'center' }]}>Total Jam</Text>
              <Text style={[styles.thText, { flex: 1.3, textAlign: 'right' }]}>Estimasi Selesai</Text>
            </View>

            {report.skillGapTable.map((item, idx) => (
              <View key={item.name} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tdText, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{item.name}</Text>
                <Text style={[styles.tdText, { flex: 0.8, textAlign: 'center', color: '#b91c1c' }]}>
                  {item.gap < 0 ? item.gap : '0'}
                </Text>
                <Text style={[styles.tdText, { flex: 1.2, textAlign: 'center' }]}>5 jam/mggu</Text>
                <Text style={[styles.tdText, { flex: 1.2, textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                  {item.hoursMin > 0 ? `${item.hoursMin}–${item.hoursMax} jam` : '—'}
                </Text>
                <Text style={[styles.tdText, { flex: 1.3, textAlign: 'right' }]}>
                  {item.weeksMin > 0 ? `${item.weeksMin}–${item.weeksMax} minggu` : 'Tercapai'}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, { paddingVertical: 8 }]}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 2 }}>
              Asumsi Metodologi Belajar:
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, lineHeight: 1.3 }}>
              Estimasi berdasarkan pembelajaran terstruktur 5 jam/minggu, kombinasi 40% teori dan 60% praktik langsung studi kasus. Waktu aktual dapat berbeda tergantung intensitas belajar dan latar belakang awal.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={{ fontSize: 8, color: '#93c5fd', textTransform: 'uppercase' }}>Total Waktu Menuju Kesiapan Dasar</Text>
              <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff' }}>
                {report.totalEstHoursMin} – {report.totalEstHoursMax} Jam
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#ffffff' }}>
              ~{report.totalEstWeeksMin} – {report.totalEstWeeksMax} Minggu
            </Text>
          </View>
        </View>

        <Footer page={6} />
      </Page>

      {/* ── HALAMAN 7: RENCANA BELAJAR 30/60/90 HARI ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 6</Text>
          <Text style={styles.sectionTitle}>Rencana Belajar 30 / 60 / 90 Hari</Text>
          <View style={styles.divider} />

          {/* 30 Hari */}
          <View style={[styles.card, { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }]}>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1e3a8a' }}>
              30 HARI PERTAMA — {report.actionPlan.day30.phaseTitle}
            </Text>
            <Text style={{ fontSize: 7.5, color: '#3b82f6', marginBottom: 4 }}>
              Fokus: {report.actionPlan.day30.focusSkills.join(', ')}
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 2 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Minggu 1–2:</Text> {report.actionPlan.day30.weeksFirstHalf}
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 3 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Minggu 3–4:</Text> {report.actionPlan.day30.weeksSecondHalf}
            </Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1e40af' }}>
              Milestone: {report.actionPlan.day30.milestone}
            </Text>
          </View>

          {/* 60 Hari */}
          <View style={[styles.card, { borderColor: '#c7d2fe', backgroundColor: '#eef2ff' }]}>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#312e81' }}>
              60 HARI — {report.actionPlan.day60.phaseTitle}
            </Text>
            <Text style={{ fontSize: 7.5, color: '#6366f1', marginBottom: 4 }}>
              Fokus: {report.actionPlan.day60.focusSkills.join(', ')}
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 2 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Minggu 5–6:</Text> {report.actionPlan.day60.weeksFirstHalf}
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 3 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Minggu 7–8:</Text> {report.actionPlan.day60.weeksSecondHalf}
            </Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#3730a3' }}>
              Milestone: {report.actionPlan.day60.milestone}
            </Text>
          </View>

          {/* 90 Hari */}
          <View style={[styles.card, { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#14532d' }}>
              90 HARI — {report.actionPlan.day90.phaseTitle}
            </Text>
            <Text style={{ fontSize: 7.5, color: '#16a34a', marginBottom: 4 }}>
              Fokus: {report.actionPlan.day90.focusSkills.join(', ')}
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 2 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Minggu 9–10:</Text> {report.actionPlan.day90.weeksFirstHalf}
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, marginBottom: 3 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Minggu 11–12:</Text> {report.actionPlan.day90.weeksSecondHalf}
            </Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#166534' }}>
              Milestone: {report.actionPlan.day90.milestone}
            </Text>
          </View>
        </View>

        <Footer page={7} />
      </Page>

      {/* ── HALAMAN 8: REKOMENDASI SUMBER BELAJAR ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 7</Text>
          <Text style={styles.sectionTitle}>Rekomendasi Sumber Belajar Terkurasi</Text>
          <View style={styles.divider} />

          {Object.entries(report.skillResources).map(([skill, resources]) => (
            <View key={skill} style={[styles.card, { marginBottom: 6, paddingVertical: 6 }]}>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4 }}>
                {skill}
              </Text>

              {resources.length > 0 ? (
                resources.map((res, i) => (
                  <View key={i} style={{ marginBottom: 3 }}>
                    <Text style={{ fontSize: 8, color: colors.textDark }}>
                      • <Text style={{ fontFamily: 'Helvetica-Bold' }}>{res.title}</Text> ({res.provider} — {res.isFree ? 'Gratis' : 'Berbayar'})
                    </Text>
                    <Text style={{ fontSize: 7, color: colors.secondary, marginLeft: 8 }}>
                      {res.url}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 7.5, color: colors.textMuted, fontStyle: 'italic' }}>
                  Akses modul kurikulum terpandu pada Learning Roadmap Gapless.
                </Text>
              )}
            </View>
          ))}

          <Text style={{ fontSize: 7.5, color: colors.textMuted, fontStyle: 'italic', marginTop: 6 }}>
            Catatan: Sumber belajar diperbarui berkala. Akses platform Gapless di gapless.id/roadmap untuk modul interaktif.
          </Text>
        </View>

        <Footer page={8} />
      </Page>

      {/* ── HALAMAN 9: PENUTUP & METODOLOGI ── */}
      <Page size="A4" style={styles.page}>
        <View>
          <Header />
          <Text style={styles.sectionBadge}>Bagian 8</Text>
          <Text style={styles.sectionTitle}>Penutup & Metodologi</Text>
          <View style={styles.divider} />

          <View style={[styles.card, { marginBottom: 10 }]}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4 }}>
              Ringkasan Kesimpulan
            </Text>
            <Text style={{ fontSize: 8, color: colors.textDark, textAlign: 'justify', lineHeight: 1.3 }}>
              Berdasarkan asesmen menyeluruh ini, fokus utama pengembangan karier kamu sebagai {report.targetRole} adalah penutupan kesenjangan skill teknis prioritas melalui pembelajaran terstruktur dan portofolio berbasis proyek nyata.
            </Text>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.secondary, marginTop: 6 }}>
              Lanjutkan perjalanan kariermu di: gapless.id/roadmap
            </Text>
          </View>

          <View style={[styles.card, { marginBottom: 12 }]}>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4 }}>
              Metodologi Asesmen Lengkap
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, textAlign: 'justify', lineHeight: 1.35, marginBottom: 3 }}>
              Laporan ini disusun berdasarkan: (1) jawaban asesmen mandiri terstruktur yang diisi pengguna, (2) data tolok ukur O*NET (Occupational Information Network) dari U.S. Department of Labor sebagai referensi taksonomi kompetensi standar industri, dan (3) analisis inferensi kecerdasan buatan terlatih.
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, textAlign: 'justify', lineHeight: 1.35 }}>
              Laporan ini merupakan instrumen akselerasi edukatif dan bukan pengganti psikotes klinis atau sertifikasi profesi formal. Data O*NET berbasis pasar kerja global; penyesuaian bobot industri lokal Indonesia diterapkan melalui kurasi kurikulum Gapless.
            </Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 10 }}>
            <Text style={{ fontSize: 8, color: colors.textDark }}>Nomor Laporan: {report.reportNumber}</Text>
            <Text style={{ fontSize: 8, color: colors.textDark }}>Diterbitkan: {report.generatedAt}</Text>
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 7.5, color: colors.textLight, textAlign: 'center', marginBottom: 4 }}>
            © {new Date().getFullYear()} Gapless. Laporan ini dibuat khusus untuk {report.userName} dan tidak untuk disebarluaskan.
          </Text>
          <Footer page={9} />
        </View>
      </Page>

    </Document>
  );
}
