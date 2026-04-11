import { useState, useEffect } from "react";
import { useStore, TipoDocumento } from "../../lib/store";

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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  X,
  UserCheck,
  Users,
  Hash,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Building2,
  ShoppingBag,
  Lock,
  Activity,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { userService } from "../../services/userService";
import { Cliente } from "../../lib/store";

export function ClientesViewModule() {
  const { users, clientes, setClientes, ventas, pedidos } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "CC" as TipoDocumento,
    numeroDocumento: "",
    fechaNacimiento: "",
    email: "",
    passwordHash: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    pais: "Colombia",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateClienteField = (name: string, value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    switch (name) {
      case 'nombres':
      case 'apellidos': {
        const label = name === 'nombres' ? 'El nombre' : 'El apellido';
        if (!value.trim()) return `${label} es obligatorio`;
        if (value.trim().length > 80) return `${label} no puede superar 80 caracteres`;
        return '';
      }
      case 'numeroDocumento':
        if (!value.trim()) return 'El documento es obligatorio';
        if (value.trim().length > 10) return 'Máximo 10 caracteres';
        return '';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!emailRegex.test(value.trim())) return 'Formato de email inválido';
        if (value.trim().length > 100) return 'Máximo 100 caracteres';
        return '';
      case 'passwordHash':
        if (!editingCliente) {
          if (!value) return 'La contraseña es obligatoria';
          if (value.length < 8) return 'Mínimo 8 caracteres';
        }
        return '';
      case 'telefono': {
        if (!value.trim()) return 'El teléfono es obligatorio';
        const soloDigitos = /^\d+$/.test(value.trim());
        if (!soloDigitos) return 'Solo se permiten números';
        if (value.trim().length < 7) return 'Mínimo 7 dígitos';
        if (value.trim().length > 15) return 'Máximo 15 dígitos';
        return '';
      }
      case 'direccion':
        if (value.trim() && value.trim().length < 3) return 'Mínimo 3 caracteres';
        if (value.trim().length > 30) return 'Máximo 30 caracteres';
        return '';
      case 'ciudad':
        if (value.trim().length > 50) return 'Máximo 50 caracteres';
        return '';
      default:
        return '';
    }
  };

  const handleClienteFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateClienteField(name, value);
    if (name === 'email' && !error) {
      const emailExists = clientes.some(
        c => c.email.toLowerCase() === value.trim().toLowerCase() &&
          (!editingCliente || c.id !== editingCliente.id)
      );
      setFieldErrors(prev => ({ ...prev, [name]: emailExists ? 'Este email ya está registrado' : '' }));
    } else if (name === 'numeroDocumento' && !error) {
      const docExists = clientes.some(
        c => c.numeroDocumento === value.trim() &&
          (!editingCliente || c.id !== editingCliente.id)
      );
      setFieldErrors(prev => ({ ...prev, [name]: docExists ? 'Este documento ya está registrado' : '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await userService.getAll({
        id_rol: 2,
        q: searchQuery.length >= 2 ? searchQuery : undefined,
      });

      const mapped: Cliente[] = response.data.map((u: any) => {
        const nombres = u.nombres || u.nombre || "";
        const apellidos = u.apellidos || u.apellido || "";
        return {
          id: u.id_usuario.toString(),
          nombre: `${nombres} ${apellidos}`.trim() || "Sin Nombre",
          nombres: nombres,
          apellidos: apellidos,
          email: u.email,
          telefono: u.telefono || "",
          documento: u.documento || "",
          numeroDocumento: u.documento || "",
          id_rol: u.id_rol,
          rol: "cliente" as const,
          estado: u.estado ? "activo" : "inactivo",
          totalCompras: Number(u.total_ventas) || 0,
          fechaRegistro: u.fecha_registro || new Date().toISOString(),
          tipoDocumento: u.tipo_documento || "CC",
          direccion: u.direccion || "",
          ciudad: u.ciudad || "",
          pais: u.pais || "Colombia",
        };
      });
      setClientes(mapped);
    } catch (error: any) {
      toast.error("Error al cargar clientes", { description: error.message });
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenDialog = (cliente?: any) => {
    if (cliente && cliente.estado === 'inactivo') {
      toast.error('Cliente inactivo', { description: 'Debes activar el cliente antes de poder editarlo.' });
      return;
    }
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        tipoDocumento: cliente.tipoDocumento,
        numeroDocumento: cliente.numeroDocumento,
        fechaNacimiento: cliente.fechaNacimiento || "",
        email: cliente.email,
        passwordHash: cliente.passwordHash,
        telefono: cliente.telefono,
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
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
        fechaNacimiento: "",
        email: "",
        passwordHash: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        pais: "Colombia",
        estado: "activo",
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const fields = ['nombres', 'apellidos', 'numeroDocumento', 'email', 'telefono', 'direccion', 'ciudad'];
    if (!editingCliente) fields.push('passwordHash');
    const newErrors: Record<string, string> = {};

    fields.forEach(f => {
      const err = validateClienteField(f, (formData as any)[f] || '');
      if (err) newErrors[f] = err;
    });

    // Unicidad email
    const emailExists = clientes.some(
      c => c.email.toLowerCase() === formData.email.trim().toLowerCase() &&
        (!editingCliente || c.id !== editingCliente.id)
    );
    if (emailExists) newErrors.email = 'Este email ya está registrado';

    // Unicidad documento
    const docExists = clientes.some(
      c => c.numeroDocumento === formData.numeroDocumento.trim() &&
        (!editingCliente || c.id !== editingCliente.id)
    );
    if (docExists) newErrors.numeroDocumento = 'Este documento ya está registrado';

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Corrige los errores antes de continuar');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const clienteData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        tipo_documento: formData.tipoDocumento,
        documento: formData.numeroDocumento.trim(),
        email: formData.email.trim(),
        password_hash: formData.passwordHash || undefined,
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        id_rol: 2,
        estado: formData.estado === "activo",
      };

      if (editingCliente) {
        await userService.update(editingCliente.id, clienteData);
        toast.success("Cliente actualizado correctamente", {
          description: `${clienteData.nombres} ${clienteData.apellidos} ha sido actualizado exitosamente.`,
        });
      } else {
        await userService.create(clienteData as any);
        toast.success("Cliente registrado exitosamente", {
          description: `${clienteData.nombres} ${clienteData.apellidos} ha sido agregado al sistema.`,
        });
      }

      await fetchClientes();
      setIsDialogOpen(false);
      setIsSaving(false);
    } catch (error: any) {
      setIsSaving(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido del servidor";
      toast.error(
        editingCliente
          ? "No se pudo actualizar el cliente"
          : "Error al registrar el cliente",
        {
          description: errorMessage || "Inténtalo nuevamente.",
        },
      );
    }
  };

  const handleOpenDetailDialog = (cliente: any) => {
    setSelectedCliente(cliente);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDeleteDialog = (cliente: any) => {
    const clienteExists = clientes.find((u) => u.id === cliente.id);
    if (!clienteExists) {
      toast.error("Cliente no encontrado", {
        description: "El cliente que intentas eliminar no existe o ya fue eliminado.",
      });
      return;
    }
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCliente) return;

    // Verificar pedidos activos (no entregado ni cancelado)
    const pedidosActivos = pedidos.filter(
      (p) => p.clienteId === selectedCliente.id && !['entregado', 'cancelado'].includes(p.estado)
    );
    // Verificar ventas activas (no anuladas)
    const ventasActivas = ventas.filter(
      (v) => v.clienteId === selectedCliente.id && v.estado === 'activo'
    );

    if (pedidosActivos.length > 0 || ventasActivas.length > 0) {
      const detalle = [];
      if (pedidosActivos.length > 0) detalle.push(`${pedidosActivos.length} pedido(s) activo(s)`);
      if (ventasActivas.length > 0) detalle.push(`${ventasActivas.length} venta(s) activa(s)`);
      toast.error("No se puede eliminar este cliente", {
        description: `Tiene ${detalle.join(' y ')}. Deben estar entregados, cancelados o anulados primero.`,
      });
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deletePermanent(selectedCliente.id);
      toast.success("Cliente eliminado correctamente", {
        description: `${selectedCliente.nombres} ${selectedCliente.apellidos} ha sido eliminado del sistema.`,
      });
      await fetchClientes();
      setIsDeleteDialogOpen(false);
      setSelectedCliente(null);
    } catch (error: any) {
      toast.error("No se pudo eliminar el cliente", {
        description: error.message || "Ocurrió un error. Inténtalo nuevamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredClientes = clientes.filter((cliente) => {
    if (!searchQuery || searchQuery.length < 2) return true;

    const query = searchQuery.toLowerCase();
    return (
      cliente.nombres.toLowerCase().includes(query) ||
      cliente.apellidos.toLowerCase().includes(query) ||
      (cliente.nombres + " " + cliente.apellidos)
        .toLowerCase()
        .includes(query) ||
      cliente.email.toLowerCase().includes(query) ||
      cliente.numeroDocumento.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getTotalCompras = (clienteId: string) => {
    return ventas.filter(
      (v) => v.clienteId === clienteId && v.estado === "activo",
    ).length;
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#fffff2" }}
                    >
                      Clientes
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>
                      Gestión de clientes registrados
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDialog()}
                style={{ backgroundColor: "#7b1347ff", color: "#ffffff" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nuevo Cliente
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
                placeholder="Buscar clientes por nombre, email o documento..."
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
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
                    <User className="w-3.5 h-3.5" />
                    Cliente
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    Documento
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Teléfono
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Ciudad
                  </div>
                </TableHead>

                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <Users className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          No hay clientes registrados
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Comienza agregando tu primer cliente al sistema
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 && searchQuery.length >= 2 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <Search className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          No se encontraron resultados
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          No hay clientes que coincidan con "{searchQuery}"
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClientes.map((cliente) => {
                  const comprasCount = getTotalCompras(cliente.id);
                  return (
                    <TableRow
                      key={cliente.id}
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                          <span className="font-mono text-[11px] font-semibold text-gray-500">
                            {cliente.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-gray-800 font-semibold text-sm">
                              {cliente.nombres} {cliente.apellidos}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-sm font-mono">
                            {cliente.tipoDocumento}
                          </span>
                          <span className="text-gray-800 text-sm font-medium">
                            {cliente.numeroDocumento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-600 text-sm">
                          {cliente.email}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-800 text-sm">
                          {cliente.telefono}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600 text-sm">
                            {cliente.ciudad || "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        {(() => {
                          const pedidosActivos = pedidos.filter(p =>
                            p.clienteId === cliente.id &&
                            !['entregado', 'cancelado'].includes(p.estado)
                          );
                          const ventasActivas = ventas.filter(v =>
                            v.clienteId === cliente.id && v.estado === 'activo'
                          );
                          const tieneActivos = pedidosActivos.length > 0 || ventasActivas.length > 0;
                          const detalleActivos = [
                            pedidosActivos.length > 0 ? `${pedidosActivos.length} pedido(s)` : '',
                            ventasActivas.length > 0 ? `${ventasActivas.length} venta(s)` : '',
                          ].filter(Boolean).join(' y ');
                          return (
                            <div title={tieneActivos ? `Tiene ${detalleActivos} activo(s)` : undefined}>
                              <StatusSwitch
                                status={cliente.estado}
                                onChange={async (newStatus) => {
                                  if (tieneActivos) {
                                    toast.error('No se puede cambiar el estado', { description: `Tiene ${detalleActivos} activo(s) pendientes.` });
                                    return;
                                  }
                                  try {
                                    await userService.update(cliente.id, { estado: newStatus === "activo" });
                                    await fetchClientes();
                                  } catch (e) {
                                    toast.error("Error al cambiar estado");
                                  }
                                }}
                              />
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetailDialog(cliente)}
                            title="Ver detalles"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(cliente)}
                            title="Editar cliente"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(cliente)}
                            title="Eliminar cliente"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
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
        {filteredClientes.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClientes.length}
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
        <DialogContent className="bg-white border border-gray-100 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
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
                {editingCliente ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  {editingCliente
                    ? "Modifica la información del cliente existente"
                    : "Completa los campos para registrar un nuevo cliente"}
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
            <div className="space-y-5 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c47b96]" />
                    Nombre <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.nombres}
                    onChange={(e) => handleClienteFieldChange('nombres', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.nombres ? 'border-rose-400' : ''}`}
                    placeholder="Ej: Juan"
                    disabled={isSaving}
                    maxLength={80}
                  />
                  {fieldErrors.nombres && <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombres}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c47b96]" />
                    Apellido <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.apellidos}
                    onChange={(e) => handleClienteFieldChange('apellidos', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.apellidos ? 'border-rose-400' : ''}`}
                    placeholder="Ej: Pérez"
                    disabled={isSaving}
                    maxLength={80}
                  />
                  {fieldErrors.apellidos && <p className="text-rose-500 text-xs mt-1">{fieldErrors.apellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#c47b96]" />
                    Tipo Documento <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipoDocumento}
                    onValueChange={(value: TipoDocumento) =>
                      setFormData({ ...formData, tipoDocumento: value })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl">
                      <SelectItem value="CC" className="text-gray-800">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="TI" className="text-gray-800">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="CE" className="text-gray-800">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PAS" className="text-gray-800">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[#c47b96]" />
                    Número Documento <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.numeroDocumento}
                    onChange={(e) => handleClienteFieldChange('numeroDocumento', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.numeroDocumento ? 'border-rose-400' : ''}`}
                    placeholder="Ej: 1234567890"
                    disabled={isSaving}
                    maxLength={10}
                  />
                  {fieldErrors.numeroDocumento && <p className="text-rose-500 text-xs mt-1">{fieldErrors.numeroDocumento}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#c47b96]" />
                    Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleClienteFieldChange('email', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.email ? 'border-rose-400' : ''}`}
                    placeholder="cliente@correo.com"
                    disabled={isSaving}
                    maxLength={100}
                  />
                  {fieldErrors.email && <p className="text-rose-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#c47b96]" />
                    Teléfono <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => handleClienteFieldChange('telefono', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.telefono ? 'border-rose-400' : ''}`}
                    placeholder="3001234567"
                    disabled={isSaving}
                    maxLength={15}
                  />
                  {fieldErrors.telefono && <p className="text-rose-500 text-xs mt-1">{fieldErrors.telefono}</p>}
                </div>
              </div>

              {!editingCliente && (
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#c47b96]" />
                    Contraseña <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    value={formData.passwordHash}
                    onChange={(e) => handleClienteFieldChange('passwordHash', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.passwordHash ? 'border-rose-400' : ''}`}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isSaving}
                    maxLength={225}
                  />
                  {fieldErrors.passwordHash && <p className="text-rose-500 text-xs mt-1">{fieldErrors.passwordHash}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#c47b96]" />
                  Dirección
                </Label>
                <Input
                  value={formData.direccion}
                  onChange={(e) => handleClienteFieldChange('direccion', e.target.value)}
                  className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.direccion ? 'border-rose-400' : ''}`}
                  placeholder="Calle 50 #30-20"
                  disabled={isSaving}
                  maxLength={30}
                />
                {fieldErrors.direccion && <p className="text-rose-500 text-xs mt-1">{fieldErrors.direccion}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                    Ciudad
                  </Label>
                  <Input
                    value={formData.ciudad}
                    onChange={(e) => handleClienteFieldChange('ciudad', e.target.value)}
                    className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.ciudad ? 'border-rose-400' : ''}`}
                    placeholder="Medellín"
                    disabled={isSaving}
                    maxLength={50}
                  />
                  {fieldErrors.ciudad && <p className="text-rose-500 text-xs mt-1">{fieldErrors.ciudad}</p>}
                </div>

                {editingCliente && (
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#c47b96]" />
                      Estado
                    </Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value: "activo" | "inactivo") =>
                        setFormData({ ...formData, estado: value })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-xl">
                        <SelectItem value="activo" className="text-gray-800">
                          Activo
                        </SelectItem>
                        <SelectItem value="inactivo" className="text-gray-800">
                          Inactivo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                  {editingCliente ? "Actualizando..." : "Creando..."}
                </div>
              ) : editingCliente ? (
                "Actualizar Cliente"
              ) : (
                "Crear Cliente"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE DETALLE ==================== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
          {selectedCliente && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}
                  >
                    {selectedCliente.nombres?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                      {selectedCliente.nombres} {selectedCliente.apellidos}
                    </DialogTitle>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ID #{selectedCliente.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: selectedCliente.estado === "activo" ? "#d1fae5" : "#fee2e2",
                      color: selectedCliente.estado === "activo" ? "#065f46" : "#991b1b",
                    }}
                  >
                    {selectedCliente.estado}
                  </span>
                  <button
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Fila 1: Identificación + Contacto */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" /> Identificación
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{selectedCliente.tipoDocumento}</p>
                    <p className="text-sm font-bold text-gray-800">{selectedCliente.numeroDocumento}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Contacto
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#c47b96] flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{selectedCliente.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#c47b96] flex-shrink-0" />
                        <span className="text-xs text-gray-700">{selectedCliente.telefono || "No registrado"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fila 2: Localización */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Localización
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ciudad</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedCliente.ciudad || "No registrada"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dirección</p>
                      <p className="text-sm text-gray-700">{selectedCliente.direccion || "No registrada"}</p>
                    </div>
                  </div>
                </div>

                {/* Fila 3: Actividad */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] rounded-xl p-4 border border-[#f0d5e0] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#c47b96] uppercase mb-1">Compras Totales</p>
                      <p className="text-3xl font-black text-gray-800 leading-none">{getTotalCompras(selectedCliente.id)}</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-[#c47b96] opacity-40" />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Miembro Desde</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(selectedCliente.fechaRegistro).toLocaleDateString("es-CO", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="w-full rounded-lg text-white font-semibold h-10 text-sm border-0"
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
                  Eliminar Cliente
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
                  ¿Estás seguro de eliminar permanentemente al cliente{" "}
                  <span style={{ fontWeight: 700, color: "#c47b96" }}>
                    &quot;{selectedCliente?.nombres}{" "}
                    {selectedCliente?.apellidos}&quot;
                  </span>
                  ?
                </p>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: 4 }}>
                  Esta acción eliminará al cliente del sistema de forma permanente.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-lg text-white font-semibold px-6 h-10 text-sm"
              style={{ background: "#ef4444" }}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Eliminando...
                </div>
              ) : (
                "Eliminar Cliente"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
