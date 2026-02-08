import React, { memo, useMemo } from "react";
import { COLORS } from "../../constants/colors";
import { FONTS, ANIMATION_DELAYS } from "../../constants/styles";
import { fmt, pct, getMarginColor } from "../../utils/format";
import type { IncentiveEntry } from "../../types";

interface DetailTableProps {
  data: IncentiveEntry[];
  onEdit: (entry: IncentiveEntry) => void;
  onDelete: (id: number) => void;
}

// Convert margin ratio to percentage for color lookup
const getMarginColorFromRatio = (margin: number): string => {
  return getMarginColor(margin * 100);
};

export const DetailTable: React.FC<DetailTableProps> = memo(({ data, onEdit, onDelete }) => {
  // Memoize computed row data
  const rowData = useMemo(() =>
    data.map(d => ({
      ...d,
      profit: d.billing - d.cost,
      margin: d.billing > 0 ? (d.billing - d.cost) / d.billing : 0,
    })),
    [data]
  );

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 18,
        border: `1px solid ${COLORS.border}`,
        boxShadow: COLORS.shadow,
        overflow: "hidden",
        animation: `riseUp 0.6s ease ${ANIMATION_DELAYS.DETAIL_TABLE}s both`,
      }}
    >
      <div
        style={{
          padding: "18px 28px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 700 }}>明細データ</h3>
        <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
          {data.length}件
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                borderBottom: `1px solid ${COLORS.border}`,
                background: "rgba(0,0,0,0.01)",
              }}
            >
              {[
                "要員名",
                "営業",
                "所属",
                "案件顧客",
                "売上",
                "仕入",
                "粗利",
                "粗利率",
                "インセン対象",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "10px 14px",
                    textAlign: i >= 4 ? "right" : "left",
                    color: COLORS.textMuted,
                    fontWeight: 600,
                    fontSize: 10.5,
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowData.map((d) => {
              const marginColor = getMarginColorFromRatio(d.margin);

              return (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(251,146,60,0.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                    {d.name}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        color: COLORS.space1,
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    >
                      {d.sales}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: COLORS.textSub,
                      fontSize: 11.5,
                    }}
                  >
                    {d.affiliation}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: COLORS.textSub,
                      fontSize: 11.5,
                    }}
                  >
                    {d.client}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      textAlign: "right",
                      fontFamily: FONTS.MONO,
                      fontWeight: 600,
                    }}
                  >
                    {fmt(d.billing)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      textAlign: "right",
                      fontFamily: FONTS.MONO,
                      color: COLORS.textMuted,
                    }}
                  >
                    {fmt(d.cost)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      textAlign: "right",
                      fontFamily: FONTS.MONO,
                      fontWeight: 700,
                      color: d.profit > 100000 ? COLORS.space1 : COLORS.text,
                    }}
                  >
                    {fmt(d.profit)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: FONTS.MONO,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: marginColor,
                      }}
                    >
                      {pct(d.margin)}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      textAlign: "right",
                      fontFamily: FONTS.MONO,
                      fontWeight: 800,
                      color: COLORS.sun1,
                    }}
                  >
                    {fmt(d.incentiveTarget)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => onEdit(d)}
                      title="編集"
                      style={{
                        background: "none",
                        border: "none",
                        color: COLORS.textDim,
                        cursor: "pointer",
                        fontSize: 13,
                        padding: 4,
                        marginRight: 4,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = COLORS.space1)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = COLORS.textDim)
                      }
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDelete(d.id)}
                      title="削除"
                      style={{
                        background: "none",
                        border: "none",
                        color: COLORS.textDim,
                        cursor: "pointer",
                        fontSize: 13,
                        padding: 4,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = COLORS.sun3)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = COLORS.textDim)
                      }
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

DetailTable.displayName = "DetailTable";
