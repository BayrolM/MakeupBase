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

interface PerdidasTrendChartProps {
  data: any[];
  formatCurrency: (value: number) => string;
}

export const PerdidasTrendChart: React.FC<PerdidasTrendChartProps> = ({ data, formatCurrency }) => {
  // Color de alerta para pérdidas
  const lossColor = "#b83232";

  return (
    <div
      style={{
        height: '100%',
        background: C.white,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: `1px solid rgba(184, 50, 50, 0.15)`,
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: C.textDark, margin: 0 }}>
            Tendencia de Pérdidas
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
            Histórico detallado de mermas y pérdidas (24 meses)
          </p>
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="gradientLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lossColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={lossColor} stopOpacity={0} />
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
              formatter={(value: any) => [formatCurrency(value), "Pérdidas"]}
              labelStyle={{ fontWeight: 600, color: C.textDark, marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke={lossColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gradientLoss)"
              connectNulls
              dot={{ r: 4, fill: lossColor, strokeWidth: 2, stroke: C.white }}
              activeDot={{ r: 6, fill: lossColor }}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
