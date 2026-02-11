import { COLORS } from "../constants/colors";

// Formatting utilities

/**
 * Format number as Japanese Yen
 */
export const fmt = (n: number): string => `¥${n.toLocaleString()}`;

// Incentive calculation constants
export const INCENTIVE_CONFIG = {
  BASE_PROFIT: 500000,    // Base profit threshold (50万円)
  RATE: 0.20,             // 20% of excess profit
} as const;

/**
 * Calculate incentive based on profit
 * Formula: max(0, (profit - BASE_PROFIT)) * RATE
 * Example: profit = 1,000,000 => (1,000,000 - 500,000) * 0.20 = 100,000
 */
export const calculateIncentive = (profit: number): number => {
  const excessProfit = profit - INCENTIVE_CONFIG.BASE_PROFIT;
  if (excessProfit <= 0) return 0;
  return Math.round(excessProfit * INCENTIVE_CONFIG.RATE);
};

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
