import { 
  X, 
  Building2, 
  Settings, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

interface ProveedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProveedor: any;
  formData: {
    tipo_proveedor: string;
    nombre: string;
    email: string;
    telefono: string;
    nit: string;
    direccion: string;
    estado: "activo" | "inactivo";
  };
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ProveedorFormDialog({
  open,
  onOpenChange,
  editingProveedor,
  formData,
  setFormData,
  isSaving,
  onSave,
}: ProveedorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[700px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
              }}
            >
              {editingProveedor ? <Settings className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingProveedor ? "Actualiza los datos del aliado" : "Registra un nuevo contacto comercial"}
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

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>
          
          {/* Fila 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                Tipo Persona <span style={{ color: "#f87171" }}>*</span>
              </p>
              <select
                value={formData.tipo_proveedor}
                onChange={(e) => setFormData({ ...formData, tipo_proveedor: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white"
              >
                <option value="Persona Natural">Persona Natural</option>
                <option value="Persona Jurídica">Persona Jurídica</option>
              </select>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 className="w-3.5 h-3.5 text-gray-400" /> Nombre / Razón Social <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                maxLength={100}
                required
                className="h-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white"
                placeholder="Ej: Suministros S.A.S"
              />
            </div>
          </div>

          {/* Fila 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText className="w-3.5 h-3.5 text-gray-400" /> NIT / Documento <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                maxLength={20}
                required
                className="h-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white font-mono"
                placeholder="900.123.456-7"
              />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Teléfono <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                maxLength={20}
                required
                className="h-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white"
                placeholder="+57 321..."
              />
            </div>
          </div>

          {/* Fila 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Correo Electrónico <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                maxLength={100}
                required
                className="h-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white"
                placeholder="contacto@proveedor.com"
              />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Dirección <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                maxLength={150}
                required
                className="h-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white"
                placeholder="Av. Siempre Viva 123"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
            style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </div>
            ) : editingProveedor ? (
              "Actualizar Proveedor"
            ) : (
              "Registrar Proveedor"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
