import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { COLORS, CHART_COLORS } from "../../constants/colors";
import { SolarTooltip } from "./SolarTooltip";

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartSectionProps {
  data: PieChartData[];
}

export const PieChartSection: React.FC<PieChartSectionProps> = ({ data }) => (
  <div
    style={{
      background: COLORS.card,
      borderRadius: 18,
      border: `1px solid ${COLORS.border}`,
      boxShadow: COLORS.shadow,
      padding: "22px 18px 14px",
      animation: "riseUp 0.6s ease 0.3s both",
    }}
  >
    <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 18px 8px" }}>
      顧客別 売上構成
    </h3>
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={88}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<SolarTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 10 }}
          formatter={(value: string) => (
            <span style={{ color: COLORS.textMuted, fontSize: 10 }}>
              {value.length > 14 ? value.slice(0, 14) + "…" : value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
