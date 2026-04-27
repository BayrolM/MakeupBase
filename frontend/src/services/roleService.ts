import api from '../lib/api';

import { INITIAL_PERMISOS } from '../utils/rolUtils';

export interface RolAPI {
  id_rol: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  created_at?: string;
  permisos_asignados?: {
    id_permiso: number;
    nombre: string;
    modulo: string;
    descripcion: string;
  }[];
}

// Normaliza un rol del backend al formato del store del frontend
export function normalizeRol(r: RolAPI) {
  const permisosMap: Record<string, any> = JSON.parse(JSON.stringify(INITIAL_PERMISOS));
  
  if (r.permisos_asignados && Array.isArray(r.permisos_asignados)) {
    r.permisos_asignados.forEach(p => {
      // nombre is something like 'ver_usuarios', so we split by '_' to get 'ver'
      const accion = p.nombre.split('_')[0];
      if (accion && permisosMap[p.modulo][accion] !== undefined) {
        permisosMap[p.modulo][accion] = true;
      }
    });
  }

  return {
    id: String(r.id_rol),
    nombre: r.nombre,
    descripcion: r.descripcion ?? '',
    estado: r.estado ? ('activo' as const) : ('inactivo' as const),
    created_at: r.created_at ?? null,
    permisos: permisosMap,
    permisos_asignados: r.permisos_asignados || [], // keep reference
  };
}

/** Obtiene todos los permisos disponibles */
export async function getPermisosAPI() {
  const res = await api.get('/roles/permisos', { params: { limit: 1000 } });
  return res.data.data;
}

/** Obtiene permisos con paginación y filtros */
export async function getPermisosPaginatedAPI(params: { page?: number; limit?: number; q?: string; modulo?: string }) {
  const res = await api.get('/roles/permisos', { params });
  return res.data;
}

/** Obtiene todos los roles (solo administrador) */
export async function getRoles(params?: { q?: string; estado?: boolean }) {
  const res = await api.get('/roles', { params });
  return (res.data.data as RolAPI[]).map(normalizeRol);
}

/** Crea un nuevo rol. Lanza error con `message` del backend si falla. */
export async function createRol(data: {
  nombre: string;
  descripcion?: string;
  estado?: boolean;
}) {
  const res = await api.post('/roles', data);
  return normalizeRol(res.data.data as RolAPI);
}

/** Actualiza un rol existente. */
export async function updateRolAPI(
  id: string,
  data: { nombre?: string; descripcion?: string; estado?: boolean }
) {
  const res = await api.put(`/roles/${id}`, data);
  return normalizeRol(res.data.data as RolAPI);
}

/** Obtiene un rol por su ID */
export async function getRolById(id: string) {
  const res = await api.get(`/roles/${id}`);
  return normalizeRol(res.data.data as RolAPI);
}

/** Elimina un rol existente */
export async function deleteRolAPI(id: string) {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
}

/** Asigna permisos a un rol */
export async function asignarPermisosAPI(id: string, permisos: number[]) {
  const res = await api.post(`/roles/${id}/permisos`, { permisos });
  return res.data;
}

/** Elimina un permiso de un rol */
export async function eliminarPermisoAPI(rolId: string, permisoId: number) {
  const res = await api.delete(`/roles/${rolId}/permisos/${permisoId}`);
  return res.data;
}
