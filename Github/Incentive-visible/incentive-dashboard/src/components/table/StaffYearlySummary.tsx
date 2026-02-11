import React, { memo, useMemo } from "react";
import { COLORS } from "../../constants/colors";
import {
  createCardStyle,
  createIconBadgeStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  sectionSubtitleStyle,
  FONTS,
  ANIMATION_DELAYS,
} from "../../constants/styles";
import { fmt, pct, getMarginColor, calculateIncentive } from "../../utils/format";
import type { IncentiveEntry } from "../../types";

interface StaffYearlySummaryProps {
  data: IncentiveEntry[];
  selectedYear: string;
}

interface StaffSummary {
  name: string;
  totalBilling: number;
  totalCost: number;
  totalProfit: number;
  avgMargin: number;
  totalIncentive: number;
  monthCount: number;
}

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "right",
  fontSize: 13,
  fontFamily: FONTS.MONO,
  borderBottom: `1px solid ${COLORS.border}`,
};

const headerCellStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontWeight: 700,
  fontSize: 11,
  color: COLORS.textSub,
  textAlign: "center",
  background: "rgba(0,0,0,0.02)",
  fontFamily: FONTS.SANS_JP,
  borderBottom: `1px solid ${COLORS.border}`,
};

const nameCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "left",
  fontWeight: 700,
  fontFamily: FONTS.SANS_JP,
};

export const StaffYearlySummary: React.FC<StaffYearlySummaryProps> = memo(({
  data,
  selectedYear,
}) => {
  // Aggregate data by staff member
  // Incentive is calculated per month based on that month's profit
  const staffSummaries: StaffSummary[] = useMemo(() => {
    // First, group by staff and month to calculate per-month profit
    const staffMonthMap = new Map<string, Map<string, { billing: number; cost: number }>>();

    data.forEach((entry) => {
      if (!staffMonthMap.has(entry.name)) {
        staffMonthMap.set(entry.name, new Map());
      }
      const monthMap = staffMonthMap.get(entry.name)!;
      const existing = monthMap.get(entry.month);
      if (existing) {
        existing.billing += entry.billing;
        existing.cost += entry.cost;
      } else {
        monthMap.set(entry.month, {
          billing: entry.billing,
          cost: entry.cost,
        });
      }
    });

    // Convert to array and calculate derived values
    const summaries: StaffSummary[] = Array.from(staffMonthMap.entries()).map(
      ([name, monthMap]) => {
        let totalBilling = 0;
        let totalCost = 0;
        let totalIncentive = 0;

        // Calculate incentive per month based on that month's profit
        monthMap.forEach(({ billing, cost }) => {
          totalBilling += billing;
          totalCost += cost;
          const monthProfit = billing - cost;
          totalIncentive += calculateIncentive(monthProfit);
        });

        const totalProfit = totalBilling - totalCost;
        return {
          name,
          totalBilling,
          totalCost,
          totalProfit,
          avgMargin: totalBilling > 0 ? totalProfit / totalBilling : 0,
          totalIncentive,
          monthCount: monthMap.size,
        };
      }
    );

    // Sort by total profit (descending)
    return summaries.sort((a, b) => b.totalProfit - a.totalProfit);
  }, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    const billing = staffSummaries.reduce((a, s) => a + s.totalBilling, 0);
    const cost = staffSummaries.reduce((a, s) => a + s.totalCost, 0);
    const profit = billing - cost;
    const incentive = staffSummaries.reduce((a, s) => a + s.totalIncentive, 0);
    return {
      billing,
      cost,
      profit,
      margin: billing > 0 ? profit / billing : 0,
      incentive,
    };
  }, [staffSummaries]);

  if (staffSummaries.length === 0) {
    return null;
  }

  return (
    <div style={createCardStyle(ANIMATION_DELAYS.MARGIN_BARS)}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>
          <span style={createIconBadgeStyle(COLORS.gradFlare)}>
            👤
          </span>
          要員別 年間サマリー
        </h3>
        <span style={sectionSubtitleStyle}>
          {selectedYear}年 STAFF SUMMARY
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
              <th style={{ ...headerCellStyle, textAlign: "left" }}>要員名</th>
              <th style={headerCellStyle}>稼働月数</th>
              <th style={headerCellStyle}>年間売上</th>
              <th style={headerCellStyle}>年間仕入</th>
              <th style={headerCellStyle}>年間粗利</th>
              <th style={headerCellStyle}>平均粗利率</th>
              <th style={headerCellStyle}>年間インセン</th>
            </tr>
          </thead>
          <tbody>
            {staffSummaries.map((staff) => {
              const marginColor = getMarginColor(staff.avgMargin * 100);
              return (
                <tr
                  key={staff.name}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(251,146,60,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={nameCellStyle}>{staff.name}</td>
                  <td style={{ ...cellStyle, textAlign: "center", fontFamily: FONTS.SANS_JP }}>
                    <span
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        color: COLORS.space1,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {staff.monthCount}ヶ月
                    </span>
                  </td>
                  <td style={cellStyle}>{fmt(staff.totalBilling)}</td>
                  <td style={{ ...cellStyle, color: COLORS.textMuted }}>
                    {fmt(staff.totalCost)}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      fontWeight: 700,
                      color: staff.totalProfit > 500000 ? COLORS.space1 : COLORS.text,
                    }}
                  >
                    {fmt(staff.totalProfit)}
                  </td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: 6,
                        background: `${marginColor}15`,
                        color: marginColor,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {pct(staff.avgMargin)}
                    </span>
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      fontWeight: 800,
                      color: COLORS.sun1,
                    }}
                  >
                    {fmt(staff.totalIncentive)}
                  </td>
                </tr>
              );
            })}
            {/* Total Row */}
            <tr
              style={{
                background: "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(251,191,36,0.08))",
              }}
            >
              <td
                style={{
                  ...nameCellStyle,
                  fontWeight: 800,
                  borderBottom: "none",
                }}
              >
                合計 ({staffSummaries.length}名)
              </td>
              <td style={{ ...cellStyle, textAlign: "center", borderBottom: "none" }}>—</td>
              <td style={{ ...cellStyle, fontWeight: 700, borderBottom: "none" }}>
                {fmt(totals.billing)}
              </td>
              <td style={{ ...cellStyle, borderBottom: "none" }}>{fmt(totals.cost)}</td>
              <td style={{ ...cellStyle, fontWeight: 700, borderBottom: "none" }}>
                {fmt(totals.profit)}
              </td>
              <td style={{ ...cellStyle, borderBottom: "none" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: `${getMarginColor(totals.margin * 100)}15`,
                    color: getMarginColor(totals.margin * 100),
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {pct(totals.margin)}
                </span>
              </td>
              <td
                style={{
                  ...cellStyle,
                  fontWeight: 800,
                  color: COLORS.sun1,
                  borderBottom: "none",
                }}
              >
                {fmt(totals.incentive)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

StaffYearlySummary.displayName = "StaffYearlySummary";
