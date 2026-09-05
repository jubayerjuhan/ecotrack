export const EMISSION_CATEGORIES = ["TRANSPORT", "DIET", "ELECTRICITY"] as const;
export type EmissionCategory = (typeof EMISSION_CATEGORIES)[number];

export const GLOBAL_COUNTRY_CODE = "GLOBAL";
