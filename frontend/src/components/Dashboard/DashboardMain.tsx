import { useStore } from "../../lib/store";
import { PageHeader } from "../layout/PageHeader";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  LayoutDashboard,
  Package
} from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { C } from "../../styles/dashboardStyles";

// Sub-components
import { StatCard } from "./StatCard";
import { SalesTrendChart } from "./SalesTrendChart";
import { OrderStatusPie } from "./OrderStatusPie";
import { RankingMesCard } from "./RankingMesCard";
import { CriticalStockCard } from "./CriticalStockCard";

export function Dashboard() {
  const { productos } = useStore();
  const { 
    safeData, 
    ordersByStatus, 
    productosStockCriticoList, 
    trendChartData, 
    formatCurrency 
  } = useDashboardData();

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
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Ingresos Totales" 
            value={formatCurrency(safeData.resumen.total_ventas)} 
            icon={TrendingUp} 
            trend="+12.5%" 
          />
          <StatCard 
            title="Pedidos Realizados" 
            value={safeData.resumen.total_ordenes} 
            icon={ShoppingCart} 
            trend="+5.2%" 
          />
          <StatCard 
            title="Clientes Activos" 
            value={safeData.resumen.total_usuarios} 
            icon={Users} 
            trend="+3.1%" 
          />
          <StatCard 
            title="Alerta Stock Bajo" 
            value={safeData.resumen.productos_bajo_stock} 
            icon={Package} 
            isNegative 
          />
        </div>

        {/* Main Chart Section */}
        <SalesTrendChart data={trendChartData} formatCurrency={formatCurrency} />

        {/* Detailed Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingMesCard 
            products={safeData.productos_mas_vendidos} 
            allProducts={productos} 
          />
          
          <div className="space-y-6">
            <OrderStatusPie data={ordersByStatus} />
            <CriticalStockCard products={productosStockCriticoList} />
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
