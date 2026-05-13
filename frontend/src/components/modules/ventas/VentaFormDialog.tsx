import {
  Plus,
  Trash2,
  X,
  User as UserIcon,
  CreditCard,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { AsyncClientSelect } from "../../forms/AsyncClientSelect";
import { AsyncProductSelect } from "../../forms/AsyncProductSelect";
import { GenericCombobox } from "../../forms/GenericCombobox";
import { formatCurrency } from "../../../utils/ventaUtils";

interface VentaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (
    index: number,
    field: string,
    value: any,
    prodObj?: any,
  ) => void;
}

export function VentaFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  isSaving,
  onSave,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: VentaFormDialogProps) {
  const totalVenta = formData.productos.reduce(
    (sum: number, p: any) => sum + p.cantidad * p.precioUnitario,
    0,
  );

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
                Nueva Venta
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Formulario para crear una nueva venta
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

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `,
          }}
        />

        <div
          className="no-scrollbar overflow-y-auto"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxHeight: "65vh",
          }}
        >
          {/* Cliente y Método de Pago - lado a lado */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {/* Cliente */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9ca3af",

                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <UserIcon className="w-3.5 h-3.5" /> Cliente{" "}
                <span style={{ color: "#f87171" }}>*</span>
              </p>
              <AsyncClientSelect
                value={formData.clienteId}
                onChange={(val) => setFormData({ ...formData, clienteId: val })}
              />
            </div>

            {/* Método de Pago */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9ca3af",

                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CreditCard
                  className={`w-3.5 h-3.5 ${!formData.metodoPago ? "text-rose-500 animate-pulse" : ""}`}
                />{" "}
                Método de Pago <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div
                className={
                  !formData.metodoPago
                    ? "ring-2 ring-rose-200 rounded-lg transition-all"
                    : ""
                }
              >
                <GenericCombobox
                  options={[
                    { value: "Efectivo", label: "Efectivo" },
                    { value: "Transferencia", label: "Transferencia" },
                  ]}
                  value={formData.metodoPago}
                  onChange={(v) =>
                    setFormData({ ...formData, metodoPago: v as any })
                  }
                  placeholder="Seleccionar método"
                  disabled={isSaving}
                />
              </div>
              {!formData.metodoPago && (
                <span className="micro-validation-error ml-1">Requerido</span>
              )}
            </div>
          </div>

          {/* Sección de Productos */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #f3f4f6",
              borderRadius: "12px",
            }}
          >
            {/* Header productos */}
            <div
              className="flex items-center justify-between"
              style={{
                background: "#f9fafb",
                padding: "12px 16px",
                borderBottom: "1px solid #f3f4f6",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9ca3af",

                  letterSpacing: "0.07em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  margin: 0,
                }}
              >
                <Package className="w-3.5 h-3.5" /> Productos{" "}
                <span style={{ color: "#f87171" }}>*</span>
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
            <div
              style={{
                padding: "0 16px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {formData.productos.map((prod: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px 0",
                    borderBottom:
                      index < formData.productos.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                    position: "relative",
                    zIndex: 100 - index,
                  }}
                >
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#9ca3af",

                          marginBottom: "6px",
                        }}
                      >
                        Producto
                      </p>
                      <div
                        style={{ background: "#ffffff", borderRadius: "8px" }}
                      >
                        <AsyncProductSelect
                          value={prod.productoId}
                          onChange={(val, prodObj) =>
                            onUpdateProduct(index, "productoId", val, prodObj)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#9ca3af",

                          marginBottom: "6px",
                        }}
                      >
                        Cant.
                      </p>
                      <Input
                        type="number"
                        min="1"
                        value={prod.cantidad}
                        onChange={(e) =>
                          onUpdateProduct(index, "cantidad", e.target.value)
                        }
                        className={`h-9 rounded-lg transition-all ${
                          prod.cantidad > prod.maxStock && prod.maxStock > 0
                            ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-200"
                            : "border-gray-200 text-gray-800 focus:ring-[#c47b96]/20"
                        }`}
                      />
                      {prod.cantidad > prod.maxStock && prod.maxStock > 0 && (
                        <span className="micro-validation-error text-center">
                          Máx: {prod.maxStock}
                        </span>
                      )}
                    </div>
                    <div className="col-span-3">
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#9ca3af",

                          marginBottom: "6px",
                        }}
                      >
                        Precio
                      </p>
                      <Input
                        type="number"
                        value={prod.precioUnitario}
                        onChange={(e) =>
                          onUpdateProduct(
                            index,
                            "precioUnitario",
                            e.target.value,
                          )
                        }
                        className={`h-9 rounded-lg transition-all ${
                          Number(prod.precioUnitario) <= 0 ||
                          !prod.precioUnitario
                            ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-200"
                            : "border-gray-200 text-gray-800 focus:ring-[#c47b96]/20"
                        }`}
                      />
                      {(Number(prod.precioUnitario) <= 0 ||
                        !prod.precioUnitario) && (
                        <span className="micro-validation-error text-center">
                          Requerido
                        </span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#9ca3af",

                          marginBottom: "6px",
                        }}
                      >
                        Total
                      </p>
                      <div
                        style={{
                          height: "36px",
                          padding: "0 12px",
                          background: "#f9fafb",
                          border: "1px solid #f3f4f6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#1f2937",
                          }}
                        >
                          {formatCurrency(
                            (Number(prod.cantidad) || 0) *
                              (Number(prod.precioUnitario) || 0),
                          )}
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white z-10">
          {/* Total */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af" }}
            >
              Total:
            </span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#c47b96",
                letterSpacing: "-0.5px",
              }}
            >
              {formatCurrency(totalVenta)}
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
                  Guardando...
                </span>
              ) : (
                "Confirmar Venta"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
