import React from "react";
import { Package, TrendingUp } from "lucide-react";
import { C } from "../../styles/dashboardStyles";

interface RankingMesCardProps {
  products: any[];
  allProducts: any[];
}

export const RankingMesCard: React.FC<RankingMesCardProps> = ({ products, allProducts }) => {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: C.textDark, margin: 0 }}>
            Ranking del Mes
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
            Top productos más vendidos ahora
          </p>
        </div>
        <TrendingUp style={{ width: 20, height: 20, color: C.accentDeep, opacity: 0.5 }} />
      </div>

      <div className="space-y-5">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Package style={{ width: 40, height: 40, marginBottom: 12 }} />
            <p style={{ fontSize: "14px", fontWeight: 500 }}>Sin ventas este mes</p>
          </div>
        ) : (
          products.slice(0, 5).map((producto, index) => {
            const prodInfo = allProducts.find(
              (p) => p.id === producto.id_producto?.toString(),
            );
            const totalVendido = parseInt(producto.total_vendido) || 0;
            const maxVendido = parseInt(products[0].total_vendido) || 1;
            const percentage = (totalVendido / maxVendido) * 100;

            const isTop3 = index < 3;
            const badgeColor = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "var(--luxury-bg-soft)";

            return (
              <div key={producto.id_producto} className="group relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative">
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "16px",
                        background: C.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        border: `1.5px solid ${isTop3 ? badgeColor : C.accent}44`,
                        transition: "all 0.3s ease",
                      }}
                      className="group-hover:scale-105"
                    >
                      {prodInfo?.imagenUrl ? (
                        <img
                          src={prodInfo.imagenUrl}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: `linear-gradient(135deg, ${badgeColor}22 0%, var(--luxury-bg-soft) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isTop3 ? badgeColor : C.accentDeep,
                          fontWeight: 800,
                          fontSize: '16px'
                        }}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isTop3 ? '#fff' : C.textMuted,
                      fontSize: '10px',
                      fontWeight: 900,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: `2px solid #fff`
                    }}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: C.textDark,
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {producto.nombre}
                      </h4>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: C.accentDeep,
                        }}
                      >
                        {totalVendido}
                      </span>
                    </div>

                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      background: `${C.accent}33`, 
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div 
                        style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          background: `linear-gradient(90deg, ${C.accent} 0%, ${C.accentDeep} 100%)`,
                          borderRadius: '10px',
                          transition: 'width 1s ease-out'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
