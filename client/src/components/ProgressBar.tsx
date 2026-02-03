import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  // We only show progress for actual questions (steps 2 to 11 in our flow, roughly)
  // Step 1 is Welcome (0%), Step 2 is Info (10%), Step 12 is Done (100%)
  
  const progress = Math.min(100, Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100));

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
