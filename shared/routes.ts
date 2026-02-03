import { z } from "zod";
import { insertSurveyResponseSchema, surveyResponses } from "./schema";

export const api = {
  survey: {
    submit: {
      method: "POST" as const,
      path: "/api/submit",
      input: insertSurveyResponseSchema,
      responses: {
        201: z.object({ success: z.boolean() }),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
    downloadCsv: {
      method: "GET" as const,
      path: "/api/download-csv",
      responses: {
        200: z.any(), // File download
      },
    },
  },
};
