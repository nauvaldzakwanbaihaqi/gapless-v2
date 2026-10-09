import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  primaryKey,
  jsonb,
  boolean,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";
import { relations, eq } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

// ──────────────────────────────────────────────
// NEXTAUTH & USER TABLES (Autentikasi & Tier)
// ──────────────────────────────────────────────

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password"), // Untuk credentials login
  image: text("image"),
  tier: text("tier").default("FREE").notNull(), // Penanda FREE atau PREMIUM
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ──────────────────────────────────────────────
// GAPLESS APP TABLES (Assessment & Questions)
// ──────────────────────────────────────────────

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  dimension: text("dimension").notNull(),
});

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  text: text("text").notNull(),
  mappedArchetype: text("mapped_archetype").notNull(),
});

export const questionsRelations = relations(questions, ({ many }) => ({
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

// ──────────────────────────────────────────────
// GAPLESS JOB ROLES TABLES (Data PDF Nopal)
// ──────────────────────────────────────────────

export const jobRoles = pgTable("job_roles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dimension: text("dimension").notNull(), // cth: "The Creator", "The Builder"
  roleName: text("role_name").notNull(), // cth: "UI/UX Designer"
  salaryRange: text("salary_range"), // cth: "Rp 5.000.000 - Rp 9.000.000/bulan"
  companies: text("companies").array(), // cth: ["PT Sigma Global Teknologi", "PT Ciputra Development"]
  hardSkills: text("hard_skills").array(), // cth: ["Figma", "Prototyping", "HTML/CSS"]
  softSkills: text("soft_skills").array(), // cth: ["Pemecahan Masalah", "Empati Pengguna"]
});

// ──────────────────────────────────────────────
// ASSESSMENT & ROADMAP PROGRESS
// ──────────────────────────────────────────────

import { sql } from "drizzle-orm";

export const assessmentResults = pgTable("assessment_results", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Nullable for guest
  quizType: text("quiz_type").default("belum_tahu_minat").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  careerSlug: text("career_slug"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  rawAnswers: jsonb("raw_answers").notNull(), // Record<number, number>
  traitScores: jsonb("trait_scores").notNull(), // Record<Trait, number>
  dominantTrait: text("dominant_trait").notNull(),
  selectedCareer: text("selected_career"), // Optional initially until user picks one
  skillRatings: jsonb("skill_ratings"), // Record<string, number>
}, (t) => ({
  activeQuizUnique: uniqueIndex("active_quiz_unique")
    .on(t.userId, t.quizType)
    .where(sql`${t.isActive} = true`),
}));

export const roadmapProgress = pgTable("roadmap_progress", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  careerSlug: text("career_slug").notNull(),
  moduleStatuses: jsonb("module_statuses").notNull().default({}), // For future manual tracking
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userCareerUnique: uniqueIndex("user_career_unique")
    .on(t.userId, t.careerSlug),
}));

export const assessmentResultsRelations = relations(
  assessmentResults,
  ({ one }) => ({
    user: one(users, {
      fields: [assessmentResults.userId],
      references: [users.id],
    }),
  })
);

export const roadmapProgressRelations = relations(
  roadmapProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [roadmapProgress.userId],
      references: [users.id],
    }),
  })
);

