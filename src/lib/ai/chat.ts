import { z } from "zod";
import type { ActivityLog } from "@prisma/client";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getGroqClient } from "@/lib/groq";
import { buildCategoryBreakdown, round2 } from "@/lib/emissions/aggregate";

const chatResultSchema = z.object({ reply: z.string() });

const RESPONSE_FORMAT = {
  type: "json_schema" as const,
  json_schema: {
    name: "chat_reply",
    strict: true,
    schema: {
      type: "object",
      properties: { reply: { type: "string" } },
      required: ["reply"],
      additionalProperties: false,
    },
  },
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

function buildDataContext(activities: ActivityLog[]): string {
  const total = round2(activities.reduce((sum, a) => sum + a.emissionsKg, 0));
  const byCategory = buildCategoryBreakdown(activities);
  const breakdown = byCategory
    .map((c) => `${c.category}: ${c.emissionsKg.toFixed(1)} kg CO2e`)
    .join(", ");

  // Aggregates cover the whole window; the row list is capped so token size
  // stays bounded even for a very active user over 90 days.
  const RECENT_ROW_CAP = 60;
  const rows = activities
    .slice(0, RECENT_ROW_CAP)
    .map((a) => `${a.logDate.toISOString().slice(0, 10)} | ${a.category} | ${a.subtype} | ${a.quantity} ${a.unit} | ${a.emissionsKg.toFixed(2)} kg`)
    .join("\n");

  return [
    `Total over the last 90 days: ${total} kg CO2e`,
    `By category: ${breakdown || "no data"}`,
    "",
    `Individual activities (most recent ${Math.min(activities.length, RECENT_ROW_CAP)} of ${activities.length}, newest first):`,
    activities.length ? rows : "(none logged in this window)",
  ].join("\n");
}

/** Answers a question about the user's own footprint, grounded in their real ActivityLog rows — never free-form. */
export async function answerDataQuestion(
  message: string,
  history: ChatTurn[],
  activities: ActivityLog[],
): Promise<string> {
  const completion = await getGroqClient().chat.completions.create({
    model: env.GROQ_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: [
          "You are a helpful assistant inside a personal carbon-tracking app, answering questions about the user's own logged activities.",
          "Only use the data given below — never invent numbers or activities that aren't listed. If the data doesn't answer the question, say so plainly.",
          "Keep replies short and conversational (1-4 sentences unless the question needs a list). No markdown headers.",
          "",
          "=== User's data (last 90 days) ===",
          buildDataContext(activities),
        ].join("\n"),
      },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
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

  const result = chatResultSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new AppError(502, "The AI's response didn't match the expected format.");
  }

  return result.data.reply;
}
