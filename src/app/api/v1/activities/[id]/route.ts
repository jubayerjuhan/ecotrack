export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { requireSession } from "@/lib/auth/session";
import { calculateEmissions } from "@/lib/emissions/calculate-emissions";
import { prisma } from "@/lib/prisma";
import { updateActivitySchema } from "@/lib/validation";

async function getOwnedActivity(id: string, userId: string) {
  const activity = await prisma.activityLog.findUnique({ where: { id } });
  if (!activity || activity.userId !== userId) {
    throw new AppError(404, "Activity not found");
  }
  return activity;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = requireSession();
    const body = updateActivitySchema.parse(await req.json());

    const existing = await getOwnedActivity(params.id, session.sub);
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      throw new AppError(401, "Not authenticated");
    }

    const category = body.category ?? existing.category;
    const subtype = body.subtype ?? existing.subtype;
    const quantity = body.quantity ?? existing.quantity;
    const logDate = body.logDate ?? existing.logDate;

    const { emissionsKg, unit } = await calculateEmissions({
      category,
      subtype,
      quantity,
      countryCode: user.countryCode,
    });

    const activity = await prisma.activityLog.update({
      where: { id: existing.id },
      data: { category, subtype, quantity, unit, emissionsKg, logDate },
    });

    return NextResponse.json({ activity });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = requireSession();
    const existing = await getOwnedActivity(params.id, session.sub);

    await prisma.activityLog.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
