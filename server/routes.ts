import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { z } from "zod";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Submit Survey Response
  app.post(api.survey.submit.path, async (req, res) => {
    try {
      const data = insertSurveyResponseSchema.parse(req.body);
      await storage.createSurveyResponse(data);
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
  app.get(api.survey.downloadCsv.path, (req, res) => {
    const filePath = storage.getCsvFilePath();
    res.download(filePath, "survey_responses.csv");
  });

  return httpServer;
}
