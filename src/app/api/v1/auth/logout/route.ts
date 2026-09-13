export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    const res = NextResponse.json({ success: true });
    clearAuthCookies(res);
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}
