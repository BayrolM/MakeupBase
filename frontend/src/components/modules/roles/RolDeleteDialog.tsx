import { AlertCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";

interface RolDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: any;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function RolDeleteDialog({
  open,
  onOpenChange,
  rol,
  isDeleting,
  onConfirm,
}: RolDeleteDialogProps) {
  if (!rol) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isDeleting) onOpenChange(false);
      }}
    >
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0"
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
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Eliminar Rol
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Esta acción no se puede deshacer
              </p>
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
        <div className="p-6 space-y-4">
          <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3 border border-red-100/50">
            <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                ¿Estás seguro que deseas eliminar permanentemente el rol{" "}
                <span className="font-bold text-gray-900 uppercase tracking-tight">
                  "{rol.nombre}"
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Esta acción eliminará las configuraciones de permisos asociadas.
                Asegúrate de que ningún usuario dependa de este rol antes de
                continuar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 bg-gray-50/30">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="px-5 h-10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all border border-gray-200 bg-white"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 h-10 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2"
            style={{ background: "#ef4444" }}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              "Confirmar Eliminación"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
