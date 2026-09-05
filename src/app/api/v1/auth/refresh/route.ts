export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { issueSession } from "@/lib/auth/issue-session";
import { hashToken, verifyRefreshToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      throw new AppError(401, "Not authenticated");
    }

    let userId: string;
    try {
      userId = verifyRefreshToken(refreshToken).sub;
    } catch {
      throw new AppError(401, "Session expired, please log in again");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Reuse of a revoked/unknown refresh token can indicate theft —
      // revoke every session for this user as a precaution.
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      const res = NextResponse.json({ error: "Session expired, please log in again" }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(401, "Not authenticated");
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const tokens = await issueSession(user);

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, tokens);
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}