export const aiRoadmaps = pgTable("ai_roadmaps", {
  careerSlug: text("career_slug").primaryKey(),
  careerName: text("career_name").notNull(),
  roadmapData: jsonb("roadmap_data").notNull(),
  onetData: jsonb("onet_data"), // To cache O*NET data if needed later
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const aiModuleInsights = pgTable("ai_module_insights", {
  moduleSlug: text("module_slug").notNull(),
  careerSlug: text("career_slug").notNull(),
  insightData: jsonb("insight_data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  compoundKey: primaryKey({ columns: [t.moduleSlug, t.careerSlug] }),
}));

// ──────────────────────────────────────────────
// O*NET LOCAL DATABASE (Reference Layer)
// ──────────────────────────────────────────────

export const onetOccupations = pgTable("onet_occupations", {
  onetsocCode: text("onetsoc_code").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
});

export const onetSkills = pgTable("onet_skills", {
  id: serial("id").primaryKey(),
  onetsocCode: text("onetsoc_code").references(() => onetOccupations.onetsocCode, { onDelete: "cascade" }).notNull(),
  elementName: text("element_name").notNull(),
});

export const onetTasks = pgTable("onet_tasks", {
  id: serial("id").primaryKey(),
  onetsocCode: text("onetsoc_code").references(() => onetOccupations.onetsocCode, { onDelete: "cascade" }).notNull(),
  task: text("task").notNull(),
});

export const onetKnowledge = pgTable("onet_knowledge", {
  id: serial("id").primaryKey(),
  onetsocCode: text("onetsoc_code").references(() => onetOccupations.onetsocCode, { onDelete: "cascade" }).notNull(),
  elementName: text("element_name").notNull(),
});

export const onetTools = pgTable("onet_tools", {
  id: serial("id").primaryKey(),
  onetsocCode: text("onetsoc_code").references(() => onetOccupations.onetsocCode, { onDelete: "cascade" }).notNull(),
  example: text("example").notNull(),
});

export const onetOccupationsRelations = relations(onetOccupations, ({ many }) => ({
  skills: many(onetSkills),
  tasks: many(onetTasks),
  knowledge: many(onetKnowledge),
  tools: many(onetTools),
}));

export const onetSkillsRelations = relations(onetSkills, ({ one }) => ({
  occupation: one(onetOccupations, {
    fields: [onetSkills.onetsocCode],
    references: [onetOccupations.onetsocCode],
  }),
}));

export const onetTasksRelations = relations(onetTasks, ({ one }) => ({
  occupation: one(onetOccupations, {
    fields: [onetTasks.onetsocCode],
    references: [onetOccupations.onetsocCode],
  }),
}));

export const onetKnowledgeRelations = relations(onetKnowledge, ({ one }) => ({
  occupation: one(onetOccupations, {
    fields: [onetKnowledge.onetsocCode],
    references: [onetOccupations.onetsocCode],
  }),
}));

export const onetToolsRelations = relations(onetTools, ({ one }) => ({
  occupation: one(onetOccupations, {
    fields: [onetTools.onetsocCode],
    references: [onetOccupations.onetsocCode],
  }),
}));
// ──────────────────────────────────────────────
// SOFT SKILL BASELINES (Asesmen Likert Awal)
// ──────────────────────────────────────────────

export const softSkillBaselines = pgTable("soft_skill_baselines", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  competency: text("competency").notNull(), // "Cooperation"|"Integrity"|"Dependability"|"Adaptability"|"Communication"
  score: integer("score").notNull(),       // 0-100
  source: text("source").notNull().default("self-report"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userCompetencyUnique: uniqueIndex("soft_skill_baselines_user_competency")
    .on(t.userId, t.competency),
}));

export const softSkillBaselinesRelations = relations(softSkillBaselines, ({ one }) => ({
  user: one(users, { fields: [softSkillBaselines.userId], references: [users.id] }),
}));

// ──────────────────────────────────────────────
// KATALOG MISI SOFT SKILL
// ──────────────────────────────────────────────

export const softSkillMissions = pgTable("soft_skill_missions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  competency: text("competency").notNull(),
  description: text("description"),
  estimatedMinutes: integer("estimated_minutes").default(30),
  difficultyLevel: text("difficulty_level").default("medium"),
  difficultyOrder: integer("difficulty_order").default(1),
  isSample: boolean("is_sample").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// PROGRESS MISI USER (idempotent via UNIQUE)
// ──────────────────────────────────────────────

export const userMissionProgress = pgTable("user_mission_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: text("mission_id").notNull().references(() => softSkillMissions.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("not_started"), // "not_started"|"submitted"|"completed"
  submissionText: text("submission_text"),
  submissionUrl: text("submission_url"),
  notes: text("notes"),
  evidenceType: text("evidence_type").notNull().default("self-report"),
  score: integer("score"),
  completedAt: timestamp("completed_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userMissionUnique: uniqueIndex("user_mission_unique").on(t.userId, t.missionId),
}));

export const userMissionProgressRelations = relations(userMissionProgress, ({ one }) => ({
  user: one(users, { fields: [userMissionProgress.userId], references: [users.id] }),
  mission: one(softSkillMissions, { fields: [userMissionProgress.missionId], references: [softSkillMissions.id] }),
}));

export const softSkillMissionsRelations = relations(softSkillMissions, ({ many }) => ({
  progress: many(userMissionProgress),
}));

// ──────────────────────────────────────────────
// KATALOG KEGIATAN
// ──────────────────────────────────────────────

export const activities = pgTable("activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  type: text("type").notNull(),              // "organisasi"|"lomba"|"volunteer"
  description: text("description"),
  competencyTags: text("competency_tags").array().default([]),
  skillTags: text("skill_tags").array().default([]),
  deadline: timestamp("deadline", { mode: "date" }),
  registrationUrl: text("registration_url"),
  matchPercent: integer("match_percent").default(0),
  isSample: boolean("is_sample").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  organizerContactServer: text("organizer_contact_server"), // server-only, tidak dikirim ke client
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// KEGIATAN DISIMPAN USER
// ──────────────────────────────────────────────

export const savedActivities = pgTable("saved_activities", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityId: text("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.activityId] }),
}));

export const savedActivitiesRelations = relations(savedActivities, ({ one }) => ({
  user: one(users, { fields: [savedActivities.userId], references: [users.id] }),
  activity: one(activities, { fields: [savedActivities.activityId], references: [activities.id] }),
}));

// ──────────────────────────────────────────────
// BUKTI & KONFIRMASI KEGIATAN
// ──────────────────────────────────────────────

export const activityEvidence = pgTable("activity_evidence", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityId: text("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  evidenceUrl: text("evidence_url").notNull(),
  status: text("status").notNull().default("pending"), // "pending"|"confirmed"|"rejected"
  confirmationTokenHash: text("confirmation_token_hash"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
  confirmedAt: timestamp("confirmed_at", { mode: "date" }),
  isSampleConfirmation: boolean("is_sample_confirmation").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const activityEvidenceRelations = relations(activityEvidence, ({ one }) => ({
  user: one(users, { fields: [activityEvidence.userId], references: [users.id] }),
  activity: one(activities, { fields: [activityEvidence.activityId], references: [activities.id] }),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  savedBy: many(savedActivities),
  evidence: many(activityEvidence),
}));

// ──────────────────────────────────────────────
// SNAPSHOT READINESS (Tren Progres)
// ──────────────────────────────────────────────

export const readinessSnapshots = pgTable("readiness_snapshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  careerSlug: text("career_slug").notNull(),
  hardSkillScore: integer("hard_skill_score"),
  softSkillScore: integer("soft_skill_score"),
  snapshotDate: date("snapshot_date").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userCareerDateUnique: uniqueIndex("readiness_snapshot_unique")
    .on(t.userId, t.careerSlug, t.snapshotDate),
}));

export const readinessSnapshotsRelations = relations(readinessSnapshots, ({ one }) => ({
  user: one(users, { fields: [readinessSnapshots.userId], references: [users.id] }),
}));

// ──────────────────────────────────────────────
// PROFIL PUBLIK (Share Passport)
// ──────────────────────────────────────────────

export const publicProfiles = pgTable("public_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  publicToken: text("public_token").notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const publicProfilesRelations = relations(publicProfiles, ({ one }) => ({
  user: one(users, { fields: [publicProfiles.userId], references: [users.id] }),
}));

