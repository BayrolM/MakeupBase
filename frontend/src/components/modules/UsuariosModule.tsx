import { useState, useEffect } from 'react';
import { useStore, TipoDocumento, UserRole, Status } from '../../lib/store';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Plus, Eye, Pencil, Trash2, Search, X, UserPlus,
  Users, Hash, Mail, Phone, Shield, Activity,
  AlertCircle, CheckCircle2, User,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';

export function UsuariosModule() {
  const { users, setUsers, pedidos, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    fechaNacimiento: '',
    email: '',
    passwordHash: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    rol: 'cliente' as 'admin' | 'vendedor' | 'cliente' | 'bodeguero',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  // Errores en tiempo real
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
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
        if (!editingUser) {
          if (!value) return 'La contraseña es obligatoria';
          if (value.length < 8) return 'Mínimo 8 caracteres';
        }
        return '';
      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio';
        if (value.trim().length > 20) return 'Máximo 20 caracteres';
        return '';
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

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    // Validación de unicidad de email en tiempo real
    if (name === 'email' && !error) {
      const emailExists = users.some(u => u.email.toLowerCase() === value.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id));
      setFieldErrors(prev => ({ ...prev, [name]: emailExists ? 'Este email ya está registrado' : '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isAdmin = currentUser?.rol === 'admin';

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll({
        q: searchQuery.length >= 2 ? searchQuery : undefined,
        limit: 100,
      });
      const mapped = response.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombres: u.nombres || u.nombre,
        apellidos: u.apellidos || u.apellido,
        tipoDocumento: u.tipo_documento || 'CC',
        numeroDocumento: u.documento || u.numeroDocumento,
        email: u.email,
        passwordHash: '',
        telefono: u.telefono,
        direccion: u.direccion,
        ciudad: u.ciudad,
        rol: (Number(u.id_rol) === 1 ? 'admin' : Number(u.id_rol) === 2 ? 'cliente' : 'vendedor') as UserRole,
        estado: (u.estado ? 'activo' : 'inactivo') as Status,
        fechaCreacion: u.fecha_registro || new Date().toISOString(),
      }));
      setUsers(mapped);
    } catch (error: any) {
      toast.error('Error al cargar usuarios', { description: error.message });
    }
  };

  useEffect(() => { fetchUsers(); }, [searchQuery]);

  const handleOpenDialog = (user?: any) => {
    if (!isAdmin) { toast.error('Solo los administradores pueden gestionar usuarios.'); return; }
    if (user && user.estado === 'inactivo') {
      toast.error('Usuario inactivo', { description: 'Debes activar el usuario antes de poder editarlo.' });
      return;
    }
    if (user) {
      setEditingUser(user);
      setFormData({
        nombres: user.nombres, apellidos: user.apellidos,
        tipoDocumento: user.tipoDocumento, numeroDocumento: user.numeroDocumento,
        fechaNacimiento: user.fechaNacimiento || '', email: user.email,
        passwordHash: '', telefono: user.telefono,
        direccion: user.direccion || '', ciudad: user.ciudad || '',
        pais: user.pais || 'Colombia', rol: user.rol, estado: user.estado,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombres: '', apellidos: '', tipoDocumento: 'CC', numeroDocumento: '',
        fechaNacimiento: '', email: '', passwordHash: '', telefono: '',
        direccion: '', ciudad: '', pais: 'Colombia', rol: 'cliente', estado: 'activo',
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const fields = ['nombres', 'apellidos', 'numeroDocumento', 'email', 'telefono', 'direccion', 'ciudad'];
    if (!editingUser) fields.push('passwordHash');
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      const err = validateField(f, (formData as any)[f] || '');
      if (err) newErrors[f] = err;
    });
    // Unicidad email
    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (emailExists) newErrors.email = 'Este email ya está registrado';
    // Unicidad documento
    const docExists = users.some(u => u.numeroDocumento === formData.numeroDocumento.trim() && (!editingUser || u.id !== editingUser.id));
    if (docExists) newErrors.numeroDocumento = 'Ya existe un usuario con este documento';

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Corrige los errores antes de continuar');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const userData = {
        id_rol: formData.rol === 'admin' ? 1 : 2,
        nombres: formData.nombres.trim(), apellidos: formData.apellidos.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        estado: formData.estado === 'activo',
      };
      if (editingUser) {
        await userService.update(editingUser.id, userData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await userService.create({ ...userData, tipo_documento: formData.tipoDocumento, documento: formData.numeroDocumento, email: formData.email, password_hash: formData.passwordHash });
        toast.success('Usuario creado correctamente');
      }
      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error('Error al procesar usuario', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (user: any) => {
    if (!isAdmin) { toast.error('Solo los administradores pueden eliminar usuarios.'); return; }
    // Un admin no puede eliminar a otro admin
    if (user.rol === 'admin') {
      toast.error('No permitido', { description: 'No se puede eliminar a un usuario administrador.' });
      return;
    }
    const userExists = users.find(u => u.id === user.id);
    if (!userExists) { toast.error('Usuario no encontrado o ya eliminado.'); return; }

    // Bloquear si tiene pedidos activos (no entregado ni cancelado)
    const pedidosActivos = pedidos.filter(p =>
      p.clienteId === user.id &&
      !['entregado', 'cancelado'].includes(p.estado)
    );
    if (pedidosActivos.length > 0) {
      toast.error('No se puede eliminar este usuario', {
        description: `Tiene ${pedidosActivos.length} pedido(s) activo(s). Deben estar entregados o cancelados primero.`,
      });
      return;
    }

    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await userService.deletePermanent(selectedUser.id);
      toast.success('Usuario eliminado correctamente');
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error('No se pudo eliminar el usuario', { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery || searchQuery.length < 2) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.nombres.toLowerCase().includes(q) ||
      user.apellidos.toLowerCase().includes(q) ||
      (user.nombres + ' ' + user.apellidos).toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.numeroDocumento.includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRolLabel = (rol: string) => ({ admin: 'Administrador', vendedor: 'Vendedor', cliente: 'Cliente', bodeguero: 'Bodeguero' }[rol] || rol);
  const getTipoDocumentoLabel = (tipo: string) => ({ CC: 'Cédula de Ciudadanía', TI: 'Tarjeta de Identidad', CE: 'Cédula de Extranjería', PAS: 'Pasaporte', NIT: 'NIT', OTRO: 'Otro' }[tipo] || tipo);

  const getRolBadge = (rol: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
      vendedor: { bg: 'bg-blue-50', text: 'text-blue-700' },
      cliente: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      bodeguero: { bg: 'bg-amber-50', text: 'text-amber-700' },
    };
    return map[rol] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      {/* HEADER */}
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
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fffff2" }}>Usuarios</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>Gestión de usuarios del sistema</p>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenDialog()}
                  style={{ backgroundColor: "#7b1347ff", color: "#ffffff" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Usuario
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                  placeholder="Buscar por nombre, email o documento..."
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nombre</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Documento</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Rol</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Estado</div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <Users className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay usuarios registrados'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Los usuarios aparecerán aquí'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const rolBadge = getRolBadge(user.rol);
                  return (
                    <TableRow key={user.id} className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group">
                      <TableCell className="py-2.5">
                        <span className="font-mono text-[11px] font-semibold text-gray-400">#{user.id}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">    
                          <span className="text-gray-800 font-semibold text-sm">{user.nombres} {user.apellidos}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-500 text-sm font-mono">{user.tipoDocumento} {user.numeroDocumento}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-600 text-sm">{user.email}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-600 text-sm">{user.telefono}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${rolBadge.bg} ${rolBadge.text}`}>
                          {getRolLabel(user.rol)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        {(() => {
                          const pedidosActivos = pedidos.filter(p =>
                            p.clienteId === user.id &&
                            !['entregado', 'cancelado'].includes(p.estado)
                          );
                          const tieneActivos = pedidosActivos.length > 0;
                          return (
                            <div title={tieneActivos ? `Tiene ${pedidosActivos.length} pedido(s) activo(s)` : undefined}>
                              <StatusSwitch
                                status={user.estado}
                                onChange={async (newStatus) => {
                                  if (tieneActivos) {
                                    toast.error('No se puede desactivar', { description: `Tiene ${pedidosActivos.length} pedido(s) activo(s) pendientes.` });
                                    return;
                                  }
                                  try {
                                    await userService.update(user.id, { estado: newStatus === 'activo' });
                                    await fetchUsers();
                                  } catch {
                                    toast.error('Error al cambiar estado');
                                  }
                                }}
                              />
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedUser(user); setIsDetailDialogOpen(true); }} title="Ver detalles" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleOpenDialog(user)} title="Editar" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button onClick={() => handleOpenDeleteDialog(user)} title="Desactivar" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open && !isSaving) setIsDialogOpen(false); }}>
        <DialogContent className="bg-white border border-gray-100 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}>
                {editingUser ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  {editingUser ? 'Modifica la información del usuario' : 'Completa los campos para registrar un nuevo usuario'}
                </DialogDescription>
              </div>
            </div>
            <button onClick={() => { if (!isSaving) setIsDialogOpen(false); }} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Nombre <span className="text-rose-500">*</span></Label>
                <Input value={formData.nombres} onChange={(e) => handleFieldChange('nombres', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.nombres ? 'border-rose-400' : ''}`} placeholder="Ej: Juan" disabled={isSaving} maxLength={80} />
                {fieldErrors.nombres && <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombres}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Apellido <span className="text-rose-500">*</span></Label>
                <Input value={formData.apellidos} onChange={(e) => handleFieldChange('apellidos', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.apellidos ? 'border-rose-400' : ''}`} placeholder="Ej: Pérez" disabled={isSaving} maxLength={80} />
                {fieldErrors.apellidos && <p className="text-rose-500 text-xs mt-1">{fieldErrors.apellidos}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Tipo de Documento <span className="text-rose-500">*</span></Label>
                <Select value={formData.tipoDocumento} onValueChange={(v: TipoDocumento) => setFormData({ ...formData, tipoDocumento: v })} disabled={isSaving}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Número de Documento <span className="text-rose-500">*</span></Label>
                <Input value={formData.numeroDocumento} onChange={(e) => handleFieldChange('numeroDocumento', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.numeroDocumento ? 'border-rose-400' : ''}`} placeholder="Ej: 1234567890" disabled={isSaving} maxLength={10} />
                {fieldErrors.numeroDocumento && <p className="text-rose-500 text-xs mt-1">{fieldErrors.numeroDocumento}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Teléfono <span className="text-rose-500">*</span></Label>
                <Input value={formData.telefono} onChange={(e) => handleFieldChange('telefono', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.telefono ? 'border-rose-400' : ''}`} placeholder="Ej: 3001234567" disabled={isSaving} maxLength={20} />
                {fieldErrors.telefono && <p className="text-rose-500 text-xs mt-1">{fieldErrors.telefono}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Email <span className="text-rose-500">*</span></Label>
              <Input type="email" value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.email ? 'border-rose-400' : ''}`} placeholder="Ej: usuario@correo.com" disabled={isSaving} maxLength={100} />
              {fieldErrors.email && <p className="text-rose-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Contraseña <span className="text-rose-500">*</span></Label>
                <Input type="password" value={formData.passwordHash} onChange={(e) => handleFieldChange('passwordHash', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.passwordHash ? 'border-rose-400' : ''}`} placeholder="Mínimo 8 caracteres" disabled={isSaving} maxLength={225} />
                {fieldErrors.passwordHash && <p className="text-rose-500 text-xs mt-1">{fieldErrors.passwordHash}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Dirección</Label>
              <Input value={formData.direccion} onChange={(e) => handleFieldChange('direccion', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.direccion ? 'border-rose-400' : ''}`} placeholder="Ej: Calle 50 #30-20" disabled={isSaving} maxLength={30} />
              {fieldErrors.direccion && <p className="text-rose-500 text-xs mt-1">{fieldErrors.direccion}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Ciudad</Label>
                <Input value={formData.ciudad} onChange={(e) => handleFieldChange('ciudad', e.target.value)} className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.ciudad ? 'border-rose-400' : ''}`} placeholder="Ej: Medellín" disabled={isSaving} maxLength={50} />
                {fieldErrors.ciudad && <p className="text-rose-500 text-xs mt-1">{fieldErrors.ciudad}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">País</Label>
                <Input value={formData.pais} onChange={(e) => setFormData({ ...formData, pais: e.target.value })} className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11" placeholder="Ej: Colombia" disabled={isSaving} maxLength={100} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Rol <span className="text-rose-500">*</span></Label>
                <Select value={formData.rol} onValueChange={(v: any) => setFormData({ ...formData, rol: v })} disabled={isSaving}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="bodeguero">Bodeguero</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser && (
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm">Estado</Label>
                  <Select value={formData.estado} onValueChange={(v: any) => setFormData({ ...formData, estado: v })} disabled={isSaving}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!editingUser && (
              <div className="p-3 rounded-xl bg-[#fff0f5] border border-[#f0d5e0]">
                <p className="text-[#c47b96] text-xs font-medium">El usuario se creará con estado "Activo" por defecto.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm" disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-lg font-semibold px-6 h-10 text-sm border-0" style={{ backgroundColor: "#c47b96", color: "#ffffff" }}>
              {isSaving ? (
                <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{editingUser ? 'Actualizando...' : 'Creando...'}</div>
              ) : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-2xl rounded-2xl shadow-2xl p-0">
          {selectedUser && (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-gray-900 leading-tight">Detalle de Usuario</DialogTitle>
                    <DialogDescription className="text-xs text-gray-400 mt-0.5">{selectedUser.nombres} {selectedUser.apellidos}</DialogDescription>
                  </div>
                </div>
                <button onClick={() => setIsDetailDialogOpen(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre Completo', value: `${selectedUser.nombres} ${selectedUser.apellidos}` },
                    { label: 'Email', value: selectedUser.email },
                    { label: 'Tipo de Documento', value: getTipoDocumentoLabel(selectedUser.tipoDocumento) },
                    { label: 'Número de Documento', value: selectedUser.numeroDocumento },
                    { label: 'Teléfono', value: selectedUser.telefono },
                    { label: 'Rol', value: getRolLabel(selectedUser.rol) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  ))}
                  {selectedUser.ciudad && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ciudad</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedUser.ciudad}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedUser.estado === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#fff0f5] text-[#c47b96]'}`}>
                      {selectedUser.estado === 'activo' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {selectedUser.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end px-6 pb-6 pt-4 border-t border-gray-100">
                <Button onClick={() => setIsDetailDialogOpen(false)} className="rounded-lg font-semibold px-6 h-10 text-sm border-0" style={{ backgroundColor: "#c47b96", color: "#ffffff" }}>Cerrar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open && !isDeleting) setIsDeleteDialogOpen(false); }}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "#fff1f2", boxShadow: "0 2px 8px rgba(239,68,68,0.12)" }}>
                <AlertCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">Eliminar Usuario</DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">Esta acción es permanente y no se puede deshacer</DialogDescription>
              </div>
            </div>
            <button onClick={() => setIsDeleteDialogOpen(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ background: "#fef2f2", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", border: "1px solid #fecaca" }}>
              <AlertCircle style={{ color: "#ef4444", width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5 }}>
                  ¿Estás seguro que deseas eliminar permanentemente a <strong>{selectedUser?.nombres} {selectedUser?.apellidos}</strong>?
                </p>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: 4, lineHeight: 1.5 }}>
                  El usuario será eliminado del sistema y no podrá recuperarse.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm" disabled={isDeleting}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} disabled={isDeleting} style={{ backgroundColor: "#ef4444", color: "#ffffff" }} className="rounded-lg font-semibold px-6 h-10 text-sm border-0">
              {isDeleting ? (
                <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Eliminando...</div>
              ) : 'Eliminar Usuario'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
