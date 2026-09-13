"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border bg-white px-3.5 text-base text-brand-950 placeholder:text-brand-950/35",
        "transition-colors duration-150 outline-none",
        "focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
        error ? "border-red-300" : "border-brand-200",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
