import React from "react";
import { Modal } from "../ui/Modal";
import { FormField } from "../ui/FormField";
import { inputStyle, buttonStyle } from "../ui/formStyles";
import type { NewEntry } from "../../types";

// Format number with commas
const formatWithCommas = (value: string): string => {
  const num = value.replace(/[^\d]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
};

// Remove commas from formatted string
const removeCommas = (value: string): string => {
  return value.replace(/,/g, "");
};

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEntry: NewEntry;
  setNewEntry: React.Dispatch<React.SetStateAction<NewEntry>>;
  onAdd: () => void;
}

export const AddDataModal: React.FC<AddDataModalProps> = ({
  isOpen,
  onClose,
  newEntry,
  setNewEntry,
  onAdd,
}) => {
  const updateField = (field: keyof NewEntry) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewEntry((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const updateNumericField = (field: keyof NewEntry) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = removeCommas(e.target.value);
    setNewEntry((prev) => ({ ...prev, [field]: rawValue }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="データ追加">
      <FormField label="要員名">
        <input
          style={inputStyle}
          value={newEntry.name}
          onChange={updateField("name")}
          placeholder="山田 太郎"
        />
      </FormField>
      <FormField label="営業担当">
        <input
          style={{
            ...inputStyle,
            backgroundColor: "#f5f5f5",
            cursor: "not-allowed",
          }}
          value={newEntry.sales}
          readOnly
        />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormField label="所属">
          <input
            style={inputStyle}
            value={newEntry.affiliation}
            onChange={updateField("affiliation")}
            placeholder="社員 / 会社名"
          />
        </FormField>
        <FormField label="案件顧客">
          <input
            style={inputStyle}
            value={newEntry.client}
            onChange={updateField("client")}
            placeholder="顧客名"
          />
        </FormField>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
      >
        <FormField label="売上（単価）">
          <input
            style={inputStyle}
            type="text"
            inputMode="numeric"
            value={formatWithCommas(newEntry.billing)}
            onChange={updateNumericField("billing")}
            placeholder="650,000"
          />
        </FormField>
        <FormField label="仕入（原価）">
          <input
            style={inputStyle}
            type="text"
            inputMode="numeric"
            value={formatWithCommas(newEntry.cost)}
            onChange={updateNumericField("cost")}
            placeholder="500,000"
          />
        </FormField>
        <FormField label="インセン対象">
          <input
            style={inputStyle}
            type="text"
            inputMode="numeric"
            value={formatWithCommas(newEntry.incentiveTarget)}
            onChange={updateNumericField("incentiveTarget")}
            placeholder="50,000"
          />
        </FormField>
      </div>
      <FormField label="月">
        <input
          style={inputStyle}
          type="month"
          value={newEntry.month}
          onChange={updateField("month")}
        />
      </FormField>
      <button onClick={onAdd} style={buttonStyle}>
        追加する
      </button>
    </Modal>
  );
};
