import type { ActivityLog } from "@prisma/client";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function activitiesToCsv(activities: ActivityLog[]): string {
  const header = ["Date", "Category", "Subtype", "Quantity", "Unit", "Emissions (kg CO2e)"];
  const rows = activities.map((a) => [
    a.logDate.toISOString().slice(0, 10),
    a.category,
    a.subtype,
    String(a.quantity),
    a.unit,
    a.emissionsKg.toFixed(3),
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\n");
}
