import {
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Activity,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";

interface ClientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
}

export function ClientDetailDialog({
  open,
  onOpenChange,
  cliente,
}: ClientDetailDialogProps) {
  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {cliente.nombres.charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Perfil del Cliente
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                ID #{cliente.id.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 md:px-6 py-6 overflow-y-auto max-h-[70vh] space-y-5">
          {/* Nombre Completo */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#c47b96]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Nombre Completo</p>
              <p className="text-sm font-bold text-gray-800">{cliente.nombres} {cliente.apellidos}</p>
            </div>
          </div>

          {/* Documento */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-[#c47b96]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">{cliente.tipoDocumento || "Documento"}</p>
              <p className="text-sm font-bold text-gray-800 font-mono">{cliente.numeroDocumento}</p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#c47b96]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
              <p className="text-sm font-bold text-gray-800 truncate">{cliente.email}</p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-[#c47b96]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Teléfono</p>
              <p className="text-sm font-bold text-gray-800">{cliente.telefono || "No registrado"}</p>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#c47b96]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Dirección</p>
              <p className="text-sm font-bold text-gray-800">
                {cliente.direccion || "No registrada"}
                {cliente.ciudad ? `, ${cliente.ciudad}` : ""}
              </p>
            </div>
          </div>

          {/* Departamento / Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#c47b96]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Ciudad</p>
                <p className="text-sm font-bold text-gray-800">{cliente.ciudad || "N/A"}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#c47b96]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Departamento</p>
                <p className="text-sm font-bold text-gray-800">{cliente.departamento || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Fecha Registro */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#c47b96]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Fecha de Registro</p>
              <p className="text-sm font-bold text-gray-800">
                {new Date(cliente.fechaRegistro).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Estado */}
          <div className={`rounded-xl p-4 flex items-center gap-4 ${cliente.estado === "activo" ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cliente.estado === "activo" ? "bg-emerald-100" : "bg-red-100"}`}>
              <Activity className={`w-5 h-5 ${cliente.estado === "activo" ? "text-emerald-600" : "text-red-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Estado</p>
              <p className={`text-sm font-bold ${cliente.estado === "activo" ? "text-emerald-700" : "text-red-700"}`}>
                {cliente.estado === "activo" ? "Activo" : "Inactivo"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 pb-6 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20 cursor-pointer" 
          >
            Cerrar Detalles
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
