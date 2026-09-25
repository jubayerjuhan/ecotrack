import { z } from "zod";
import type { EmissionCategory } from "@prisma/client";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getGroqClient } from "@/lib/groq";
import type { Period } from "@/lib/date-range";

const insightResultSchema = z.object({ insight: z.string() });

const RESPONSE_FORMAT = {
  type: "json_schema" as const,
  json_schema: {
    name: "dashboard_insight",
    strict: true,
    schema: {
      type: "object",
      properties: { insight: { type: "string" } },
      required: ["insight"],
      additionalProperties: false,
    },
  },
};

export type DashboardInsightInput = {
  period: Period;
  totalEmissionsKg: number;
  byCategory: { category: EmissionCategory; emissionsKg: number }[];
};

/** Generates a short, specific coaching insight over the user's real aggregated numbers. */
export async function generateDashboardInsight({
  period,
  totalEmissionsKg,
  byCategory,
}: DashboardInsightInput): Promise<string> {
  const breakdown = byCategory
    .map((c) => {
      const pct = totalEmissionsKg > 0 ? Math.round((c.emissionsKg / totalEmissionsKg) * 100) : 0;
      return `${c.category}: ${c.emissionsKg.toFixed(1)} kg CO2e (${pct}%)`;
    })
    .join(", ");

  const completion = await getGroqClient().chat.completions.create({
    model: env.GROQ_MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You are a friendly, concise sustainability coach inside a carbon-tracking app. Given a user's real emissions data for a period, write ONE short insight: 2-3 plain sentences, no markdown, no greeting or preamble. Name their single biggest emission category by its real share, and give one concrete, specific, realistic suggestion tied to that category. Be encouraging, never preachy or guilt-tripping. Use the actual numbers given, never invent numbers.",
      },
      {
        role: "user",
        content: `Period: this ${period}\nTotal: ${totalEmissionsKg.toFixed(1)} kg CO2e\nBy category: ${breakdown}`,
      },
    ],
    response_format: RESPONSE_FORMAT,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new AppError(502, "The AI didn't return a response.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new AppError(502, "The AI returned something unparseable.");
  }

  const result = insightResultSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new AppError(502, "The AI's response didn't match the expected format.");
  }

  return result.data.insight;
}
