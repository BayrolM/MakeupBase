import { 
  Plus, 
  Trash2, 
  X, 
  User as UserIcon, 
  MapPin, 
  Package, 
  ShoppingBag 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { AsyncClientSelect } from "../../AsyncClientSelect";
import { AsyncProductSelect } from "../../AsyncProductSelect";
import { formatCurrency } from "../../../utils/pedidoUtils";

interface PedidoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, field: string, value: any, prodObj?: any) => void;
}

export function PedidoFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  isSaving,
  onSave,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: PedidoFormDialogProps) {
  const subtotal = formData.productos.reduce((s: number, p: any) => s + (p.cantidad * p.precioUnitario), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[95vw] rounded-2xl shadow-2xl p-0 overflow-hidden">
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
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Nuevo Pedido
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Formulario para registrar un nuevo pedido directo
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

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "65vh", overflowY: "auto" }}>
          {/* Cliente y Dirección - lado a lado */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Cliente */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserIcon className="w-3.5 h-3.5" /> Cliente <span style={{ color: "#f87171" }}>*</span>
              </p>
              <AsyncClientSelect
                value={formData.clienteId}
                onChange={(val) => setFormData({ ...formData, clienteId: val })}
              />
            </div>

          {/* Dirección de Envío */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin className="w-3.5 h-3.5" /> Dirección de Envío <span style={{ color: "#f87171" }}>*</span>
            </p>
            <Input
              value={formData.direccionEnvio}
              onChange={(e) => setFormData({ ...formData, direccionEnvio: e.target.value })}
              placeholder="Ej: Carrera 50 # 10-20"
              className="rounded-xl h-11 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
            />
          </div>

          {/* Ciudad y Departamento */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                Ciudad <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Medellín"
                className="rounded-xl h-11 border-gray-200 bg-white text-sm"
              />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                Departamento <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                placeholder="Antioquia"
                className="rounded-xl h-11 border-gray-200 bg-white text-sm"
              />
            </div>
          </div>
          </div>

          {/* Sección de Productos */}
          <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px" }}>
            {/* Header productos */}
            <div className="flex items-center justify-between" style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6", borderRadius: "12px 12px 0 0" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                <Package className="w-3.5 h-3.5" /> Productos <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onAddProduct}
                className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            </div>

            {/* Lista de productos */}
            <div style={{ padding: "0 16px" }}>
              {formData.productos.map((prod: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px 0",
                    borderBottom: index < formData.productos.length - 1 ? "1px solid #f3f4f6" : "none",
                    position: "relative",
                    zIndex: 100 - index,
                  }}
                >
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Producto
                      </p>
                      <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                        <AsyncProductSelect
                          value={prod.productoId}
                          onChange={(val, prodObj) => onUpdateProduct(index, "productoId", val, prodObj)}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Cant.
                      </p>
                      <Input
                        type="number"
                        min="1"
                        value={prod.cantidad}
                        onChange={(e) => onUpdateProduct(index, "cantidad", e.target.value)}
                        className="border-gray-200 text-gray-800 h-9 rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Precio
                      </p>
                      <div style={{ height: "36px", padding: "0 12px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563" }}>
                          {formatCurrency(prod.precioUnitario)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Total
                      </p>
                      <div style={{ height: "36px", padding: "0 12px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#1f2937" }}>
                          {formatCurrency(prod.cantidad * prod.precioUnitario)}
                        </span>
                      </div>
                    </div>

                    {formData.productos.length > 1 && (
                      <div className="absolute -top-1 -right-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveProduct(index)}
                          style={{ height: "24px", width: "24px", padding: 0 }}
                          className="bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Total + Botones */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white z-10"
        >
          {/* Total */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af" }}>Total:</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#c47b96", letterSpacing: "-0.5px" }}>
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
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
              {isSaving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                  Guardando...
                </span>
              ) : (
                "Crear Pedido"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
