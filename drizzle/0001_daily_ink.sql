CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"competency_tags" text[] DEFAULT '{}',
	"skill_tags" text[] DEFAULT '{}',
	"deadline" timestamp,
	"registration_url" text,
	"match_percent" integer DEFAULT 0,
	"is_sample" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"organizer_contact_server" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"evidence_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"confirmation_token_hash" text,
	"token_expires_at" timestamp,
	"confirmed_at" timestamp,
	"is_sample_confirmation" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_module_insights" (
	"module_slug" text NOT NULL,
	"career_slug" text NOT NULL,
	"insight_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_module_insights_module_slug_career_slug_pk" PRIMARY KEY("module_slug","career_slug")
);
--> statement-breakpoint
CREATE TABLE "ai_roadmaps" (
	"career_slug" text PRIMARY KEY NOT NULL,
	"career_name" text NOT NULL,
	"roadmap_data" jsonb NOT NULL,
	"onet_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onet_knowledge" (
	"id" serial PRIMARY KEY NOT NULL,
	"onetsoc_code" text NOT NULL,
	"element_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onet_occupations" (
	"onetsoc_code" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "onet_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"onetsoc_code" text NOT NULL,
	"element_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onet_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"onetsoc_code" text NOT NULL,
	"task" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onet_tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"onetsoc_code" text NOT NULL,
	"example" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"public_token" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "public_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "public_profiles_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
CREATE TABLE "readiness_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"career_slug" text NOT NULL,
	"hard_skill_score" integer,
	"soft_skill_score" integer,
	"snapshot_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_activities" (
	"user_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_activities_user_id_activity_id_pk" PRIMARY KEY("user_id","activity_id")
);
--> statement-breakpoint
CREATE TABLE "soft_skill_baselines" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"competency" text NOT NULL,
	"score" integer NOT NULL,
	"source" text DEFAULT 'self-report' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soft_skill_missions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"competency" text NOT NULL,
	"description" text,
	"estimated_minutes" integer DEFAULT 30,
	"difficulty_level" text DEFAULT 'medium',
	"is_sample" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_mission_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mission_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"submission_text" text,
	"evidence_type" text DEFAULT 'self-report' NOT NULL,
	"score" integer,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "active_quiz_unique";--> statement-breakpoint
ALTER TABLE "activity_evidence" ADD CONSTRAINT "activity_evidence_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_evidence" ADD CONSTRAINT "activity_evidence_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onet_knowledge" ADD CONSTRAINT "onet_knowledge_onetsoc_code_onet_occupations_onetsoc_code_fk" FOREIGN KEY ("onetsoc_code") REFERENCES "public"."onet_occupations"("onetsoc_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onet_skills" ADD CONSTRAINT "onet_skills_onetsoc_code_onet_occupations_onetsoc_code_fk" FOREIGN KEY ("onetsoc_code") REFERENCES "public"."onet_occupations"("onetsoc_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onet_tasks" ADD CONSTRAINT "onet_tasks_onetsoc_code_onet_occupations_onetsoc_code_fk" FOREIGN KEY ("onetsoc_code") REFERENCES "public"."onet_occupations"("onetsoc_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onet_tools" ADD CONSTRAINT "onet_tools_onetsoc_code_onet_occupations_onetsoc_code_fk" FOREIGN KEY ("onetsoc_code") REFERENCES "public"."onet_occupations"("onetsoc_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_profiles" ADD CONSTRAINT "public_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readiness_snapshots" ADD CONSTRAINT "readiness_snapshots_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_activities" ADD CONSTRAINT "saved_activities_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_activities" ADD CONSTRAINT "saved_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soft_skill_baselines" ADD CONSTRAINT "soft_skill_baselines_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_mission_id_soft_skill_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."soft_skill_missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "readiness_snapshot_unique" ON "readiness_snapshots" USING btree ("user_id","career_slug","snapshot_date");--> statement-breakpoint
CREATE UNIQUE INDEX "soft_skill_baselines_user_competency" ON "soft_skill_baselines" USING btree ("user_id","competency");--> statement-breakpoint
CREATE UNIQUE INDEX "user_mission_unique" ON "user_mission_progress" USING btree ("user_id","mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "active_quiz_unique" ON "assessment_results" USING btree ("user_id","quiz_type") WHERE "assessment_results"."is_active" = true;