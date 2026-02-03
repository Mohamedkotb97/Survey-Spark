import { useMutation } from "@tanstack/react-query";
import { api, type InsertSurveyResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubmitSurvey() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSurveyResponse) => {
      const res = await fetch(api.survey.submit.path, {
        method: api.survey.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit survey");
      }

      return api.survey.submit.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
