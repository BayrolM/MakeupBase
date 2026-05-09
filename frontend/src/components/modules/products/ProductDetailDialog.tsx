import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import {
  X,
  Package,
  Layers,
  Tag,
  DollarSign,
  Boxes,
  Info,
  Archive,
  AlertCircle,
} from "lucide-react";
import { Producto, Categoria } from "../../../lib/store";
import { formatCurrency, getStockStatus } from "../../../utils/productUtils";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Producto | null;
  categorias: Categoria[];
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  product,
  categorias,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const stockStatus = getStockStatus(product);
  const categoria = categorias.find((c) => c.id === product.categoriaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient overflow-hidden"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {product.imagenUrl ? (
                <img
                  src={product.imagenUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Detalle del Producto
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                ID: {product.id.slice(0, 8)} •{" "}
                {categoria?.nombre || "Sin categoría"}
                <Badge
                  className={`${product.estado === "activo" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"} text-[8px] font-bold uppercase`}
                >
                  {product.estado}
                </Badge>
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

        <div className="px-6 py-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-6">
            {/* Identificación y Clasificación */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider uppercase">
                Identificación y Valor
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <Tag className="w-4 h-4 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                      Nombre
                    </p>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {product.nombre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <Layers className="w-4 h-4 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                      Categoría y Marca
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {categoria?.nombre || "General"} •{" "}
                      {product.marca || "Genérica"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <DollarSign className="w-4 h-4 text-[#c47b96]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                          Precio de Venta
                        </p>
                        <p className="text-lg font-black text-gray-900 leading-none">
                          {formatCurrency(product.precioVenta)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                          Costo: {formatCurrency(product.precioCompra)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventario y Estado */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider uppercase">
                Control de Inventario
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                      Físico
                    </p>
                    <div className="flex items-center gap-2">
                      <Archive className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-bold text-gray-800">
                        {product.stockFisico}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                      Mínimo
                    </p>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-bold text-gray-800">
                        {product.stockMinimo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200/50" />

                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${stockStatus?.bgColor || "bg-gray-50"} ${stockStatus?.color || "text-gray-400"}`}
                    >
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Disponible
                      </p>
                      <p
                        className={`text-xl font-black ${stockStatus?.color || "text-gray-900"}`}
                      >
                        {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {stockStatus && (
                      <Badge
                        className={`${stockStatus.bgColor} ${stockStatus.color} border-0 text-[9px] font-bold uppercase py-0.5 px-2`}
                      >
                        {stockStatus.message}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-5 space-y-3">
            <h3 className="text-[11px] font-bold text-[#c47b96] tracking-wider uppercase flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Descripción del Producto
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {product.descripcion ||
                  '"Sin descripción detallada para este producto."'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Cerrar Detalle
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
