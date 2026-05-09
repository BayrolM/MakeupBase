import {
  Pencil,
  UserPlus,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Activity,
  Hash as HashIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Proveedor } from "../../../lib/store";

interface ProveedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProveedor: Proveedor | null;
  formData: any;
  onChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
}

export function ProveedorFormDialog({
  open,
  onOpenChange,
  editingProveedor,
  formData,
  onChange,
  fieldErrors,
  isSaving,
  onSave,
}: ProveedorFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isSaving) onOpenChange(false);
      }}
    >
      <DialogContent className="bg-white border-0 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {editingProveedor ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingProveedor
                  ? "Modifica la información del aliado comercial"
                  : "Completa los campos para registrar un nuevo aliado estratégico"}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isSaving) onOpenChange(false);
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                Razón Social <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.nombre}
                onChange={(e) => onChange("nombre", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.nombre ? "border-rose-400" : ""}`}
                placeholder="Ej: Suministros Cosméticos S.A.S"
                disabled={isSaving}
              />
              {fieldErrors.nombre && (
                <span className="micro-validation-error">{fieldErrors.nombre}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <HashIcon className="w-3.5 h-3.5 text-[#c47b96]" />
                NIT / Documento <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.nit}
                onChange={(e) => onChange("nit", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.nit ? "border-rose-400" : ""}`}
                placeholder="Ej: 900123456-7"
                disabled={isSaving}
              />
              {fieldErrors.nit && (
                <span className="micro-validation-error">{fieldErrors.nit}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#c47b96]" />
                Tipo de Proveedor <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.tipo_proveedor}
                onValueChange={(v) => onChange("tipo_proveedor", v)}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-11">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 rounded-xl shadow-lg">
                  <SelectItem value="Persona Natural">Persona Natural</SelectItem>
                  <SelectItem value="Persona Jurídica">Persona Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c47b96]" />
                Teléfono <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.telefono}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/[^0-9]/g, "");
                  onChange("telefono", soloNumeros);
                }}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.telefono ? "border-rose-400" : ""}`}
                placeholder="Ej: 3001234567"
                disabled={isSaving}
                maxLength={20}
              />
              {fieldErrors.telefono && (
                <span className="micro-validation-error">{fieldErrors.telefono}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c47b96]" />
                Email Corporativo <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => onChange("email", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.email ? "border-rose-400" : ""}`}
                placeholder="Ej: contacto@empresa.com"
                disabled={isSaving}
              />
              {fieldErrors.email && (
                <span className="micro-validation-error">{fieldErrors.email}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c47b96]" />
                Dirección Principal <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.direccion}
                onChange={(e) => onChange("direccion", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.direccion ? "border-rose-400" : ""}`}
                placeholder="Ej: Calle 50 #30-20"
                disabled={isSaving}
              />
              {fieldErrors.direccion && (
                <span className="micro-validation-error">{fieldErrors.direccion}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#c47b96]" />
                Estado Operativo
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(v) => onChange("estado", v)}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 rounded-xl shadow-lg">
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!editingProveedor && (
            <div className="p-4 rounded-xl bg-[#fff0f5] border border-[#f0d5e0]">
              <p className="text-[#c47b96] text-[11px] font-medium">
                El proveedor se registrará con estado "Activo" por defecto para comenzar operaciones.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-5 bg-white border-t border-gray-100 sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "1.5px solid #f0d5e0",
              background: "#fff8fb",
              color: "#c47b96",
              transition: "all 0.2s",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              padding: "10px 28px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "none",
              background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
              transition: "all 0.2s",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{editingProveedor ? "Actualizando..." : "Guardando..."}</span>
              </span>
            ) : editingProveedor ? (
              "Actualizar Proveedor"
            ) : (
              "Registrar Proveedor"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
