import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surveyResponses = pgTable("survey_responses", {
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

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
