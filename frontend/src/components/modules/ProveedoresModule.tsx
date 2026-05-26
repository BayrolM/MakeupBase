import { useState, useEffect, useMemo } from "react";
import { useStore, Proveedor } from "../../lib/store";
import { toast } from "sonner";
import { providerService } from "../../services/providerService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../common/Pagination";

// Sub-componentes
import { ProveedorHeader } from "./proveedores/ProveedorHeader";
import { ProveedorTable } from "./proveedores/ProveedorTable";
import { ProveedorFormDialog } from "./proveedores/ProveedorFormDialog";
import { ProveedorDetailDialog } from "./proveedores/ProveedorDetailDialog";
import { ProveedorDeleteDialog } from "./proveedores/ProveedorDeleteDialog";

export function ProveedoresModule() {
  const { proveedores, setProveedores, userType, currentUser } = useStore();
  // Ensure we check for the specific 'admin' role if available, otherwise fallback to userType
  const isAdmin = currentUser?.rol === "admin" || userType === "admin";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(
    null,
  );
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredProveedores = useMemo(() => {
    return proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nit.includes(searchQuery) ||
        (p.email &&
          p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.telefono && p.telefono.includes(searchQuery)),
    );
  }, [proveedores, searchQuery]);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems: filteredProveedores.length });

  const paginatedProveedores = useMemo(() => {
    return filteredProveedores.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredProveedores, currentPage, itemsPerPage]);

  const [formData, setFormData] = useState({
    tipo_proveedor: "Persona Natural",
    nombre: "",
    email: "",
    telefono: "",
    nit: "",
    direccion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper to update specific field and clear its error
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    let error = "";
    if (!value && field !== "estado") {
      error = "Requerido";
    } else if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value.trim())) {
        error = "Formato inválido";
      } else {
        const duplicateEmail = proveedores.find(
          (p) =>
            p.email.toLowerCase() === value.trim().toLowerCase() &&
            p.id !== editingProveedor?.id,
        );
        if (duplicateEmail) error = "Ya en uso";
      }
    } else if (field === "nit") {
      const duplicateNit = proveedores.find(
        (p) => p.nit === value.trim() && p.id !== editingProveedor?.id,
      );
      if (duplicateNit) error = "Ya registrado";
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const refreshProveedores = async () => {
    try {
      const data = await providerService.getAll();
      const mapped = (
        Array.isArray(data) ? data : (data as any).data || []
      ).map((prov: any) => ({
        id: prov.id_proveedor.toString(),
        tipo_proveedor: prov.tipo_proveedor || "Persona Natural",
        nombre: prov.nombre,
        email: prov.email || "",
        telefono: prov.telefono || "",
        nit: prov.documento_nit || "",
        direccion: prov.direccion || "",
        estado: prov.estado ? ("activo" as const) : ("inactivo" as const),
        fechaRegistro: new Date().toISOString(),
      }));
      setProveedores(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar proveedores");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      await refreshProveedores();
      setIsInitialLoading(false);
    };
    init();
  }, []);


  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData({
        tipo_proveedor: proveedor.tipo_proveedor || "Persona Natural",
        nombre: proveedor.nombre,
        email: proveedor.email,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        direccion: proveedor.direccion,
        estado: proveedor.estado,
      });
    } else {
      setEditingProveedor(null);
      setFormData({
        tipo_proveedor: "Persona Natural",
        nombre: "",
        email: "",
        telefono: "",
        nit: "",
        direccion: "",
        estado: "activo",
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    }
    if (!formData.nit.trim()) {
      errors.nit = "El NIT/Documento es requerido";
    } else {
      const duplicateNit = proveedores.find(
        (p) => p.nit === formData.nit.trim() && p.id !== editingProveedor?.id,
      );
      if (duplicateNit) {
        errors.nit = "Ya existe un proveedor registrado con este NIT";
      }
    }
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es requerido";
    }
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Formato de correo electrónico inválido";
      } else {
        const duplicateEmail = proveedores.find(
          (p) =>
            p.email.toLowerCase() === formData.email.trim().toLowerCase() &&
            p.id !== editingProveedor?.id,
        );
        if (duplicateEmail) {
          errors.email = "Este correo electrónico ya está en uso";
        }
      }
    }
    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es requerida";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setFieldErrors({});

    setIsSaving(true);
    try {
      const payload: any = {
        tipo_proveedor: formData.tipo_proveedor,
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        documento_nit: formData.nit.trim(),
        direccion: formData.direccion.trim(),
        estado: formData.estado === "activo",
      };

      if (editingProveedor) {
        await providerService.update(Number(editingProveedor.id), payload);
        toast.success("Proveedor actualizado");
      } else {
        await providerService.create(payload);
        toast.success("Proveedor creado");
      }

      await refreshProveedores();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!isAdmin) {
      toast.error("Solo un administrador puede eliminar proveedores");
      return;
    }
    if (!selectedProveedor) return;
    setIsSaving(true);
    try {
      await providerService.delete(Number(selectedProveedor.id));
      await refreshProveedores();
      toast.success("Proveedor eliminado permanentemente");
      setIsDeleteDialogOpen(false);
      setSelectedProveedor(null);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    proveedor: any,
    newStatus: "activo" | "inactivo",
  ) => {
    try {
      await providerService.update(Number(proveedor.id), {
        tipo_proveedor: proveedor.tipo_proveedor,
        nombre: proveedor.nombre,
        email: proveedor.email,
        telefono: proveedor.telefono,
        documento_nit: proveedor.nit,
        direccion: proveedor.direccion,
        estado: newStatus === "activo",
      });
      await refreshProveedores();
      toast.success(`Proveedor ${newStatus}`);
    } catch (e) {
      toast.error("Error al cambiar el estado");
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
          Cargando Proveedores...
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
        <ProveedorHeader
          onOpenDialog={() => {
            if (!isAdmin) {
              toast.error("Solo un administrador puede realizar esta acción");
              return;
            }
            handleOpenDialog();
          }}
          isAdmin={isAdmin}
        />

        <div className="px-8 mt-6">
          <ProveedorTable
            proveedores={paginatedProveedores}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewDetail={(p) => {
              setSelectedProveedor(p);
              setIsDetailDialogOpen(true);
            }}
            onEdit={(p) => {
              if (!isAdmin) {
                toast.error("Solo un administrador puede editar proveedores");
                return;
              }
              handleOpenDialog(p);
            }}
            onDelete={(p) => {
              if (!isAdmin) {
                toast.error("Solo un administrador puede eliminar proveedores");
                return;
              }
              setSelectedProveedor(p);
              setIsDeleteDialogOpen(true);
            }}
            onStatusChange={handleStatusChange}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <ProveedorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProveedor={editingProveedor}
        formData={formData}
        onChange={handleFieldChange}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <ProveedorDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        proveedor={selectedProveedor}
      />

      <ProveedorDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        proveedor={selectedProveedor}
        isSaving={isSaving}
        onConfirm={handleConfirmDelete}
      />

      {filteredProveedores.length > 0 && (
        <div className="px-8 pb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProveedores.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </div>
      )}
    </div>
  );
}
