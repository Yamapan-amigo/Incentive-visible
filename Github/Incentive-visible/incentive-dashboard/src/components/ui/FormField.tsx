import React from "react";
import { COLORS } from "../../constants/colors";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 5,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);
