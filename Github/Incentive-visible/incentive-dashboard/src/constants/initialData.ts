import type { IncentiveEntry } from "../types";

// Sales persons list - add new sales persons here
export const SALES_PERSONS = ["岡田"] as const;
export type SalesPerson = (typeof SALES_PERSONS)[number];

export const INITIAL_DATA: IncentiveEntry[] = [
  // 2025-01 January
  { id: 101, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 700000, cost: 660000, incentiveTarget: 40000, month: "2025-01" },
  { id: 102, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 480000, cost: 450000, incentiveTarget: 30000, month: "2025-01" },
  { id: 103, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 620000, cost: 480000, incentiveTarget: 48000, month: "2025-01" },

  // 2025-02 February
  { id: 201, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 720000, cost: 680000, incentiveTarget: 40000, month: "2025-02" },
  { id: 202, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 490000, cost: 460000, incentiveTarget: 30000, month: "2025-02" },
  { id: 203, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 630000, cost: 485000, incentiveTarget: 48000, month: "2025-02" },

  // 2025-03 March
  { id: 301, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 730000, cost: 690000, incentiveTarget: 40000, month: "2025-03" },
  { id: 302, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 640000, cost: 495000, incentiveTarget: 50000, month: "2025-03" },
  { id: 303, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 820000, cost: 770000, incentiveTarget: 50000, month: "2025-03" },

  // 2025-04 April
  { id: 401, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 740000, cost: 700000, incentiveTarget: 40000, month: "2025-04" },
  { id: 402, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 500000, cost: 470000, incentiveTarget: 30000, month: "2025-04" },
  { id: 403, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 640000, cost: 510000, incentiveTarget: 50000, month: "2025-04" },

  // 2025-05 May
  { id: 501, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 650000, cost: 505000, incentiveTarget: 50000, month: "2025-05" },
  { id: 502, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 660000, cost: 510000, incentiveTarget: 50000, month: "2025-05" },
  { id: 503, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 840000, cost: 790000, incentiveTarget: 50000, month: "2025-05" },

  // 2025-06 June
  { id: 601, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 750000, cost: 710000, incentiveTarget: 40000, month: "2025-06" },
  { id: 602, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 510000, cost: 480000, incentiveTarget: 30000, month: "2025-06" },
  { id: 603, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 660000, cost: 530000, incentiveTarget: 50000, month: "2025-06" },

  // 2025-07 July
  { id: 701, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 660000, cost: 510000, incentiveTarget: 50000, month: "2025-07" },
  { id: 702, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 670000, cost: 520000, incentiveTarget: 50000, month: "2025-07" },

  // 2025-08 August
  { id: 801, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 760000, cost: 720000, incentiveTarget: 40000, month: "2025-08" },
  { id: 802, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 860000, cost: 810000, incentiveTarget: 50000, month: "2025-08" },

  // 2025-09 September
  { id: 901, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 520000, cost: 490000, incentiveTarget: 30000, month: "2025-09" },
  { id: 902, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 670000, cost: 520000, incentiveTarget: 50000, month: "2025-09" },
  { id: 903, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 680000, cost: 550000, incentiveTarget: 50000, month: "2025-09" },

  // 2025-10 October
  { id: 1001, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 770000, cost: 730000, incentiveTarget: 40000, month: "2025-10" },
  { id: 1002, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 680000, cost: 530000, incentiveTarget: 50000, month: "2025-10" },
  { id: 1003, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 870000, cost: 820000, incentiveTarget: 50000, month: "2025-10" },

  // 2025-11 November
  { id: 1101, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 530000, cost: 500000, incentiveTarget: 30000, month: "2025-11" },
  { id: 1102, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 680000, cost: 530000, incentiveTarget: 50000, month: "2025-11" },
  { id: 1103, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 690000, cost: 560000, incentiveTarget: 50000, month: "2025-11" },

  // 2025-12 December
  { id: 1, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 740000, cost: 700000, incentiveTarget: 40000, month: "2025-12" },
  { id: 2, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 502500, cost: 472500, incentiveTarget: 30000, month: "2025-12" },
  { id: 3, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 650000, cost: 504000, incentiveTarget: 50000, month: "2025-12" },
  { id: 4, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 650000, cost: 500000, incentiveTarget: 50000, month: "2025-12" },
  { id: 5, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 850000, cost: 800000, incentiveTarget: 50000, month: "2025-12" },
  { id: 6, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 650000, cost: 520000, incentiveTarget: 50000, month: "2025-12" },

  // ============ 2026年 ============

  // 2026-01 January
  { id: 2601, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 780000, cost: 740000, incentiveTarget: 40000, month: "2026-01" },
  { id: 2602, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 520000, cost: 490000, incentiveTarget: 30000, month: "2026-01" },
  { id: 2603, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 680000, cost: 530000, incentiveTarget: 50000, month: "2026-01" },
  { id: 2604, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 700000, cost: 540000, incentiveTarget: 55000, month: "2026-01" },

  // 2026-02 February
  { id: 2605, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 790000, cost: 750000, incentiveTarget: 40000, month: "2026-02" },
  { id: 2606, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 530000, cost: 500000, incentiveTarget: 30000, month: "2026-02" },
  { id: 2607, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 880000, cost: 830000, incentiveTarget: 50000, month: "2026-02" },
  { id: 2608, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 700000, cost: 560000, incentiveTarget: 50000, month: "2026-02" },

  // 2026-03 March
  { id: 2609, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 800000, cost: 760000, incentiveTarget: 40000, month: "2026-03" },
  { id: 2610, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 690000, cost: 540000, incentiveTarget: 50000, month: "2026-03" },
  { id: 2611, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 710000, cost: 550000, incentiveTarget: 55000, month: "2026-03" },
  { id: 2612, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 890000, cost: 840000, incentiveTarget: 50000, month: "2026-03" },

  // 2026-04 April
  { id: 2613, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 810000, cost: 770000, incentiveTarget: 40000, month: "2026-04" },
  { id: 2614, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 540000, cost: 510000, incentiveTarget: 30000, month: "2026-04" },
  { id: 2615, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 710000, cost: 570000, incentiveTarget: 50000, month: "2026-04" },

  // 2026-05 May
  { id: 2616, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 700000, cost: 550000, incentiveTarget: 50000, month: "2026-05" },
  { id: 2617, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 720000, cost: 560000, incentiveTarget: 55000, month: "2026-05" },
  { id: 2618, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 900000, cost: 850000, incentiveTarget: 50000, month: "2026-05" },

  // 2026-06 June
  { id: 2619, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 820000, cost: 780000, incentiveTarget: 40000, month: "2026-06" },
  { id: 2620, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 550000, cost: 520000, incentiveTarget: 30000, month: "2026-06" },
  { id: 2621, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 720000, cost: 580000, incentiveTarget: 50000, month: "2026-06" },

  // 2026-07 July
  { id: 2622, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 710000, cost: 560000, incentiveTarget: 50000, month: "2026-07" },
  { id: 2623, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 730000, cost: 570000, incentiveTarget: 55000, month: "2026-07" },

  // 2026-08 August
  { id: 2624, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 830000, cost: 790000, incentiveTarget: 40000, month: "2026-08" },
  { id: 2625, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 910000, cost: 860000, incentiveTarget: 50000, month: "2026-08" },

  // 2026-09 September
  { id: 2626, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 560000, cost: 530000, incentiveTarget: 30000, month: "2026-09" },
  { id: 2627, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 720000, cost: 570000, incentiveTarget: 50000, month: "2026-09" },
  { id: 2628, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 730000, cost: 590000, incentiveTarget: 50000, month: "2026-09" },

  // 2026-10 October
  { id: 2629, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 840000, cost: 800000, incentiveTarget: 40000, month: "2026-10" },
  { id: 2630, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 740000, cost: 580000, incentiveTarget: 55000, month: "2026-10" },
  { id: 2631, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 920000, cost: 870000, incentiveTarget: 50000, month: "2026-10" },

  // 2026-11 November
  { id: 2632, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 570000, cost: 540000, incentiveTarget: 30000, month: "2026-11" },
  { id: 2633, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 730000, cost: 580000, incentiveTarget: 50000, month: "2026-11" },
  { id: 2634, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 740000, cost: 600000, incentiveTarget: 50000, month: "2026-11" },

  // 2026-12 December
  { id: 2635, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 850000, cost: 810000, incentiveTarget: 40000, month: "2026-12" },
  { id: 2636, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 580000, cost: 550000, incentiveTarget: 30000, month: "2026-12" },
  { id: 2637, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 740000, cost: 590000, incentiveTarget: 50000, month: "2026-12" },
  { id: 2638, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 750000, cost: 590000, incentiveTarget: 55000, month: "2026-12" },
  { id: 2639, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 930000, cost: 880000, incentiveTarget: 50000, month: "2026-12" },
  { id: 2640, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 750000, cost: 610000, incentiveTarget: 50000, month: "2026-12" },
];

export const DEFAULT_GOALS = {
  billing: 5000000,
  profit: 800000,
  incentive: 350000,
};
