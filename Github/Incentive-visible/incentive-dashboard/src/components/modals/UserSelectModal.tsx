import React, { useState } from "react";
import { COLORS } from "../../constants/colors";
import { STORAGE_KEYS } from "../../hooks/useIncentiveData";
import { buttonStyle, inputStyle } from "../ui/formStyles";

interface UserSelectModalProps {
  isOpen: boolean;
  onSelect: (user: string) => void;
  salesPersons: string[];
}

export const UserSelectModal: React.FC<UserSelectModalProps> = ({
  isOpen,
  onSelect,
  salesPersons,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, selectedUser);
      onSelect(selectedUser);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: "28px 32px",
          width: "92%",
          maxWidth: 400,
          boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
          animation: "modalIn 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: COLORS.gradSun,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            ☀️
          </span>
          <div>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: COLORS.text,
                margin: 0,
              }}
            >
              営業担当を選択してください
            </h3>
            <p
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                margin: "4px 0 0",
              }}
            >
              データ追加時に自動入力されます
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.textMuted,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            営業担当
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
          >
            <option value="">選択してください</option>
            {salesPersons.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedUser}
          style={{
            ...buttonStyle,
            opacity: selectedUser ? 1 : 0.5,
            cursor: selectedUser ? "pointer" : "not-allowed",
          }}
        >
          確定する
        </button>
      </div>
    </div>
  );
};
