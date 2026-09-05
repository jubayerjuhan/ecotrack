import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Sustainability palette: deep teal primary, moss green accent,
        // warm neutral background — avoids the generic "startup green" cliche.
        brand: {
          50: "#eefaf6",
          100: "#d6f1e7",
          200: "#aee3d0",
          300: "#7ccdb5",
          400: "#48b096",
          500: "#2c937c",
          600: "#217664",
          700: "#1e5f53",
          800: "#1c4c44",
          900: "#193f39",
          950: "#0a2320",
        },
        moss: {
          400: "#a3b566",
          500: "#87994f",
          600: "#6a7a3c",
        },
        sand: {
          50: "#faf8f3",
          100: "#f4efe4",
          200: "#e8dfcb",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.35rem" }],
        base: ["1rem", { lineHeight: "1.55rem" }],
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.375rem", { lineHeight: "1.85rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.15rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.6rem" }],
      },
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        18: "4.5rem",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(10 35 32 / 0.06), 0 1px 8px -2px rgb(10 35 32 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
