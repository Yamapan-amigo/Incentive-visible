import React from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import type { Goals } from "../../types";

interface GoalSummaryProps {
  goals: Goals;
}

interface GoalItemProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const GoalItem: React.FC<GoalItemProps> = ({ label, value, icon, color }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "20px 32px",
      background: `linear-gradient(135deg, ${color}10, ${color}05)`,
      borderRadius: 16,
      border: `1px solid ${color}20`,
      minWidth: 200,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.textSub,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </div>
    <div
      style={{
        fontSize: 28,
        fontWeight: 800,
        fontFamily: "'Space Mono', monospace",
        color: COLORS.text,
        letterSpacing: "-0.02em",
      }}
    >
      {fmt(value)}
    </div>
  </div>
);

export const GoalSummary: React.FC<GoalSummaryProps> = ({ goals }) => {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 20,
        border: `1px solid ${COLORS.border}`,
        boxShadow: COLORS.shadow,
        padding: "28px 32px",
        marginBottom: 22,
        animation: "riseUp 0.6s ease 0.1s both",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              background: COLORS.gradSun,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            🎯
          </span>
          月次目標
        </h2>
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          MONTHLY GOALS
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <GoalItem
          label="売上目標"
          value={goals.billing}
          icon="☀️"
          color={COLORS.sun1}
        />
        <GoalItem
          label="粗利目標"
          value={goals.profit}
          icon="🔥"
          color={COLORS.space1}
        />
        <GoalItem
          label="インセンティブ目標"
          value={goals.incentive}
          icon="💫"
          color={COLORS.orbit1}
        />
      </div>
    </div>
  );
};
