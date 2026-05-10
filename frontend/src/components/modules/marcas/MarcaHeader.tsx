import { Plus, Tags } from "lucide-react";

interface MarcaHeaderProps {
  isAdmin: boolean;
  onOpenDialog: () => void;
}

export function MarcaHeader({ isAdmin, onOpenDialog }: MarcaHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-5">
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <div className="relative px-6 py-8 luxury-header-gradient">
          <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <Tags className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight luxury-text-cream">Marcas</h1>
                  <p className="text-sm mt-0.5 luxury-text-cream">Gestión de marcas de productos</p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenDialog}
              disabled={!isAdmin}
              className={`luxury-button-premium ${!isAdmin ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
            >
              <Plus className="w-5 h-5" />
              Nueva Marca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
