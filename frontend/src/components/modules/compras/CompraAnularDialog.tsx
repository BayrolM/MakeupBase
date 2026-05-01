import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";

interface CompraAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compra: any;
  isSaving: boolean;
  onConfirm: () => void;
}

export function CompraAnularDialog({
  open,
  onOpenChange,
  compra,
  isSaving,
  onConfirm,
}: CompraAnularDialogProps) {
  if (!compra) return null;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Anular Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                #{compra.id}
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

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <div className="text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              ¿Estás seguro de que deseas anular esta compra? Esta acción es{" "}
              <strong className="text-red-500">irreversible</strong> y todos los productos ingresados serán descontados del inventario.
            </p>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700 leading-relaxed">
              El stock de cada producto se restará automáticamente al confirmar la anulación.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-11 font-bold text-sm"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 rounded-xl font-bold h-11 text-sm border-0 shadow-lg text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#c47b96", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </span>
            ) : "Sí, Anular"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
