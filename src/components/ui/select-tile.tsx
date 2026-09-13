"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function SelectTile({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-all duration-150 active:scale-[0.97]",
        active
          ? "border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-400"
          : "border-brand-100 bg-white text-brand-700/80 hover:border-brand-200 hover:bg-brand-50/50",
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}
