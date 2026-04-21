import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Calendar 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { StatusBadge } from "../../StatusBadge";
import { formatNIT } from "../../../utils/proveedorUtils";

interface ProveedorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor: any;
}

export function ProveedorDetailDialog({
  open,
  onOpenChange,
  proveedor,
}: ProveedorDetailDialogProps) {
  if (!proveedor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[92vw] !max-w-[500px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div
          className="relative px-8 py-6"
          style={{ backgroundColor: "#c47b96" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-xl border border-white/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  Ficha del Proveedor
                </DialogTitle>
                <p className="text-white font-bold mt-0.5 tracking-wide line-clamp-1 max-w-[200px]">
                  {proveedor.nombre}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{
                  background: proveedor.estado === "activo" ? "rgba(209,250,229,0.9)" : "rgba(254,226,226,0.9)",
                  color: proveedor.estado === "activo" ? "#065f46" : "#991b1b",
                }}
              >
                {proveedor.estado}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info rápida en el header */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">
                {proveedor.tipo_proveedor || "Persona Natural"}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">
                {new Date(proveedor.fechaRegistro).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-4 space-y-4">
          <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Información de Contacto</p>
            </div>
            
            <div className="flex flex-col">
               {/* NIT */}
               <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                     <FileText className="w-4 h-4 text-gray-400" />
                     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">NIT / Documento</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 font-mono">{formatNIT(proveedor.nit)}</span>
               </div>
               
               {/* Email */}
               <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                     <Mail className="w-4 h-4 text-gray-400" />
                     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{proveedor.email || "N/A"}</span>
               </div>
               
               {/* Teléfono */}
               <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                     <Phone className="w-4 h-4 text-gray-400" />
                     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Teléfono</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{proveedor.telefono || "N/A"}</span>
               </div>
               
               {/* Dirección */}
               <div className="flex justify-between items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                     <MapPin className="w-4 h-4 text-gray-400" />
                     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Dirección</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-right max-w-[200px] truncate" title={proveedor.direccion}>
                    {proveedor.direccion || "No especificada"}
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl text-white font-semibold h-11 text-sm border-0"
            style={{ backgroundColor: "#c47b96" }}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
