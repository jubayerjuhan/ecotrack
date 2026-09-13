import type { EmissionCategory } from "@/lib/validation";

// Validated 3-slot categorical palette (dataviz skill): passes CVD + normal-vision
// separation and lightness/chroma gates for all pairs, light mode. Assigned in a
// fixed order — never cycled — so a category's color never shifts across views.
export const CATEGORY_COLORS: Record<EmissionCategory, string> = {
  TRANSPORT: "#2a78d6",
  DIET: "#eb6834",
  ELECTRICITY: "#1baf7a",
};
