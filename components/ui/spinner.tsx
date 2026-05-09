"use client";

import { Loader } from "lucide-react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullHeight?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

export function Spinner({ size = "md", text, fullHeight = false }: SpinnerProps) {
  const sizeClass = sizeClasses[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader className={`${sizeClass} animate-spin text-accent`} />
      {text && <p className="text-[#666666] text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullHeight) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        {content}
      </div>
    );
  }

  return content;
}
