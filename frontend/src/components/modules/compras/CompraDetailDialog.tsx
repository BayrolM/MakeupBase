import {
  X,
  Building2,
  Calendar,
  FileText,
  Download,
  Package,
  Hash,
  CheckCircle2,
  XCircle,
  MessageSquare
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { formatCurrency } from "../../../utils/compraUtils";
import { generateCompraPDF } from "../../../lib/pdfGenerator";
import { toast } from "sonner";
import { Button } from "../../ui/button";

interface CompraDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCompra: any;
  proveedores: any[];
  productos: any[];
}

export function CompraDetailDialog({
  open,
  onOpenChange,
  selectedCompra,
  proveedores,
  productos,
}: CompraDetailDialogProps) {
  if (!selectedCompra) return null;

  const proveedor = proveedores.find((p) => p.id === selectedCompra.proveedorId);
  const isConfirmada = selectedCompra.confirmada ?? selectedCompra.estado;

  const detalles = selectedCompra.detalles || [];
  const itemCount = detalles.length;

  const handlePrint = () => {
    generateCompraPDF(selectedCompra, proveedor, productos);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Detalle de Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                ORDEN #{selectedCompra.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                style={{
                  background: isConfirmada ? "rgba(209,250,229,0.9)" : "rgba(254,226,226,0.9)",
                  color: isConfirmada ? "#065f46" : "#991b1b",
                }}
              >
                {isConfirmada ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {isConfirmada ? "Confirmada" : "Anulada"}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[65vh]">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Información de Compra
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Proveedor</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{proveedor?.nombre || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Fecha</p>
                    <p className="text-sm font-bold text-gray-800">{new Date(selectedCompra.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Inversión
              </h3>
              <div className="bg-[#fff0f5] border border-pink-100 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal Estimado</span>
                  <span className="font-bold text-gray-800">{formatCurrency(selectedCompra.total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-3 border-b border-pink-100">
                  <span className="text-gray-500 font-medium">Costo de Envío</span>
                  <span className="font-bold text-gray-800">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Monto Total</span>
                  <span className="text-2xl font-black text-[#c47b96]">{formatCurrency(selectedCompra.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedCompra.observaciones && (
            <div className="mb-6 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Observaciones</span>
              </div>
              <p className="text-sm text-gray-600 italic">"{selectedCompra.observaciones}"</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Productos Adquiridos
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-500 bg-gray-100 uppercase tracking-widest">
                {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
              </span>
            </div>
            
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="col-span-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Producto</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Cant.</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Costo Unit.</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</div>
              </div>
              <div className="divide-y divide-gray-50">
                {detalles.map((d: any, i: number) => {
                  const pName = d.nombre_producto || productos.find(p => p.id === d.id_producto?.toString())?.nombre || `Item #${d.id_producto}`;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 truncate">{pName}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-600 font-medium">{d.cantidad}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm text-gray-600">{formatCurrency(Number(d.precio_unitario))}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-gray-800">{formatCurrency(Number(d.cantidad) * Number(d.precio_unitario))}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex items-center gap-3 bg-white">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11 text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </Button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "#c47b96", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}
          >
            Cerrar Detalle
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
