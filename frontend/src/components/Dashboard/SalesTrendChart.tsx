import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { C, V } from "../../styles/dashboardStyles";

interface SalesTrendChartProps {
  data: any[];
  formatCurrency: (value: number) => string;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, formatCurrency }) => {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: `1px solid ${C.accent}`,
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: C.textDark, margin: 0 }}>
            Tendencia de Ingresos
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
            Histórico detallado de los últimos 24 meses
          </p>
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="gradientTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.accentDeep} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.accentDeep} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fontSize: 8, fill: V("text-muted"), fontWeight: 500 }}
              dy={10}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: V("text-muted") }}
              tickFormatter={(value) => {
                if (value === 0) return "$0";
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
              width={50}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                padding: "12px",
                background: C.white,
              }}
              formatter={(value: any) => [formatCurrency(value), "Ingresos"]}
              labelStyle={{ fontWeight: 600, color: C.textDark, marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke={C.accentDeep}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gradientTrend)"
              connectNulls
              dot={{ r: 4, fill: C.accentDeep, strokeWidth: 2, stroke: C.white }}
              activeDot={{ r: 6, fill: C.accentDeep }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
