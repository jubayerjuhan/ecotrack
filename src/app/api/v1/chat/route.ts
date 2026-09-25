export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { answerDataQuestion } from "@/lib/ai/chat";
import { handleRouteError } from "@/lib/api-handler";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { chatMessageSchema } from "@/lib/validation";

const CONTEXT_WINDOW_DAYS = 90;

export async function POST(req: Request) {
  try {
    const session = requireSession();
    const body = chatMessageSchema.parse(await req.json());

    const from = new Date();
    from.setDate(from.getDate() - CONTEXT_WINDOW_DAYS);

    const activities = await prisma.activityLog.findMany({
      where: { userId: session.sub, logDate: { gte: from } },
      orderBy: { logDate: "desc" },
    });

    const reply = await answerDataQuestion(body.message, body.history, activities);

    return NextResponse.json({ reply });
  } catch (err) {
    return handleRouteError(err);
  }
}
