import { useState } from "react";
import { X, Plus, Trash2, Search, Package } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { formatCurrency } from "../../../utils/compraUtils";

interface CompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    proveedorId: string;
    observaciones: string;
    detalles: {
      productoId: string;
      cantidad: number;
      precioUnitario: number;
    }[];
  };
  setFormData: (data: any) => void;
  proveedores: any[];
  productos: any[];
  isSaving: boolean;
  onSave: () => void;
}

function ProductRow({ d, index, formData, setFormData, productos }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const prod = productos.find((x: any) => x.id === d.productoId);

  const filtered = productos.filter((p: any) => 
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: index < formData.detalles.length - 1 ? "1px solid #f3f4f6" : "none",
        position: "relative",
      }}
    >
      {/* Fila de campos en línea */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", width: "100%" }}>
        {/* Producto */}
        <div style={{ flex: "2", minWidth: 0 }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "5px", letterSpacing: "0.05em" }}>
            Producto
          </p>
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={open ? search : (prod ? prod.nombre : "")}
                onFocus={() => {
                  setOpen(true);
                  setSearch("");
                }}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpen(true);
                  // Opcional: si borra todo, podemos limpiar el producto seleccionado
                  if (d.productoId && e.target.value === "") {
                    const nd = [...formData.detalles];
                    nd[index].productoId = "";
                    setFormData({ ...formData, detalles: nd });
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setOpen(false), 200);
                }}
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                  padding: "0 30px 0 12px",
                  outline: "none",
                  background: "white",
                  color: "#111827",
                  textOverflow: "ellipsis"
                }}
              />
              <ChevronsUpDown className="h-4 w-4 opacity-50 absolute right-3 pointer-events-none" />
            </div>

            {open && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                minWidth: "350px", // Más ancho para que se vea completo por fuera
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginTop: 4,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 999999,
                maxHeight: 250,
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ overflowY: "auto", padding: 4 }}>
                  {filtered.length === 0 ? (
                    <div style={{ padding: "8px", textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
                      No encontrado.
                    </div>
                  ) : (
                    filtered.map((p: any) => (
                      <div
                        key={p.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Evita que el input pierda el foco y se cierre antes de tiempo
                          const nd = [...formData.detalles];
                          nd[index].productoId = p.id;
                          nd[index].precioUnitario = p.precioCompra || "";
                          setFormData({ ...formData, detalles: nd });
                          setOpen(false);
                          setSearch(""); // reset search
                        }}
                        style={{
                          padding: "8px 8px",
                          fontSize: 12,
                          cursor: "pointer",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          color: "#374151"
                        }}
                        className="hover:bg-gray-100"
                      >
                        <Check className={`mr-2 h-4 w-4 ${d.productoId === p.id ? "opacity-100" : "opacity-0"}`} />
                        {p.nombre}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Unidad */}
        <div style={{ flex: "0.8", minWidth: 0 }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "5px", letterSpacing: "0.05em" }}>
            Unidad
          </p>
          <input
            type="number"
            min="1"
            value={d.cantidad}
            onChange={(e) => {
              const nd = [...formData.detalles];
              nd[index].cantidad = e.target.value;
              setFormData({ ...formData, detalles: nd });
            }}
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 14,
              color: "#1f2937",
              padding: "0 4px",
              outline: "none",
              MozAppearance: "textfield",
            }}
            className="input-no-spin"
            placeholder="0"
          />
        </div>

        {/* Costo Unitario */}
        <div style={{ flex: "1.2", minWidth: 0 }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "5px", letterSpacing: "0.05em" }}>
            Costo Unit.
          </p>
          <input
            type="number"
            value={d.precioUnitario}
            onChange={(e) => {
              const nd = [...formData.detalles];
              nd[index].precioUnitario = e.target.value;
              setFormData({ ...formData, detalles: nd });
            }}
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontWeight: 700,
              fontSize: 13,
              color: "#1f2937",
              padding: "0 8px",
              outline: "none",
              MozAppearance: "textfield",
            }}
            className="input-no-spin"
            placeholder="0"
          />
        </div>

        {/* Total */}
        <div style={{ flex: "1.2", minWidth: 0 }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "5px", letterSpacing: "0.05em" }}>
            Total
          </p>
          <div style={{
            height: 36,
            background: "#f9fafb",
            border: "1px solid #f3f4f6",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 8px",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#c47b96", whiteSpace: "nowrap" }}>
              {formatCurrency((Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0))}
            </span>
          </div>
        </div>

        {/* Botón eliminar */}
        <div style={{ flex: "0 0 32px", display: "flex", justifyContent: "flex-end", paddingBottom: "6px" }}>
          <button
            onClick={() => {
              const nd = [...formData.detalles];
              nd.splice(index, 1);
              setFormData({ ...formData, detalles: nd });
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1px solid #ef4444",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#ef4444",
              padding: 0,
              flexShrink: 0,
            }}
            title="Eliminar producto"
            className="hover:bg-red-100 transition-colors"
          >
            <Trash2 style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompraFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  proveedores,
  productos,
  isSaving,
  onSave,
}: CompraFormDialogProps) {


  const totalPurchase = formData.detalles.reduce(
    (acc: number, curr: any) => acc + (Number(curr.cantidad) || 0) * (Number(curr.precioUnitario) || 0),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[1400px] rounded-2xl shadow-2xl p-0 overflow-hidden">
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
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Nueva Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Formulario para registrar una nueva adquisición de productos
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
          .input-no-spin::-webkit-inner-spin-button, 
          .input-no-spin::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          .input-no-spin { -moz-appearance: textfield; }
        `}} />

        <div 
          className="no-scrollbar overflow-y-auto"
          style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "65vh" }}
        >
          {/* Fila superior: Proveedor + Observaciones */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
            {/* Proveedor */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Search className="w-3.5 h-3.5" /> Proveedor <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                <Select
                  value={formData.proveedorId}
                  onValueChange={(v) => setFormData({ ...formData, proveedorId: v })}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-white border-gray-200">
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-100">
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observaciones */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                Observaciones
              </p>
              <Input
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="h-10 rounded-lg border-gray-200 bg-white"
                placeholder="Ej: Factura #12345..."
              />
            </div>
          </div>

          {/* Sección de Productos */}
          <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px" }}>
            {/* Header productos */}
            <div className="flex items-center justify-between" style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                <Package className="w-3.5 h-3.5" /> Productos <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const newDetalle = {
                    productoId: "",
                    cantidad: "",
                    precioUnitario: "",
                  };
                  setFormData({
                    ...formData,
                    detalles: [...formData.detalles, newDetalle]
                  });
                }}
                className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            </div>

            {/* Lista de productos */}
            <div style={{ padding: "0 16px" }}>
              {formData.detalles.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm italic">
                  No hay productos agregados. Haz clic en "Añadir" para comenzar.
                </div>
              ) : (
                formData.detalles.map((d: any, index: number) => (
                  <ProductRow 
                    key={index} 
                    d={d} 
                    index={index} 
                    formData={formData} 
                    setFormData={setFormData} 
                    productos={productos} 
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer: Total + Botones */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10">
          {/* Total */}
          <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Inversión Total
            </p>
            <span className="text-[#c47b96] font-black text-2xl">
              {formatCurrency(totalPurchase)}
            </span>
          </div>
          {/* Botones */}
          <div className="flex items-center gap-4 ml-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-12 text-sm font-bold whitespace-nowrap"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || formData.detalles.length === 0}
              className="rounded-xl font-bold px-8 h-12 text-sm border-0 whitespace-nowrap transition-all shadow-md hover:opacity-90"
              style={{ backgroundColor: formData.detalles.length === 0 ? "#d1d5db" : "#c47b96", color: "#ffffff" }}
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                "Guardar Compra"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
