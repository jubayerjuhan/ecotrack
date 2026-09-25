import { z } from "zod";

export const parseActivityTextSchema = z.object({
  text: z.string().trim().min(1, "Type something to log").max(500, "Keep it under 500 characters"),
});
export type ParseActivityTextInput = z.infer<typeof parseActivityTextSchema>;

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Type a question").max(500, "Keep it under 500 characters"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(12)
    .default([]),
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
