# Solar Incentive Dashboard — Cursor セットアップガイド

## 1. プロジェクト作成

```bash
# Vite + React + TypeScript で作成
npm create vite@latest incentive-dashboard -- --template react-ts
cd incentive-dashboard
```

## 2. 必要パッケージのインストール

```bash
# UI・チャート関連
npm install recharts

# ルーティング（将来の拡張用）
npm install react-router-dom

# 日付操作
npm install date-fns

# （任意）Tailwind CSS を使う場合
npm install -D tailwindcss @tailwindcss/vite
```

## 3. 推奨ディレクトリ構成

```
incentive-dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # ヘッダー（太陽オーブ、フィルタ、ボタン）
│   │   │   └── CursorGlow.tsx      # カーソル追従グロー
│   │   ├── cards/
│   │   │   ├── KPICard.tsx         # 売上/仕入/粗利/インセンのカード
│   │   │   └── GoalRing.tsx        # 目標達成率リング
│   │   ├── charts/
│   │   │   ├── BarChartSection.tsx  # 要員別棒グラフ
│   │   │   ├── PieChartSection.tsx  # 顧客別円グラフ
│   │   │   └── MarginBars.tsx      # 粗利率バー
│   │   ├── table/
│   │   │   └── DetailTable.tsx     # 明細テーブル
│   │   ├── modals/
│   │   │   ├── AddDataModal.tsx    # データ追加モーダル
│   │   │   └── GoalModal.tsx       # 目標設定モーダル
│   │   └── decorations/
│   │       ├── SunOrb.tsx          # 太陽オーブ
│   │       └── StarField.tsx       # 背景パーティクル
│   ├── hooks/
│   │   └── useIncentiveData.ts     # データ管理カスタムフック
│   ├── types/
│   │   └── index.ts                # 型定義
│   ├── constants/
│   │   ├── colors.ts               # カラーパレット
│   │   └── initialData.ts          # 初期データ
│   ├── utils/
│   │   └── format.ts               # フォーマット関数（fmt, pct）
│   ├── App.tsx                      # メインコンポーネント
│   └── main.tsx                     # エントリーポイント
├── public/
├── package.json
└── tsconfig.json
```

## 4. 型定義（src/types/index.ts）

```typescript
export interface IncentiveEntry {
  id: number;
  name: string;        // 要員名
  sales: string;       // 営業担当
  affiliation: string; // 所属
  client: string;      // 案件顧客
  billing: number;     // 売上（単価）
  cost: number;        // 仕入（原価）
  incentiveTarget: number; // インセンティブ対象額
  month: string;       // 対象月 (YYYY-MM)
}

export interface Goals {
  billing: number;     // 売上目標
  profit: number;      // 粗利目標
  incentive: number;   // インセンティブ目標
}

export interface Stats {
  totalBilling: number;
  totalCost: number;
  totalProfit: number;
  totalIncentive: number;
  avgMargin: number;
  count: number;
}
```

## 5. カラー定数（src/constants/colors.ts）

```typescript
export const COLORS = {
  bg: "#faf9f7",
  card: "#ffffff",
  border: "rgba(0,0,0,0.06)",
  borderWarm: "rgba(251,146,60,0.15)",
  text: "#1a1a2e",
  textSub: "#4a4a68",
  textMuted: "#9ca3af",
  textDim: "#c4c4d4",

  // Solar
  sun1: "#fb923c",
  sun2: "#f59e0b",
  sun3: "#ef4444",

  // Space
  space1: "#6366f1",
  space2: "#818cf8",

  // Orbit
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
  "#fb923c", "#6366f1", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#a78bfa", "#fbbf24",
];
```

## 6. データ永続化（localStorage）

```typescript
// src/hooks/useIncentiveData.ts
import { useState, useEffect, useMemo } from "react";
import type { IncentiveEntry, Goals } from "../types";
import { INITIAL_DATA } from "../constants/initialData";

const STORAGE_KEYS = {
  DATA: "incentive-data",
  GOALS: "incentive-goals",
};

export function useIncentiveData() {
  const [data, setData] = useState<IncentiveEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DATA);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [goals, setGoals] = useState<Goals>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : {
      billing: 5000000,
      profit: 800000,
      incentive: 350000,
    };
  });

  // 自動保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  const addEntry = (entry: Omit<IncentiveEntry, "id">) => {
    setData((prev) => [...prev, { ...entry, id: Date.now() }]);
  };

  const deleteEntry = (id: number) => {
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  return { data, goals, setGoals, addEntry, deleteEntry };
}
```

## 7. Cursor での開発フロー

### Step 1: プロジェクト作成 → パッケージインストール
### Step 2: 型定義・定数ファイルを先に作成
### Step 3: Artifact の JSX を参考にコンポーネント分割
### Step 4: localStorage による永続化を組み込み
### Step 5: 動作確認 → デプロイ

## 8. Cursor への指示例（プロンプト）

Cursor に以下のようなプロンプトを渡すと効率的です：

```
このプロジェクトは SES 企業向けのインセンティブダッシュボードです。

デザインテーマ：
- 白基調（#faf9f7）で太陽・宇宙モチーフ
- オレンジグラデーション（#fb923c → #fbbf24）がアクセント
- カーソル追従グローエフェクト
- 背景に星パーティクルと太陽オーブ

主な機能：
1. KPIカード（売上/仕入/粗利/インセンティブ対象）
2. 目標達成率リング（SVG）
3. 棒グラフ（要員別）
4. ドーナツチャート（顧客別）
5. 粗利率バー
6. 明細テーブル
7. データ追加/削除
8. 目標設定モーダル
9. 営業担当フィルタ
10. localStorage 永続化

フォント：Noto Sans JP + Space Mono
チャートライブラリ：Recharts
```

## 9. 今後の拡張候補

- [ ] CSV / Excel インポート機能
- [ ] 月次切替（月を選択してデータを切り替え）
- [ ] 営業担当ごとの個別目標設定
- [ ] ダッシュボードの PDF エクスポート
- [ ] Supabase 等のバックエンド連携（複数人利用時）
- [ ] PWA 対応（モバイルでも使える）
