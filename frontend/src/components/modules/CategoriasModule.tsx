import { useState, useEffect } from "react";
import { useStore, Categoria } from "../../lib/store";

import { StatusSwitch } from "../StatusSwitch";
import { Pagination } from "../Pagination";
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
import { Textarea } from "../ui/textarea";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  X,
  Archive,
  FolderTree,
  Hash,
  AlertCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "../../services/categoryService";

export function CategoriasModule() {
  const { categorias, productos, setCategorias, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null,
  );
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateNombre = (value: string, excludeId?: string) => {
    if (!value.trim()) return 'El nombre es obligatorio';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    if (value.trim().length > 50) return 'Máximo 50 caracteres';
    const duplicate = categorias.find(
      c => c.nombre.toLowerCase() === value.trim().toLowerCase() && c.id !== excludeId
    );
    if (duplicate) return 'Ya existe una categoría con este nombre';
    return '';
  };

  const isAdmin = currentUser?.rol === "admin";

  useEffect(() => {
    refreshCategorias();
  }, []);

  const refreshCategorias = async () => {
    try {
      const response = await categoryService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(response.total || 0);
      const mapped = (response.data || []).map((cat: any) => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || "",
        estado: cat.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setCategorias(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar categorías");
    }
  };

  useEffect(() => {
    refreshCategorias();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenDialog = (categoria?: Categoria) => {
    if (!isAdmin) {
      toast.error("Acceso denegado");
      return;
    }

    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        estado: categoria.estado,
      });
    } else {
      setEditingCategoria(null);
      setFormData({
        nombre: "",
        descripcion: "",
        estado: "activo",
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const nombreErr = validateNombre(formData.nombre, editingCategoria?.id);
    if (nombreErr) {
      setFieldErrors({ nombre: nombreErr });
      toast.error(nombreErr);
      return;
    }
    setFieldErrors({});

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        estado: formData.estado === "activo",
      };

      if (editingCategoria) {
        await categoryService.update(Number(editingCategoria.id), payload);
        toast.success("Categoría actualizada");
      } else {
        await categoryService.create(payload);
        toast.success("Categoría creada");
      }

      await refreshCategorias();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategoria) return;

    // Verificar productos asociados antes de eliminar
    const productCount = getProductCount(selectedCategoria.id);
    if (productCount > 0) {
      toast.error("No se puede eliminar esta categoría", {
        description: `Tiene ${productCount} producto(s) asociado(s). Reasigna o elimina los productos primero.`,
      });
      return;
    }

    setIsSaving(true);
    try {
      await categoryService.delete(Number(selectedCategoria.id));
      await refreshCategorias();
      toast.success("Categoría eliminada");
      setIsDeleteDialogOpen(false);
      setSelectedCategoria(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const getProductCount = (categoriaId: string) => {
    return productos.filter((p) => p.categoriaId === categoriaId).length;
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
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#fffff2" }}
                    >
                      Categorías
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>
                      Gestión de categorías de productos
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
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                placeholder="Buscar categorías por nombre o descripción..."
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
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5" />
                    Nombre
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    Descripción
                  </div>
                </TableHead>

                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <FolderTree className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          {searchQuery
                            ? `No se encontraron resultados para "${searchQuery}"`
                            : "No hay categorías registradas"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda"
                            : "Las categorías aparecerán aquí"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categorias.map((categoria) => {
                  const productCount = getProductCount(categoria.id);
                  const hasProducts = productCount > 0;
                  return (
                    <TableRow
                      key={categoria.id}
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                          <span className="font-mono text-[11px] font-semibold text-gray-500">
                            {categoria.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-gray-800 font-semibold text-sm">
                              {categoria.nombre}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-500 text-sm line-clamp-1 max-w-xs">
                          {categoria.descripcion || (
                            <span className="text-gray-400 italic">
                              Sin descripción
                            </span>
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <StatusSwitch
                          status={categoria.estado}
                          onChange={(newStatus) => {
                            if (!isAdmin) return;
                            categoryService
                              .update(Number(categoria.id), {
                                estado: newStatus === "activo",
                              })
                              .then(refreshCategorias);
                          }}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setIsDetailDialogOpen(true);
                            }}
                            title="Ver detalles"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(categoria)}
                            disabled={!isAdmin}
                            title={
                              !isAdmin ? "Acceso denegado" : "Editar categoría"
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
                              setSelectedCategoria(categoria);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={!isAdmin}
                            title={
                              !isAdmin
                                ? "Acceso denegado"
                                : hasProducts
                                  ? `Tiene ${productCount} producto(s) asociado(s)`
                                  : "Eliminar categoría"
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
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* ==================== DIALOG DE CREACIÓN/EDICIÓN ==================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Encabezado con avatar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
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
                {editingCategoria ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  {editingCategoria
                    ? "Modifica los datos de la categoría"
                    : "Completa el formulario para crear una nueva categoría"}
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

          {/* Cuerpo */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Campo Nombre */}
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
                  marginBottom: "8px",
                }}
              >
                Nombre <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.nombre}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, nombre: val });
                  setFieldErrors(prev => ({ ...prev, nombre: validateNombre(val, editingCategoria?.id) }));
                }}
                className={`border-gray-200 text-gray-800 rounded-lg h-9 text-sm ${fieldErrors.nombre ? 'border-rose-400' : ''}`}
                style={{ background: "#ffffff" }}
                placeholder="Ej: Maquillaje, Cuidado Facial..."
                maxLength={50}
              />
              {fieldErrors.nombre && <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombre}</p>}
            </div>

            {/* Campo Descripción */}
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
                  marginBottom: "8px",
                }}
              >
                Descripción{" "}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 400,
                    color: "#9ca3af",
                    textTransform: "none",
                  }}
                >
                  (Opcional)
                </span>
              </p>
              <Textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Describe brevemente esta categoría..."
                className="border-gray-200 text-gray-800 rounded-lg text-sm resize-none"
                style={{ background: "#ffffff" }}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6">
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
              ) : editingCategoria ? (
                "Actualizar"
              ) : (
                "Crear Categoría"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE DETALLE ==================== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          {selectedCategoria && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "linear-gradient(135deg,#c47b96,#e092b2)",
                      boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                    }}
                  >
                    {selectedCategoria.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                      Detalle de Categoría
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-400 mt-0.5">
                      ID #{selectedCategoria.id}
                    </DialogDescription>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex flex-col gap-4">
                {/* Nombre + Estado */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
                    <p className="text-sm font-bold text-gray-800">{selectedCategoria.nombre}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado</p>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: selectedCategoria.estado === "activo" ? "#d1fae5" : "#f3f4f6",
                        color: selectedCategoria.estado === "activo" ? "#065f46" : "#6b7280",
                      }}
                    >
                      <span
                        style={{
                          width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                          background: selectedCategoria.estado === "activo" ? "#10b981" : "#9ca3af",
                        }}
                      />
                      {selectedCategoria.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedCategoria.descripcion || (
                      <span className="text-gray-400 italic">Sin descripción registrada</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end px-6 pb-6 pt-2">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="rounded-lg text-white font-semibold px-8 h-10 text-sm w-full"
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
                  Eliminar Categoría
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
                  ¿Estás seguro de eliminar la categoría{" "}
                  <span style={{ fontWeight: 700, color: "#c47b96" }}>
                    &quot;{selectedCategoria?.nombre}&quot;
                  </span>
                  ?
                </p>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: 4 }}>
                  Esta acción eliminará permanentemente la categoría del
                  sistema.
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
