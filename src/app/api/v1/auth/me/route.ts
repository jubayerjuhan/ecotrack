export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { requireSession } from "@/lib/auth/session";
import { serializeUser } from "@/lib/auth/serialize-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = requireSession();
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      throw new AppError(401, "Not authenticated");
    }
    return NextResponse.json({ user: serializeUser(user) });
  } catch (err) {
    return handleRouteError(err);
  }
}
