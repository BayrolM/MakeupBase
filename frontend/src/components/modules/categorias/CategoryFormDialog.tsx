import { Pencil, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Categoria } from "../../../lib/store";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategoria: Categoria | null;
  formData: { nombre: string; descripcion: string; estado: "activo" | "inactivo" };
  setFormData: (data: any) => void;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
  validateNombre: (val: string) => string;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  editingCategoria,
  formData,
  setFormData,
  fieldErrors,
  isSaving,
  onSave,
  validateNombre,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
              {editingCategoria ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingCategoria
                  ? "Modifica los datos de la categoría"
                  : "Completa el formulario para crear una nueva categoría"}
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

        {/* Cuerpo */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Nombre <span className="text-rose-500">*</span>
            </p>
            <Input
              value={formData.nombre}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, nombre: val });
              }}
              className={`border-gray-200 text-gray-800 rounded-lg h-9 text-sm focus:ring-[#c47b96]/20 focus:border-[#c47b96] ${
                fieldErrors.nombre ? "border-rose-400" : ""
              }`}
              placeholder="Ej: Maquillaje, Cuidado Facial..."
              maxLength={50}
            />
            {fieldErrors.nombre && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombre}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Descripción (Opcional)
            </p>
            <Textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Describe brevemente esta categoría..."
              className="border-gray-200 text-gray-800 rounded-lg text-sm resize-none focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
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
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fdf2f6"; e.currentTarget.style.borderColor = "#c47b96"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff8fb"; e.currentTarget.style.borderColor = "#f0d5e0"; }}
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
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)"; }}
          >
            {isSaving ? "Guardando..." : editingCategoria ? "Actualizar" : "Crear Categoría"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
