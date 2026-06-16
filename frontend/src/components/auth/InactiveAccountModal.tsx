import { Lock, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface InactiveAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InactiveAccountModal({ open, onOpenChange }: InactiveAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
              }}
            >
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Cuenta inactiva
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                No puedes iniciar sesión en este momento
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
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#fff0f5",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #f0d5e0",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <Lock
              style={{
                color: "#c47b96",
                width: 18,
                height: 18,
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  lineHeight: 1.5,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Tu cuenta ha sido desactivada
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  lineHeight: 1.5,
                }}
              >
                No tienes permiso para iniciar sesión. Si crees que esto es
                un error, comunícate con el administrador del sistema.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 pb-6 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg font-semibold px-6 h-10 text-sm text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#c47b96" }}
          >
            Entendido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
