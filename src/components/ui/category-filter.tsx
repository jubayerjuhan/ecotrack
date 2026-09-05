"use client";

import { CATEGORY_META } from "@/lib/category-meta";
import { cn } from "@/lib/cn";
import { EMISSION_CATEGORIES, type EmissionCategory } from "@/lib/validation";

export function CategoryFilter({
  value,
  onChange,
}: {
  value: EmissionCategory | null;
  onChange: (category: EmissionCategory | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          value === null ? "bg-brand-600 text-white" : "bg-brand-100/60 text-brand-700/70 hover:bg-brand-100",
        )}
      >
        All
      </button>
      {EMISSION_CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === c ? "bg-brand-600 text-white" : "bg-brand-100/60 text-brand-700/70 hover:bg-brand-100",
          )}
        >
          {CATEGORY_META[c].label}
        </button>
      ))}
    </div>
  );
}
