import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";

import { Input } from "../../ui/input";

import { ArrowRight, Package, Archive, Activity, X } from "lucide-react";
import { Producto } from "../../../lib/store";
import { productService } from "../../../services/productService";
import { toast } from "sonner";

interface ProductMoveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Producto | null;
  onSuccess: () => Promise<void>;
}

export function ProductMoveStockDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductMoveStockDialogProps) {
  const [cantidad, setCantidad] = React.useState<string>("1");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setCantidad("1");
      setError(null);
    }
  }, [open]);

  // Validación en vivo
  React.useEffect(() => {
    if (!product) return;
    const num = parseInt(cantidad);
    if (cantidad === "") {
      setError("Ingresa una cantidad");
    } else if (isNaN(num) || num <= 0) {
      setError("Cantidad inválida");
    } else if (num > product.stockFisico) {
      setError(`Stock insuficiente (máx. ${product.stockFisico})`);
    } else {
      setError(null);
    }
  }, [cantidad, product]);

  const handleMove = async () => {
    if (!product || error) return;

    const num = parseInt(cantidad);
    if (isNaN(num) || num <= 0) {
      toast.error("Cantidad inválida");
      return;
    }

    if (num > product.stockFisico) {
      toast.error("Stock físico insuficiente", {
        description: `Solo tienes ${product.stockFisico} unidades en el almacén físico.`,
      });
      return;
    }

    setIsSaving(true);
    try {
      await productService.moveStock(Number(product.id), num);
      toast.success("Stock movido correctamente", {
        description: `Se han pasado ${num} unidades a stock disponible.`,
      });
      await onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al mover stock");
    } finally {
      setIsSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Mover a Disponible
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Pasa productos del almacén físico a la venta directa.
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Comparativo de Stock */}
          <div className="bg-[#fdf2f6] rounded-xl p-4 border border-[#fce8f0]">
            <p className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider mb-3 text-center">
              Estado Actual del Inventario
            </p>
            <div className="flex items-center justify-between px-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1">
                  <Archive className="w-3 h-3" /> Físico
                </div>
                <div className="text-xl font-black text-gray-800">
                  {product.stockFisico}
                </div>
              </div>

              <div className="px-2 text-[#c47b96]">
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#c47b96] uppercase mb-1">
                  <Activity className="w-3 h-3" /> Disponible
                </div>
                <div className="text-xl font-black text-[#c47b96]">
                  {product.stock}
                </div>
              </div>
            </div>
          </div>

          {/* Input de Cantidad */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Cantidad a mover <span className="text-rose-500">*</span>
            </p>
            <div className="relative">
              <Input
                id="cantidad"
                type="number"
                min="1"
                max={product.stockFisico}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className={`h-10 text-base font-bold rounded-lg border-gray-200 bg-white focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all ${
                  error ? "border-rose-400 ring-1 ring-rose-400/20" : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                Unidades
              </div>
            </div>
            {error ? (
              <span className="micro-validation-error">{error}</span>
            ) : (
              <p className="text-[10px] text-gray-400 font-medium mt-2">
                * El disponible aumentará y el físico disminuirá.
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "1.5px solid #f0d5e0",
              background: "#fff8fb",
              color: "#c47b96",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fdf2f6";
              e.currentTarget.style.borderColor = "#c47b96";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff8fb";
              e.currentTarget.style.borderColor = "#f0d5e0";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleMove}
            disabled={isSaving || !!error}
            style={{
              padding: "10px 28px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving || !!error ? "not-allowed" : "pointer",
              border: "none",
              background:
                isSaving || !!error
                  ? "#e5e7eb"
                  : "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
              color: isSaving || !!error ? "#9ca3af" : "#ffffff",
              boxShadow:
                isSaving || !!error
                  ? "none"
                  : "0 4px 12px rgba(196,123,150,0.3)",
              transition: "all 0.2s",
              opacity: isSaving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (isSaving || !!error) return;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(196,123,150,0.4)";
            }}
            onMouseLeave={(e) => {
              if (isSaving || !!error) return;
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(196,123,150,0.3)";
            }}
          >
            {isSaving ? "Procesando..." : "Mover Stock"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
