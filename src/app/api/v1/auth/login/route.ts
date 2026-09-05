export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { setAuthCookies } from "@/lib/auth/cookies";
import { issueSession } from "@/lib/auth/issue-session";
import { verifyPassword } from "@/lib/auth/password";
import { serializeUser } from "@/lib/auth/serialize-user";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new AppError(401, "Invalid email or password");
    }

    const tokens = await issueSession(user);

    const res = NextResponse.json({ user: serializeUser(user) });
    setAuthCookies(res, tokens);
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}