// ──────────────────────────────────────────────
// AFFILIATE / OUTGOING CLICKS TRACKING
// ──────────────────────────────────────────────

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  clickedAt: timestamp("clicked_at", { mode: "date" }).defaultNow().notNull(),
});

export const affiliateClicksRelations = relations(affiliateClicks, ({ one }) => ({
  user: one(users, { fields: [affiliateClicks.userId], references: [users.id] }),
}));

// ──────────────────────────────────────────────
// PRODUK A LA CARTE & PRICING
// ──────────────────────────────────────────────

export const products = pgTable("products", {
  key: text("key").primaryKey(), // 'pro_monthly' | 'gap_report'
  name: text("name").notNull(),
  type: text("type").notNull().default("subscription"), // 'subscription' | 'one_time'
  price: integer("price").notNull(),
  priceFormatted: text("price_formatted").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// TRANSAKSI PEMBELIAN USER (A LA CARTE)
// ──────────────────────────────────────────────

export const userPurchases = pgTable("user_purchases", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productKey: text("product_key").notNull(), // 'pro_monthly' | 'gap_report'
  careerSlug: text("career_slug"),           // Nullable jika produk global (Pro), terisi jika per-career
  amount: integer("amount").notNull(),
  periodStart: timestamp("period_start", { mode: "date" }),
  periodEnd: timestamp("period_end", { mode: "date" }), // Masa aktif langganan Pro
  isActive: boolean("is_active").default(true).notNull(),
  isMockPayment: boolean("is_mock_payment").default(true).notNull(),
  purchasedAt: timestamp("purchased_at", { mode: "date" }).defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const userPurchasesRelations = relations(userPurchases, ({ one }) => ({
  user: one(users, { fields: [userPurchases.userId], references: [users.id] }),
}));

// ──────────────────────────────────────────────
// SUMBER BELAJAR TERKURASI (STATIS & TERVERIFIKASI)
// ──────────────────────────────────────────────

export const learningResources = pgTable("learning_resources", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  url: text("url").notNull(),
  provider: text("provider").notNull(),
  type: text("type").notNull(), // 'Dokumentasi' | 'Video' | 'Course' | 'Artikel'
  skillTags: text("skill_tags").array().default([]),
  level: text("level").default("Beginner"),
  isFree: boolean("is_free").default(true).notNull(),
  isVerified: boolean("is_verified").default(true).notNull(),
  isBroken: boolean("is_broken").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
