import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Fallback dummy connection string for build-time static page collection
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://build_dummy:build_dummy@ep-build-dummy.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString);

// Inisialisasi DB dengan skema Drizzle
export const db = drizzle(sql, { schema });