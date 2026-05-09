import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Search, Package, ShoppingCart, User as UserIcon, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { formatCurrency } from "../../../utils/compraUtils";
import { AsyncProductSelect } from "../../AsyncProductSelect";

interface CompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onFieldChange: (name: string, value: any) => void;
  addRow: () => void;
  removeRow: (i: number) => void;
  updateRow: (i: number, field: string, val: any) => void;
  proveedores: any[];
  productos: any[];
  isSaving: boolean;
  onSave: () => void;
  fieldErrors: Record<string, string>;
}

// ── Componente principal ──────────────────────────────────────
export function CompraFormDialog({
  open,
  onOpenChange,
  formData,
  onFieldChange,
  addRow,
  removeRow,
  updateRow,
  proveedores,
  productos,
  isSaving,
  onSave,
  fieldErrors,
}: CompraFormDialogProps) {
  const totalPurchase = formData.detalles.reduce(
    (acc: number, d: any) => acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white border border-gray-100 !w-[95vw] !max-w-[95vw] rounded-2xl shadow-2xl p-0 overflow-hidden"
      >
        {/* Header (Inspired by Ventas) */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
              }}
            >
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Nueva Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Registra la adquisición de productos para el inventario
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
        <div 
          className="no-scrollbar overflow-y-auto"
          style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "65vh" }}
        >
          {/* Proveedor y Observaciones - Lado a Lado (Inspired by Ventas) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserIcon className="w-3.5 h-3.5" /> Proveedor <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Select value={formData.proveedorId} onValueChange={(v) => onFieldChange("proveedorId", v)}>
                <SelectTrigger className={`h-11 rounded-xl bg-white text-sm focus:ring-[#c47b96]/10 ${fieldErrors?.proveedorId ? "border-rose-400" : "border-gray-200 focus:border-[#c47b96]"}`}>
                  <SelectValue placeholder="Seleccionar proveedor..." />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="bg-white border-gray-100 shadow-xl rounded-xl" style={{ zIndex: 99999 }}>
                  {proveedores.filter(p => p.estado === "activo").map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors?.proveedorId && <span className="micro-validation-error ml-1">{fieldErrors.proveedorId}</span>}
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ClipboardList className="w-3.5 h-3.5" /> Observaciones
              </p>
              <Input
                value={formData.observaciones}
                onChange={(e) => onFieldChange("observaciones", e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 bg-white text-sm"
                placeholder="Ej: Factura #12345..."
              />
            </div>
          </div>

          {/* Sección de Productos (Inspired by Ventas) */}
          <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px", overflow: "hidden" }}>
            <div
              className="flex items-center justify-between"
              style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                <Package className="w-3.5 h-3.5" /> Productos <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Button
                type="button"
                size="sm"
                onClick={addRow}
                className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            </div>

            <div style={{ padding: "0 16px", maxHeight: "300px", overflowY: "auto" }} className="no-scrollbar">
              {formData.detalles.length === 0 ? (
                <div style={{ padding: "48px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
                  No hay productos añadidos. Haz clic en «Añadir» para comenzar.
                </div>
              ) : (
                formData.detalles.map((d: any, i: number) => {
                  const subtotal = (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0);
                  const hasCantError = !!fieldErrors?.[`cantidad_${i}`];
                  const hasPriceError = !!fieldErrors?.[`precioUnitario_${i}`];

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "16px 0",
                        borderBottom: i < formData.detalles.length - 1 ? "1px solid #f3f4f6" : "none",
                        position: "relative",
                        zIndex: 100 - i,
                      }}
                    >
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "6px" }}>Producto</p>
                          <div className={fieldErrors?.[`producto_${i}`] ? "ring-2 ring-rose-200 rounded-xl transition-all" : ""}>
                            <AsyncProductSelect
                              value={d.productoId}
                              onlyWithStock={false}
                              onChange={(val, prodObj) => {
                                updateRow(i, "productoId", val);
                                if (prodObj) {
                                  updateRow(i, "precioUnitario", prodObj.precioCompra || 0);
                                }
                              }}
                            />
                          </div>
                          {fieldErrors?.[`producto_${i}`] && <span className="micro-validation-error ml-1 mt-1">{fieldErrors[`producto_${i}`]}</span>}
                        </div>

                        <div className="col-span-2">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "6px" }}>Cant.</p>
                          <Input
                            type="number"
                            min="1"
                            value={d.cantidad}
                            onChange={(e) => updateRow(i, "cantidad", e.target.value)}
                            className={`h-11 rounded-xl transition-all ${hasCantError ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-200" : "border-gray-200 text-gray-800 focus:ring-[#c47b96]/20"}`}
                          />
                          {hasCantError && <span className="micro-validation-error text-center">{fieldErrors[`cantidad_${i}`]}</span>}
                        </div>

                        <div className="col-span-3">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "6px" }}>Precio Costo</p>
                          <Input
                            type="number"
                            min="0"
                            value={d.precioUnitario}
                            onChange={(e) => updateRow(i, "precioUnitario", e.target.value)}
                            className={`h-11 rounded-xl transition-all ${hasPriceError ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-200" : "border-gray-200 text-gray-800 focus:ring-[#c47b96]/20"}`}
                          />
                          {hasPriceError && <span className="micro-validation-error text-center">{fieldErrors[`precioUnitario_${i}`]}</span>}
                        </div>

                        <div className="col-span-2">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "6px" }}>Total</p>
                          <div style={{ height: "44px", padding: "0 12px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            <span style={{ fontSize: "13px", fontWeight: 800, color: subtotal > 0 ? "#1f2937" : "#9ca3af" }}>
                              {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="absolute -top-1 -right-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRow(i)}
                            style={{ height: "24px", width: "24px", padding: 0 }}
                            className="bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer (Inspired by Ventas) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white z-10">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af" }}>Inversión Total:</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#c47b96", letterSpacing: "-0.5px" }}>
              {formatCurrency(totalPurchase)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              style={{
                padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                border: "1.5px solid #f0d5e0", background: "#fff8fb", color: "#c47b96",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fdf2f6"; e.currentTarget.style.borderColor = "#c47b96"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff8fb"; e.currentTarget.style.borderColor = "#f0d5e0"; }}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || formData.detalles.length === 0}
              style={{
                padding: "10px 28px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                cursor: (isSaving || formData.detalles.length === 0) ? "not-allowed" : "pointer",
                border: "none",
                background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
                transition: "all 0.2s",
                opacity: (isSaving || formData.detalles.length === 0) ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSaving && formData.detalles.length > 0) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)";
                }
              }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)"; }}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : "Confirmar Compra"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}