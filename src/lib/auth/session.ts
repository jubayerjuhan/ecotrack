import { cookies } from "next/headers";
import { AppError } from "@/lib/errors";
import { ACCESS_COOKIE } from "./cookies";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens";

export function getSession(): AccessTokenPayload | null {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/** Throws a 401 AppError when there's no valid session — use in any route handler that requires auth. */
export function requireSession(): AccessTokenPayload {
  const session = getSession();
  if (!session) {
    throw new AppError(401, "Not authenticated");
  }
  return session;
}
