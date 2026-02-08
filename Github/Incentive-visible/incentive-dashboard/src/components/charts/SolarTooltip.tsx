import React from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface SolarTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export const SolarTooltip: React.FC<SolarTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: COLORS.textMuted,
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: entry.color,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {entry.name}: {fmt(entry.value)}
        </div>
      ))}
    </div>
  );
};
