import { useState, useEffect, useMemo } from "react";
import { useStore } from "../lib/store";
import { PageHeader } from "./PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  reportService,
  DashboardData,
  SalesComparisonData,
} from "../services/reportService";
import { toast } from "sonner";

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V("bg-soft"),
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  shadowSm: V("shadow-sm"),
  shadow: V("shadow"),
  white: "#ffffff",
  danger: "#ef4444",
  success: "#10b981",
  blue: "#3b82f6",
};

export function Dashboard() {
  const { pedidos, productos } = useStore();
  const [data, setData] = useState<DashboardData | null>({
    resumen: {
      total_ventas: 0,
      total_ordenes: 0,
      total_productos: 0,
      total_usuarios: 0,
      productos_bajo_stock: 0,
    },
    productos_mas_vendidos: [],
    ventas_tendencia: [],
  });
  const [salesComparison, setSalesComparison] =
    useState<SalesComparisonData | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchSalesComparison();
  }, []);

  const fetchSalesComparison = async () => {
    try {
      const res = await reportService.getSalesComparison();
      setSalesComparison(res);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await reportService.getDashboard();
      setData(res);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al cargar datos del dashboard");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const safeData = data || {
    resumen: {
      total_ventas: 0,
      total_ordenes: 0,
      total_usuarios: 0,
      productos_bajo_stock: 0,
    },
    productos_mas_vendidos: [],
  };

  const ordersByStatus = [
    {
      estado: "Pendiente",
      cantidad: pedidos.filter((p) => p.estado === "pendiente").length,
    },
    {
      estado: "Procesando",
      cantidad: pedidos.filter((p) => p.estado === "procesando").length,
    },
    {
      estado: "Enviado",
      cantidad: pedidos.filter((p) => p.estado === "enviado").length,
    },
    {
      estado: "Entregado",
      cantidad: pedidos.filter((p) => p.estado === "entregado").length,
    },
    {
      estado: "Cancelado",
      cantidad: pedidos.filter((p) => p.estado === "cancelado").length,
    },
  ];

  const statusColors = ["#7b1347", "#a85d77", "#c47b96", "#10b981", "#ef4444"];

  const productosStockCriticoList = productos.filter(
    (p) => p.stock <= p.stockMinimo,
  );

  const trendChartData = useMemo(() => {
    if (!data?.ventas_tendencia) return [];

    return data.ventas_tendencia.map((v) => ({
      mes: v.mes_nombre,
      total: parseFloat(v.total) || 0,
      cantidad: parseInt(v.cantidad) || 0,
    }));
  }, [data?.ventas_tendencia]);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}
    >
      <PageHeader
        title="Panel de Control"
        subtitle="Métricas estratégicas y estado del negocio"
        icon={LayoutDashboard}
      />

      <div className="p-6 space-y-6">
        {/* KPI Grid - Modern & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales KPI */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "16px",
              boxShadow: C.shadowSm,
              border: `1px solid ${C.accent}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "80px",
                height: "80px",
                background: `linear-gradient(135deg, transparent 50%, ${C.accent} 100%)`,
                opacity: 0.3,
              }}
            />
            <div className="flex justify-between items-start mb-4">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: C.bgSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp
                  style={{ width: 20, height: 20, color: C.accentDeep }}
                />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "#10b981",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                +12% <ArrowUpRight style={{ width: 12, height: 12 }} />
              </span>
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Ventas Totales
            </p>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: C.textDark,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {formatCurrency(safeData.resumen.total_ventas)}
            </h3>
          </div>

          {/* Orders KPI */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "16px",
              boxShadow: C.shadowSm,
              border: `1px solid ${C.accent}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: C.bgSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart
                  style={{ width: 20, height: 20, color: C.accentDeep }}
                />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  fontWeight: 500,
                  background: C.bgSoft,
                  padding: "2px 8px",
                  borderRadius: "20px",
                }}
              >
                Hoy
              </span>
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Pedidos
            </p>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: C.textDark,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {safeData.resumen.total_ordenes}
            </h3>
          </div>

          {/* Users KPI */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "16px",
              boxShadow: C.shadowSm,
              border: `1px solid ${C.accent}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: C.bgSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users style={{ width: 20, height: 20, color: C.accentDeep }} />
              </div>
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Usuarios
            </p>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: C.textDark,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {safeData.resumen.total_usuarios}
            </h3>
          </div>

          {/* Stock KPI - Warning style */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.white} 0%, #fffafa 100%)`,
              borderRadius: "20px",
              padding: "20px",
              boxShadow: C.shadowSm,
              border: `1px solid ${C.danger}33`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: `${C.danger}11`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle
                  style={{ width: 20, height: 20, color: C.danger }}
                />
              </div>
              {safeData.resumen.productos_bajo_stock > 0 && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: C.danger,
                    animation: "pulse 2s infinite",
                  }}
                />
              )}
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Stock Crítico
            </p>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: C.danger,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {safeData.resumen.productos_bajo_stock}
            </h3>
          </div>
        </div>

        {/* Main Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Comparison Chart */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "24px",
              boxShadow: C.shadow,
              border: `1px solid ${C.accent}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: C.textDark,
                    margin: 0,
                  }}
                >
                  Tendencia de Ingresos
                </h3>
                <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
                  Evolución de ventas - Últimos 24 meses
                </p>
              </div>
              {salesComparison ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "3px",
                        background: C.accentDeep,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: C.textMuted }}>
                      {salesComparison.anio_actual}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "3px",
                        background: C.blue,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: C.textMuted }}>
                      {salesComparison.anio_pasado}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded animate-pulse"
                    style={{ background: V("accent-soft") }}
                  />
                  <div
                    className="w-3 h-3 rounded animate-pulse"
                    style={{ background: V("accent-soft") }}
                  />
                </div>
              )}
            </div>

            {!data?.ventas_tendencia ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-48 bg-gray-100 rounded-2xl" />
              </div>
            ) : (
              <>
                <div style={{ width: "100%", height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradientTrend"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={C.accentDeep}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={C.accentDeep}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis
                        dataKey="mes"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={{
                          fontSize: 8,
                          fill: V("text-muted"),
                          fontWeight: 500,
                        }}
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
                          if (value >= 1000000)
                            return `$${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000)
                            return `$${(value / 1000).toFixed(0)}K`;
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
                        formatter={(value: any) => [
                          formatCurrency(value),
                          "Ingresos",
                        ]}
                        labelStyle={{
                          fontWeight: 600,
                          color: C.textDark,
                          marginBottom: "4px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={C.accentDeep}
                        strokeWidth={3.5}
                        fillOpacity={1}
                        fill="url(#gradientTrend)"
                        connectNulls
                        dot={{ r: 4, fill: C.accentDeep, strokeWidth: 2, stroke: C.white }}
                        activeDot={{ r: 6, fill: C.accentDeep }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center items-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: C.accentDeep,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: C.textMuted,
                      }}
                    >
                      Ingresos Mensuales
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Orders Distribution */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "20px",
              boxShadow: C.shadow,
              border: `1px solid ${C.accent}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.textDark,
                    margin: 0,
                  }}
                >
                  Estado de Pedidos
                </h3>
                <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
                  Seguimiento logístico
                </p>
              </div>
              <div
                style={{
                  padding: "2px 8px",
                  borderRadius: "20px",
                  background: V("accent-soft"),
                  fontSize: "10px",
                  fontWeight: 600,
                  color: C.accentDeep,
                }}
              >
                {pedidos.length} total
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="cantidad"
                      stroke="none"
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[index % statusColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        padding: "10px",
                        background: C.white,
                      }}
                      formatter={(value: any, name: string, props: any) => [
                        `${value} pedidos`,
                        props.payload.estado,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: C.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      margin: 0,
                    }}
                  >
                    Total
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: C.textDark,
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {pedidos.length}
                  </p>
                </div>
              </div>

              {/* Status Cards Legend - Right side */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 overflow-y-auto max-h-[220px] pr-2 no-scrollbar">
                {ordersByStatus.map((status, index) => (
                  <div
                    key={status.estado}
                    style={{
                      background: C.bgSoft,
                      padding: "8px 12px",
                      borderRadius: "12px",
                      border: `1px solid ${V("accent-soft")}`,
                      display: "flex",
                      justifyContent: "between",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: statusColors[index % statusColors.length],
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: C.textMuted,
                          textTransform: "uppercase",
                        }}
                      >
                        {status.estado}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: C.textDark,
                      }}
                    >
                      {status.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "20px",
              boxShadow: C.shadow,
              border: `1px solid ${C.accent}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: C.textDark,
                    margin: 0,
                  }}
                >
                  Ranking del Mes
                </h3>
                <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
                  Top productos más vendidos ahora
                </p>
              </div>
              <TrendingUp style={{ width: 20, height: 20, color: C.accentDeep, opacity: 0.5 }} />
            </div>

            <div className="space-y-5">
              {safeData.productos_mas_vendidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Package style={{ width: 40, height: 40, marginBottom: 12 }} />
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>Sin ventas este mes</p>
                </div>
              ) : (
                safeData.productos_mas_vendidos.slice(0, 5).map((producto, index) => {
                  const prodInfo = productos.find(
                    (p) => p.id === producto.id_producto?.toString(),
                  );
                  const totalVendido = parseInt(producto.total_vendido) || 0;
                  const maxVendido = parseInt(safeData.productos_mas_vendidos[0].total_vendido) || 1;
                  const percentage = (totalVendido / maxVendido) * 100;

                  // Ranking badge styles
                  const isTop3 = index < 3;
                  const badgeColor = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : C.bgSoft;

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
                                background: `linear-gradient(135deg, ${badgeColor}22 0%, ${C.bgSoft} 100%)`,
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
                          {/* Mini Badge */}
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
                          
                          {/* Progress Bar - Luxury Style */}
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
                          <div className="flex justify-between mt-1">
                             <span style={{ fontSize: '10px', color: C.textMuted, fontWeight: 500 }}>
                               ID: {producto.id_producto}
                             </span>
                             <span style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600 }}>
                               UNIDADES
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Critical Inventory */}
          <div
            style={{
              background: C.white,
              borderRadius: "20px",
              padding: "20px",
              boxShadow: C.shadow,
              border: `1px solid ${C.danger}22`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: C.textDark,
                  margin: 0,
                }}
              >
                Inventario Crítico
              </h3>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: C.danger,
                }}
              ></div>
            </div>

            <div className="space-y-3">
              {productosStockCriticoList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package
                    style={{
                      width: 40,
                      height: 40,
                      color: C.accent,
                      opacity: 0.5,
                      marginBottom: "12px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textMuted,
                      fontWeight: 500,
                    }}
                  >
                    Inventario saludable
                  </p>
                </div>
              ) : (
                productosStockCriticoList.slice(0, 5).map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: `${C.danger}05`,
                      border: `1px solid ${C.danger}11`,
                    }}
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
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AlertTriangle
                            style={{ width: 18, height: 18, color: C.danger }}
                          />
                        )}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: C.textDark,
                            margin: 0,
                          }}
                        >
                          {producto.nombre}
                        </p>
                        <div className="flex gap-2 items-center mt-0.5">
                          <span
                            style={{
                              fontSize: "9px",
                              padding: "1px 5px",
                              background: `${C.danger}22`,
                              color: C.danger,
                              borderRadius: "3px",
                              fontWeight: 700,
                            }}
                          >
                            BAJO STOCK
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: C.danger,
                          margin: 0,
                        }}
                      >
                        {producto.stock}
                      </p>
                      <p
                        style={{
                          fontSize: "9px",
                          color: C.textMuted,
                          margin: 0,
                        }}
                      >
                        Mín: {producto.stockMinimo}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
