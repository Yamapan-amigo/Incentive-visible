import React, { memo } from "react";
import { COLORS } from "../../constants/colors";
import { createCardStyle, FONTS, ANIMATION_DELAYS } from "../../constants/styles";
import { getMarginColor, MARGIN_THRESHOLDS } from "../../utils/format";

interface MarginData {
  name: string;
  rate: number;
}

interface MarginBarsProps {
  data: MarginData[];
}

const MARGIN_LEGEND = [
  { label: `${MARGIN_THRESHOLDS.HIGH}%以上`, color: COLORS.orbit2 },
  { label: `${MARGIN_THRESHOLDS.MEDIUM}〜${MARGIN_THRESHOLDS.HIGH}%`, color: COLORS.sun2 },
  { label: `${MARGIN_THRESHOLDS.MEDIUM}%未満`, color: COLORS.sun3 },
] as const;

export const MarginBars: React.FC<MarginBarsProps> = memo(({ data }) => (
  <div style={createCardStyle(ANIMATION_DELAYS.MARGIN_BARS)}>
    <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
      粗利率分布
    </h3>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {data.map((d, i) => {
        const color = getMarginColor(d.rate);
        return (
          <div key={i} style={{ flex: "1 1 0", minWidth: 110 }}>
            <div
              style={{
                fontSize: 11,
                color: COLORS.textMuted,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {d.name}
            </div>
            <div
              style={{
                position: "relative",
                height: 32,
                background: "rgba(0,0,0,0.03)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.min(d.rate * 4, 100)}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                  borderRadius: 8,
                  transition: "width 1s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: FONTS.MONO,
                  }}
                >
                  {d.rate}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        display: "flex",
        gap: 18,
        marginTop: 12,
        fontSize: 10,
        color: COLORS.textMuted,
      }}
    >
      {MARGIN_LEGEND.map(({ label, color }) => (
        <span
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: color,
            }}
          />
          {label}
        </span>
      ))}
    </div>
  </div>
));

MarginBars.displayName = "MarginBars";
