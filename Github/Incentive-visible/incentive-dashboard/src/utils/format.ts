import { COLORS } from "../constants/colors";

// Formatting utilities

/**
 * Format number as Japanese Yen
 */
export const fmt = (n: number): string => `¥${n.toLocaleString()}`;

/**
 * Format decimal as percentage
 */
export const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;

// Margin thresholds for color coding
export const MARGIN_THRESHOLDS = {
  HIGH: 15,
  MEDIUM: 8,
} as const;

/**
 * Get color based on margin rate
 */
export const getMarginColor = (rate: number): string => {
  if (rate > MARGIN_THRESHOLDS.HIGH) return COLORS.orbit2;
  if (rate > MARGIN_THRESHOLDS.MEDIUM) return COLORS.sun2;
  return COLORS.sun3;
};
