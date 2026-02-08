import React, { memo, useCallback } from "react";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/styles";

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  icon: string;
  delay: number;
}

export const KPICard: React.FC<KPICardProps> = memo(({
  label,
  value,
  sub,
  gradient,
  icon,
  delay,
}) => {
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow = COLORS.shadowHover;
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = COLORS.shadow;
  }, []);

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 18,
        padding: "22px 24px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: COLORS.shadow,
        position: "relative",
        overflow: "hidden",
        animation: `riseUp 0.6s ease ${delay}s both`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: "default",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top gradient bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: gradient,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.textMuted,
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: COLORS.text,
              fontFamily: FONTS.MONO,
              letterSpacing: "-0.03em",
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {sub}
            </div>
          )}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: gradient,
            opacity: 0.12,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ position: "absolute", fontSize: 20 }}>{icon}</span>
        </div>
      </div>
    </div>
  );
});

KPICard.displayName = "KPICard";
