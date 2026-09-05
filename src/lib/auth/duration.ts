const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

/** Parses a duration like "15m" or "30d" (used for both JWT expiresIn and cookie maxAge) into seconds. */
export function parseDurationSeconds(input: string): number {
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${input}"`);
  }
  const [, value, unit] = match;
  return Number(value) * UNIT_SECONDS[unit];
}
