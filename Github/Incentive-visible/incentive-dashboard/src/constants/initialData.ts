import type { IncentiveEntry } from "../types";

export const INITIAL_DATA: IncentiveEntry[] = [
  { id: 1, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 740000, cost: 700000, incentiveTarget: 40000, month: "2025-12" },
  { id: 2, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 502500, cost: 472500, incentiveTarget: 30000, month: "2025-12" },
  { id: 3, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 650000, cost: 504000, incentiveTarget: 50000, month: "2025-12" },
  { id: 4, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 650000, cost: 500000, incentiveTarget: 50000, month: "2025-12" },
  { id: 5, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 850000, cost: 800000, incentiveTarget: 50000, month: "2025-12" },
  { id: 6, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 650000, cost: 520000, incentiveTarget: 50000, month: "2025-12" },
];

export const DEFAULT_GOALS = {
  billing: 5000000,
  profit: 800000,
  incentive: 350000,
};
