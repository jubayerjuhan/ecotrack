"use client";

import { cn } from "@/lib/cn";
import type { Period } from "@/lib/date-range";

export function PeriodToggle({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  const options: { value: Period; label: string }[] = [
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
  ];

  return (
    <div className="inline-flex rounded-xl bg-brand-100/60 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
            value === opt.value ? "bg-white text-brand-800 shadow-sm" : "text-brand-700/60 hover:text-brand-800",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
