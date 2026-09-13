export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    requireSession();

    const factors = await prisma.emissionFactor.findMany({
      orderBy: [{ category: "asc" }, { subtype: "asc" }],
    });

    return NextResponse.json({ factors });
  } catch (err) {
    return handleRouteError(err);
  }
}
