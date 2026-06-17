import {
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Shield,
  Activity,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import { getTipoDocumentoLabel } from "../../../utils/usuarioUtils";

interface UsuarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  roles: any[];
}

export function UsuarioDetailDialog({
  open,
  onOpenChange,
  user,
  roles,
}: UsuarioDetailDialogProps) {
  if (!user) return null;

  const rolNombre =
    roles.find((r: any) => String(r.id) === String(user.rolAsignadoId || user.id_rol))?.nombre ||
    user.rol;

  const isActivo = user.estado === "activo";
  const initials = `${user.nombres?.charAt(0) ?? ""}${user.apellidos?.charAt(0) ?? ""}`.toUpperCase();

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    truncate = false,
  }: {
    icon: any;
    label: string;
    value: string;
    truncate?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
      <div
        className="flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "rgba(196,123,150,0.08)",
        }}
      >
        <Icon className="w-3.5 h-3.5 text-[#c47b96]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-tight mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-medium text-gray-600 leading-snug ${
            truncate ? "truncate" : "break-words"
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );

  const hasLocation = user.departamento || user.ciudad || user.direccion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white border-0 rounded-2xl shadow-2xl p-0 overflow-hidden"
        style={{ maxWidth: "800px", width: "90vw" } as React.CSSProperties}
      >
        {/* ── Banner superior ── */}
        <div
          style={{
            background: "#c47b96",
            padding: "20px 24px 38px",
            position: "relative",
          }}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-lg"
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(6px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              {initials}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white leading-tight">
                {user.nombres} {user.apellidos}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                {user.email}
              </DialogDescription>
            </div>
          </div>

          {/* Badges flotantes */}
          <div className="absolute flex gap-2" style={{ bottom: "-14px", left: "24px" }}>
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-md"
              style={{
                background: "#fff",
                color: "#7b1347",
                border: "1px solid rgba(123,19,71,0.15)",
              }}
            >
              <Shield className="w-3 h-3" />
              {rolNombre}
            </span>
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-md"
              style={{
                background: "#fff",
                color: isActivo ? "#059669" : "#9ca3af",
                border: `1px solid ${isActivo ? "#d1fae5" : "#e5e7eb"}`,
              }}
            >
              <Activity className="w-3 h-3" />
              {isActivo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* ── Cuerpo en 2 columnas ── */}
        <div className="px-6 pt-8 pb-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-5">
              {/* Información Personal */}
              <div>
                <p className="text-[10px] font-bold text-[#c47b96] uppercase tracking-widest mb-3">
                  Información Personal
                </p>
                <div className="bg-gray-50 rounded-xl px-4">
                  <InfoRow
                    icon={CreditCard}
                    label={getTipoDocumentoLabel(user.tipoDocumento)}
                    value={user.numeroDocumento}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Fecha de Registro"
                    value={new Date(user.fechaCreacion).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                </div>
              </div>

              {/* Ubicación */}
              {hasLocation && (
                <div>
                  <p className="text-[10px] font-bold text-[#c47b96] uppercase tracking-widest mb-3">
                    Ubicación
                  </p>
                  <div className="bg-gray-50 rounded-xl px-4">
                    {user.departamento && (
                      <InfoRow icon={Building2} label="Departamento" value={user.departamento} />
                    )}
                    {user.ciudad && (
                      <InfoRow icon={MapPin} label="Ciudad" value={user.ciudad} />
                    )}
                    {user.direccion && (
                      <InfoRow icon={MapPin} label="Dirección" value={user.direccion} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha */}
            <div className="space-y-5">
              {/* Contacto */}
              <div>
                <p className="text-[10px] font-bold text-[#c47b96] uppercase tracking-widest mb-3">
                  Contacto
                </p>
                <div className="bg-gray-50 rounded-xl px-4">
                  <InfoRow icon={Mail} label="Correo electrónico" value={user.email} truncate />
                  <InfoRow icon={Phone} label="Teléfono" value={user.telefono} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-semibold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20 transition-all hover:opacity-90"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
