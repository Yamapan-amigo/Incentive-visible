import React, { memo, useMemo } from "react";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/styles";
import { fmt } from "../../utils/format";

interface GoalRingProps {
  current: number;
  goal: number;
  label: string;
  color: string;
}

const RING_RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const GoalRing: React.FC<GoalRingProps> = memo(({
  current,
  goal,
  label,
  color,
}) => {
  const ratio = useMemo(() =>
    goal > 0 ? Math.min(current / goal, 1) : 0,
    [current, goal]
  );

  const strokeDashoffset = useMemo(() =>
    CIRCUMFERENCE * (1 - ratio),
    [ratio]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: COLORS.text,
              fontFamily: FONTS.MONO,
            }}
          >
            {Math.round(ratio * 100)}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSub }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            fontFamily: FONTS.MONO,
            marginTop: 2,
          }}
        >
          {fmt(current)} / {fmt(goal)}
        </div>
      </div>
    </div>
  );
});

GoalRing.displayName = "GoalRing";
