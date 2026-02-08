import React from "react";

interface SunOrbProps {
  size?: number;
}

export const SunOrb: React.FC<SunOrbProps> = ({ size = 120 }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    {/* Outer glow */}
    <div
      style={{
        position: "absolute",
        inset: -size * 0.3,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(253,230,138,0.25) 0%, rgba(251,146,60,0.06) 50%, transparent 70%)",
        animation: "sunPulse 4s ease-in-out infinite",
      }}
    />
    {/* Inner glow */}
    <div
      style={{
        position: "absolute",
        inset: -size * 0.12,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
        animation: "sunPulse 3s ease-in-out 0.5s infinite",
      }}
    />
    {/* Sun core */}
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 35%, #fde68a 0%, #fbbf24 25%, #fb923c 60%, #f97316 100%)",
        boxShadow:
          "0 0 40px rgba(251,146,60,0.25), 0 0 80px rgba(251,146,60,0.08)",
      }}
    />
  </div>
);
