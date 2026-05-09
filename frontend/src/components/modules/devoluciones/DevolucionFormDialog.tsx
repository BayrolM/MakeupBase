import { X, Search, Calendar, Package, Check, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { formatCurrency } from "../../../utils/devolucionUtils";

interface DevolucionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  ventaData: any;
  productosDevolver: any[];
  productos: any[];
  successMessage: string;
  errorMessage: string;
  isSaving: boolean;
  esDefectuoso: boolean;
  onVentaIdChange: (id: string) => void;
  onFieldChange: (name: string, value: any) => void;
  onEsDefectuosoChange: (val: boolean) => void;
  onToggleProducto: (index: number) => void;
  onCantidadChange: (index: number, cantidad: number) => void;
  onSave: () => void;
  totalDevolucion: number;
  fieldErrors?: Record<string, string>;
  setFieldErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function DevolucionFormDialog({
  open,
  onOpenChange,
  formData,
  ventaData,
  productosDevolver,
  productos,
  successMessage,
  errorMessage,
  isSaving,
  esDefectuoso,
  onVentaIdChange,
  onFieldChange,
  onEsDefectuosoChange,
  onToggleProducto,
  onCantidadChange,
  onSave,
  totalDevolucion,
  fieldErrors,
}: DevolucionFormDialogProps) {
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",

    letterSpacing: "0.07em",
    marginBottom: 7,
    display: "flex",
    alignItems: "center",
    gap: 5,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 !w-[95vw] !max-w-[900px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 24px 20px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              className="luxury-icon-gradient"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                Registrar Devolución
              </DialogTitle>
              <DialogDescription
                style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
              >
                Gestiona las devoluciones asociadas a ventas realizadas
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

        {/* Body */}
        <div
          className="no-scrollbar overflow-y-auto"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxHeight: "70vh",
          }}
        >
          {/* Mensajes de éxito y error general */}
          {successMessage && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-green-700">
                {successMessage}
              </span>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-700">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Fila superior: ID Venta + Fecha */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="space-y-2">
              <p style={labelStyle}>
                <Search className="w-3.5 h-3.5" /> ID de Venta{" "}
                <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div style={{ position: "relative" }}>
                <Input
                  value={formData.ventaId}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(
                      /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,
                      "",
                    );
                    onVentaIdChange(cleanValue);
                  }}
                  className={`h-10 rounded-xl pr-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 text-sm ${fieldErrors?.ventaId ? "border-rose-400" : ""}`}
                  placeholder="Ej: 6..."
                  disabled={isSaving}
                  style={{ fontSize: 13, color: "#374151" }}
                />
                <Search
                  className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors?.ventaId ? "text-rose-400" : "text-gray-400"}`}
                />
              </div>
              {fieldErrors?.ventaId && (
                <span className="micro-validation-error ml-1">
                  {fieldErrors.ventaId}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p style={labelStyle}>
                <Calendar className="w-3.5 h-3.5" /> Fecha Devolución{" "}
                <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                type="date"
                value={formData.fechaDevolucion}
                onChange={(e) =>
                  onFieldChange("fechaDevolucion", e.target.value)
                }
                className="h-10 rounded-xl border-gray-200 text-sm"
                disabled={true}
                readOnly={true}
                style={{
                  fontSize: 13,
                  color: "#9ca3af",
                  background: "#f9fafb",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          {/* Motivo y Estado */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr",
              gap: "16px",
            }}
          >
            <div className="space-y-2">
              <p style={labelStyle}>
                Motivo de Devolución <span style={{ color: "#f87171" }}>*</span>
              </p>
              <textarea
                value={formData.motivo}
                onChange={(e) => {
                  if (e.target.value.length <= 100)
                    onFieldChange("motivo", e.target.value);
                }}
                disabled={isSaving}
                placeholder="Describa el motivo..."
                className={`w-full min-h-[44px] border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#c47b96] focus:ring-1 focus:ring-[#c47b96]/10 transition-all text-sm ${fieldErrors?.motivo ? "border-rose-400" : ""}`}
                style={{
                  resize: "none",
                  fontSize: 13,
                  color: "#374151",
                  background: fieldErrors?.motivo ? "#fffafb" : "#fff",
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="micro-validation-error">
                  {fieldErrors?.motivo || ""}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: formData.motivo.length > 90 ? "#ef4444" : "#9ca3af",
                  }}
                >
                  {formData.motivo.length}/100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p style={labelStyle}>Estado Inicial</p>
              <Select
                value={formData.estado}
                onValueChange={(v) => onFieldChange("estado", v)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="bg-white border-gray-100 shadow-xl rounded-xl"
                  style={{ zIndex: 99999 }}
                >
                  <SelectItem value="aprobada">
                    Aprobada (buen estado o dañado)
                  </SelectItem>
                  <SelectItem value="pendiente">
                    Pendiente de Revisión
                  </SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.estado === "aprobada" && (
            <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-rose-50 border border-rose-100 transition-all animate-in fade-in slide-in-from-top-1 my-2 space-y-2">
              <div className="flex items-center gap-2.5">
                <input
                  id="es_defectuoso_form"
                  type="checkbox"
                  checked={esDefectuoso}
                  onChange={(e) => onEsDefectuosoChange(e.target.checked)}
                  className="w-5 h-5 text-[#c47b96] border-gray-300 rounded-lg focus:ring-[#c47b96] cursor-pointer"
                />
                <label
                  htmlFor="es_defectuoso_form"
                  className="text-sm font-bold text-rose-700 cursor-pointer select-none"
                >
                  ¿Producto Defectuoso?
                </label>
              </div>
              <p className="text-[11px] text-rose-500 font-semibold max-w-xs leading-relaxed">
                Se registrará como pérdida y <strong>NO</strong> volverá al
                stock.
              </p>
            </div>
          )}

          {/* Resumen de Venta */}
          {ventaData ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  background: "#fff0f5",
                  border: "1px solid #fce8f0",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#c47b96",

                    letterSpacing: "0.07em",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Info className="w-3.5 h-3.5" /> Información de la Venta #
                  {ventaData.id}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9ca3af",

                        letterSpacing: "0.07em",
                      }}
                    >
                      Fecha Venta
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#374151",
                      }}
                    >
                      {ventaData.fecha}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9ca3af",

                        letterSpacing: "0.07em",
                      }}
                    >
                      Cliente
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#374151",
                      }}
                    >
                      {ventaData.clienteNombre || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9ca3af",

                        letterSpacing: "0.07em",
                      }}
                    >
                      Monto Venta
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: "#c47b96",
                      }}
                    >
                      {formatCurrency(ventaData.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de productos para devolver */}
              <div
                style={{
                  background: "#ffffff",
                  border: fieldErrors?.productos
                    ? "1.5px solid #fb7185"
                    : "1px solid #f3f4f6",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{
                    background: fieldErrors?.productos ? "#fff1f2" : "#f9fafb",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <p style={labelStyle}>
                      <Package className="w-3.5 h-3.5" /> Productos de la Venta
                    </p>
                    {fieldErrors?.productos && (
                      <span className="micro-validation-error">
                        ({fieldErrors.productos})
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#c47b96",
                      background: "#fff0f5",
                      padding: "4px 10px",
                      borderRadius: 12,
                    }}
                  >
                    {productosDevolver.filter((p) => p.selected).length}{" "}
                    SELECCIONADOS
                  </span>
                </div>

                <div
                  style={{
                    padding: "0",
                    maxHeight: "280px",
                    overflowY: "auto",
                  }}
                  className="no-scrollbar"
                >
                  {(ventaData.productos || []).map(
                    (item: any, index: number) => {
                      const producto = productos.find(
                        (p) => p.id === item.productoId,
                      );
                      const isSelected =
                        productosDevolver[index]?.selected || false;
                      const cantidadDev =
                        productosDevolver[index]?.cantidadADevolver || 0;
                      const subtotal = isSelected
                        ? cantidadDev * item.precioUnitario
                        : 0;
                      const hasCantError = !!fieldErrors?.[`cantidad_${index}`];

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                            padding: "16px",
                            borderBottom:
                              index < ventaData.productos.length - 1
                                ? "1px solid #f9fafb"
                                : "none",
                            background: isSelected ? "#fffafb" : "#fff",
                            transition: "all 0.2s",
                          }}
                        >
                          {/* Header Producto */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleProducto(index)}
                              disabled={isSaving}
                              className="w-5 h-5 text-[#c47b96] border-gray-300 rounded focus:ring-[#c47b96] cursor-pointer"
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: "#111827",
                                  margin: 0,
                                }}
                              >
                                {producto?.nombre || "Producto Desconocido"}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#9ca3af",
                                  margin: "2px 0 0 0",
                                }}
                              >
                                Precio Unitario:{" "}
                                {formatCurrency(item.precioUnitario)}
                              </p>
                            </div>
                          </div>

                          {/* Controles Cantidad */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              paddingLeft: 32,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <p style={labelStyle}>Cant. Original</p>
                              <div
                                style={{
                                  height: 40,
                                  borderRadius: 10,
                                  background: "#f9fafb",
                                  border: "1px solid #f3f4f6",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 12px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#6b7280",
                                  }}
                                >
                                  {item.cantidad}
                                </span>
                              </div>
                            </div>

                            <div style={{ flex: 1 }} className="space-y-1.5">
                              <p style={labelStyle}>A Devolver</p>
                              <input
                                type="number"
                                value={
                                  cantidadDev === 0 && !isSelected
                                    ? ""
                                    : cantidadDev
                                }
                                onChange={(e) =>
                                  onCantidadChange(
                                    index,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                disabled={!isSelected || isSaving}
                                min={0}
                                max={item.cantidad}
                                placeholder="0"
                                className={`w-full h-10 px-3 rounded-xl border text-center text-sm font-bold transition-all outline-none ${isSelected ? (hasCantError ? "border-rose-400 bg-rose-50" : "border-gray-200 focus:border-[#c47b96]") : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"}`}
                              />
                              {hasCantError && isSelected && (
                                <p className="micro-validation-error text-center">
                                  {fieldErrors[`cantidad_${index}`]}
                                </p>
                              )}
                            </div>

                            <div style={{ flex: 1 }}>
                              <p style={labelStyle}>Subtotal</p>
                              <div
                                style={{
                                  height: 40,
                                  borderRadius: 10,
                                  background:
                                    subtotal > 0 ? "#fff0f5" : "#f9fafb",
                                  border: `1px solid ${subtotal > 0 ? "#fce8f0" : "#f3f4f6"}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  padding: "0 12px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: subtotal > 0 ? "#c47b96" : "#9ca3af",
                                  }}
                                >
                                  {subtotal > 0
                                    ? formatCurrency(subtotal)
                                    : "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50 mb-4 animate-pulse">
                <Search className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-sm text-gray-400 font-medium italic text-center max-w-[240px]">
                Ingresa un ID de Venta para cargar los productos disponibles
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af" }}
            >
              Reembolso Total:
            </span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#c47b96",
                letterSpacing: "-0.5px",
              }}
            >
              {formatCurrency(totalDevolucion)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              style={{
                padding: "10px 22px",
                borderRadius: "12px",
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
              disabled={isSaving || !ventaData || totalDevolucion === 0}
              style={{
                padding: "10px 32px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor:
                  isSaving || !ventaData || totalDevolucion === 0
                    ? "not-allowed"
                    : "pointer",
                border: "none",
                background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
                transition: "all 0.2s",
                opacity:
                  isSaving || !ventaData || totalDevolucion === 0 ? 0.7 : 1,
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
                  Procesando...
                </span>
              ) : (
                "Confirmar Devolución"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
