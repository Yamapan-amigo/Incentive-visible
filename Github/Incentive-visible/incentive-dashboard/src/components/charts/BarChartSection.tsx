import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "../../constants/colors";
import { SolarTooltip } from "./SolarTooltip";

interface BarChartData {
  name: string;
  売上: number;
  仕入: number;
  粗利: number;
}

interface BarChartSectionProps {
  data: BarChartData[];
}

export const BarChartSection: React.FC<BarChartSectionProps> = ({ data }) => (
  <div
    style={{
      background: COLORS.card,
      borderRadius: 18,
      border: `1px solid ${COLORS.border}`,
      boxShadow: COLORS.shadow,
      padding: "22px 18px 14px",
      animation: "riseUp 0.6s ease 0.25s both",
    }}
  >
    <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 18px 8px" }}>
      要員別 売上・仕入・粗利
    </h3>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={2} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: COLORS.textMuted }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: COLORS.textDim }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
        />
        <Tooltip content={<SolarTooltip />} />
        <Bar dataKey="売上" fill={COLORS.sun1} radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="仕入"
          fill={COLORS.textDim}
          radius={[4, 4, 0, 0]}
          opacity={0.5}
        />
        <Bar dataKey="粗利" fill={COLORS.space1} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
