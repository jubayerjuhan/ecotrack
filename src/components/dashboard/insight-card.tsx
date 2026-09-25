"use client";

import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightCard({ insight, isLoading, error }: { insight: string | null; isLoading: boolean; error: string | null }) {
  // Insights are a nice-to-have, not critical — fail silently rather than
  // showing an alarming error where the numeric dashboard still works fine.
  if (error || (!isLoading && !insight)) return null;

  return (
    <div className="flex gap-3 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Sparkles className="size-4" aria-hidden />
      </div>
      {isLoading ? (
        <div className="flex-1 space-y-2 py-0.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      ) : (
        <p className="flex-1 text-sm leading-relaxed text-brand-900">{insight}</p>
      )}
    </div>
  );
}
