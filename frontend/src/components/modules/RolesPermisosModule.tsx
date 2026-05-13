import { useState, useEffect } from "react";
import { useStore, Rol, Status } from "../../lib/store";
import { Pagination } from "../common/Pagination";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { INITIAL_PERMISOS } from "../../utils/rolUtils";
import {
  getRoles,
  createRol,
  updateRolAPI,
  getRolById,
  deleteRolAPI,
  getPermisosAPI,
  asignarPermisosAPI,
} from "../../services/roleService";
import type { AxiosError } from "axios";

// Sub-componentes
import { RolHeader } from "./roles/RolHeader";
import { RolTable } from "./roles/RolTable";
import { RolFormDialog } from "./roles/RolFormDialog";
import { RolDetailDialog } from "./roles/RolDetailDialog";
import { RolDeleteDialog } from "./roles/RolDeleteDialog";
import { PermisosTable } from "./roles/PermisosTable";

export function RolesPermisosModule() {
  const { roles, users, setRoles, updateRol, deleteRol } = useStore();
  const [activeTab, setActiveTab] = useState<"roles" | "permisos">("roles");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selection
  const [rolToDelete, setRolToDelete] = useState<Rol | null>(null);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [availablePermisos, setAvailablePermisos] = useState<any[]>([]);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as Status,
    permisos: INITIAL_PERMISOS as any,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (name: string, val: any) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    let error = "";
    if (name === "nombre") {
      if (!val.trim()) {
        error = "Requerido";
      } else if (val.trim().length > 30) {
        error = "Máx 30 chars";
      } else {
        const duplicado = roles.find(
          (r) => r.nombre.toLowerCase() === val.trim().toLowerCase() && r.id !== editingRol?.id
        );
        if (duplicado) error = "Ya existe";
      }
    }

    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ── Cargar roles desde el backend al montar el módulo ──────────────────────
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const [data, permisosData] = await Promise.all([
        getRoles(),
        getPermisosAPI(),
      ]);
      setRoles(data);
      setAvailablePermisos(permisosData);
    } catch (err) {
      // Si falla la carga (p.ej. sin token) no bloqueamos la UI
      console.warn("No se pudieron cargar los roles desde el backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleOpenDialog = async (rol?: Rol) => {
    if (rol) {
      try {
        // Verificar que el rol existe en el backend
        const backendRol = await getRolById(rol.id);

        // Si no lanza error, seguimos usando los permisos reales que vienen del backend
        setEditingRol({ ...rol, ...backendRol, permisos: backendRol.permisos });
        setFormData({
          nombre: backendRol.nombre,
          descripcion: backendRol.descripcion,
          estado: backendRol.estado,
          permisos: JSON.parse(JSON.stringify(backendRol.permisos)),
        });
        setIsDialogOpen(true);
      } catch (err) {
        toast.error("Rol no encontrado", {
          description: "El rol no existe o fue eliminado.",
        });
        fetchRoles(); // Refrescar lista
      }
    } else {
      setEditingRol(null);
      setFormData({
        nombre: "",
        descripcion: "",
        estado: "activo",
        permisos: JSON.parse(JSON.stringify(INITIAL_PERMISOS)),
      });
      setIsDialogOpen(true);
    }
  };

  const handleViewDetail = async (rol: Rol) => {
    try {
      const backendRol = await getRolById(rol.id);
      setSelectedRol({ ...rol, ...backendRol, permisos: backendRol.permisos });
      setIsDetailDialogOpen(true);
    } catch (err) {
      toast.error("Rol no encontrado", {
        description: "El rol no existe o fue eliminado.",
      });
      fetchRoles(); // Refrescar lista
    }
  };

  const handleSave = async () => {
    // ── Validación en cliente ─────────────────────────────────────────────────
    if (!formData.nombre.trim()) {
      toast.error("Campo requerido", {
        description: "El nombre del rol es obligatorio.",
      });
      return;
    }

    if (formData.nombre.trim().length > 30) {
      toast.error("Nombre demasiado largo", {
        description: "El nombre del rol no puede superar los 30 caracteres.",
      });
      return;
    }

    // Validar duplicado localmente antes de ir al servidor (UX rápido)
    const nombreLower = formData.nombre.trim().toLowerCase();
    const duplicado = roles.find(
      (r) => r.nombre.toLowerCase() === nombreLower && r.id !== editingRol?.id,
    );
    if (duplicado) {
      toast.error("Nombre duplicado", {
        description: "Ya existe un rol con ese nombre. Por favor elige otro.",
      });
      return;
    }

    // Extraer IDs de permisos seleccionados
    const selectedPermisosIds: number[] = [];
    Object.keys(formData.permisos).forEach((modulo) => {
      Object.keys(formData.permisos[modulo]).forEach((accion) => {
        if (formData.permisos[modulo][accion]) {
          const permisoStr = `${accion}_${modulo}`;
          const pInfo = availablePermisos.find((p) => p.nombre === permisoStr);
          if (pInfo) selectedPermisosIds.push(pInfo.id_permiso);
        }
      });
    });

    if (selectedPermisosIds.length === 0) {
      toast.error("Permisos requeridos", {
        description: "Debe seleccionar al menos un permiso para el rol.",
      });
      return;
    }

    setIsSaving(true);
    try {
      let finalRolId = "";
      if (editingRol) {
        // ── Editar ────────────────────────────────────────────────────────────
        const updated = await updateRolAPI(editingRol.id, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion?.trim() || undefined,
          estado: formData.estado === "activo",
        });
        finalRolId = editingRol.id;
        updateRol(finalRolId, {
          ...updated,
          permisos: formData.permisos,
        });
        toast.success("Rol actualizado correctamente");
      } else {
        // ── Crear ─────────────────────────────────────────────────────────────
        const created = await createRol({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion?.trim() || undefined,
          estado: formData.estado === "activo",
        });
        finalRolId = created.id;
        setRoles([...roles, { ...created, permisos: formData.permisos }]);
        toast.success("Rol creado correctamente");
      }

      // Asignar permisos en lote
      await asignarPermisosAPI(finalRolId, selectedPermisosIds);
      toast.success("Permisos asignados correctamente");

      setIsDialogOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const msg =
        error.response?.data?.message ?? "Error inesperado al guardar el rol.";
      // Mensajes de error claros según el tipo
      if (msg.includes("nombre") && msg.toLowerCase().includes("existe")) {
        toast.error("Nombre duplicado", { description: msg });
      } else if (msg.includes("requerido") || msg.includes("obligatorio")) {
        toast.error("Campo requerido", { description: msg });
      } else if (msg.includes("30 caracteres")) {
        toast.error("Nombre demasiado largo", { description: msg });
      } else if (msg.includes("internos")) {
        toast.error("Acción denegada", { description: msg });
      } else {
        toast.error("Error al guardar el rol", { description: msg });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (rol: Rol) => {
    const usersWithRole = users.filter((u) => u.rolAsignadoId === rol.id);
    if (usersWithRole.length > 0) {
      toast.error("Conflicto de integridad", {
        description: `No se puede eliminar este rol porque tiene ${usersWithRole.length} usuario(s) asignado(s).`,
      });
      return;
    }
    setRolToDelete(rol);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (rolToDelete) {
      setIsSaving(true);
      try {
        await deleteRolAPI(rolToDelete.id);
        deleteRol(rolToDelete.id);
        toast.success("Rol eliminado correctamente");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        const msg =
          error.response?.data?.message ?? "No se pudo eliminar el rol.";
        toast.error("Error al eliminar", { description: msg });
        fetchRoles(); // Sincronizar en caso de que ya haya sido borrado
      } finally {
        setIsSaving(false);
        setIsDeleteDialogOpen(false);
        setRolToDelete(null);
      }
    }
  };

  // Cambio de estado via API (activo/inactivo)
  const handleStatusChange = async (
    id: string,
    status: "activo" | "inactivo",
  ) => {
    try {
      await updateRolAPI(id, { estado: status === "activo" });
      updateRol(id, { estado: status });
      toast.success(
        `Rol ${status === "activo" ? "activado" : "desactivado"} correctamente`,
      );
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const msg =
        error.response?.data?.message ??
        "No se pudo cambiar el estado del rol.";
      toast.error("Acción denegada", { description: msg });
      // Forzar renderizado para deshacer el cambio visual (Switch local se revertirá cuando dependa de roles globales)
      fetchRoles();
    }
  };

  // Funciones de utilidad (handleMatrizPermisoChange eliminado)

  const handleFormPermisoChange = (
    modulo: string,
    tipo: "ver" | "crear" | "editar" | "eliminar",
    value: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [modulo]: { ...prev.permisos[modulo], [tipo]: value },
      },
    }));
  };

   // ── Filtrado por búsqueda integral ──
  const filteredRoles = roles.filter((rol) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    return (
      rol.nombre.toLowerCase().includes(query) ||
      (rol.descripcion && rol.descripcion.toLowerCase().includes(query)) ||
      rol.estado.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <RolHeader onOpenDialog={() => handleOpenDialog()} />

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#c47b96]" />
          <span className="ml-3 text-gray-500 font-medium">
            Cargando roles...
          </span>
        </div>
      ) : (
        <div className="p-8">
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "roles"
                  ? "border-[#c47b96] text-[#c47b96]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Gestión de Roles
            </button>
            <button
              onClick={() => setActiveTab("permisos")}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "permisos"
                  ? "border-[#c47b96] text-[#c47b96]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Catálogo de Permisos
            </button>
          </div>

          {activeTab === "roles" ? (
            <div className="space-y-12">
              <div className="space-y-6">
                <RolTable
                  roles={paginatedRoles}
                  users={users}
                  searchQuery={searchQuery}
                  onSearchChange={(q) => {
                    setSearchQuery(q);
                    setCurrentPage(1);
                  }}
                  onViewDetail={handleViewDetail}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteClick}
                  onStatusChange={handleStatusChange}
                />

                {filteredRoles.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredRoles.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(n) => {
                      setItemsPerPage(n);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <PermisosTable />
          )}
        </div>
      )}

      <RolFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingRol={editingRol}
        formData={formData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onFieldChange={handleFieldChange}
        onPermisoChange={handleFormPermisoChange}
        onSave={handleSave}
      />

      <RolDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        rol={selectedRol}
        users={users}
      />

      <RolDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        rol={rolToDelete}
        isDeleting={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
