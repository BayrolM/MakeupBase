import { Search, Shield, Hash, Users as UsersIcon, Eye, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { StatusSwitch } from '../../StatusSwitch';

interface RolTableProps {
  roles: any[];
  users: any[];
  searchQuery: string;
  estadoFilter: 'todos' | 'activo' | 'inactivo';
  onSearchChange: (query: string) => void;
  onEstadoFilterChange: (estado: 'todos' | 'activo' | 'inactivo') => void;
  onViewDetail: (rol: any) => void;
  onEdit: (rol: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: 'activo' | 'inactivo') => void;
}

export function RolTable({
  roles,
  users,
  searchQuery,
  estadoFilter,
  onSearchChange,
  onEstadoFilterChange,
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange
}: RolTableProps) {
  const getUsersForRole = (rolId: string) => {
    return users.filter(u => u.rolAsignadoId === rolId);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex justify-end">
          <div className="w-full sm:w-48 relative shrink-0">
            <select
              value={estadoFilter}
              onChange={(e) => onEstadoFilterChange(e.target.value as any)}
              className="w-full h-11 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all appearance-none cursor-pointer shadow-sm"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Nombre del Rol</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              Descripción
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 text-center">
              <div className="flex items-center justify-center gap-1.5"><UsersIcon className="w-3.5 h-3.5" /> Usuarios</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              Estado
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20 bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <Shield className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay roles registrados'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Los roles aparecerán aquí'}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((rol) => (
              <TableRow key={rol.id} className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group bg-white">
                <TableCell className="py-2.5 pl-6">
                  <span className="font-mono text-[11px] font-semibold text-gray-400 group-hover:text-[#c47b96]">#{rol.id}</span>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-gray-800 font-bold text-sm">{rol.nombre}</span>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-gray-500 text-sm truncate max-w-[200px] block">{rol.descripcion || 'Sin descripción'}</span>
                </TableCell>
                <TableCell className="py-2.5 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100 font-mono text-xs font-bold text-gray-600">
                    {getUsersForRole(rol.id).length}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <StatusSwitch
                    status={rol.estado}
                    onChange={(newStatus) => onStatusChange(rol.id, newStatus)}
                  />
                </TableCell>
                <TableCell className="py-2.5 pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onViewDetail(rol)} title="Ver detalles" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(rol)} title="Editar" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(rol.id)} title="Eliminar" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
