import { z } from "zod";
import { EMISSION_CATEGORIES } from "./enums";

export const createActivitySchema = z.object({
  category: z.enum(EMISSION_CATEGORIES),
  subtype: z.string().trim().min(1, "Select a subtype"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  logDate: z.coerce.date().optional(),
});
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = createActivitySchema.partial();
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export const activityQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  category: z.enum(EMISSION_CATEGORIES).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;

export const dashboardQuerySchema = z.object({
  period: z.enum(["week", "month"]).default("week"),
});
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

export const reportsQuerySchema = z.object({
  period: z.enum(["week", "month"]).default("month"),
  format: z.enum(["json", "csv"]).default("json"),
});
export type ReportsQueryInput = z.infer<typeof reportsQuerySchema>;
