import type { EmissionCategory } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export type CalculateEmissionsInput = {
  category: EmissionCategory;
  subtype: string;
  quantity: number;
  /** The user's country — a country-specific factor is preferred, falling back to the GLOBAL row. */
  countryCode: string;
};

export type CalculateEmissionsResult = {
  emissionsKg: number;
  unit: string;
  factorId: string;
};

/**
 * The single source of truth for turning a logged quantity into kg CO2e.
 * Isolated here (rather than inline in route handlers) because this is the
 * part of the app most likely to grow — more categories, more countries,
 * eventually per-factor versioning.
 */
export async function calculateEmissions({
  category,
  subtype,
  quantity,
  countryCode,
}: CalculateEmissionsInput): Promise<CalculateEmissionsResult> {
  const countrySpecific = await prisma.emissionFactor.findFirst({
    where: { category, subtype, countryCode },
  });

  const factor =
    countrySpecific ??
    (await prisma.emissionFactor.findFirst({
      where: { category, subtype, countryCode: null },
    }));

  if (!factor) {
    throw new AppError(422, `No emission factor is configured for ${category}/${subtype}`);
  }

  return {
    emissionsKg: quantity * factor.factorValue,
    unit: factor.unit,
    factorId: factor.id,
  };
}
