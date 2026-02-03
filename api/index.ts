// Simple API handler for Vercel serverless functions
// This handles only API routes - static files are served by Vercel directly

import express from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// API Routes

// Submit Survey Response
app.post("/api/submit", async (req, res) => {
  try {
    const data = surveySchema.parse(req.body);
    
    ensureCsvFile();
    
    // Append to CSV
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

    res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Submission error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Download CSV
app.get("/api/download-csv", (req, res) => {
  ensureCsvFile();
  
  if (!fs.existsSync(CSV_FILE_PATH)) {
    res.status(404).json({ error: "CSV file not found" });
    return;
  }
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=survey_responses.csv");
  
  const csvContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
  res.send(csvContent);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
