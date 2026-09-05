export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { requireSession } from "@/lib/auth/session";
import { calculateEmissions } from "@/lib/emissions/calculate-emissions";
import { prisma } from "@/lib/prisma";
import { searchParamsToObject } from "@/lib/query-params";
import { activityQuerySchema, createActivitySchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = requireSession();
    const query = activityQuerySchema.parse(searchParamsToObject(new URL(req.url).searchParams));

    const where = {
      userId: session.sub,
      ...(query.category ? { category: query.category } : {}),
      ...(query.from || query.to
        ? {
            logDate: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { logDate: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 1,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = requireSession();
    const body = createActivitySchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      throw new AppError(401, "Not authenticated");
    }

    const { emissionsKg, unit } = await calculateEmissions({
      category: body.category,
      subtype: body.subtype,
      quantity: body.quantity,
      countryCode: user.countryCode,
    });

    const activity = await prisma.activityLog.create({
      data: {
        userId: user.id,
        category: body.category,
        subtype: body.subtype,
        quantity: body.quantity,
        unit,
        emissionsKg,
        logDate: body.logDate ?? new Date(),
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
