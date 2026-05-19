"use client";

import { Star } from "lucide-react";

interface StarRatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
}

export function StarRatingInput({
  label,
  value,
  onChange,
  size = "md",
}: StarRatingInputProps) {
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-[#444444]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
            aria-label={`${label} ${star} stars`}
          >
            <Star
              className={`${starSize} ${
                star <= value
                  ? "text-accent fill-accent"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
