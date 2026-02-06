import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { useSubmitSurvey } from "@/hooks/use-survey";
import { StepCard } from "@/components/StepCard";
import { RatingOption } from "@/components/RatingOption";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronRight, CheckCircle2, Star, ArrowRight } from "lucide-react";
import orangeLogo from "@assets/Orange_Cyberdefense_RGB_Master_Logo_Black_Text_1770148513417.png";

// --- Configuration & Types ---

const ratingOptions = [
  { label: "Very Dissatisfied", value: 1, emoji: "😡" },
  { label: "Dissatisfied", value: 2, emoji: "🙁" },
  { label: "Neutral", value: 3, emoji: "😐" },
  { label: "Satisfied", value: 4, emoji: "🙂" },
  { label: "Very Satisfied", value: 5, emoji: "🤩" },
];

const steps = [
  { id: "welcome", type: "welcome" },
  { id: "info", type: "info" },
  { id: "q1", type: "rating", field: "overallExperience", question: "How would you describe your overall experience with our service?", title: "Overall Experience" },
  { id: "q2", type: "rating", field: "serviceQuality", question: "How satisfied are you with the quality of the service you received?", title: "Service Quality" },
  { id: "q3", type: "rating", field: "timeliness", question: "Did the service meet your expectations in terms of delivery time?", title: "Timeliness" },
  { id: "q4", type: "rating", field: "communication", question: "How clear and effective was the communication from our team throughout the service process?", title: "Communication" },
  { id: "q5", type: "rating", field: "professionalism", question: "How would you rate the professionalism and courtesy of our staff?", title: "Professionalism" },
  { id: "q6", type: "rating", field: "issueResolution", question: "How effectively did the service resolve your issue or meet your needs?", title: "Issue Resolution" },
  { id: "q7", type: "rating", field: "easeOfAccess", question: "How easy was it to access and use our service?", title: "Ease of Access" },
  { id: "q8", type: "rating", field: "valueAdded", question: "How would you rate the value added by the security advisor to your overall experience?", title: "Security Advisor Value" },
  { id: "q9", type: "rating", field: "efficiency", question: "How efficient was the security advisor in addressing your security concerns and providing solutions?", title: "Security Advisor Efficiency" },
  { id: "q10", type: "text", field: "suggestions", question: "Do you have any suggestions for how we could improve our service?", title: "Suggestions for Improvement" },
  { id: "done", type: "done" },
] as const;

// Validation schema for the form
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  overallExperience: z.number(),
  serviceQuality: z.number(),
  timeliness: z.number(),
  communication: z.number(),
  professionalism: z.number(),
  issueResolution: z.number(),
  easeOfAccess: z.number(),
  valueAdded: z.number(),
  efficiency: z.number(),
  suggestions: z.string().min(3, "Suggestions must be at least 3 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function Survey() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const submitMutation = useSubmitSurvey();

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isLastQuestion = currentStepIndex === steps.length - 2; // -1 is done, -2 is last input

  // Watch fields to validate "Next" button state
  const watchedValues = watch();

  const handleNext = async () => {
    let isValid = true;
    
    if (currentStep.type === "info") {
      isValid = await trigger(["name", "company"]);
    } else if (currentStep.type === "rating") {
      // @ts-ignore - dynamic field check
      isValid = watchedValues[currentStep.field] !== undefined;
    }

    if (isValid) {
      if (isLastQuestion) {
        await onSubmit(watchedValues);
      } else {
        setDirection(1);
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await submitMutation.mutateAsync(data);
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1); // Move to 'done' step
    } catch (e) {
      // Error handled by mutation hook toast
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-slate-50/50">
      
      {currentStep.type !== "welcome" && currentStep.type !== "done" && (
        <ProgressBar currentStep={currentStepIndex} totalSteps={totalSteps - 1} />
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {currentStep.type === "welcome" && (
          <StepCard key="welcome">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-8">
                <img 
                  src={orangeLogo} 
                  alt="Orange Cyberdefense Logo" 
                  className="h-24 md:h-32 object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Customer Satisfaction Survey
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                We value your feedback! Please take a moment to tell us about your experience. 
                Your insights help us improve our services.
              </p>
              <div className="pt-8">
                <Button 
                  size="lg" 
                  onClick={() => { setDirection(1); setCurrentStepIndex(1); }}
                  className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all"
                >
                  Start Survey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </StepCard>
        )}

        {currentStep.type === "info" && (
          <StepCard key="info">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                <p className="text-muted-foreground">We need a few details to get started.</p>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Jane Doe" 
                    {...register("name")}
                    className="h-12 text-lg bg-background"
                  />
                  {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-base">Company Name</Label>
                  <Input 
                    id="company" 
                    placeholder="Acme Corp" 
                    {...register("company")}
                    className="h-12 text-lg bg-background"
                  />
                  {errors.company && <p className="text-sm text-destructive font-medium">{errors.company.message}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  className="rounded-full px-8"
                >
                  Continue
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </StepCard>
        )}

        {currentStep.type === "rating" && (
          <StepCard key={currentStep.id}>
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {currentStep.title}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {currentStep.question}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ratingOptions.map((option) => (
                  <RatingOption
                    key={option.value}
                    {...option}
                    isSelected={watch(currentStep.field as any) === option.value}
                    onSelect={(val) => setValue(currentStep.field as any, val)}
                  />
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  disabled={watch(currentStep.field as any) === undefined}
                  className="rounded-full px-8"
                >
                  Next Question
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </StepCard>
        )}

        {currentStep.type === "text" && (
          <StepCard key="suggestions">
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  Final Thoughts
                </span>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {currentStep.question}
                </h2>
                <p className="text-muted-foreground text-sm">Please share your suggestions for improvement.</p>
              </div>

              <div className="max-w-xl mx-auto">
                <Textarea 
                  placeholder="Type your suggestions here..." 
                  className="min-h-[150px] text-lg p-4 resize-none bg-background"
                  {...register("suggestions")}
                  maxLength={1000}
                  required
                />
                {errors.suggestions && (
                  <p className="text-sm text-destructive mt-1">{errors.suggestions.message}</p>
                )}
                <div className="text-xs text-right text-muted-foreground mt-2">
                  {watch("suggestions")?.length || 0}/1000 characters
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  disabled={submitMutation.isPending}
                  className="rounded-full px-8 bg-gradient-to-r from-primary to-purple-600 hover:to-purple-700 shadow-lg shadow-primary/25"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Survey"}
                  {!submitMutation.isPending && <CheckCircle2 className="ml-2 w-5 h-5" />}
                </Button>
              </div>
            </div>
          </StepCard>
        )}

        {currentStep.type === "done" && (
          <StepCard key="done">
            <div className="text-center space-y-6 py-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 mb-4"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-4xl font-extrabold text-foreground tracking-tight">
                Thank You!
              </h2>
              <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your feedback has been successfully recorded. We appreciate your time and honesty.
              </p>
              <div className="pt-8">
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-full px-8"
                >
                  Take Survey Again
                </Button>
              </div>
            </div>
          </StepCard>
        )}
      </AnimatePresence>
    </div>
  );
}
