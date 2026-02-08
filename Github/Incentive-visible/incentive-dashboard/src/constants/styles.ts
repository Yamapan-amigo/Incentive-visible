import { COLORS } from "./colors";
import type { CSSProperties } from "react";

// Font constants
export const FONTS = {
  MONO: "'Space Mono', monospace",
  SANS_JP: "'Noto Sans JP', sans-serif",
} as const;

// Spacing system
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  CARD: 28,
  SECTION: 32,
} as const;

// Animation delays for consistent ordering
export const ANIMATION_DELAYS = {
  GOAL_SUMMARY: 0.1,
  KPI_CARDS: [0, 0.05, 0.1, 0.15],
  GOAL_PROGRESS: 0.2,
  BAR_CHART: 0.25,
  PIE_CHART: 0.3,
  MARGIN_BARS: 0.35,
  MONTHLY_TABLE: 0.4,
  DETAIL_TABLE: 0.45,
} as const;

// Create card container style with animation delay
export const createCardStyle = (animationDelay: number): CSSProperties => ({
  background: COLORS.card,
  borderRadius: 18,
  border: `1px solid ${COLORS.border}`,
  boxShadow: COLORS.shadow,
  padding: `${SPACING.XXL - 2}px ${SPACING.CARD}px`,
  marginBottom: SPACING.XXL - 2,
  animation: `riseUp 0.6s ease ${animationDelay}s both`,
});

// Section header style
export const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: SPACING.XL,
};

// Section title style
export const sectionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: SPACING.SM,
};

// Section subtitle style
export const sectionSubtitleStyle: CSSProperties = {
  fontSize: 10,
  color: COLORS.textMuted,
  fontWeight: 500,
};

// Icon badge style
export const createIconBadgeStyle = (gradient: string): CSSProperties => ({
  width: 18,
  height: 18,
  borderRadius: 6,
  background: gradient,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
});

// Table styles
export const tableStyles = {
  container: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  headerCell: {
    padding: `${SPACING.MD}px ${SPACING.LG}px`,
    textAlign: "center" as const,
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.textSub,
    background: "rgba(0,0,0,0.02)",
    fontFamily: FONTS.SANS_JP,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  cell: {
    padding: `${SPACING.MD}px ${SPACING.LG}px`,
    textAlign: "right" as const,
    fontSize: 13,
    fontFamily: FONTS.MONO,
    borderBottom: `1px solid ${COLORS.border}`,
  },
};
