import type { ActivityLog, EmissionCategory } from "@prisma/client";

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** One point per day in the range, zero-filled, so the trend line stays continuous. */
export function buildDailyTrend(activities: ActivityLog[], from: Date, days: number) {
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const activity of activities) {
    const key = activity.logDate.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + activity.emissionsKg);
    }
  }

  return Array.from(buckets.entries()).map(([date, emissionsKg]) => ({
    date,
    emissionsKg: round2(emissionsKg),
  }));
}

export function buildCategoryBreakdown(activities: ActivityLog[]) {
  const totals = new Map<EmissionCategory, number>();
  for (const activity of activities) {
    totals.set(activity.category, (totals.get(activity.category) ?? 0) + activity.emissionsKg);
  }

  return Array.from(totals.entries()).map(([category, emissionsKg]) => ({
    category,
    emissionsKg: round2(emissionsKg),
  }));
}
