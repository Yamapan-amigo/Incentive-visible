// Formatting utilities

/**
 * Format number as Japanese Yen
 */
export const fmt = (n: number): string => `¥${n.toLocaleString()}`;

/**
 * Format decimal as percentage
 */
export const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
