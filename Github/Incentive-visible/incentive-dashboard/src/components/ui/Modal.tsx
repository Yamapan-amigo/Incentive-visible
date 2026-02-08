import React from "react";
import { COLORS } from "../../constants/colors";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: "28px 32px",
          width: "92%",
          maxWidth: 540,
          maxHeight: "82vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
          animation: "modalIn 0.3s ease",
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
          <h3
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: COLORS.text,
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.04)",
              border: "none",
              width: 32,
              height: 32,
              borderRadius: 10,
              color: COLORS.textMuted,
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
