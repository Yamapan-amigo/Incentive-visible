import React from "react";
import { COLORS } from "../../constants/colors";

// Shared input styles
export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  color: COLORS.text,
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

// Shared button styles
export const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px",
  marginTop: 6,
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  background: COLORS.gradSun,
  color: "#fff",
  fontFamily: "inherit",
  boxShadow: "0 2px 12px rgba(251,146,60,0.25)",
};
