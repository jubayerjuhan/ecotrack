import { PrismaClient, EmissionCategory } from "@prisma/client";

const prisma = new PrismaClient();

type FactorSeed = {
  category: EmissionCategory;
  subtype: string;
  countryCode: string | null;
  factorValue: number;
  unit: string;
  source: string;
};

const factors: FactorSeed[] = [
  // Transport (kg CO2e per km) — global averages, not country-specific.
  { category: "TRANSPORT", subtype: "car_petrol", countryCode: null, factorValue: 0.192, unit: "km", source: "DEFRA 2024" },
  { category: "TRANSPORT", subtype: "car_electric", countryCode: null, factorValue: 0.053, unit: "km", source: "DEFRA 2024" },
  { category: "TRANSPORT", subtype: "bus", countryCode: null, factorValue: 0.105, unit: "km", source: "DEFRA 2024" },
  { category: "TRANSPORT", subtype: "train", countryCode: null, factorValue: 0.041, unit: "km", source: "DEFRA 2024" },
  { category: "TRANSPORT", subtype: "flight_short_haul", countryCode: null, factorValue: 0.151, unit: "km", source: "DEFRA 2024" },
  { category: "TRANSPORT", subtype: "flight_long_haul", countryCode: null, factorValue: 0.148, unit: "km", source: "DEFRA 2024" },

  // Diet (kg CO2e per meal) — global averages.
  { category: "DIET", subtype: "beef_meal", countryCode: null, factorValue: 6.61, unit: "meal", source: "Poore & Nemecek 2018" },
  { category: "DIET", subtype: "chicken_meal", countryCode: null, factorValue: 1.5, unit: "meal", source: "Poore & Nemecek 2018" },
  { category: "DIET", subtype: "vegetarian_meal", countryCode: null, factorValue: 0.7, unit: "meal", source: "Poore & Nemecek 2018" },
  { category: "DIET", subtype: "vegan_meal", countryCode: null, factorValue: 0.5, unit: "meal", source: "Poore & Nemecek 2018" },

  // Electricity (kg CO2e per kWh) — grid carbon intensity varies a lot by
  // country, so this is the category most worth per-country factors.
  { category: "ELECTRICITY", subtype: "grid_electricity", countryCode: "US", factorValue: 0.386, unit: "kWh", source: "EPA eGRID 2023" },
  { category: "ELECTRICITY", subtype: "grid_electricity", countryCode: "GB", factorValue: 0.207, unit: "kWh", source: "UK BEIS/DEFRA 2024" },
  { category: "ELECTRICITY", subtype: "grid_electricity", countryCode: "IN", factorValue: 0.708, unit: "kWh", source: "CEA India 2023" },
  { category: "ELECTRICITY", subtype: "grid_electricity", countryCode: "AU", factorValue: 0.66, unit: "kWh", source: "Australia NGA 2024" },
  { category: "ELECTRICITY", subtype: "grid_electricity", countryCode: "BD", factorValue: 0.51, unit: "kWh", source: "IGES/Bangladesh PDB 2023" },
  { category: "ELECTRICITY", subtype: "grid_electricity", countryCode: null, factorValue: 0.475, unit: "kWh", source: "IEA World Average 2023" },
];

async function main() {
  // Not a plain upsert(): Prisma's generated compound-unique type for Mongo
  // doesn't accept `null` for the nullable countryCode field, so the GLOBAL
  // rows can't be looked up that way. Find-then-create/update instead.
  for (const factor of factors) {
    const existing = await prisma.emissionFactor.findFirst({
      where: {
        category: factor.category,
        subtype: factor.subtype,
        countryCode: factor.countryCode,
      },
    });

    if (existing) {
      await prisma.emissionFactor.update({ where: { id: existing.id }, data: factor });
    } else {
      await prisma.emissionFactor.create({ data: factor });
    }
  }
  console.log(`Seeded ${factors.length} emission factors.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
