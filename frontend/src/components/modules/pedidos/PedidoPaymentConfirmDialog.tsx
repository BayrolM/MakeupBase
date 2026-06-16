import { 
  X, 
  CreditCard, 
  CheckCircle2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "../../ui/dialog";
import { Button } from "../../ui/button";

interface PedidoPaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoToConfirm: any;
  isSaving: boolean;
  onConfirm: () => void;
}

export function PedidoPaymentConfirmDialog({
  open,
  onOpenChange,
  pedidoToConfirm,
  isSaving,
  onConfirm,
}: PedidoPaymentConfirmDialogProps) {
  if (!pedidoToConfirm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 w-[95vw] max-w-[450px] sm:max-w-[450px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 12,
                background: "linear-gradient(135deg, #10b981, #34d399)",
                boxShadow: "0 2px 8px rgba(16,185,129,0.3)"
              }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Confirmar Pago
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Pedido #{pedidoToConfirm.id.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div 
            className="rounded-2xl p-5 flex gap-4 border"
            style={{ 
              backgroundColor: "#f0fdf4",
              borderColor: "#bbf7d0"
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: "white" }}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-800">
                ¿Confirmar recepción del pago?
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Esta acción marcará el pedido como PAGADO y permitirá proceder con el despacho. Una vez confirmado, no se podrá revertir esta acción.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl h-11 font-semibold shadow-sm transition-all cursor-pointer"
              style={{ background: "#ffffff" }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isSaving}
              className="flex-1 justify-center h-11 rounded-xl font-bold shadow-md transition-all text-white hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #10b981, #34d399)",
              }}
            >
              {isSaving ? "Guardando..." : "Sí, confirmar pago"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
