import { 
  X, 
  ShoppingBag, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Package, 
  ClipboardList 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { formatCurrency, getStatusColor } from "../../../utils/pedidoUtils";

interface PedidoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPedido: any;
  productos: any[];
}

export function PedidoDetailDialog({
  open,
  onOpenChange,
  selectedPedido,
  productos,
}: PedidoDetailDialogProps) {
  if (!selectedPedido) return null;

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
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Detalle del Pedido
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                PEDIDO #{selectedPedido.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{
                  background: selectedPedido.estado === "entregado" || selectedPedido.estado === "preparado" ? "rgba(209,250,229,0.9)" : selectedPedido.estado === "cancelado" ? "rgba(254,226,226,0.9)" : "rgba(254,243,199,0.9)",
                  color: selectedPedido.estado === "entregado" || selectedPedido.estado === "preparado" ? "#065f46" : selectedPedido.estado === "cancelado" ? "#991b1b" : "#92400e",
                }}
              >
                {getStatusColor(selectedPedido.estado).label}
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
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Información del Pedido
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Cliente</p>
                    <p className="text-sm font-bold text-gray-800">{selectedPedido.clienteNombre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Fecha</p>
                    <p className="text-sm font-bold text-gray-800">{selectedPedido.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Dirección de Envío</p>
                    <p className="text-sm font-bold text-gray-800 max-w-[180px]">{selectedPedido.direccionEnvio || selectedPedido.direccion}</p>
                    <p className="text-[11px] text-gray-500">{selectedPedido.ciudad} - {selectedPedido.departamento}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Resumen de Totales
              </h3>
              <div className="bg-[#fff0f5] border border-pink-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-800">{formatCurrency(selectedPedido.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">IVA 19%</span>
                  <span className="font-bold text-gray-800">{formatCurrency(selectedPedido.iva)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-3 border-b border-pink-100">
                  <span className="text-gray-500 font-medium">Envío</span>
                  <span className="font-bold text-gray-800">{formatCurrency(selectedPedido.costoEnvio)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Total</span>
                  <span className="text-2xl font-black text-[#c47b96]">{formatCurrency(selectedPedido.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Artículos
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-500 bg-gray-100 uppercase tracking-widest">
                {(selectedPedido.productos || []).length} {(selectedPedido.productos || []).length === 1 ? "ítem" : "ítems"}
              </span>
            </div>
            
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="col-span-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Producto</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Cant.</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Precio</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</div>
              </div>
              <div className="divide-y divide-gray-50">
                {(selectedPedido.productos || []).map((p: any, i: number) => {
                  const producto = productos.find((prod) => prod.id === p.productoId);
                  return (
                    <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {producto?.imagenUrl
                            ? <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-contain" />
                            : <Package className="w-4 h-4 text-gray-300" />
                          }
                        </div>
                        <span className="text-sm font-semibold text-gray-800 truncate">{producto?.nombre || "Producto"}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-600 font-medium">{p.cantidad}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm text-gray-600">{formatCurrency(p.precioUnitario)}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-gray-800">{formatCurrency(p.cantidad * p.precioUnitario)}</span>
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
