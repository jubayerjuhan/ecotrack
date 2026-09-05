"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { EmissionFactor } from "@/lib/api/types";
import type { EmissionCategory } from "@/lib/validation";

export function useEmissionFactors() {
  const [factors, setFactors] = useState<EmissionFactor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ factors: EmissionFactor[] }>("/emission-factors")
      .then((res) => {
        if (!cancelled) setFactors(res.factors);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load emission factors");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { factors, isLoading: factors === null && !error, error };
}

/** One entry per distinct subtype in a category (factors list has one row per country). */
export function getSubtypesForCategory(factors: EmissionFactor[], category: EmissionCategory): EmissionFactor[] {
  const seen = new Map<string, EmissionFactor>();
  for (const factor of factors) {
    if (factor.category === category && !seen.has(factor.subtype)) {
      seen.set(factor.subtype, factor);
    }
  }
  return Array.from(seen.values());
}
