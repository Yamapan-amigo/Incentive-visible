import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { FormField, inputStyle, buttonStyle } from "../ui/FormField";
import { COLORS } from "../../constants/colors";
import type { Goals } from "../../types";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempGoals: Goals;
  setTempGoals: React.Dispatch<React.SetStateAction<Goals>>;
  onSave: () => void;
}

// Format number with commas
const formatWithCommas = (value: number): string => {
  return value.toLocaleString();
};

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  tempGoals,
  setTempGoals,
  onSave,
}) => {
  // Local state for formatted display values
  const [displayValues, setDisplayValues] = useState({
    billing: formatWithCommas(tempGoals.billing),
    profit: formatWithCommas(tempGoals.profit),
    incentive: formatWithCommas(tempGoals.incentive),
  });

  // Sync display values when tempGoals changes (e.g., modal opens)
  useEffect(() => {
    setDisplayValues({
      billing: formatWithCommas(tempGoals.billing),
      profit: formatWithCommas(tempGoals.profit),
      incentive: formatWithCommas(tempGoals.incentive),
    });
  }, [tempGoals.billing, tempGoals.profit, tempGoals.incentive]);

  const handleChange = (field: keyof Goals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const numValue = parseInt(rawValue, 10) || 0;

    setDisplayValues((prev) => ({
      ...prev,
      [field]: rawValue ? formatWithCommas(numValue) : "",
    }));
    setTempGoals((prev) => ({ ...prev, [field]: numValue }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎯 目標額設定">
      <p
        style={{
          fontSize: 12,
          color: COLORS.textMuted,
          marginBottom: 18,
          lineHeight: 1.6,
        }}
      >
        月次の目標額を設定します。達成率リングに反映されます。
      </p>
      <FormField label="売上目標">
        <input
          style={inputStyle}
          type="text"
          value={displayValues.billing}
          onChange={handleChange("billing")}
          placeholder="5,000,000"
        />
      </FormField>
      <FormField label="粗利目標">
        <input
          style={inputStyle}
          type="text"
          value={displayValues.profit}
          onChange={handleChange("profit")}
          placeholder="800,000"
        />
      </FormField>
      <FormField label="インセンティブ目標">
        <input
          style={inputStyle}
          type="text"
          value={displayValues.incentive}
          onChange={handleChange("incentive")}
          placeholder="350,000"
        />
      </FormField>
      <button onClick={onSave} style={buttonStyle}>
        保存する
      </button>
    </Modal>
  );
};
