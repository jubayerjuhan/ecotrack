export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { generateDashboardInsight } from "@/lib/ai/dashboard-insight";
import { handleRouteError } from "@/lib/api-handler";
import { requireSession } from "@/lib/auth/session";
import { getPeriodRange } from "@/lib/date-range";
import { buildCategoryBreakdown, round2 } from "@/lib/emissions/aggregate";
import { prisma } from "@/lib/prisma";
import { searchParamsToObject } from "@/lib/query-params";
import { dashboardQuerySchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = requireSession();
    const query = dashboardQuerySchema.parse(searchParamsToObject(new URL(req.url).searchParams));
    const { from, to } = getPeriodRange(query.period);

    const activities = await prisma.activityLog.findMany({
      where: { userId: session.sub, logDate: { gte: from, lte: to } },
    });

    const totalEmissionsKg = round2(activities.reduce((sum, a) => sum + a.emissionsKg, 0));

    // Nothing to summarize — skip the Groq call entirely rather than asking
    // the model to comment on an empty dataset.
    if (totalEmissionsKg === 0) {
      return NextResponse.json({ insight: null });
    }

    const insight = await generateDashboardInsight({
      period: query.period,
      totalEmissionsKg,
      byCategory: buildCategoryBreakdown(activities),
    });

    return NextResponse.json({ insight });
  } catch (err) {
    return handleRouteError(err);
  }
}
