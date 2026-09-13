export type Period = "week" | "month";

/** Rolling window ending today (not a calendar week/month) — keeps the trend chart populated even early in a month. */
export function getPeriodRange(period: Period, now = new Date()) {
  const days = period === "week" ? 7 : 30;

  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  return { from, to, days };
}
