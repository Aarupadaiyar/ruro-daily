// Mirrors tailwind.config.ts — kept as plain JS for places Tailwind classes
// can't reach, like the HTML email digest template.
export const tokens = {
  color: {
    cream: "#0D0B28",
    creamDim: "#14123A",
    ink: "#14123A",
    inkSoft: "#1f1b4d",
    lime: "#4C56E8",
    limeDim: "#6C74EF",
    grayBody: "rgba(255,255,255,0.65)",
    border: "rgba(255,255,255,0.12)",
  },
  radius: {
    card: "22px",
    pill: "999px",
  },
  font: {
    family: "'Inter', ui-sans-serif, system-ui, sans-serif",
  },
} as const;
