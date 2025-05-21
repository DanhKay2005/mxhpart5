"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

export function NutThich({ liked, count, onClick, disabled }: LikeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 transition-colors ${
        liked ? "text-red-500" : "hover:text-red-500 text-muted-foreground"
      }`}
      aria-label={liked ? "Bỏ thích" : "Thích"}
    >
      <motion.span
        key={liked ? "liked" : "not-liked"}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
      </motion.span>
      {count}
    </button>
  );
}
