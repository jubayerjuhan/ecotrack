"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Activity, Pagination } from "@/lib/api/types";
import type { EmissionCategory } from "@/lib/validation";

export function useActivities(page: number, category: EmissionCategory | null) {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (category) params.set("category", category);

    apiFetch<{ items: Activity[]; pagination: Pagination }>(`/activities?${params.toString()}`)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load activities");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, category, reloadToken]);

  return { items, pagination, isLoading, error, refresh };
}
