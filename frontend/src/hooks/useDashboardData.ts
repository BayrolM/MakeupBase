import { useState, useEffect, useMemo, useCallback } from "react";
import { reportService, DashboardData, SalesComparisonData } from "../services/reportService";
import { toast } from "sonner";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [salesComparison, setSalesComparison] = useState<SalesComparisonData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({});

  const toISODate = (date?: Date) => date ? date.toISOString().split("T")[0] : undefined;

  const fetchDashboardData = useCallback(async (range: DateRange = {}) => {
    try {
      const params: { fecha_inicio?: string; fecha_fin?: string } = {};
      if (range.from) params.fecha_inicio = toISODate(range.from);
      if (range.to)   params.fecha_fin   = toISODate(range.to);
      const res = await reportService.getDashboard(params);
      setData(res);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al cargar datos del dashboard");
    }
  }, []);

  const fetchSalesComparison = async () => {
    try {
      const res = await reportService.getSalesComparison();
      setSalesComparison(res);
    } catch (error: any) {
      console.error(error);
    }
  };

  // Carga inicial y Polling cada 30 segundos — se reinicia al cambiar el rango
  useEffect(() => {
    fetchDashboardData(dateRange);
    fetchSalesComparison();

    const intervalId = setInterval(() => {
      fetchDashboardData(dateRange);
      fetchSalesComparison();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dateRange, fetchDashboardData]);

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
      total_perdidas: 0,
      total_ordenes: 0,
      total_productos: 0,
      devoluciones_pendientes: 0,
      productos_bajo_stock: 0,
    },
    productos_mas_vendidos: [],
    pedidos_por_estado: [],
    productos_stock_critico: [],
    ventas_tendencia: [],
    perdidas_tendencia: [],
    ventas_del_mes: [],
  };

  const ordersByStatus = useMemo(() => {
    if (!safeData.pedidos_por_estado || safeData.pedidos_por_estado.length === 0) {
      return [
        { estado: "Pendiente", cantidad: 0 },
        { estado: "Procesando", cantidad: 0 },
        { estado: "Enviado", cantidad: 0 },
        { estado: "Entregado", cantidad: 0 },
        { estado: "Cancelado", cantidad: 0 },
      ];
    }
    return safeData.pedidos_por_estado.map(p => ({
      estado: p.estado ? p.estado.charAt(0).toUpperCase() + p.estado.slice(1) : "Desconocido",
      cantidad: parseInt(p.cantidad) || 0
    }));
  }, [safeData.pedidos_por_estado]);

  const productosStockCriticoList = useMemo(() => {
    if (!safeData.productos_stock_critico) return [];
    return safeData.productos_stock_critico.map(p => ({
      id: p.id_producto.toString(),
      nombre: p.nombre,
      stock: p.stock_actual,
      stockMinimo: p.stock_min,
      precioVenta: p.precio_venta,
      categoria: p.categoria || '',
      marca: p.marca || ''
    }));
  }, [safeData.productos_stock_critico]);

  const trendChartData = useMemo(() => {
    if (!data?.ventas_tendencia) return [];
    return data.ventas_tendencia.map((v) => ({
      mes: v.mes_nombre,
      total: parseFloat(v.total) || 0,
      cantidad: parseInt(v.cantidad) || 0,
    }));
  }, [data?.ventas_tendencia]);

  const perdidasTrendChartData = useMemo(() => {
    if (!data?.perdidas_tendencia) return [];
    return data.perdidas_tendencia.map((p) => ({
      mes: p.mes_nombre,
      total: parseFloat(p.total) || 0,
      cantidad: parseInt(p.cantidad) || 0,
    }));
  }, [data?.perdidas_tendencia]);

  const ventasMesChartData = useMemo(() => {
    if (!safeData.ventas_del_mes) return [];
    return safeData.ventas_del_mes.map((v) => ({
      dia: v.dia,
      total: parseFloat(v.total) || 0,
    }));
  }, [safeData.ventas_del_mes]);

  return {
    data,
    safeData,
    salesComparison,
    ordersByStatus,
    productosStockCriticoList,
    trendChartData,
    perdidasTrendChartData,
    ventasMesChartData,
    formatCurrency,
    dateRange,
    setDateRange,
    refresh: () => fetchDashboardData(dateRange),
  };
}
