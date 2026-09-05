import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

export function handleRouteError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed", issues: err.flatten() }, { status: 400 });
  }

  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode });
  }

  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
