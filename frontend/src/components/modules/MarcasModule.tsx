import { useState, useEffect } from "react";
import { useStore, Marca } from "../../lib/store";
import { toast } from "sonner";
import { marcaService } from "../../services/marcaService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../common/Pagination";

// Sub-componentes
import { MarcaHeader } from "./marcas/MarcaHeader";
import { MarcaTable } from "./marcas/MarcaTable";
import { MarcaFormDialog } from "./marcas/MarcaFormDialog";
import { MarcaDetailDialog } from "./marcas/MarcaDetailDialog";
import { MarcaDeleteDialog } from "./marcas/MarcaDeleteDialog";

// Utils
import {
  validateMarcaNombre,
} from "../../utils/marcaUtils";

export function MarcasModule() {
  const { marcas, productos, setMarcas, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Hook unificado de paginación
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    handleLimitChange,
  } = usePagination({ totalItems });

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAdmin = currentUser?.rol === "admin";

  const refreshMarcas = async () => {
    try {
      const response = await marcaService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(response.total || 0);
      const mapped = (response.data || []).map((m: any) => ({
        id: m.id_marca.toString(),
        nombre: m.nombre,
        descripcion: m.descripcion || "",
        estado: m.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setMarcas(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar marcas");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      await refreshMarcas();
      setIsInitialLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      refreshMarcas();
    }
  }, [currentPage, itemsPerPage, searchQuery]);


  const handleOpenDialog = (marca?: Marca) => {
    if (!isAdmin) {
      toast.error("Acceso denegado");
      return;
    }

    if (marca) {
      setEditingMarca(marca);
      setFormData({
        nombre: marca.nombre,
        descripcion: marca.descripcion,
        estado: marca.estado,
      });
    } else {
      setEditingMarca(null);
      setFormData({
        nombre: "",
        descripcion: "",
        estado: "activo",
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };
  
  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "nombre") {
      const err = validateMarcaNombre(value, marcas, editingMarca?.id);
      setFieldErrors((prev) => ({ ...prev, nombre: err }));
    }
  };

  const handleSave = async () => {
    const nombreErr = validateMarcaNombre(
      formData.nombre,
      marcas,
      editingMarca?.id,
    );
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

      if (editingMarca) {
        await marcaService.update(Number(editingMarca.id), payload);
        toast.success("Marca actualizada");
      } else {
        await marcaService.create(payload);
        toast.success("Marca registrada");
        setCurrentPage(1);
      }

      await refreshMarcas();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMarca) return;

    setIsSaving(true);
    try {
      await marcaService.delete(Number(selectedMarca.id));
      await refreshMarcas();
      toast.success("Marca eliminada");
      setIsDeleteDialogOpen(false);
      setSelectedMarca(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f6f3f5 100%)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '24px',
          color: '#1e1b1d',
          fontFamily: "'DM Sans', sans-serif",
          width: '100%',
        }}
      >
        <div style={{ position: 'relative', width: '56px', height: '56px' }}>
          <div 
            className="animate-spin"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '3px solid rgba(123, 19, 71, 0.08)',
              borderTopColor: '#7b1347',
              borderRadius: '50%'
            }} 
          />
        </div>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: '#7b1347', 
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Cargando Marcas...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3f5] animate-premium-fade-in-up flex flex-col justify-between">
      <style>{`
        @keyframes premiumFadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-premium-fade-in-up {
          animation: premiumFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div>
        <MarcaHeader
          isAdmin={isAdmin}
          onOpenDialog={() => handleOpenDialog()}
        />

        <MarcaTable
          marcas={marcas}
          productos={productos}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCurrentPage={setCurrentPage}
          isAdmin={isAdmin}
          onViewDetail={(m) => {
            setSelectedMarca(m);
            setIsDetailDialogOpen(true);
          }}
          onEdit={handleOpenDialog}
          onDelete={(m) => {
            if (m.estado === "inactivo") {
              toast.error("Marca inactiva", {
                description:
                  "No se puede eliminar una marca que ya está inactiva.",
              });
              return;
            }
            // Nota: La validación de productos asociados se maneja en el backend y el utility
            setSelectedMarca(m);
            setIsDeleteDialogOpen(true);
          }}
          onStatusChange={(id, newStatus) => {
            if (!isAdmin) return;
            marcaService
              .update(Number(id), { estado: newStatus === "activo" })
              .then(() => {
                toast.success(`Marca ${newStatus === "activo" ? "activada" : "desactivada"}`);
                refreshMarcas();
              })
              .catch((err) => {
                toast.error(err.message || "Error al cambiar el estado de la marca");
              });
          }}
        />
      </div>

      <MarcaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingMarca={editingMarca}
        formData={formData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onSave={handleSave}
        onFieldChange={handleFieldChange}
      />

      <MarcaDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        marca={selectedMarca}
      />

      <MarcaDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        marca={selectedMarca}
        isSaving={isSaving}
        onConfirm={handleConfirmDelete}
      />

      {marcas.length > 0 && (
        <div className="px-8 pb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleLimitChange}
          />
        </div>
      )}
    </div>
  );
}
