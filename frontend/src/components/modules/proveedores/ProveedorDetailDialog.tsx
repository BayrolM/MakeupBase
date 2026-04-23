import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Calendar,
  User as UserIcon,
  Activity
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
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
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Ficha del Proveedor
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {proveedor.nombre}
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

        <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-6">
            {/* Información Principal */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Información Principal
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">NIT / Documento</p>
                    <p className="text-sm font-bold text-gray-800 font-mono">{formatNIT(proveedor.nit)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Tipo de Proveedor</p>
                    <p className="text-sm font-bold text-gray-800">{proveedor.tipo_proveedor || "Persona Natural"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Fecha Registro</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(proveedor.fechaRegistro).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Contacto y Ubicación
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[180px]">{proveedor.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Teléfono</p>
                    <p className="text-sm font-bold text-gray-800">{proveedor.telefono || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Dirección</p>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[180px]" title={proveedor.direccion}>
                      {proveedor.direccion || "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="mt-6">
            <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider mb-4">
              Estado de Proveedor
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center col-span-2">
                <Activity className={`w-5 h-5 mx-auto mb-2 ${proveedor.estado === 'activo' ? 'text-emerald-500' : 'text-rose-500'}`} />
                <p className={`text-sm font-bold uppercase ${proveedor.estado === 'activo' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Estado de Cuenta</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20"
          >
            Cerrar Ficha
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
