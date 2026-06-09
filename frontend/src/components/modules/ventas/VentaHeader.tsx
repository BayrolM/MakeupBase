import { Plus, TrendingUp } from "lucide-react";
import { useStore, hasPermission } from "../../../lib/store";

interface VentaHeaderProps {
  onOpenDialog: () => void;
}

export function VentaHeader({ onOpenDialog }: VentaHeaderProps) {
  const { currentUser } = useStore();
  const canCreate = hasPermission(currentUser, "crear_ventas");

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 pb-5">
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <div className="relative px-4 md:px-6 py-8 luxury-header-gradient">
          <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight luxury-text-cream">
                    Ventas
                  </h1>
                  <p className="text-sm mt-0.5 luxury-text-cream">
                    Gestión de ventas y facturación
                  </p>
                </div>
              </div>
            </div>

            {canCreate && (
              <button onClick={onOpenDialog} className="luxury-button-premium">
                <Plus className="w-5 h-5" />
                Nueva Venta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
