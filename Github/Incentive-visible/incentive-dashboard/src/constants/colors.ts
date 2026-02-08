// Solar color palette for the dashboard

export const COLORS = {
  // Base colors
  bg: "#faf9f7",
  card: "#ffffff",
  border: "rgba(0,0,0,0.06)",
  borderWarm: "rgba(251,146,60,0.15)",

  // Text colors
  text: "#1a1a2e",
  textSub: "#4a4a68",
  textMuted: "#9ca3af",
  textDim: "#c4c4d4",

  // Solar colors
  sun1: "#fb923c",
  sun2: "#f59e0b",
  sun3: "#ef4444",

  // Space colors
  space1: "#6366f1",
  space2: "#818cf8",

  // Orbit colors
  orbit1: "#06b6d4",
  orbit2: "#10b981",

  // Gradients
  gradSun: "linear-gradient(135deg, #fb923c 0%, #f59e0b 50%, #fbbf24 100%)",
  gradFlare: "linear-gradient(135deg, #ef4444 0%, #fb923c 50%, #fbbf24 100%)",
  gradCosmic: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
  gradNebula: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",

  // Shadows
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
  shadowHover: "0 4px 20px rgba(251,146,60,0.12), 0 8px 32px rgba(0,0,0,0.06)",
} as const;

export const CHART_COLORS = [
  "#fb923c",
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#fbbf24",
];

export type Colors = typeof COLORS;
