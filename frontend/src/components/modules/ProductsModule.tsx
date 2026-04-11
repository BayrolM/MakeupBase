import { useState, useEffect } from "react";
import { useStore, Producto } from "../../lib/store";

import { StatusSwitch } from "../StatusSwitch";
import { Pagination } from "../Pagination";
import { GenericCombobox } from "../GenericCombobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { Textarea } from "../ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Package,
  Tag,
  Layers,
  Building2,
  DollarSign,
  Boxes,
  AlertCircle,
  Hash,
  Folders,
  Archive,
  Activity,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { productService } from "../../services/productService";


export function ProductsModule() {
  const { productos, categorias, marcas, setProductos, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoriaId: "",
    marcaId: "",
    precioCompra: "",
    precioVenta: "",
    stock: "",
    stockMinimo: "",
    stockMaximo: "",
    imagenUrl: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateProductField = (name: string, value: string) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 4) return 'Mínimo 4 caracteres';
        if (value.trim().length > 80) return 'Máximo 80 caracteres';
        return '';
      case 'categoriaId':
        if (!value) return 'La categoría es obligatoria';
        return '';
      case 'marcaId':
        if (!value) return 'La marca es obligatoria';
        return '';
      default:
        return '';
    }
  };

  const handleProductFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateProductField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const isAdmin = currentUser?.rol === "admin";

  const refreshProductsLocal = async () => {
    try {
      const resp = await productService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(resp.total || 0);
      const mapped = resp.data.map((prod) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marcaId: prod.id_marca?.toString() || "1",
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || "",
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar productos");
    }
  };

  useEffect(() => {
    refreshProductsLocal();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenDialog = (product?: Producto) => {
    if (!isAdmin) {
      toast.error("Acceso denegado", {
        description:
          "Solo los administradores pueden crear o editar productos.",
      });
      return;
    }

    if (product) {
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        categoriaId: product.categoriaId,
        marcaId: product.marcaId || "",
        precioCompra: product.precioCompra.toString(),
        precioVenta: product.precioVenta.toString(),
        stock: product.stock.toString(),
        stockMinimo: product.stockMinimo.toString(),
        stockMaximo: product.stockMaximo.toString(),
        imagenUrl: product.imagenUrl || "",
        estado: product.estado,
      });
      setImagePreview(product.imagenUrl || "");
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: "",
        descripcion: "",
        categoriaId: categorias[0]?.id || "",
        marcaId: marcas[0]?.id || "",
        precioCompra: "0",
        precioVenta: "0",
        stock: "0",
        stockMinimo: "0",
        stockMaximo: "100",
        imagenUrl: "",
        estado: "activo",
      });
      setImagePreview("");
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    const nombreErr = validateProductField('nombre', formData.nombre);
    if (nombreErr) newErrors.nombre = nombreErr;
    const catErr = validateProductField('categoriaId', formData.categoriaId);
    if (catErr) newErrors.categoriaId = catErr;
    const marcaErr = validateProductField('marcaId', formData.marcaId);
    if (marcaErr) newErrors.marcaId = marcaErr;

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Corrige los errores antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        id_categoria: Number(formData.categoriaId),
        id_marca: Number(formData.marcaId) || 1,
        precio_venta: Number(formData.precioVenta),
        costo_promedio: Number(formData.precioCompra),
        stock_actual: Number(formData.stock),
        stock_min: Number(formData.stockMinimo),
        stock_max: Number(formData.stockMaximo),
        imagen_url: formData.imagenUrl,
        estado: formData.estado === "activo",
      };

      if (editingProduct) {
        await productService.update(Number(editingProduct.id), payload);
        toast.success("Producto actualizado");
      } else {
        await productService.create(payload);
        toast.success("Producto creado");
      }

      await refreshProductsLocal();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    const id = Number(selectedProduct.id);
    if (!id || isNaN(id)) {
      toast.error("ID de producto inválido");
      return;
    }

    setIsSaving(true);
    try {
      await productService.delete(id);
      await refreshProductsLocal();
      toast.success("Producto eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      // El backend devuelve mensaje específico si no existe o tiene asociaciones
      toast.error(error.message || "Error al eliminar el producto");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (product: Producto) => {
    if (product.stock <= product.stockMinimo) {
      return {
        type: "low",
        color: "text-[#FFA500]",
        bgColor: "bg-[#FFA500]/10",
        label: "BAJO",
        message: "Stock mínimo alcanzado",
      };
    } else if (product.stock >= product.stockMaximo) {
      return {
        type: "high",
        color: "text-[#FF8C00]",
        bgColor: "bg-[#FF8C00]/10",
        label: "MÁXIMO",
        message: "Stock máximo alcanzado",
      };
    }
    return null;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      {/* HEADER PREMIUM */}
      <div className="px-8 pt-8 pb-5">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <div
            className="relative px-6 py-8"
            style={{
              background: `
                radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.6) 0%, transparent 50%),
                radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
                radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.45) 0%, transparent 45%),
                linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
              `,
            }}
          >
            <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#fffff2" }}
                    >
                      Productos
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>
                      Gestión del catálogo de productos
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDialog()}
                disabled={!isAdmin}
                style={{
                  backgroundColor: isAdmin ? "#7b1347ff" : "#d1d5db",
                  color: "#ffffff",
                  cursor: isAdmin ? "pointer" : "not-allowed",
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150"
              >
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="px-8 pb-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                placeholder="Buscar por nombre, marca o categoría..."
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    Producto
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Folders className="w-3.5 h-3.5 text-gray-400" />
                    Categoría
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    Marca
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    Precio
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-gray-400" />
                    Stock
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
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
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDetailDialogOpen(true);
                          }}
                          className="font-mono text-[11px] font-semibold text-gray-500 hover:text-[#c47b96] transition-all duration-200 flex items-center gap-2 group/btn"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/btn:bg-[#c47b96] transition-colors"></div>
                          <span className="group-hover/btn:underline">
                            {product.id.slice(0, 8)}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-800 font-semibold text-sm">
                          {product.nombre}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#c47b96]/5 text-gray-600 text-xs text-center justify-center min-w-[100px]">
                          <Layers className="w-3 h-3" />
                          {categorias.find((c) => c.id === product.categoriaId)
                            ?.nombre || "Sin cat."}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-600 text-sm">
                          {product.marca}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-900 font-bold text-sm">
                          {formatCurrency(product.precioVenta)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
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
                              await refreshProductsLocal();
                            } catch (error: any) {
                              toast.error(error.message || "Error al cambiar estado");
                            }
                          }}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDetailDialogOpen(true);
                            }}
                            title="Ver detalles"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(product)}
                            disabled={!isAdmin}
                            title={
                              !isAdmin ? "Acceso denegado" : "Editar producto"
                            }
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                              isAdmin
                                ? "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={!isAdmin}
                            title={
                              !isAdmin ? "Acceso denegado" : "Eliminar producto"
                            }
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                              isAdmin
                                ? "text-gray-400 hover:bg-rose-50 hover:text-rose-600"
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* ==================== DIALOG DE CREACIÓN/EDICIÓN ==================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          {/* Encabezado con avatar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
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
                {editingProduct ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  {editingProduct
                    ? "Modifica los datos del producto existente"
                    : "Completa el formulario para crear un nuevo producto"}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div style={{ padding: "20px 24px" }}>
            <div className="grid grid-cols-2 gap-5 py-6">
              {/* Columna 1 */}
              <div className="space-y-4" style={{ position: 'relative', zIndex: 50 }}>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#c47b96]" />
                    Nombre <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => handleProductFieldChange('nombre', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.nombre ? 'border-rose-400' : ''}`}
                    placeholder="Nombre del producto"
                    maxLength={80}
                  />
                  {fieldErrors.nombre && <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombre}</p>}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#c47b96]" />
                      Categoría <span className="text-rose-500">*</span>
                    </Label>
                    <GenericCombobox
                      options={categorias.filter(c => c.estado === 'activo').map((c) => ({
                        value: c.id.toString(),
                        label: c.nombre,
                      }))}
                      value={formData.categoriaId}
                      onChange={(v) => { setFormData({ ...formData, categoriaId: v }); handleProductFieldChange('categoriaId', v); }}
                      placeholder="Seleccionar categoría"
                      disabled={isSaving}
                    />
                    {fieldErrors.categoriaId && <p className="text-rose-500 text-xs mt-1">{fieldErrors.categoriaId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                      Marca <span className="text-rose-500">*</span>
                    </Label>
                    <GenericCombobox
                      options={marcas.map((m) => ({
                        value: m.id,
                        label: m.nombre,
                      }))}
                      value={formData.marcaId}
                      onChange={(v) => { setFormData({ ...formData, marcaId: v }); handleProductFieldChange('marcaId', v); }}
                      placeholder="Seleccionar marca"
                      disabled={isSaving}
                    />
                    {fieldErrors.marcaId && <p className="text-rose-500 text-xs mt-1">{fieldErrors.marcaId}</p>}
                  </div>
                </div>
              </div>

              {/* Columna 2 */}
              <div className="space-y-4" style={{ position: 'relative', zIndex: 40 }}>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#c47b96]" />
                    Precio Compra
                  </Label>
                  <Input
                    type="number"
                    value={formData.precioCompra}
                    onChange={(e) =>
                      setFormData({ ...formData, precioCompra: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#c47b96]" />
                    Precio Venta <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.precioVenta}
                    onChange={(e) =>
                      setFormData({ ...formData, precioVenta: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                      <Boxes className="w-3.5 h-3.5 text-[#c47b96]" />
                      Stock Actual
                    </Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#c47b96]" />
                      Stock Mínimo
                    </Label>
                    <Input
                      type="number"
                      value={formData.stockMinimo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stockMinimo: e.target.value,
                        })
                      }
                      className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción - ocupa ambas columnas */}
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-[#c47b96]" />
                  Descripción (Opcional)
                </Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Escribe una breve descripción del producto..."
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Imagen - ocupa ambas columnas */}
              <div className="col-span-2 space-y-4">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-[#c47b96]" />
                  Imagen del Producto (URL)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <Input
                      value={formData.imagenUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imagenUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p className="text-[11px] text-gray-400 mt-2 px-1">
                      Pegue la dirección URL de la imagen. Se recomienda usar
                      enlaces directos de alta calidad.
                    </p>
                  </div>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 h-[110px] overflow-hidden group hover:border-[#c47b96]/30 transition-all">
                    {imagePreview ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/400x400?text=Error+de+URL";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, imagenUrl: "" });
                          }}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-300">
                        <Package className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] font-medium uppercase tracking-widest opacity-40">
                          Sin Vista Previa
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : editingProduct ? (
                "Actualizar Producto"
              ) : (
                "Crear Producto"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE DETALLE ==================== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          {selectedProduct && (
            <>
              {/* Encabezado con avatar */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
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
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                      Detalle del Producto
                    </DialogTitle>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ID #{selectedProduct.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cuerpo */}
              <div
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Image and Basic Info */}
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "16px",
                        background: "#f9fafb",
                        border: "1px solid #f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {selectedProduct.imagenUrl ? (
                        <img
                          src={selectedProduct.imagenUrl}
                          alt={selectedProduct.nombre}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-300" />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "#1f2937",
                          marginBottom: "8px",
                        }}
                      >
                        {selectedProduct.nombre}
                      </h2>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "#f3f4f6",
                            color: "#4b5563",
                            textTransform: "uppercase",
                          }}
                        >
                          <Building2 className="w-3 h-3 text-[#c47b96]" />
                          {selectedProduct.marca}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "#f3f4f6",
                            color: "#4b5563",
                            textTransform: "uppercase",
                          }}
                        >
                          <Folders className="w-3 h-3 text-[#c47b96]" />
                          {categorias.find(
                            (c) => c.id === selectedProduct.categoriaId,
                          )?.nombre || "Sin Categoría"}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background:
                              selectedProduct.estado === "activo"
                                ? "#d1fae5"
                                : "#f3f4f6",
                            color:
                              selectedProduct.estado === "activo"
                                ? "#065f46"
                                : "#6b7280",
                            textTransform: "uppercase",
                          }}
                        >
                          {selectedProduct.estado}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "12px",
                      padding: "16px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "6px",
                      }}
                    >
                      Descripción
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        lineHeight: 1.6,
                      }}
                    >
                      {selectedProduct.descripcion || (
                        <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                          Sin descripción registrada
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Technical Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Prices Card */}
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Precios
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          fontWeight: 600,
                        }}
                      >
                        Costo Compra
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#1f2937",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(selectedProduct.precioCompra)}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#c47b96",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        Precio Venta
                      </p>
                      <p
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          color: "#1f2937",
                        }}
                      >
                        {formatCurrency(selectedProduct.precioVenta)}
                      </p>
                    </div>
                  </div>

                  {/* Stock Card */}
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Archive className="w-3.5 h-3.5" /> Inventario
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            color: "#1f2937",
                            lineHeight: 1,
                          }}
                        >
                          {selectedProduct.stock}{" "}
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              fontWeight: 600,
                            }}
                          >
                            und.
                          </span>
                        </p>
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            marginTop: "4px",
                          }}
                        >
                          Stock Actual
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: getStockStatus(selectedProduct)
                            ? getStockStatus(selectedProduct)?.type === "low"
                              ? "#fff7ed"
                              : "#fefce8"
                            : "#f3f4f6",
                          border: `1px solid ${getStockStatus(selectedProduct) ? (getStockStatus(selectedProduct)?.type === "low" ? "#ffedd5" : "#fef9c3") : "#e5e7eb"}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            color:
                              getStockStatus(selectedProduct)?.type === "low"
                                ? "#ea580c"
                                : getStockStatus(selectedProduct)?.type ===
                                    "high"
                                  ? "#ca8a04"
                                  : "#6b7280",
                          }}
                        >
                          {getStockStatus(selectedProduct)?.label || "ESTABLE"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          background: "#ffffff",
                          borderRadius: "8px",
                          padding: "10px",
                          border: "1px solid #f3f4f6",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            marginBottom: "2px",
                          }}
                        >
                          Stock Mín.
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {selectedProduct.stockMinimo} und.
                        </p>
                      </div>
                      <div
                        style={{
                          background: "#ffffff",
                          borderRadius: "8px",
                          padding: "10px",
                          border: "1px solid #f3f4f6",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            marginBottom: "2px",
                          }}
                        >
                          Stock Máx.
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {selectedProduct.stockMaximo} und.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="rounded-lg text-white font-semibold px-7 h-10 text-sm"
                  style={{ backgroundColor: "#c47b96" }}
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE ELIMINACIÓN ==================== */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Encabezado */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fff1f2",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.12)",
                }}
              >
                <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Eliminar Producto
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Tarjeta de advertencia */}
            <div
              style={{
                background: "#fff1f2",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <AlertCircle
                style={{
                  color: "#ef4444",
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: 1.5,
                  }}
                >
                  ¿Estás seguro de eliminar el producto{" "}
                  <span style={{ fontWeight: 700, color: "#c47b96" }}>
                    &quot;{selectedProduct?.nombre}&quot;
                  </span>
                  ?
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    marginTop: "16px",
                  }}
                >
                  Esta acción eliminará permanentemente el producto del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isSaving}
              className="rounded-lg text-white font-semibold px-6 h-10 text-sm"
              style={{ background: "#ef4444" }}
            >
              {isSaving ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
