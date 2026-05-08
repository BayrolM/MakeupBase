import { 
  X, 
  User as UserIcon, 
  MapPin, 
  Package, 
  Trash2, 
  Plus,
  Info,
  Tag,
  DollarSign,
  ClipboardList,
  Loader2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { AsyncClientSelect } from "../../AsyncClientSelect";
import { AsyncProductSelect } from "../../AsyncProductSelect";
import { formatCurrency } from "../../../utils/pedidoUtils";

interface PedidoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPedido: any;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, field: string, value: any, prodObj?: any) => void;
}

export function PedidoEditDialog({
  open,
  onOpenChange,
  editingPedido,
  formData,
  setFormData,
  isSaving,
  onSave,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: PedidoEditDialogProps) {
  if (!editingPedido) return null;
  const isPending = editingPedido.estado === "pendiente";
  const subtotal = formData.productos.reduce((s: number, p: any) => s + (p.cantidad * p.precioUnitario), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 w-[95vw] max-w-[1100px] sm:max-w-[1100px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0 no-scrollbar">
        {/* Header - Sticky like ProductFormDialog */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Editar Pedido #{editingPedido.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {isPending ? "Modifica los items y datos de envío" : "Solo se permite modificar la dirección de envío"}
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

        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-5 py-2">
            {/* Cliente */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#c47b96]" />
                Cliente <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <AsyncClientSelect
                  value={formData.clienteId}
                  onChange={(val) => setFormData({ ...formData, clienteId: val })}
                  disabled={!isPending || isSaving}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#c47b96]" />
                  Dirección de Envío <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.direccionEnvio || formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccionEnvio: e.target.value })}
                  placeholder="Ej: Carrera 50 # 10-20"
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm">Ciudad *</Label>
                  <Input
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm">Departamento *</Label>
                  <Input
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {!isPending && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">
                Este pedido no está en estado <span className="font-bold">Pendiente</span>. No se pueden modificar los productos ni el cliente.
              </p>
            </div>
          )}

          {/* Sección de Productos */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-gray-700 font-bold text-sm flex items-center gap-2 uppercase tracking-wider">
                <Package className="w-4 h-4 text-[#c47b96]" />
                Items del Pedido
              </Label>
              {isPending && (
                <Button
                  type="button"
                  onClick={onAddProduct}
                  className="h-9 luxury-button-modal hover:opacity-90 rounded-lg text-white font-bold text-xs border-0 px-4"
                  disabled={isSaving}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Añadir Producto
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {formData.productos.length === 0 ? (
                <div className="py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm italic">No hay productos seleccionados</p>
                </div>
              ) : (
                formData.productos.map((prod: any, index: number) => (
                  <div key={index} className={`grid grid-cols-12 gap-4 items-end p-5 rounded-2xl border transition-all ${isPending ? "bg-white border-gray-100 hover:border-[#fce8f0] hover:shadow-sm" : "bg-gray-50/50 border-gray-100"} relative`}>
                    <div className="col-span-6">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">Producto</Label>
                      <AsyncProductSelect
                        value={prod.productoId}
                        onChange={(val, prodObj) => onUpdateProduct(index, "productoId", val, prodObj)}
                        disabled={!isPending || isSaving}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={prod.cantidad}
                        onChange={(e) => onUpdateProduct(index, "cantidad", e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl h-11"
                        disabled={!isPending || isSaving}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">P. Unitario</Label>
                      <div className="h-11 px-4 bg-gray-100/50 border border-gray-100 flex items-center text-xs font-bold text-gray-500 rounded-xl">
                        {formatCurrency(prod.precioUnitario)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest text-[#c47b96]">Subtotal</Label>
                      <div className="h-11 px-4 bg-[#fff0f5] border border-[#fad6e3] flex items-center text-sm font-black text-[#c47b96] rounded-xl">
                        {formatCurrency(prod.cantidad * prod.precioUnitario)}
                      </div>
                    </div>
                    {isPending && (
                      <button
                        onClick={() => onRemoveProduct(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-500 hover:border-rose-100 transition-all z-10"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer - Sticky like ProductFormDialog */}
        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
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
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)"; }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                "Actualizar Pedido"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
