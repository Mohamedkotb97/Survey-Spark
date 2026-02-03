import { surveyResponses, type InsertSurveyResponse, type SurveyResponse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define CSV path - one level up from server (root)
const CSV_FILE_PATH = path.join(__dirname, "..", "survey_responses.csv");

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

export interface IStorage {
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  getCsvFilePath(): string;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.ensureCsvFile();
  }

  private ensureCsvFile() {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      fs.writeFileSync(CSV_FILE_PATH, CSV_HEADERS + "\n");
    }
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    // 1. Save to Database (Reliability)
    const [result] = await db
      .insert(surveyResponses)
      .values(insertResponse)
      .returning();

    // 2. Append to CSV (Requirement)
    const csvRow = [
      new Date().toISOString(), // timestamp in UTC
      this.escapeCsvField(insertResponse.name),
      this.escapeCsvField(insertResponse.company),
      insertResponse.overallExperience,
      insertResponse.serviceQuality,
      insertResponse.timeliness,
      insertResponse.communication,
      insertResponse.professionalism,
      insertResponse.issueResolution,
      insertResponse.easeOfAccess,
      insertResponse.valueAdded,
      insertResponse.efficiency,
      this.escapeCsvField(insertResponse.suggestions || "")
    ].join(",");

    fs.appendFileSync(CSV_FILE_PATH, csvRow + "\n");

    return result;
  }

  getCsvFilePath(): string {
    return CSV_FILE_PATH;
  }

  private escapeCsvField(field: string | number): string {
    const stringField = String(field);
    if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }
}

export const storage = new DatabaseStorage();
