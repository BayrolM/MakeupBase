import { useState, useEffect, useMemo } from "react";
import { useStore } from "../lib/store";
import { reportService, DashboardData, SalesComparisonData } from "../services/reportService";
import { toast } from "sonner";

export function useDashboardData() {
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
  const [salesComparison, setSalesComparison] = useState<SalesComparisonData | null>(null);

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

  const ordersByStatus = useMemo(() => {
    const normalize = (s: string) => s?.toLowerCase() || "";
    return [
      {
        estado: "Pendiente",
        cantidad: pedidos.filter((p) => normalize(p.estado) === "pendiente").length,
      },
      {
        estado: "Procesando",
        cantidad: pedidos.filter((p) => 
          normalize(p.estado) === "procesando" || normalize(p.estado) === "preparado"
        ).length,
      },
      {
        estado: "Enviado",
        cantidad: pedidos.filter((p) => normalize(p.estado) === "enviado").length,
      },
      {
        estado: "Entregado",
        cantidad: pedidos.filter((p) => normalize(p.estado) === "entregado").length,
      },
      {
        estado: "Cancelado",
        cantidad: pedidos.filter((p) => normalize(p.estado) === "cancelado").length,
      },
    ];
  }, [pedidos]);

  const productosStockCriticoList = useMemo(() => 
    productos.filter((p) => p.stock <= p.stockMinimo),
  [productos]);

  const trendChartData = useMemo(() => {
    if (!data?.ventas_tendencia) return [];

    return data.ventas_tendencia.map((v) => ({
      mes: v.mes_nombre,
      total: parseFloat(v.total) || 0,
      cantidad: parseInt(v.cantidad) || 0,
    }));
  }, [data?.ventas_tendencia]);

  return {
    data,
    safeData,
    salesComparison,
    ordersByStatus,
    productosStockCriticoList,
    trendChartData,
    formatCurrency,
    refresh: fetchDashboardData
  };
}
