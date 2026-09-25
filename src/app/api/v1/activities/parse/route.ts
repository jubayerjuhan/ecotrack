export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { parseActivityText } from "@/lib/ai/activity-parser";
import { handleRouteError } from "@/lib/api-handler";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { parseActivityTextSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    requireSession();
    const body = parseActivityTextSchema.parse(await req.json());

    const factors = await prisma.emissionFactor.findMany({
      select: { category: true, subtype: true, unit: true },
    });
    // One entry per distinct (category, subtype) — factors has one row per country.
    const seen = new Set<string>();
    const catalog = factors.filter((f) => {
      const key = `${f.category}:${f.subtype}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const activities = await parseActivityText(body.text, catalog);

    return NextResponse.json({ activities });
  } catch (err) {
    return handleRouteError(err);
  }
}
