"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { DashboardSummary } from "@/lib/api/types";
import type { Period } from "@/lib/date-range";

export function useDashboardSummary(period: Period) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    apiFetch<DashboardSummary>(`/dashboard/summary?period=${period}`)
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return { summary, isLoading, error };
}
