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

export type ViewMode = "monthly" | "yearly";

export interface MonthlyData {
  month: string;        // YYYY-MM format
  monthLabel: string;   // Display label (e.g., "1月")
  billing: number;
  cost: number;
  profit: number;
  incentive: number;
  count: number;
}

export interface ProfileSettings {
  salesPersons: string[];     // List of sales person names
  currentUser: string;        // Currently selected sales person
  goals: Goals;               // Monthly goals
  focusClients: string[];     // List of focus client names
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  salesPersons: ["岡田"],
  currentUser: "",
  goals: { billing: 5000000, profit: 800000, incentive: 350000 },
  focusClients: [],
};
