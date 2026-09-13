export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { requireSession } from "@/lib/auth/session";
import { getPeriodRange } from "@/lib/date-range";
import { buildCategoryBreakdown, buildDailyTrend, round2 } from "@/lib/emissions/aggregate";
import { prisma } from "@/lib/prisma";
import { searchParamsToObject } from "@/lib/query-params";
import { dashboardQuerySchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = requireSession();
    const query = dashboardQuerySchema.parse(searchParamsToObject(new URL(req.url).searchParams));
    const { from, to, days } = getPeriodRange(query.period);

    const activities = await prisma.activityLog.findMany({
      where: { userId: session.sub, logDate: { gte: from, lte: to } },
    });

    const totalEmissionsKg = round2(activities.reduce((sum, a) => sum + a.emissionsKg, 0));

    return NextResponse.json({
      period: query.period,
      range: { from, to },
      totalEmissionsKg,
      trend: buildDailyTrend(activities, from, days),
      byCategory: buildCategoryBreakdown(activities),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
