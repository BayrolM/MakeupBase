import { Edit, CheckCircle2, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
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
  esDefectuoso: boolean;
  onMotivoChange: (val: string) => void;
  onEstadoChange: (val: string) => void;
  onEsDefectuosoChange: (val: boolean) => void;
  onConfirm: (status: string) => void;
}

export function DevolucionStatusDialog({
  open,
  onOpenChange,
  devolucion,
  motivoDecision,
  nuevoEstado,
  isSaving,
  esDefectuoso,
  onMotivoChange,
  onEstadoChange,
  onEsDefectuosoChange,
  onConfirm
}: DevolucionStatusDialogProps) {
  if (!devolucion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 w-[90vw] max-w-[800px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl p-0 overflow-hidden" style={{ '--input-background': '#ffffff' } as React.CSSProperties}>
        <DialogHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-6 border-b border-gray-100 flex-shrink-0 bg-white z-10">
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

        <div className="px-4 md:px-8 py-6 space-y-6 overflow-y-auto flex-1 no-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Nuevo Estado</Label>
              <Select value={nuevoEstado} onValueChange={onEstadoChange}>
                <SelectTrigger className="border-gray-200 text-gray-800 rounded-xl h-11" style={{ backgroundColor: '#ffffff' }}>
                  <SelectValue placeholder="Seleccione nuevo estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aprobada">Aprobar Devolución (Suma Stock)</SelectItem>
                  <SelectItem value="rechazada">Rechazar Permanentemente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {nuevoEstado === "aprobada" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 pt-2">
                <Label className="text-gray-700 font-bold text-sm">Estado Físico del Producto Devuelto <span className="text-rose-500">*</span></Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => onEsDefectuosoChange(false)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${!esDefectuoso ? 'border-[#c47b96] bg-[#fff0f5] shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                     <div className={`p-2 rounded-full ${!esDefectuoso ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                       <CheckCircle2 className={`w-6 h-6 ${!esDefectuoso ? 'text-[#c47b96]' : 'text-gray-400'}`} />
                     </div>
                     <span className={`text-[13px] mt-1 font-bold ${!esDefectuoso ? 'text-[#c47b96]' : 'text-gray-500'}`}>Buen Estado</span>
                     <span className="text-[11px] text-gray-400 text-center leading-tight">El producto retornará al inventario disponible para la venta.</span>
                  </div>
                  
                  <div 
                    onClick={() => onEsDefectuosoChange(true)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${esDefectuoso ? 'border-rose-400 bg-rose-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                     <div className={`p-2 rounded-full ${esDefectuoso ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                       <ShieldAlert className={`w-6 h-6 ${esDefectuoso ? 'text-rose-500' : 'text-gray-400'}`} />
                     </div>
                     <span className={`text-[13px] mt-1 font-bold ${esDefectuoso ? 'text-rose-600' : 'text-gray-500'}`}>Producto Defectuoso</span>
                     <span className="text-[11px] text-gray-400 text-center leading-tight">Se registrará como pérdida y <strong>NO</strong> volverá al stock.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Motivo de la Decisión <span className="text-rose-500">*</span></Label>
              <Textarea
                value={motivoDecision}
                onChange={(e) => onMotivoChange(e.target.value)}
                className="border-gray-200 text-gray-800 rounded-xl min-h-[100px] focus:ring-[#c47b96]/20 focus:border-[#c47b96] py-3 text-sm font-medium"
                style={{ backgroundColor: '#ffffff' }}
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
                {esDefectuoso && nuevoEstado === 'aprobada' ? (
                  <>Al marcar como <strong>"Aprobada"</strong> con defecto, las cantidades se registrarán en el módulo de <strong>pérdidas</strong>.</>
                ) : (
                  <>Al marcar como <strong>"Aprobada"</strong>, las cantidades seleccionadas volverán automáticamente al inventario disponible para la venta.</>
                )}
             </p>
          </div>
        </div>

        <div className="flex gap-3 px-4 md:px-8 pb-6 pt-5 border-t border-gray-100 bg-white flex-shrink-0 z-10">
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
