import { AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
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
                Cerrar Sesión
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                ¿Estás seguro de que deseas salir?
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
        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black rounded-lg px-6 h-10 text-sm font-medium transition-all cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="rounded-lg text-white font-semibold px-6 h-10 text-sm transition-all hover:bg-red-400 hover:border-0 cursor-pointer"
            style={{ background: "#ef4444" }}
          >
            Cerrar Sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
