import type { Config } from "tailwindcss";

// Trafy design tokens — pulled 1:1 from the existing marketing site.
// Do not introduce new accent colors, gradients, or glass effects here.
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#0D0B28", // page background (dark navy, not cream anymore)
          dim: "#14123A",     // secondary surface (e.g. sidebar wells)
        },
        ink: {
          DEFAULT: "#14123A", // elevated dark surfaces / dark-band sections
          soft: "#1f1b4d",
        },
        lime: {
          DEFAULT: "#4C56E8", // primary accent (indigo, matches trafy.ai)
          dim: "#6C74EF",     // hover/tint state
        },
        gray: {
          body: "rgba(255,255,255,0.65)",    // muted body copy on cream (now dark) bg
          bodyDark: "rgba(255,255,255,0.55)" // muted body copy on ink sections
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.12)", // hairline borders on cream (now dark) bg
          dark: "rgba(255,255,255,0.1)",     // hairline borders on ink sections
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["4.25rem", { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-md": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      borderRadius: {
        card: "22px",       // standard card radius (20-24px range)
        "card-sm": "16px",
        pill: "999px",      // buttons / eyebrow chips
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,11,11,0.04), 0 8px 24px rgba(11,11,11,0.04)",
        "soft-lg": "0 4px 8px rgba(11,11,11,0.04), 0 16px 40px rgba(11,11,11,0.06)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
