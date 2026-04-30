import { Edit, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface DevolucionStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  motivoDecision: string;
  nuevoEstado: string;
  isSaving: boolean;
  onMotivoChange: (val: string) => void;
  onEstadoChange: (val: string) => void;
  onConfirm: (status: string) => void;
}

export function DevolucionStatusDialog({
  open,
  onOpenChange,
  devolucion,
  motivoDecision,
  nuevoEstado,
  isSaving,
  onMotivoChange,
  onEstadoChange,
  onConfirm
}: DevolucionStatusDialogProps) {
  if (!devolucion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}>
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Cambiar Estado</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">Devolución DEV-{devolucion.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Nuevo Estado</Label>
              <Select value={nuevoEstado} onValueChange={onEstadoChange}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11">
                  <SelectValue placeholder="Seleccione nuevo estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aprobada">Aprobar Devolución (Suma Stock)</SelectItem>
                  <SelectItem value="rechazada">Rechazar Permanentemente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Motivo de la Decisión <span className="text-rose-500">*</span></Label>
              <Textarea
                value={motivoDecision}
                onChange={(e) => onMotivoChange(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-800 rounded-2xl min-h-[100px] focus:ring-[#c47b96]/20 focus:border-[#c47b96] py-3 text-sm font-medium"
                placeholder="Explica detalladamente por qué se aprobó o rechazó esta solicitud de devolución..."
                disabled={isSaving}
              />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Mínimo: 3 caracteres</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-3">
             <div className="p-1.5 bg-white rounded-lg border border-indigo-100 h-fit">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
             </div>
             <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                Al marcar como <strong>"Aprobada"</strong>, las cantidades seleccionadas volverán automáticamente al inventario disponible para la venta.
             </p>
          </div>
        </div>

        <div className="flex gap-3 px-8 pb-8 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            style={{
              padding: "10px 22px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "1.5px solid #f0d5e0",
              background: "#fff8fb",
              color: "#c47b96",
              transition: "all 0.2s",
              flex: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fdf2f6"; e.currentTarget.style.borderColor = "#c47b96"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff8fb"; e.currentTarget.style.borderColor = "#f0d5e0"; }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(nuevoEstado)}
            disabled={isSaving || !motivoDecision.trim() || motivoDecision.trim().length < 3}
            style={{
              padding: "10px 28px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: (isSaving || !motivoDecision.trim() || motivoDecision.trim().length < 3) ? "not-allowed" : "pointer",
              border: "none",
              background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
              transition: "all 0.2s",
              opacity: (isSaving || !motivoDecision.trim() || motivoDecision.trim().length < 3) ? 0.7 : 1,
              flex: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)"; }}
          >
            {isSaving ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </span>
            ) : "Confirmar Cambio"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
