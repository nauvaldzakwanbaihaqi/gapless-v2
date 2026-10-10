export interface MissionProgressItem {
  progress: {
    id: string;
    missionId: string;
    status: string;
    submissionUrl?: string | null;
    notes?: string | null;
    evidenceType?: string;
    completedAt?: Date | string | null;
  };
  mission: {
    id: string;
    title: string;
    competency: string;
    difficultyLevel?: string | null;
    difficulty?: string;
  };
}

export interface ActivityEvidenceItem {
  evidence: {
    id: string;
    activityId: string;
    evidenceUrl: string;
    status: string;
    confirmedAt: Date | string | null;
  };
  activity: {
    id: string;
    title: string;
    type: string;
  };
}

export interface SnapshotItem {
  id: string;
  snapshotDate: string;
  hardSkillScore: number | null;
  softSkillScore: number | null;
}

export interface PublicProfile {
  id: string;
  publicToken: string;
  enabled: boolean;
}

export interface AssessmentInfo {
  id: string;
  quizType: string;
  careerSlug: string | null;
  careerTitle: string;
  dominantTrait?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CertificateData {
  id: string;
  judul: string;
  penyelenggara: string;
  tanggalTerbit: string;
  kategoriSkill: string | null;
  sumber?: string;
  catatanTambahan?: string | null;
  fileMimeType: string;
  fileSize: number;
  status: string;
  adminNote: string | null;
  readinessBoostApplied: number;
  aiAnalysis?: any;
  aiSuggestedBoost?: number | null;
  source: string;
  createdAt: string | Date;
}

export interface PassportProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  targetRole: string;
  assessments?: AssessmentInfo[];
  hardSkillScore: number;
  softSkillScore: number;
  completedMissions: MissionProgressItem[];
  userActivities: ActivityEvidenceItem[];
  certificates?: CertificateData[];
  snapshots: SnapshotItem[];
  publicProfile: PublicProfile | null;
  isPro: boolean;
}

export interface CompetencyItem {
  id: string;
  name: string;
  base: number;
  desc: string;
}

export const COMPETENCIES: CompetencyItem[] = [
  { id: 'komunikasi', name: 'Komunikasi & Negosiasi', base: 75, desc: 'Kemampuan menyampaikan ide, persuasi, dan mendengar aktif.' },
  { id: 'kerjasama', name: 'Kerjasama & Kolaborasi', base: 82, desc: 'Bekerja efektif dalam tim lintas fungsi dan resolusi konflik.' },
  { id: 'integritas', name: 'Integritas & Etika Kerja', base: 90, desc: 'Konsistensi moral, kejujuran data, dan komitmen profesional.' },
  { id: 'keandalan', name: 'Keandalan & Tanggung Jawab', base: 80, desc: 'Ketepatan deadline dan kepemilikan hasil kerja.' },
  { id: 'adaptabilitas', name: 'Adaptabilitas & Ketahanan', base: 72, desc: 'Kelincahan belajar hal baru dan merespons perubahan situasi.' },
];
