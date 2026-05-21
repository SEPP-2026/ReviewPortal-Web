import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl font-semibold transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Brand primary — yellow accent with black text, used for Rent / Book / Submit etc.
        accent:
          "bg-accent text-black shadow-sm hover:bg-[#C97F00] active:bg-[#A66600]",
        // Neutral default — dark surface for secondary primary actions.
        default:
          "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950",
        // Destructive — red for delete / reject confirmation.
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
        // Outline — light surface with border, used for cancel / secondary.
        outline:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-accent hover:text-accent",
        // Secondary — muted fill, used inside cards / panels.
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        // Ghost — no background until hover, used for tertiary actions.
        ghost:
          "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        // Link — inline, underline on hover.
        link:
          "bg-transparent text-accent underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
