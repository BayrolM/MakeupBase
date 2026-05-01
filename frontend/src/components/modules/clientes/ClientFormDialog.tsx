import { useState } from "react";
import {
  Pencil,
  Users,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Building2,
  Hash as HashIcon,
  Eye,
  EyeOff,
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

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCliente: any;
  formData: any;
  setFormData: (data: any) => void;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
  onFieldChange: (name: string, value: string) => void;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  editingCliente,
  formData,
  fieldErrors,
  isSaving,
  onSave,
  onFieldChange,
}: ClientFormDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {editingCliente ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingCliente
                  ? "Modifica la información del cliente existente"
                  : "Completa los campos para registrar un nuevo cliente"}
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

        <div className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#c47b96]" />
                Nombres <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.nombres}
                onChange={(e) => onFieldChange("nombres", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.nombres ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Juan"
                disabled={isSaving}
              />
              {fieldErrors.nombres && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.nombres}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#c47b96]" />
                Apellidos <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.apellidos}
                onChange={(e) => onFieldChange("apellidos", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.apellidos ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Pérez"
                disabled={isSaving}
              />
              {fieldErrors.apellidos && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.apellidos}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-[#c47b96]" />
                Tipo de Documento <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(val) => onFieldChange("tipoDocumento", val)}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-11">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 rounded-xl shadow-lg">
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PAS">Pasaporte</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <HashIcon className="w-3.5 h-3.5 text-[#c47b96]" />
                Número de Documento <span className="text-rose-500">*</span>
              </Label>
              <Input
                onChange={(e) => {
                  // Limpia el texto dejando solo letras y números (sin espacios ni símbolos)
                  const letrasYNumeros = e.target.value.replace(
                    /[^a-zA-Z0-9]/g,
                    "",
                  );
                  onFieldChange("numeroDocumento", letrasYNumeros);
                }}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.numeroDocumento ? "border-rose-400" : ""
                }`}
                placeholder="Ej: 123456789"
                disabled={isSaving}
              />
              {fieldErrors.numeroDocumento && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.numeroDocumento}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c47b96]" />
                Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.email ? "border-rose-400" : ""
                }`}
                placeholder="ejemplo@correo.com"
                disabled={isSaving}
              />
              {fieldErrors.email && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c47b96]" />
                Teléfono <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.telefono}
                maxLength={10}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/[^0-9]/g, "");
                  onFieldChange("telefono", soloNumeros);
                }}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.telefono ? "border-rose-400" : ""
                }`}
                placeholder="Ej: 3001234567"
                disabled={isSaving}
              />
              {fieldErrors.telefono && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.telefono}
                </p>
              )}
            </div>
          </div>

          {!editingCliente && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#c47b96]" />
                  Contraseña <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.passwordHash}
                    onChange={(e) =>
                      onFieldChange("passwordHash", e.target.value)
                    }
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 pr-10 ${
                      fieldErrors.passwordHash ? "border-rose-400" : ""
                    }`}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.passwordHash && (
                  <p className="text-rose-500 text-[10px] mt-1">
                    {fieldErrors.passwordHash}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#c47b96]" />
                  Confirmar Contraseña <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword || ""}
                    onChange={(e) =>
                      onFieldChange("confirmPassword", e.target.value)
                    }
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 pr-10 ${
                      fieldErrors.confirmPassword ? "border-rose-400" : ""
                    }`}
                    placeholder="Repite la contraseña"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-rose-500 text-[10px] mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c47b96]" />
                Dirección
              </Label>
              <Input
                value={formData.direccion}
                onChange={(e) => onFieldChange("direccion", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.direccion ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Cl. 10 # 5-10"
                disabled={isSaving}
              />
              {fieldErrors.direccion && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.direccion}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                Ciudad
              </Label>
              <Input
                value={formData.ciudad}
                onChange={(e) => onFieldChange("ciudad", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.ciudad ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Bogotá"
                disabled={isSaving}
              />
              {fieldErrors.ciudad && (
                <p className="text-rose-500 text-[10px] mt-1">
                  {fieldErrors.ciudad}
                </p>
              )}
            </div>
          </div>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fdf2f6";
              e.currentTarget.style.borderColor = "#c47b96";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff8fb";
              e.currentTarget.style.borderColor = "#f0d5e0";
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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(196,123,150,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(196,123,150,0.3)";
            }}
          >
            {isSaving ? (
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                    display: "inline-block",
                  }}
                />
                <span>Guardando...</span>
              </span>
            ) : editingCliente ? (
              "Actualizar Cliente"
            ) : (
              "Registrar Cliente"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
