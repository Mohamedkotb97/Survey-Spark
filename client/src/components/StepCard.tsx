import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StepCardProps {
  children: ReactNode;
  className?: string;
}

export function StepCard({ children, className }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className={cn(
        "w-full max-w-2xl mx-auto glass-panel rounded-3xl p-8 md:p-12 overflow-hidden relative",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
