import type { EmissionCategory } from "@/lib/validation";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  countryCode: string;
  createdAt: string;
};

export type EmissionFactor = {
  id: string;
  category: EmissionCategory;
  subtype: string;
  countryCode: string | null;
  factorValue: number;
  unit: string;
  source: string;
};

export type Activity = {
  id: string;
  userId: string;
  category: EmissionCategory;
  subtype: string;
  quantity: number;
  unit: string;
  emissionsKg: number;
  logDate: string;
  createdAt: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DashboardSummary = {
  period: "week" | "month";
  range: { from: string; to: string };
  totalEmissionsKg: number;
  trend: { date: string; emissionsKg: number }[];
  byCategory: { category: EmissionCategory; emissionsKg: number }[];
};

export type ReportSummary = {
  period: "week" | "month";
  range: { from: string; to: string };
  totalEmissionsKg: number;
  byCategory: { category: EmissionCategory; emissionsKg: number }[];
  activities: Activity[];
};
