import { AlertCircle, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";

interface DevolucionAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  motivoAnulacion: string;
  isSaving: boolean;
  onMotivoChange: (val: string) => void;
  onConfirm: () => void;
}

export function DevolucionAnularDialog({
  open,
  onOpenChange,
  devolucion,
  motivoAnulacion,
  isSaving,
  onMotivoChange,
  onConfirm,
}: DevolucionAnularDialogProps) {
  if (!devolucion) return null;

  const esAprobada = devolucion.estado === "aprobada";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isSaving) onOpenChange(false);
      }}
    >
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#fff1f2",
                boxShadow: "0 2px 8px rgba(239,68,68,0.12)",
              }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-800 leading-tight">
                Anular Devolución
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                DEV-{devolucion.id}
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
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Tarjeta de advertencia */}
          <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 leading-relaxed font-normal">
                ¿Estás seguro que deseas anular esta devolución? Esta acción es{" "}
                <span className="text-red-500">irreversible</span>.
              </p>
            </div>
          </div>
        

          {/* Campo de motivo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Motivo de Anulación <span className="text-red-700">*</span>
            </label>
            <Textarea
              value={motivoAnulacion}
              onChange={(e) => onMotivoChange(e.target.value)}
              disabled={isSaving}
              placeholder="Describe el motivo de la anulación..."
              maxLength={255}
              className={`min-h-[80px] border-gray-200 rounded-xl p-3 text-sm font-normal resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 placeholder:text-gray-400/60 placeholder:font-normal ${motivoAnulacion.length >= 240 ? "border-amber-400" : ""}`}
              style={{ backgroundColor: '#ffffff' }}
            />
            {motivoAnulacion.length >= 240 && motivoAnulacion.length < 255 && (
              <span className="micro-validation-error" style={{ color: "#d97706" }}>
                Te quedan {255 - motivoAnulacion.length} caracteres disponibles
              </span>
            )}
            {motivoAnulacion.length === 255 && (
              <span className="micro-validation-error">
                Límite de caracteres alcanzado
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 md:px-6 pb-6 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-4 h-10 text-sm cursor-pointer"
            style={{ backgroundColor: "#ffffff" }}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving || motivoAnulacion.trim().length < 5}
            className="rounded-lg text-white font-semibold px-4 h-10 text-sm cursor-pointer"
            style={{ background: "#ef4444" }}
          >
            {isSaving ? (
              <span className="flex items-center gap-2 cursor-pointer">
                <Loader2 className="w-4 h-4 animate-spin" />
                Anulando...
              </span>
            ) : (
              "Anular"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
