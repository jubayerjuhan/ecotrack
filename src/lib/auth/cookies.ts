import type { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { parseDurationSeconds } from "./duration";

export const ACCESS_COOKIE = "ecotrack_access";
export const REFRESH_COOKIE = "ecotrack_refresh";

const isProd = process.env.NODE_ENV === "production";

// Refresh cookie is scoped to the auth routes only, so it's never sent
// (or exposed to other route handlers) outside of login/refresh/logout.
const REFRESH_COOKIE_PATH = "/api/v1/auth";

export function setAuthCookies(res: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: parseDurationSeconds(env.JWT_ACCESS_EXPIRES_IN),
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: parseDurationSeconds(env.JWT_REFRESH_EXPIRES_IN),
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
}
