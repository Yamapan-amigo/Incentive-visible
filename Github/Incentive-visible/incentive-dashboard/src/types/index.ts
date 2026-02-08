// Type definitions for the Solar Incentive Dashboard

export interface IncentiveEntry {
  id: number;
  name: string;        // Staff member name
  sales: string;       // Sales representative
  affiliation: string; // Affiliation / Company
  client: string;      // Client company
  billing: number;     // Billing amount (unit price)
  cost: number;        // Cost (purchase price)
  incentiveTarget: number; // Incentive target amount
  month: string;       // Target month (YYYY-MM)
}

export interface Goals {
  billing: number;     // Sales goal
  profit: number;      // Profit goal
  incentive: number;   // Incentive goal
}

export interface Stats {
  totalBilling: number;
  totalCost: number;
  totalProfit: number;
  totalIncentive: number;
  avgMargin: number;
  count: number;
}

export interface NewEntry {
  name: string;
  sales: string;
  affiliation: string;
  client: string;
  billing: string;
  cost: string;
  incentiveTarget: string;
  month: string;
}
