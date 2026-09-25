"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { DashboardInsight } from "@/lib/api/types";
import type { Period } from "@/lib/date-range";

/** Only fetches when `enabled` — callers should gate this on the dashboard already having data. */
export function useDashboardInsight(period: Period, enabled: boolean) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setInsight(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    apiFetch<DashboardInsight>(`/dashboard/insights?period=${period}`)
      .then((res) => {
        if (!cancelled) setInsight(res.insight);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load insight");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, enabled]);

  return { insight, isLoading, error };
}
