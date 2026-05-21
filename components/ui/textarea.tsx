import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-400",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
