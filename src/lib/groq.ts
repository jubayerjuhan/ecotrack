import Groq from "groq-sdk";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __groq__: Groq | undefined;
}

// Lazily constructed on first use, not at module load — accessing `env.*`
// triggers full env validation (see src/lib/env.ts), and Next.js imports
// route modules during the build itself, before real env vars exist.
export function getGroqClient(): Groq {
  if (!global.__groq__) {
    global.__groq__ = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return global.__groq__;
}
