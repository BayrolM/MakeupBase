import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Package,
  Layers,
  Tag,
  DollarSign,
  Archive,
  Activity,
  Hash,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { StatusSwitch } from "../../StatusSwitch";
import { Producto, Categoria } from "../../../lib/store";
import { getStockStatus, formatCurrency } from "../../../utils/productUtils";
import { productService } from "../../../services/productService";
import { toast } from "sonner";

interface ProductTableProps {
  productos: Producto[];
  categorias: Categoria[];
  isAdmin: boolean;
  searchQuery: string;
  onViewDetail: (product: Producto) => void;
  onEdit: (product: Producto) => void;
  onDelete: (product: Producto) => void;
  refreshProducts: () => Promise<void>;
}

export function ProductTable({
  productos,
  categorias,
  isAdmin,
  searchQuery,
  onViewDetail,
  onEdit,
  onDelete,
  refreshProducts,
}: ProductTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> ID
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Producto
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Categoría
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Marca
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Precio
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" /> Stock
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Estado
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-6">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {productos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-20 bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <Package className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay productos registrados"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda"
                        : "Los productos aparecerán aquí"}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            productos.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <TableRow
                  key={product.id}
                  className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group bg-white"
                >
                  <TableCell className="py-2.5 pl-6">
                    <span className="font-mono text-[11px] font-semibold text-gray-500 group-hover:text-[#c47b96]">
                      {product.id}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-800 font-semibold text-sm">
                      {product.nombre}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-600 text-xs">
                      {categorias.find((c) => c.id === product.categoriaId)
                        ?.nombre || "Sin cat."}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-600 text-sm">
                      {product.marca}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-900 font-bold text-sm">
                      {formatCurrency(product.precioVenta)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex flex-col">
                      <span
                        className={`font-semibold text-sm ${stockStatus?.color || "text-gray-800"}`}
                      >
                        {product.stock} und.
                      </span>
                      {stockStatus && (
                        <span
                          className={`text-[10px] ${stockStatus.color} font-medium`}
                        >
                          {stockStatus.label}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <StatusSwitch
                      status={product.estado}
                      onChange={async (newStatus: "activo" | "inactivo") => {
                        if (!isAdmin) return;
                        try {
                          await productService.update(Number(product.id), {
                            estado: newStatus === "activo",
                          });
                          await refreshProducts();
                        } catch (error: any) {
                          toast.error(
                            error.message || "Error al cambiar estado",
                          );
                        }
                      }}
                      disabled={!isAdmin}
                    />
                  </TableCell>
                  <TableCell className="py-2.5 pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewDetail(product)}
                        title="Ver detalles"
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        disabled={!isAdmin}
                        title={!isAdmin ? "Acceso denegado" : "Editar"}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                          isAdmin
                            ? "cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        disabled={!isAdmin}
                        title={!isAdmin ? "Acceso denegado" : "Eliminar"}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                          isAdmin
                            ? "cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
