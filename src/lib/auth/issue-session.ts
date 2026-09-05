import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { parseDurationSeconds } from "./duration";
import { hashToken, signAccessToken, signRefreshToken } from "./tokens";
import type { User } from "@prisma/client";

/** Issues a fresh access+refresh token pair for a user and persists the refresh token's hash. */
export async function issueSession(user: Pick<User, "id" | "email">) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const { token: refreshToken } = signRefreshToken(user.id);

  const expiresAt = new Date(Date.now() + parseDurationSeconds(env.JWT_REFRESH_EXPIRES_IN) * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
