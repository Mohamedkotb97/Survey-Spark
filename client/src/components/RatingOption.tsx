import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RatingOptionProps {
  label: string;
  value: number;
  isSelected: boolean;
  onSelect: (value: number) => void;
  emoji: string;
}

export function RatingOption({ label, value, isSelected, onSelect, emoji }: RatingOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-3 w-full",
        isSelected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
          : "border-transparent bg-secondary hover:bg-secondary/80 hover:border-border"
      )}
    >
      <span className="text-4xl filter drop-shadow-sm">{emoji}</span>
      <span className={cn(
        "text-sm font-medium text-center leading-tight",
        isSelected ? "text-primary font-bold" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </motion.button>
  );
}
