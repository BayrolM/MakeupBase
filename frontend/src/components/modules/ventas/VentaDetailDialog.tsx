import {
  X,
  ShoppingBag,
  User as UserIcon,
  Calendar,
  CreditCard,
  Package,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { formatCurrency, getStatusColor } from "../../../utils/ventaUtils";

interface VentaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVenta: any;
  clientes: any[];
  productos: any[];
}

export function VentaDetailDialog({
  open,
  onOpenChange,
  selectedVenta,
  clientes,
  productos,
}: VentaDetailDialogProps) {
  if (!selectedVenta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Detalle de Venta
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Detalle #{selectedVenta.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background:
                  selectedVenta.estado === "activo"
                    ? "rgba(209,250,229,0.9)"
                    : "rgba(254,226,226,0.9)",
                color:
                  selectedVenta.estado === "activo" ? "#065f46" : "#991b1b",
              }}
            >
              {getStatusColor(selectedVenta.estado).label}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
          {selectedVenta.estado === "anulada" && (
            <div className="mb-6 bg-red-50 rounded-xl px-4 py-3 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                Esta transacción ha sido anulada y no tiene validez contable.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider">
                Información de Venta
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      Cliente
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {clientes.find((c) => c.id === selectedVenta.clienteId)
                        ?.nombre || "Consumidor Final"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      Fecha
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedVenta.fecha}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      Método de Pago
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedVenta.metodoPago}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider">
                Resumen de Totales
              </h3>
              <div className="bg-[#fff0f5] border border-pink-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(selectedVenta.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-gray-800 tracking-wide">
                    Total
                  </span>
                  <span className="text-2xl font-black text-[#c47b96]">
                    {formatCurrency(selectedVenta.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider">
                Artículos
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-500 bg-gray-100 tracking-widest">
                {selectedVenta.productos.length}{" "}
                {selectedVenta.productos.length === 1 ? "ítem" : "ítems"}
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="col-span-6 text-[10px] font-bold text-gray-400 tracking-wider">
                  Producto
                </div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 tracking-wider text-center">
                  Cant.
                </div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 tracking-wider text-right">
                  Precio
                </div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 tracking-wider text-right">
                  Total
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {selectedVenta.productos.map((p: any, i: number) => {
                  const producto = productos.find(
                    (prod) => prod.id === p.productoId,
                  );
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-gray-50/60 transition-colors"
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {producto?.imagenUrl ? (
                            <img
                              src={producto.imagenUrl}
                              alt={producto.nombre}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {producto?.nombre || "Producto"}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-600 font-medium">
                          {p.cantidad}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(p.precioUnitario)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-gray-800">
                          {formatCurrency(p.cantidad * p.precioUnitario)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20"
          >
            Cerrar Detalle
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
