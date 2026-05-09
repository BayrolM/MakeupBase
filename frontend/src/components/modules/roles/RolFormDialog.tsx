import { Pencil, Shield, X, CheckCircle2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { StatusSwitch } from "../../StatusSwitch";
import { MODULOS } from "../../../utils/rolUtils";

interface RolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRol: any;
  formData: any;
  fieldErrors: Record<string, string>;
  isSaving?: boolean;
  onFieldChange: (name: string, value: any) => void;
  onPermisoChange: (
    modulo: string,
    tipo: "ver" | "crear" | "editar" | "eliminar",
    value: boolean,
  ) => void;
  onSave: () => void;
}

export function RolFormDialog({
  open,
  onOpenChange,
  editingRol,
  formData,
  fieldErrors,
  isSaving = false,
  onFieldChange,
  onPermisoChange,
  onSave,
}: RolFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !isSaving && onOpenChange(o)}>
      <DialogContent className="bg-white border-0 max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {editingRol ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingRol ? "Editar Rol" : "Nuevo Rol"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingRol
                  ? "Modifica los privilegios y descripción del rol"
                  : "Define los permisos y nombre para el nuevo rol administrativo"}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => !isSaving && onOpenChange(false)}
            disabled={isSaving}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Información Básica */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#c47b96] rounded-full"></div>
              <h3 className="text-gray-900 font-bold text-sm">
                Información General
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#c47b96]" />
                  Nombre del Rol <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => onFieldChange("nombre", e.target.value)}
                  className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11 focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all ${fieldErrors.nombre ? "border-rose-400 ring-1 ring-rose-400/20" : ""}`}
                  placeholder="Ej: Administrador, Vendedor..."
                  maxLength={30}
                  disabled={
                    isSaving ||
                    (editingRol &&
                      (editingRol.id === "1" || editingRol.id === "2"))
                  }
                />
                <div className="flex justify-between items-center px-1">
                  {fieldErrors.nombre ? (
                    <span className="micro-validation-error">
                      {fieldErrors.nombre}
                    </span>
                  ) : editingRol &&
                    (editingRol.id === "1" || editingRol.id === "2") ? (
                    <p className="text-[10px] text-amber-600 font-medium italic">
                      Rol del sistema (no editable)
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-[10px] text-gray-400">
                    {formData.nombre.length}/30
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[#c47b96]" />
                  Estado del Rol
                </Label>
                <div className="h-11 flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 px-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {formData.estado === "activo"
                      ? "Habilitado"
                      : "Deshabilitado"}
                  </span>
                  <StatusSwitch
                    status={formData.estado}
                    onChange={(newStatus) => onFieldChange("estado", newStatus)}
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[#c47b96]" />
                  Descripción y Responsabilidades
                </Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => onFieldChange("descripcion", e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl min-h-[80px] focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all"
                  placeholder="Explica brevemente para qué sirve este rol..."
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#c47b96] rounded-full"></div>
              <h3 className="text-gray-900 font-bold text-sm">
                Matriz de Privilegios
              </h3>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0] hover:bg-[#fff0f5]">
                    <TableHead className="text-gray-700 font-bold text-[10px] uppercase tracking-wider py-4 pl-6">
                      Módulo
                    </TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-[10px] uppercase tracking-wider py-4">
                      Ver
                    </TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-[10px] uppercase tracking-wider py-4">
                      Crear
                    </TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-[10px] uppercase tracking-wider py-4">
                      Editar
                    </TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-[10px] uppercase tracking-wider py-4">
                      Borrar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULOS.map((modulo) => (
                    <TableRow
                      key={modulo.key}
                      className="border-b border-gray-50 bg-white hover:bg-[#fff0f5]/30 group transition-colors"
                    >
                      <TableCell className="text-gray-800 font-bold text-xs pl-6 py-4">
                        {modulo.label}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={formData.permisos[modulo.key]?.ver || false}
                          onCheckedChange={(checked) =>
                            onPermisoChange(modulo.key, "ver", !!checked)
                          }
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={
                            formData.permisos[modulo.key]?.crear || false
                          }
                          onCheckedChange={(checked) =>
                            onPermisoChange(modulo.key, "crear", !!checked)
                          }
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={
                            formData.permisos[modulo.key]?.editar || false
                          }
                          onCheckedChange={(checked) =>
                            onPermisoChange(modulo.key, "editar", !!checked)
                          }
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={
                            formData.permisos[modulo.key]?.eliminar || false
                          }
                          onCheckedChange={(checked) =>
                            onPermisoChange(modulo.key, "eliminar", !!checked)
                          }
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </span>
            ) : (
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingRol ? "Guardar Cambios" : "Registrar Rol"}</span>
              </span>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
