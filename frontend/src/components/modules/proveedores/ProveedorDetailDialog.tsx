import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Calendar,
  User as UserIcon,
  Activity,
  Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
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

  const firstLetter = proveedor.nombre.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado (Inspired by UsuarioDetail) */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {firstLetter}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Ficha del Proveedor
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {proveedor.tipo_proveedor || "Persona Jurídica"}
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
            {/* Información Corporativa */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider uppercase">
                Información Corporativa
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Nombre / Razón Social</p>
                    <p className="text-sm font-bold text-gray-800">{proveedor.nombre}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">NIT / Documento</p>
                    <p className="text-sm font-bold text-gray-800 font-mono">{formatNIT(proveedor.nit)}</p>
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

            {/* Contacto y Ubicación */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider uppercase">
                Contacto y Ubicación
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Email Corporativo</p>
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
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Ubicación</p>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[180px]" title={proveedor.direccion}>
                      {proveedor.direccion || "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado y Nivel (Inspired by UsuarioDetail cards) */}
          <div className="mt-6">
            <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider uppercase mb-4">
              Estado del Aliado
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fff0f5] border border-pink-100 rounded-xl p-4 text-center">
                <Shield className="w-5 h-5 text-[#c47b96] mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800 uppercase">
                  {proveedor.tipo_proveedor || "Persona Jurídica"}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">
                  Tipo de Entidad
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <Activity
                  className={`w-5 h-5 mx-auto mb-2 ${proveedor.estado === "activo" ? "text-emerald-500" : "text-rose-500"}`}
                />
                <p
                  className={`text-sm font-bold uppercase ${proveedor.estado === "activo" ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {proveedor.estado === "activo" ? "Activo" : "Inactivo"}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">
                  Estado de Cuenta
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
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
