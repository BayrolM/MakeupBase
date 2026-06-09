import { useState, useEffect } from "react";
import { useStore, TipoDocumento, Cliente } from "../../lib/store";
import { toast } from "sonner";
import { userService } from "../../services/userService";
import { Pagination } from "../common/Pagination";
import { usePagination } from "../../hooks/usePagination";

// Sub-componentes
import { ClientHeader } from "./clientes/ClientHeader";
import { ClientTable } from "./clientes/ClientTable";
import { ClientFormDialog } from "./clientes/ClientFormDialog";
import { ClientDetailDialog } from "./clientes/ClientDetailDialog";
import { ClientDeleteDialog } from "./clientes/ClientDeleteDialog";

// Utils
import {
  validateClientField,
  checkClientActiveConstraints,
} from "../../utils/clientUtils";

export function ClientesViewModule() {
  const { clientes, setClientes, ventas, pedidos } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems });

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "CC" as TipoDocumento,
    numeroDocumento: "",
    email: "",
    passwordHash: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    pais: "Colombia",
    estado: "activo" as "activo" | "inactivo",
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchClientes = async () => {
    try {
      const response = await userService.getAll({
        id_rol: 2,
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(response.total || 0);

      const mapped: Cliente[] = response.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre:
          `${u.nombres || ""} ${u.apellidos || ""}`.trim() ||
          u.nombre ||
          "Sin Nombre",
        nombres: u.nombres || "",
        apellidos: u.apellidos || "",
        email: u.email,
        telefono: u.telefono || "",
        documento: u.documento || "",
        numeroDocumento: u.documento || "",
        tipoDocumento: u.tipo_documento || "CC",
        direccion: u.direccion || "",
        ciudad: u.ciudad || "",
        departamento: u.departamento || "",
        pais: u.pais || "Colombia",
        estado: u.estado ? "activo" : "inactivo",
        totalCompras: Number(u.total_ventas) || 0,
        fechaRegistro: u.fecha_registro || new Date().toISOString(),
      }));
      setClientes(mapped);
    } catch (error: any) {
      toast.error("Error al cargar clientes", { description: error.message });
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      await fetchClientes();
      setIsInitialLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchClientes();
    }
  }, [currentPage, itemsPerPage, searchQuery]);


  const handleOpenDialog = (cliente?: any) => {
    if (cliente && cliente.estado === "inactivo") {
      toast.error("Cliente inactivo", {
        description: "Debes activar el cliente antes de poder editarlo.",
      });
      return;
    }
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        tipoDocumento: cliente.tipoDocumento,
        numeroDocumento: cliente.numeroDocumento,
        email: cliente.email,
        passwordHash: "",
        confirmPassword: "",
        telefono: cliente.telefono,
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
        departamento: cliente.departamento || "",
        pais: cliente.pais || "Colombia",
        estado: cliente.estado,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombres: "",
        apellidos: "",
        tipoDocumento: "CC",
        numeroDocumento: "",
        email: "",
        passwordHash: "",
        confirmPassword: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        departamento: "",
        pais: "Colombia",
        estado: "activo",
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "passwordHash") {
      const passwordError = validateClientField("passwordHash", value, editingCliente);
      const confirmPasswordValue = formData.confirmPassword;
      const confirmPasswordError = confirmPasswordValue
        ? value !== confirmPasswordValue
          ? "Las contraseñas no coinciden"
          : ""
        : "";

      setFieldErrors((prev) => ({
        ...prev,
        passwordHash: passwordError,
        confirmPassword: confirmPasswordError,
      }));
      return;
    }

    if (name === "confirmPassword") {
      const confirmPasswordError = !value
        ? "Confirma tu contraseña"
        : value !== formData.passwordHash
        ? "Las contraseñas no coinciden"
        : "";

      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
      return;
    }

    const error = validateClientField(name, value, editingCliente);

    // Check for uniqueness if basic validation passes
    if (!error && (name === "email" || name === "numeroDocumento")) {
      const exists = clientes.some(
        (c) =>
          (name === "email"
            ? c.email.toLowerCase() === value.trim().toLowerCase()
            : c.numeroDocumento === value.trim()) &&
          (!editingCliente || c.id !== editingCliente.id),
      );
      setFieldErrors((prev) => ({
        ...prev,
        [name]: exists
          ? `Este ${name === "email" ? "email" : "documento"} ya está registrado`
          : "",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSave = async () => {
    // Basic multi-field validation
    const fields = [
      "nombres",
      "apellidos",
      "numeroDocumento",
      "email",
      "telefono",
      "direccion",
      "ciudad",
      "departamento",
    ];
    if (!editingCliente) fields.push("passwordHash");

    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const err = validateClientField(f, (formData as any)[f], editingCliente);
      if (err) newErrors[f] = err;
    });

    if (!editingCliente && formData.passwordHash !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Corrige los errores antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        tipo_documento: formData.tipoDocumento,
        documento: formData.numeroDocumento.trim(),
        email: formData.email.trim(),
        password_hash: formData.passwordHash || undefined,
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        departamento: formData.departamento.trim(),
        id_rol: 2,
        estado: formData.estado === "activo",
      };

      if (editingCliente) {
        await userService.update(editingCliente.id, payload);
        toast.success("Cliente actualizado");
      } else {
        await userService.create(payload as any);
        toast.success("Cliente registrado");
        handlePageChange(1);
      }

      await fetchClientes();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error("Error al guardar cliente", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCliente) return;
    const { hasConstraints, description } = checkClientActiveConstraints(
      selectedCliente.id,
      pedidos,
      ventas,
    );

    if (hasConstraints) {
      toast.error("No se puede eliminar este cliente", {
        description: `Tiene ${description}.`,
      });
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deletePermanent(selectedCliente.id);
      toast.success("Cliente eliminado");
      await fetchClientes();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Error al eliminar cliente", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClientes = clientes;

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
          Cargando Clientes...
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
        <ClientHeader onOpenDialog={() => handleOpenDialog()} />

        <div className="px-4 md:px-8 mt-6">
          <ClientTable
            clientes={filteredClientes}
            pedidos={pedidos}
            ventas={ventas}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onViewDetail={(c) => {
              setSelectedCliente(c);
              setIsDetailDialogOpen(true);
            }}
            onEdit={handleOpenDialog}
            onDelete={(c) => {
              if (c.estado === "inactivo") {
                toast.error("Cliente inactivo", {
                  description: "No se puede eliminar un cliente inactivo.",
                });
                return;
              }
              setSelectedCliente(c);
              setIsDeleteDialogOpen(true);
            }}
            onStatusChange={async (cliente, newStatus) => {
              try {
                await userService.update(cliente.id, {
                  estado: newStatus === "activo",
                });
                await fetchClientes();
              } catch (e) {
                toast.error("Error al cambiar estado");
              }
            }}
          />
        </div>
      </div>

      <ClientFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCliente={editingCliente}
        formData={formData}
        setFormData={setFormData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onSave={handleSave}
        onFieldChange={handleFieldChange}
      />

      <ClientDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        cliente={selectedCliente}
      />

      <ClientDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        cliente={selectedCliente}
        isSaving={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      {totalItems > 0 && (
        <div className="px-4 md:px-8 pb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </div>
      )}
    </div>
  );
}
