import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// For Vercel/serverless, database connection is optional
// If DATABASE_URL is not set, create a mock db that will fail gracefully
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn("DATABASE_URL not set. Database operations will be disabled.");
  // Create a mock pool and db that will throw helpful errors
  pool = null;
  db = null;
}

export { pool };
export { db };
