import React from "react";
import { Modal } from "../ui/Modal";
import { FormField, inputStyle, buttonStyle } from "../ui/FormField";
import type { NewEntry } from "../../types";

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
            type="number"
            value={newEntry.billing}
            onChange={updateField("billing")}
            placeholder="650000"
          />
        </FormField>
        <FormField label="仕入（原価）">
          <input
            style={inputStyle}
            type="number"
            value={newEntry.cost}
            onChange={updateField("cost")}
            placeholder="500000"
          />
        </FormField>
        <FormField label="インセン対象">
          <input
            style={inputStyle}
            type="number"
            value={newEntry.incentiveTarget}
            onChange={updateField("incentiveTarget")}
            placeholder="50000"
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
