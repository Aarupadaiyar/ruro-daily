// Mirrors tailwind.config.ts — kept as plain JS for places Tailwind classes
// can't reach, like the HTML email digest template.
export const tokens = {
  color: {
    cream: "#FBFAF7",
    creamDim: "#F3F1EC",
    paper: "#FFFFFF",
    ink: "#1F1E1B",
    inkSoft: "#2E2D29",
    brand: "#2E5E5A",
    brandDim: "#3D7470",
    grayBody: "#5F5B53",
    border: "#E6E2DA",
  },
  radius: {
    card: "14px",
    pill: "999px",
  },
  font: {
    family: "'Inter', ui-sans-serif, system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
  },
} as const;
