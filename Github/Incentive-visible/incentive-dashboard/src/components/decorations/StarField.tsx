import React, { useMemo } from "react";
import { COLORS } from "../../constants/colors";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  opacity: number;
}

export const StarField: React.FC = () => {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.2 + 0.8,
        dur: Math.random() * 4 + 3,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.2 + 0.04,
      })),
    []
  );

  const getStarColor = (id: number): string => {
    if (id % 3 === 0) return COLORS.sun1;
    if (id % 3 === 1) return COLORS.space2;
    return COLORS.orbit1;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: getStarColor(s.id),
            opacity: s.opacity,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};
