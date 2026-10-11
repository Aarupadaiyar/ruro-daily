import type { Config } from "tailwindcss";

// Ruro Daily design tokens: a light "newspaper" reading theme.
// Warm paper background, soft-black ink, and muted accents only — built for
// long, comfortable reading. Mirror any change in src/styles/design-tokens.ts
// (used by the HTML email template).
//
// Token names are semantic, not literal:
//   cream  = page background (paper)       ink    = primary text / dark surfaces
//   brand  = the single muted accent        pillar = AI / Tech / Finance hues
// Display sizes are fluid (clamp) so headlines scale down cleanly on phones.
// The admin panel keeps dark `bg-ink` surfaces, which is what `gray.bodyDark`
// and `border.dark` are for.
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBFAF7", // page background (warm paper)
          dim: "#F3F1EC",     // secondary surface (bands, wells)
        },
        paper: "#FFFFFF",     // cards
        ink: {
          DEFAULT: "#1F1E1B", // primary text + dark surfaces (admin)
          soft: "#2E2D29",
        },
        brand: {
          DEFAULT: "#2E5E5A", // muted deep teal — links, active states, buttons
          dim: "#3D7470",     // hover
          tint: "#E7EFEE",    // very light wash for highlights
          fg: "#FFFFFF",      // text on top of brand
        },
        pillar: {
          ai: "#6E5A9E",      // muted violet
          tech: "#3D6A99",    // muted blue
          finance: "#3C7A55", // muted green
        },
        gray: {
          body: "#5F5B53",                   // muted body copy on paper (≈6.5:1)
          bodyDark: "rgba(255,255,255,0.6)", // muted copy on dark admin surfaces
        },
        border: {
          DEFAULT: "#E6E2DA",                // hairlines on paper
          dark: "rgba(255,255,255,0.1)",     // hairlines on dark admin surfaces
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "ui-serif", "serif"],
        logo: ["var(--font-logo)", "Georgia", "serif"],
      },
      fontSize: {
        "display-lg": ["clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem)", { lineHeight: "1.06", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-md": ["clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "600" }],
        "display-sm": ["clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      borderRadius: {
        card: "14px",
        "card-sm": "10px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,30,27,0.04), 0 4px 16px rgba(31,30,27,0.04)",
        "soft-lg": "0 2px 6px rgba(31,30,27,0.05), 0 12px 32px rgba(31,30,27,0.07)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
