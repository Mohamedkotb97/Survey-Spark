// Simple API handler for Vercel serverless functions
// This handles only API routes - static files are served by Vercel directly

import express from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { desc } from "drizzle-orm";

const { Pool } = pg;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database schema (inline to avoid import issues)
const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  overallExperience: integer("overall_experience").notNull(),
  serviceQuality: integer("service_quality").notNull(),
  timeliness: integer("timeliness").notNull(),
  communication: integer("communication").notNull(),
  professionalism: integer("professionalism").notNull(),
  issueResolution: integer("issue_resolution").notNull(),
  easeOfAccess: integer("ease_of_access").notNull(),
  valueAdded: integer("value_added").notNull(),
  efficiency: integer("efficiency").notNull(),
  suggestions: text("suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Initialize database connection (if DATABASE_URL is set)
let db: ReturnType<typeof drizzle> | null = null;
if (process.env.DATABASE_URL) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema: { surveyResponses } });
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
} else {
  console.warn("DATABASE_URL not set. Using CSV-only mode.");
}

// CSV file path - in Vercel's writable /tmp directory
const CSV_FILE_PATH = process.env.VERCEL 
  ? "/tmp/survey_responses.csv"
  : path.join(process.cwd(), "survey_responses.csv");

const CSV_HEADERS = [
  "timestamp",
  "name",
  "company",
  "overall_experience",
  "service_quality",
  "timeliness",
  "communication",
  "professionalism",
  "issue_resolution",
  "ease_of_access",
  "value_added_by_security_advisor",
  "efficiency_of_security_advisor",
  "suggestions"
].join(",");

// Ensure CSV file exists
function ensureCsvFile() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    fs.writeFileSync(CSV_FILE_PATH, CSV_HEADERS + "\n");
  }
}

// Escape CSV field
function escapeCsvField(field: string | number): string {
  const stringField = String(field);
  if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

// Schema for survey submission
// Rating values are 1-5
const surveySchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  overallExperience: z.number().min(1).max(5),
  serviceQuality: z.number().min(1).max(5),
  timeliness: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  professionalism: z.number().min(1).max(5),
  issueResolution: z.number().min(1).max(5),
  easeOfAccess: z.number().min(1).max(5),
  valueAdded: z.number().min(1).max(5),
  efficiency: z.number().min(1).max(5),
  suggestions: z.string().optional(),
});

// Admin password
const ADMIN_PASSWORD = "OCD$survey$2026";

// Simple password check middleware
function checkAdminPassword(req: any, res: any, next: any) {
  const password = req.headers.authorization?.replace("Bearer ", "") || req.query.password as string;
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// API Routes

// Submit Survey Response
app.post("/api/submit", async (req, res) => {
  try {
    const data = surveySchema.parse(req.body);
    
    // 1. Save to database if available
    if (db) {
      try {
        await db.insert(surveyResponses).values({
          name: data.name,
          company: data.company,
          overallExperience: data.overallExperience,
          serviceQuality: data.serviceQuality,
          timeliness: data.timeliness,
          communication: data.communication,
          professionalism: data.professionalism,
          issueResolution: data.issueResolution,
          easeOfAccess: data.easeOfAccess,
          valueAdded: data.valueAdded,
          efficiency: data.efficiency,
          suggestions: data.suggestions || null,
        });
        console.log("Saved to database");
      } catch (dbError) {
        console.error("Database save error:", dbError);
        // Continue to save CSV even if database fails
      }
    }
    
    // 2. Always save to CSV (backup/requirement)
    ensureCsvFile();
    const csvRow = [
      new Date().toISOString(),
      escapeCsvField(data.name),
      escapeCsvField(data.company),
      data.overallExperience,
      data.serviceQuality,
      data.timeliness,
      data.communication,
      data.professionalism,
      data.issueResolution,
      data.easeOfAccess,
      data.valueAdded,
      data.efficiency,
      escapeCsvField(data.suggestions || "")
    ].join(",");

    fs.appendFileSync(CSV_FILE_PATH, csvRow + "\n");

    res.status(201).json({ success: true, savedToDatabase: !!db });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Submission error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Get all survey responses (protected)
app.get("/api/admin/responses", checkAdminPassword, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }
    
    const responses = await db.select().from(surveyResponses).orderBy(desc(surveyResponses.createdAt));
    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// Get analytics (protected)
app.get("/api/admin/analytics", checkAdminPassword, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }
    
    const responses = await db.select().from(surveyResponses);
    const total = responses.length;
    
    if (total === 0) {
      return res.json({
        total: 0,
        averageRatings: {},
        dateRange: null,
        responsesByDate: [],
      });
    }
    
    // Calculate averages
    const fields = [
      "overallExperience", "serviceQuality", "timeliness", "communication",
      "professionalism", "issueResolution", "easeOfAccess", "valueAdded", "efficiency"
    ];
    
    const averages: Record<string, number> = {};
    fields.forEach(field => {
      const sum = responses.reduce((acc, r) => acc + (r[field as keyof typeof r] as number), 0);
      averages[field] = total > 0 ? Number((sum / total).toFixed(2)) : 0;
    });
    
    // Date range
    const dates = responses.map(r => r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : null).filter(Boolean);
    const dateRange = dates.length > 0 ? {
      earliest: dates.sort()[0],
      latest: dates.sort().reverse()[0]
    } : null;
    
    // Responses by date
    const responsesByDate: Record<string, number> = {};
    dates.forEach(date => {
      responsesByDate[date!] = (responsesByDate[date!] || 0) + 1;
    });
    
    res.json({
      total,
      averageRatings: averages,
      dateRange,
      responsesByDate: Object.entries(responsesByDate).map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Download CSV - protected
app.get("/api/admin/download-csv", checkAdminPassword, async (req, res) => {
  try {
    let csvContent = CSV_HEADERS + "\n";
    
    // Try to get data from database first
    if (db) {
      try {
        const responses = await db.select().from(surveyResponses);
        for (const row of responses) {
          const csvRow = [
            row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
            escapeCsvField(row.name),
            escapeCsvField(row.company),
            row.overallExperience,
            row.serviceQuality,
            row.timeliness,
            row.communication,
            row.professionalism,
            row.issueResolution,
            row.easeOfAccess,
            row.valueAdded,
            row.efficiency,
            escapeCsvField(row.suggestions || "")
          ].join(",");
          csvContent += csvRow + "\n";
        }
        console.log(`Generated CSV from database with ${responses.length} rows`);
      } catch (dbError) {
        console.error("Database read error:", dbError);
        // Fall back to file
        if (fs.existsSync(CSV_FILE_PATH)) {
          csvContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
        }
      }
    } else {
      // No database, use CSV file
      ensureCsvFile();
      if (fs.existsSync(CSV_FILE_PATH)) {
        csvContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
      }
    }
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=survey_responses.csv");
    res.send(csvContent);
  } catch (error) {
    console.error("CSV download error:", error);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  const dbStatus = db ? "connected" : "not configured";
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Export for Vercel
export default app;
