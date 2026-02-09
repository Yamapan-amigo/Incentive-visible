import React, { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { FormField } from "../ui/FormField";
import { inputStyle, buttonStyle } from "../ui/formStyles";
import { COLORS } from "../../constants/colors";
import type { ProfileSettings, Goals } from "../../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSettings: ProfileSettings;
  onSave: (settings: ProfileSettings) => void;
}

// Format number with commas
const formatWithCommas = (value: number): string => {
  return value.toLocaleString();
};

// Inner component that resets when profileSettings changes via key prop
const SettingsModalInner: React.FC<{
  initialSettings: ProfileSettings;
  onSave: (settings: ProfileSettings) => void;
  onClose: () => void;
}> = ({ initialSettings, onSave, onClose }) => {
  // Local state for editing
  const [localSettings, setLocalSettings] = useState<ProfileSettings>(initialSettings);
  const [newSalesPerson, setNewSalesPerson] = useState("");
  const [newFocusClient, setNewFocusClient] = useState("");
  const [editingSalesPerson, setEditingSalesPerson] = useState<{ index: number; value: string } | null>(null);

  // Display values for goals (formatted with commas)
  const [displayGoals, setDisplayGoals] = useState(() => ({
    billing: formatWithCommas(initialSettings.goals.billing),
    profit: formatWithCommas(initialSettings.goals.profit),
    incentive: formatWithCommas(initialSettings.goals.incentive),
  }));

  // Handle goal input change
  const handleGoalChange = (field: keyof Goals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const numValue = parseInt(rawValue, 10) || 0;

    setDisplayGoals((prev) => ({
      ...prev,
      [field]: rawValue ? formatWithCommas(numValue) : "",
    }));
    setLocalSettings((prev) => ({
      ...prev,
      goals: { ...prev.goals, [field]: numValue },
    }));
  };

  // Sales person management
  const handleAddSalesPerson = () => {
    if (newSalesPerson.trim() && !localSettings.salesPersons.includes(newSalesPerson.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        salesPersons: [...prev.salesPersons, newSalesPerson.trim()],
      }));
      setNewSalesPerson("");
    }
  };

  const handleDeleteSalesPerson = (index: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      salesPersons: prev.salesPersons.filter((_, i) => i !== index),
    }));
  };

  const handleStartEditSalesPerson = (index: number) => {
    setEditingSalesPerson({ index, value: localSettings.salesPersons[index] });
  };

  const handleSaveEditSalesPerson = () => {
    if (editingSalesPerson && editingSalesPerson.value.trim()) {
      setLocalSettings((prev) => ({
        ...prev,
        salesPersons: prev.salesPersons.map((p, i) =>
          i === editingSalesPerson.index ? editingSalesPerson.value.trim() : p
        ),
      }));
      setEditingSalesPerson(null);
    }
  };

  const handleCancelEditSalesPerson = () => {
    setEditingSalesPerson(null);
  };

  // Focus client management
  const handleAddFocusClient = () => {
    if (newFocusClient.trim() && !localSettings.focusClients.includes(newFocusClient.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        focusClients: [...prev.focusClients, newFocusClient.trim()],
      }));
      setNewFocusClient("");
    }
  };

  const handleDeleteFocusClient = (index: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      focusClients: prev.focusClients.filter((_, i) => i !== index),
    }));
  };

  // Save settings
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 24,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const listItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: COLORS.bg,
    borderRadius: 8,
    marginBottom: 6,
  };

  const smallButtonStyle: React.CSSProperties = {
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const addButtonStyle: React.CSSProperties = {
    ...smallButtonStyle,
    background: COLORS.gradSun,
    color: "#fff",
  };

  const editButtonStyle: React.CSSProperties = {
    ...smallButtonStyle,
    background: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
    marginRight: 6,
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...smallButtonStyle,
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
  };

  const addRowStyle: React.CSSProperties = {
    display: "flex",
    gap: 8,
    marginTop: 8,
  };

  const smallInputStyle: React.CSSProperties = {
    ...inputStyle,
    padding: "8px 12px",
    fontSize: 13,
  };

  return (
    <>
      {/* Sales Persons Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: COLORS.gradSun,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
            }}
          >
            👤
          </span>
          営業担当者
        </div>
        <div>
          {localSettings.salesPersons.map((person, index) => (
            <div key={index} style={listItemStyle}>
              {editingSalesPerson?.index === index ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <input
                    type="text"
                    value={editingSalesPerson.value}
                    onChange={(e) => setEditingSalesPerson({ ...editingSalesPerson, value: e.target.value })}
                    style={{ ...smallInputStyle, flex: 1 }}
                    autoFocus
                  />
                  <button onClick={handleSaveEditSalesPerson} style={addButtonStyle}>
                    保存
                  </button>
                  <button onClick={handleCancelEditSalesPerson} style={deleteButtonStyle}>
                    キャンセル
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 13, color: COLORS.text }}>{person}</span>
                  <div>
                    <button onClick={() => handleStartEditSalesPerson(index)} style={editButtonStyle}>
                      編集
                    </button>
                    <button onClick={() => handleDeleteSalesPerson(index)} style={deleteButtonStyle}>
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <div style={addRowStyle}>
            <input
              type="text"
              placeholder="新しい担当者名"
              value={newSalesPerson}
              onChange={(e) => setNewSalesPerson(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSalesPerson()}
              style={{ ...smallInputStyle, flex: 1 }}
            />
            <button onClick={handleAddSalesPerson} style={addButtonStyle}>
              + 追加
            </button>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: COLORS.gradFlare,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
            }}
          >
            🎯
          </span>
          目標設定（月間）
        </div>
        <FormField label="売上目標">
          <input
            style={inputStyle}
            type="text"
            value={displayGoals.billing}
            onChange={handleGoalChange("billing")}
            placeholder="5,000,000"
          />
        </FormField>
        <FormField label="粗利目標">
          <input
            style={inputStyle}
            type="text"
            value={displayGoals.profit}
            onChange={handleGoalChange("profit")}
            placeholder="800,000"
          />
        </FormField>
        <FormField label="インセンティブ目標">
          <input
            style={inputStyle}
            type="text"
            value={displayGoals.incentive}
            onChange={handleGoalChange("incentive")}
            placeholder="350,000"
          />
        </FormField>
      </div>

      {/* Focus Clients Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: COLORS.gradCosmic,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
            }}
          >
            ⭐
          </span>
          注力顧客
        </div>
        <div>
          {localSettings.focusClients.length === 0 && (
            <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
              注力顧客が登録されていません
            </p>
          )}
          {localSettings.focusClients.map((client, index) => (
            <div key={index} style={listItemStyle}>
              <span style={{ fontSize: 13, color: COLORS.text }}>{client}</span>
              <button onClick={() => handleDeleteFocusClient(index)} style={deleteButtonStyle}>
                削除
              </button>
            </div>
          ))}
          <div style={addRowStyle}>
            <input
              type="text"
              placeholder="新しい顧客名"
              value={newFocusClient}
              onChange={(e) => setNewFocusClient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFocusClient()}
              style={{ ...smallInputStyle, flex: 1 }}
            />
            <button onClick={handleAddFocusClient} style={addButtonStyle}>
              + 追加
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} style={buttonStyle}>
        保存する
      </button>
    </>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profileSettings,
  onSave,
}) => {
  // Create a stable key based on isOpen to reset state when modal opens
  const settingsKey = useMemo(
    () => isOpen ? `open-${Date.now()}` : "closed",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen && profileSettings]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="設定">
      {isOpen && (
        <SettingsModalInner
          key={settingsKey}
          initialSettings={profileSettings}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
