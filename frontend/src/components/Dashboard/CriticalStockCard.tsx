import React from "react";
import { AlertTriangle, Package } from "lucide-react";
import { C } from "../../styles/dashboardStyles";

interface CriticalStockCardProps {
  products: any[];
}

export const CriticalStockCard: React.FC<CriticalStockCardProps> = ({ products }) => {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: `1px solid ${C.danger}22`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textDark, margin: 0 }}>
          Inventario Crítico
        </h3>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.danger }} />
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Package style={{ width: 40, height: 40, color: C.accent, opacity: 0.5, marginBottom: "12px" }} />
            <p style={{ fontSize: "13px", color: C.textMuted, fontWeight: 500 }}>
              Inventario saludable
            </p>
          </div>
        ) : (
          products.slice(0, 5).map((producto) => (
            <div
              key={producto.id}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: `${C.danger}05`, border: `1px solid ${C.danger}11` }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: `1px solid ${C.danger}22`,
                  }}
                >
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <AlertTriangle style={{ width: 18, height: 18, color: C.danger }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: C.textDark, margin: 0 }}>
                    {producto.nombre}
                  </p>
                  <span style={{ fontSize: "9px", padding: "1px 5px", background: `${C.danger}22`, color: C.danger, borderRadius: "3px", fontWeight: 700 }}>
                    BAJO STOCK
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "14px", fontWeight: 800, color: C.danger, margin: 0 }}>
                  {producto.stock}
                </p>
                <p style={{ fontSize: "9px", color: C.textMuted, margin: 0 }}>
                  Mín: {producto.stockMinimo}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
