import React, { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { FormField } from "../ui/FormField";
import { inputStyle, buttonStyle } from "../ui/formStyles";
import { COLORS } from "../../constants/colors";
import type { IncentiveEntry } from "../../types";

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: IncentiveEntry | null;
  onSave: (id: number, entry: Omit<IncentiveEntry, "id">) => void;
}

interface EditFormData {
  name: string;
  sales: string;
  affiliation: string;
  client: string;
  billing: string;
  cost: string;
  incentiveTarget: string;
  month: string;
}

// Inner component that resets when entry changes via key prop
const EditDataModalInner: React.FC<{
  entry: IncentiveEntry;
  onClose: () => void;
  onSave: (id: number, entry: Omit<IncentiveEntry, "id">) => void;
}> = ({ entry, onClose, onSave }) => {
  const initialFormData = useMemo<EditFormData>(
    () => ({
      name: entry.name,
      sales: entry.sales,
      affiliation: entry.affiliation,
      client: entry.client,
      billing: entry.billing.toString(),
      cost: entry.cost.toString(),
      incentiveTarget: entry.incentiveTarget.toString(),
      month: entry.month,
    }),
    [entry]
  );

  const [formData, setFormData] = useState<EditFormData>(initialFormData);

  const updateField = (field: keyof EditFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.billing || !formData.cost) return;

    onSave(entry.id, {
      name: formData.name,
      sales: formData.sales,
      affiliation: formData.affiliation,
      client: formData.client,
      billing: +formData.billing,
      cost: +formData.cost,
      incentiveTarget: +formData.incentiveTarget,
      month: formData.month,
    });
    onClose();
  };

  return (
    <>
      <FormField label="要員名">
        <input
          style={inputStyle}
          value={formData.name}
          onChange={updateField("name")}
          placeholder="山田 太郎"
        />
      </FormField>
      <FormField label="営業担当">
        <input
          style={inputStyle}
          value={formData.sales}
          onChange={updateField("sales")}
          placeholder="岡田"
        />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormField label="所属">
          <input
            style={inputStyle}
            value={formData.affiliation}
            onChange={updateField("affiliation")}
            placeholder="社員 / 会社名"
          />
        </FormField>
        <FormField label="案件顧客">
          <input
            style={inputStyle}
            value={formData.client}
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
            value={formData.billing}
            onChange={updateField("billing")}
            placeholder="650000"
          />
        </FormField>
        <FormField label="仕入（原価）">
          <input
            style={inputStyle}
            type="number"
            value={formData.cost}
            onChange={updateField("cost")}
            placeholder="500000"
          />
        </FormField>
        <FormField label="インセン対象">
          <input
            style={inputStyle}
            type="number"
            value={formData.incentiveTarget}
            onChange={updateField("incentiveTarget")}
            placeholder="50000"
          />
        </FormField>
      </div>
      <FormField label="月">
        <input
          style={inputStyle}
          type="month"
          value={formData.month}
          onChange={updateField("month")}
        />
      </FormField>
      <button onClick={handleSave} style={buttonStyle}>
        保存する
      </button>
      <button
        onClick={onClose}
        style={{
          ...buttonStyle,
          background: "transparent",
          border: `1px solid ${COLORS.border}`,
          color: COLORS.textMuted,
          marginTop: 8,
        }}
      >
        キャンセル
      </button>
    </>
  );
};

export const EditDataModal: React.FC<EditDataModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
}) => {
  if (!entry) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="データ編集">
      <EditDataModalInner
        key={entry.id}
        entry={entry}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
};
