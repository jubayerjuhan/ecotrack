export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { requireSession } from "@/lib/auth/session";
import { getPeriodRange } from "@/lib/date-range";
import { buildCategoryBreakdown, round2 } from "@/lib/emissions/aggregate";
import { prisma } from "@/lib/prisma";
import { searchParamsToObject } from "@/lib/query-params";
import { activitiesToCsv } from "@/lib/reports/csv";
import { reportsQuerySchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = requireSession();
    const query = reportsQuerySchema.parse(searchParamsToObject(new URL(req.url).searchParams));
    const { from, to } = getPeriodRange(query.period);

    const activities = await prisma.activityLog.findMany({
      where: { userId: session.sub, logDate: { gte: from, lte: to } },
      orderBy: { logDate: "asc" },
    });

    if (query.format === "csv") {
      const csv = activitiesToCsv(activities);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ecotrack-report-${query.period}.csv"`,
        },
      });
    }

    const totalEmissionsKg = round2(activities.reduce((sum, a) => sum + a.emissionsKg, 0));

    return NextResponse.json({
      period: query.period,
      range: { from, to },
      totalEmissionsKg,
      byCategory: buildCategoryBreakdown(activities),
      activities,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
