import React from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import type { IncentiveEntry } from "../../types";

interface MonthlyIncentiveTableProps {
  data: IncentiveEntry[];
}

interface MonthlyData {
  month: string;
  displayMonth: string;
  billing: number;
  cost: number;
  profit: number;
  incentive: number;
}

export const MonthlyIncentiveTable: React.FC<MonthlyIncentiveTableProps> = ({
  data,
}) => {
  // Group data by month and calculate totals
  const monthlyData: MonthlyData[] = React.useMemo(() => {
    const monthMap = new Map<string, MonthlyData>();

    data.forEach((entry) => {
      const existing = monthMap.get(entry.month);
      if (existing) {
        existing.billing += entry.billing;
        existing.cost += entry.cost;
        existing.profit += entry.billing - entry.cost;
        existing.incentive += entry.incentiveTarget;
      } else {
        const [year, month] = entry.month.split("-");
        monthMap.set(entry.month, {
          month: entry.month,
          displayMonth: `${year}年${parseInt(month, 10)}月`,
          billing: entry.billing,
          cost: entry.cost,
          profit: entry.billing - entry.cost,
          incentive: entry.incentiveTarget,
        });
      }
    });

    // Sort by month
    return Array.from(monthMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [data]);

  // Calculate yearly total
  const yearlyTotal = React.useMemo(() => {
    return monthlyData.reduce(
      (acc, m) => ({
        billing: acc.billing + m.billing,
        cost: acc.cost + m.cost,
        profit: acc.profit + m.profit,
        incentive: acc.incentive + m.incentive,
      }),
      { billing: 0, cost: 0, profit: 0, incentive: 0 }
    );
  }, [monthlyData]);

  const cellStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "right",
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    borderBottom: `1px solid ${COLORS.border}`,
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 700,
    fontSize: 11,
    color: COLORS.textSub,
    textAlign: "center",
    background: "rgba(0,0,0,0.02)",
    fontFamily: "'Noto Sans JP', sans-serif",
  };

  const monthCellStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: "left",
    fontWeight: 600,
    fontFamily: "'Noto Sans JP', sans-serif",
  };

  const totalRowStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 700,
    background: "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(251,191,36,0.08))",
    color: COLORS.text,
    borderBottom: "none",
  };

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 18,
        border: `1px solid ${COLORS.border}`,
        boxShadow: COLORS.shadow,
        padding: "22px 28px",
        marginBottom: 22,
        animation: "riseUp 0.6s ease 0.35s both",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background: COLORS.gradNebula,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
            }}
          >
            📅
          </span>
          月別インセンティブ
        </h3>
        <span
          style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 500 }}
        >
          MONTHLY BREAKDOWN
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, textAlign: "left" }}>月</th>
              <th style={headerCellStyle}>売上</th>
              <th style={headerCellStyle}>仕入</th>
              <th style={headerCellStyle}>粗利</th>
              <th style={headerCellStyle}>インセンティブ</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((m) => (
              <tr key={m.month}>
                <td style={monthCellStyle}>{m.displayMonth}</td>
                <td style={cellStyle}>{fmt(m.billing)}</td>
                <td style={cellStyle}>{fmt(m.cost)}</td>
                <td style={cellStyle}>{fmt(m.profit)}</td>
                <td style={{ ...cellStyle, color: COLORS.orbit1, fontWeight: 600 }}>
                  {fmt(m.incentive)}
                </td>
              </tr>
            ))}
            {/* Yearly Total Row */}
            <tr>
              <td style={{ ...totalRowStyle, textAlign: "left", fontFamily: "'Noto Sans JP', sans-serif" }}>
                🎯 年間合計
              </td>
              <td style={totalRowStyle}>{fmt(yearlyTotal.billing)}</td>
              <td style={totalRowStyle}>{fmt(yearlyTotal.cost)}</td>
              <td style={totalRowStyle}>{fmt(yearlyTotal.profit)}</td>
              <td style={{ ...totalRowStyle, color: COLORS.sun1 }}>
                {fmt(yearlyTotal.incentive)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
