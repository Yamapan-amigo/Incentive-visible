import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS } from "../../constants/colors";
import type { MonthlyData } from "../../types";

interface MonthlyTrendChartProps {
  data: MonthlyData[];
  selectedYear: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.98)",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: COLORS.text }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            fontSize: 11,
            color: entry.color,
            margin: "4px 0",
            fontWeight: 500,
          }}
        >
          {entry.name}: ¥{entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = React.memo(
  ({ data, selectedYear }) => {
    // Check if there's any data
    const hasData = data.some((d) => d.billing > 0 || d.profit > 0 || d.incentive > 0);

    return (
      <div
        style={{
          background: COLORS.card,
          borderRadius: 18,
          border: `1px solid ${COLORS.border}`,
          boxShadow: COLORS.shadow,
          padding: "22px 18px 14px",
          marginBottom: 22,
          animation: "riseUp 0.6s ease 0.2s both",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            padding: "0 8px",
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
            📈 月別推移 — {selectedYear}年
          </h3>
          <span
            style={{
              fontSize: 10,
              color: COLORS.textMuted,
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}
          >
            MONTHLY TREND
          </span>
        </div>

        {!hasData ? (
          <div
            style={{
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.textDim,
              fontSize: 13,
            }}
          >
            {selectedYear}年のデータがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: COLORS.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: COLORS.textDim }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  paddingTop: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="billing"
                name="売上"
                stroke={COLORS.sun1}
                strokeWidth={2.5}
                dot={{ fill: COLORS.sun1, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.sun1, strokeWidth: 2, fill: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="粗利"
                stroke={COLORS.space1}
                strokeWidth={2.5}
                dot={{ fill: COLORS.space1, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.space1, strokeWidth: 2, fill: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="incentive"
                name="インセン"
                stroke={COLORS.orbit1}
                strokeWidth={2.5}
                dot={{ fill: COLORS.orbit1, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.orbit1, strokeWidth: 2, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }
);

MonthlyTrendChart.displayName = "MonthlyTrendChart";
