import { useStore } from "../../lib/store";
import { PageHeader } from "../layout/PageHeader";
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  RotateCcw, 
  LayoutDashboard,
  FileSpreadsheet
} from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { C } from "../../styles/dashboardStyles";
import { DashboardDatePicker } from "./DashboardDatePicker";
import { exportDashboardToExcel } from "../../utils/excelExport";
import { toast } from "sonner";

// Sub-components
import { StatCard } from "./StatCard";
import { SalesTrendChart } from "./SalesTrendChart";
import { PerdidasTrendChart } from "./PerdidasTrendChart";
import { VentasMesChart } from "./VentasMesChart";
import { OrderStatusPie } from "./OrderStatusPie";
import { RankingMesCard } from "./RankingMesCard";
import { CriticalStockCard } from "./CriticalStockCard";

export function Dashboard() {
  const { productos } = useStore();
  const { 
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
  } = useDashboardData();

  const formatCrecimiento = (valor: number | undefined) => {
    if (valor === undefined) return "0%";
    const sign = valor > 0 ? "+" : "";
    return `${sign}${valor.toFixed(1)}%`;
  };

  const crecimientoVentas = formatCrecimiento(salesComparison?.resumen?.crecimiento);

  const handleExportExcel = async () => {
    if (safeData) {
      toast.promise(
        exportDashboardToExcel(safeData, dateRange),
        {
          loading: 'Generando reporte de Excel...',
          success: '¡Reporte exportado correctamente!',
          error: 'Error al generar el reporte',
        }
      );
    }
  };

  if (data === null) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f6f3f5 100%)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '24px',
          color: '#1e1b1d',
          fontFamily: "'DM Sans', sans-serif",
          width: '100%',
        }}
      >
        <div style={{ position: 'relative', width: '56px', height: '56px' }}>
          <div 
            className="animate-spin"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '3px solid rgba(123, 19, 71, 0.08)',
              borderTopColor: '#7b1347',
              borderRadius: '50%'
            }} 
          />
        </div>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: '#7b1347', 
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Cargando Dashboard...
        </span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative animate-premium-fade-in-up"
      style={{ background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="relative mb-6">
        <PageHeader
          title="Panel de Control"
          subtitle="Métricas estratégicas y estado del negocio"
          icon={LayoutDashboard}
        >
          {/* Botón de Exportar Excel y DatePicker viven dentro del header */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="luxury-button-premium"
              style={{ padding: "9px 16px", fontSize: "13px" }}
              title="Exportar información del dashboard a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 relative top-[1px]" />
              Exportar
            </button>
            <DashboardDatePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </PageHeader>
      </div>

      <div className="px-8 pb-8 pt-2 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Ingresos Totales" 
            value={formatCurrency(safeData.resumen.total_ventas)} 
            icon={TrendingUp} 
            trend={crecimientoVentas} 
          />
          <StatCard 
            title="Pérdidas Totales" 
            value={formatCurrency(safeData.resumen.total_perdidas)} 
            icon={TrendingDown} 
            isNegative={safeData.resumen.total_perdidas > 0}
          />
          <StatCard 
            title="Pedidos Realizados" 
            value={safeData.resumen.total_ordenes} 
            icon={ShoppingCart} 
          />
          <StatCard 
            title="Devoluciones Pendientes" 
            value={safeData.resumen.devoluciones_pendientes} 
            icon={RotateCcw} 
            isNegative={safeData.resumen.devoluciones_pendientes > 0}
          />
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTrendChart data={trendChartData} formatCurrency={formatCurrency} />
          <PerdidasTrendChart data={perdidasTrendChartData} formatCurrency={formatCurrency} />
        </div>

        {/* Third Row: Daily Sales & Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-full">
            <VentasMesChart
              data={ventasMesChartData}
              formatCurrency={formatCurrency}
              hasDateFilter={!!(dateRange.from || dateRange.to)}
            />
          </div>
          <div className="h-full">
            <OrderStatusPie data={ordersByStatus} />
          </div>
        </div>

        {/* Fourth Row: Lists and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingMesCard 
            products={safeData.productos_mas_vendidos} 
            allProducts={productos} 
          />
          <CriticalStockCard products={productosStockCriticoList} />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes premiumFadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-premium-fade-in-up {
          animation: premiumFadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
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
