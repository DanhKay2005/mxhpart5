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
      className={`flex items-center gap-2 transition-colors select-none ${
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
        <Heart className={`h-6 w-6 ${liked ? "fill-red-500" : ""}`} />
      </motion.span>
      <span className="text-lg font-semibold select-text">{count} Yêu thích</span>
    </button>
  );
}
