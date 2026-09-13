import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

// Validated lazily, on first access of a property, rather than at module
// import time — Next.js imports route modules during the build itself
// (to determine static/dynamic rendering), so an eager parse() here would
// fail the build in any environment where these vars aren't set yet.
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: keyof Env) {
    cached ??= envSchema.parse(process.env);
    return cached[prop];
  },
});
