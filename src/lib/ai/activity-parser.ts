import { z } from "zod";
import type { EmissionCategory } from "@prisma/client";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getGroqClient } from "@/lib/groq";

export type SubtypeCatalogEntry = { category: EmissionCategory; subtype: string; unit: string };

const parsedActivitySchema = z.object({
  category: z.enum(["TRANSPORT", "DIET", "ELECTRICITY"]),
  subtype: z.string(),
  quantity: z.number().positive(),
});
export type ParsedActivity = z.infer<typeof parsedActivitySchema>;

const parseResultSchema = z.object({
  activities: z.array(parsedActivitySchema),
});

function buildResponseFormat(subtypes: string[]) {
  return {
    type: "json_schema" as const,
    json_schema: {
      name: "parsed_activities",
      strict: true,
      schema: {
        type: "object",
        properties: {
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["TRANSPORT", "DIET", "ELECTRICITY"] },
                subtype: { type: "string", enum: subtypes },
                quantity: { type: "number" },
              },
              required: ["category", "subtype", "quantity"],
              additionalProperties: false,
            },
          },
        },
        required: ["activities"],
        additionalProperties: false,
      },
    },
  };
}

/**
 * Extracts zero or more structured activities from a free-text message via Groq.
 * This only extracts intent — it never computes emissions or writes to the
 * database; calculateEmissions() and the existing activity create endpoint
 * stay the single source of truth for that.
 */
export async function parseActivityText(text: string, catalog: SubtypeCatalogEntry[]): Promise<ParsedActivity[]> {
  const catalogLines = catalog.map((c) => `- category=${c.category} subtype=${c.subtype} unit=${c.unit}`).join("\n");
  const subtypes = Array.from(new Set(catalog.map((c) => c.subtype)));

  const completion = await getGroqClient().chat.completions.create({
    model: env.GROQ_MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: [
          "You extract carbon-tracking activities from a user's free-text message.",
          "Only use these exact category/subtype pairs — never invent one — and report the quantity in the listed unit:",
          catalogLines,
          "",
          "If the message doesn't describe any loggable activity, return an empty activities array.",
          "If a quantity isn't stated explicitly, make a reasonable real-world estimate rather than skipping the activity (e.g. a typical commute distance, a typical meal count of 1).",
        ].join("\n"),
      },
      { role: "user", content: text },
    ],
    response_format: buildResponseFormat(subtypes),
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new AppError(502, "The AI didn't return a response. Try again.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new AppError(502, "The AI returned something unparseable. Try again.");
  }

  const result = parseResultSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new AppError(502, "The AI's response didn't match the expected format. Try again.");
  }

  // Defense in depth: structured outputs constrains subtype values individually,
  // but not the (category, subtype) pairing — drop anything not a real combination.
  const validPairs = new Set(catalog.map((c) => `${c.category}:${c.subtype}`));
  return result.data.activities.filter((a) => validPairs.has(`${a.category}:${a.subtype}`));
}
