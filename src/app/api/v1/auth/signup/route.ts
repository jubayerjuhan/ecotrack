export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { setAuthCookies } from "@/lib/auth/cookies";
import { issueSession } from "@/lib/auth/issue-session";
import { hashPassword } from "@/lib/auth/password";
import { serializeUser } from "@/lib/auth/serialize-user";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = signupSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        countryCode: body.countryCode,
      },
    });

    const tokens = await issueSession(user);

    const res = NextResponse.json({ user: serializeUser(user) }, { status: 201 });
    setAuthCookies(res, tokens);
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}
