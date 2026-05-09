import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { C, statusColors } from "../../styles/dashboardStyles";

interface OrderStatusPieProps {
  data: any[];
}

export const OrderStatusPie: React.FC<OrderStatusPieProps> = ({ data }) => {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: `1px solid ${C.accent}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textDark, margin: 0 }}>
            Estado de Pedidos
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>Seguimiento logístico</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
        {/* Chart Container */}
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          {data.every(item => item.cantidad === 0) ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: `8px solid ${C.accent}22`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.textMuted
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800 }}>0</span>
              <span style={{ fontSize: '10px' }}>PEDIDOS</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="cantidad"
                  stroke="none"
                  animationDuration={1000}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[index % statusColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {/* Center Info (Optional) */}
          {!data.every(item => item.cantidad === 0) && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <p style={{ fontSize: '10px', color: C.textMuted, margin: 0, fontWeight: 700 }}>TOTAL</p>
              <p style={{ fontSize: '18px', color: C.textDark, margin: 0, fontWeight: 900 }}>
                {data.reduce((acc, curr) => acc + curr.cantidad, 0)}
              </p>
            </div>
          )}
        </div>

        {/* Legend Container */}
        <div className="flex-1 w-full md:w-auto space-y-2.5">
          {data.map((entry, index) => (
            <div 
              key={entry.estado} 
              className="flex items-center justify-between group cursor-default"
              style={{ padding: '4px 8px', borderRadius: '8px', transition: 'all 0.2s' }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "3px",
                    background: statusColors[index % statusColors.length],
                    boxShadow: `0 2px 4px ${statusColors[index % statusColors.length]}44`
                  }}
                />
                <span style={{ fontSize: "13px", fontWeight: 600, color: C.textDark }}>
                  {entry.estado}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "14px", fontWeight: 800, color: C.accentDeep }}>
                  {entry.cantidad}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
