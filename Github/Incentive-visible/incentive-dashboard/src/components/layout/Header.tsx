import React from "react";
import { COLORS } from "../../constants/colors";
import { SunOrb } from "../decorations/SunOrb";
import type { ViewMode } from "../../types";

interface HeaderProps {
  salesPersons: string[];
  selectedSales: string;
  onSelectSales: (sales: string) => void;
  onOpenGoalModal: () => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableYears: string[];
}

const buttonBaseStyle: React.CSSProperties = {
  padding: "7px 16px",
  fontSize: 12,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.2s",
};

export const Header: React.FC<HeaderProps> = ({
  salesPersons,
  selectedSales,
  onSelectSales,
  onOpenGoalModal,
  onOpenAddModal,
  onOpenSettingsModal,
  viewMode,
  onViewModeChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  availableYears,
}) => {
  // Generate subtitle based on view mode
  const getSubtitle = () => {
    if (viewMode === "yearly") {
      return `${selectedYear}年 年間`;
    }
    const [year, month] = selectedMonth.split("-");
    return `${year}年${parseInt(month)}月`;
  };

  // Generate month options for selected year
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return { value: `${selectedYear}-${month}`, label: `${i + 1}月` };
  });

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        padding: "24px 40px 18px",
        borderBottom: `1px solid ${COLORS.border}`,
        background:
          "linear-gradient(180deg, rgba(253,230,138,0.06) 0%, transparent 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        {/* Logo and title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SunOrb size={36} />
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              インセンティブ ダッシュボード
            </h1>
            <p
              style={{
                fontSize: 11,
                color: COLORS.textMuted,
                fontWeight: 500,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              SOLAR INCENTIVE TRACKER — {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
        >
          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              background: COLORS.card,
              borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
              overflow: "hidden",
              boxShadow: COLORS.shadow,
            }}
          >
            {(["yearly", "monthly"] as ViewMode[]).map((mode, i) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                style={{
                  ...buttonBaseStyle,
                  borderLeft: i > 0 ? `1px solid ${COLORS.border}` : "none",
                  background: viewMode === mode ? COLORS.gradCosmic : "transparent",
                  color: viewMode === mode ? "#fff" : COLORS.textMuted,
                }}
              >
                {mode === "yearly" ? "📅 年間" : "📆 月別"}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            style={{
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.text,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {availableYears.length > 0 ? (
              availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))
            ) : (
              <option value={selectedYear}>{selectedYear}年</option>
            )}
          </select>

          {/* Month selector (only in monthly view) */}
          {viewMode === "monthly" && (
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              style={{
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                background: COLORS.card,
                color: COLORS.text,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Sales filter */}
          <div
            style={{
              display: "flex",
              background: COLORS.card,
              borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
              overflow: "hidden",
              boxShadow: COLORS.shadow,
            }}
          >
            {["all", ...salesPersons].map((v, i) => (
              <button
                key={v}
                onClick={() => onSelectSales(v)}
                style={{
                  ...buttonBaseStyle,
                  borderLeft: i > 0 ? `1px solid ${COLORS.border}` : "none",
                  background: selectedSales === v ? COLORS.gradSun : "transparent",
                  color: selectedSales === v ? "#fff" : COLORS.textMuted,
                }}
              >
                {v === "all" ? "全体" : v}
              </button>
            ))}
          </div>

          {/* Goal button */}
          <button
            onClick={onOpenGoalModal}
            style={{
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${COLORS.borderWarm}`,
              borderRadius: 12,
              cursor: "pointer",
              background: "rgba(251,146,60,0.06)",
              color: COLORS.sun1,
              fontFamily: "inherit",
            }}
          >
            🎯 目標設定
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettingsModal}
            style={{
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              cursor: "pointer",
              background: COLORS.card,
              color: COLORS.textMuted,
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            設定
          </button>

          {/* Add data button */}
          <button
            onClick={onOpenAddModal}
            style={{
              padding: "7px 20px",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              background: COLORS.gradSun,
              color: "#fff",
              fontFamily: "inherit",
              boxShadow: "0 2px 12px rgba(251,146,60,0.25)",
            }}
          >
            ＋ データ追加
          </button>
        </div>
      </div>
    </div>
  );
};
