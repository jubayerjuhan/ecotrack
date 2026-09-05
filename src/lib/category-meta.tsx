import { Beef, Bus, Car, Drumstick, Leaf, Plane, Salad, TrainFront, Utensils, Zap, type LucideIcon } from "lucide-react";
import type { EmissionCategory } from "@/lib/validation";

export const CATEGORY_META: Record<EmissionCategory, { label: string; icon: LucideIcon }> = {
  TRANSPORT: { label: "Transport", icon: Car },
  DIET: { label: "Diet", icon: Utensils },
  ELECTRICITY: { label: "Electricity", icon: Zap },
};

const SUBTYPE_ICONS: Record<string, LucideIcon> = {
  car_petrol: Car,
  car_electric: Car,
  bus: Bus,
  train: TrainFront,
  flight_short_haul: Plane,
  flight_long_haul: Plane,
  beef_meal: Beef,
  chicken_meal: Drumstick,
  vegetarian_meal: Salad,
  vegan_meal: Leaf,
  grid_electricity: Zap,
};

const SUBTYPE_LABELS: Record<string, string> = {
  car_petrol: "Petrol car",
  car_electric: "Electric car",
  bus: "Bus",
  train: "Train",
  flight_short_haul: "Short-haul flight",
  flight_long_haul: "Long-haul flight",
  beef_meal: "Beef meal",
  chicken_meal: "Chicken meal",
  vegetarian_meal: "Vegetarian meal",
  vegan_meal: "Vegan meal",
  grid_electricity: "Grid electricity",
};

export function getSubtypeIcon(subtype: string): LucideIcon {
  return SUBTYPE_ICONS[subtype] ?? Zap;
}

export function getSubtypeLabel(subtype: string): string {
  return (
    SUBTYPE_LABELS[subtype] ??
    subtype
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ")
  );
}
