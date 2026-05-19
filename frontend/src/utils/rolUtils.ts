/**
 * Utilidades para el módulo de Roles y Permisos
 */

export const MODULOS = [
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'productos', label: 'Productos' },
  { key: 'marcas', label: 'Marcas' },
  { key: 'ventas', label: 'Ventas' },
  { key: 'compras', label: 'Compras' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'devoluciones', label: 'Devoluciones' },
  { key: 'configuracion', label: 'Configuración' },
];

export const INITIAL_PERMISOS = {
  usuarios: { ver: false, crear: false, editar: false, eliminar: false },
  productos: { ver: false, crear: false, editar: false, eliminar: false },
  marcas: { ver: false, crear: false, editar: false, eliminar: false },
  ventas: { ver: false, crear: false, editar: false, eliminar: false },
  compras: { ver: false, crear: false, editar: false, eliminar: false },
  pedidos: { ver: false, crear: false, editar: false, eliminar: false },
  clientes: { ver: false, crear: false, editar: false, eliminar: false },
  proveedores: { ver: false, crear: false, editar: false, eliminar: false },
  devoluciones: { ver: false, crear: false, editar: false, eliminar: false },
  configuracion: { ver: false, crear: false, editar: false, eliminar: false },
};

export interface ActionConfig {
  label: string;
  available: boolean;
}

export const getPermisoConfig = (
  modulo: string,
  accion: "ver" | "crear" | "editar" | "eliminar"
): ActionConfig => {
  if (modulo === "ventas") {
    if (accion === "editar") return { label: "Ver PDF", available: true };
    if (accion === "eliminar") return { label: "Anular", available: true };
  }
  if (modulo === "pedidos") {
    if (accion === "ver") return { label: "Ver / PDF", available: true };
    if (accion === "eliminar") return { label: "Anular", available: true };
  }
  if (modulo === "compras" && accion === "eliminar") {
    return { label: "Anular", available: true };
  }
  if (modulo === "devoluciones" && accion === "eliminar") {
    return { label: "Anular", available: true };
  }

  const defaultLabels = {
    ver: "Ver",
    crear: "Crear",
    editar: "Editar",
    eliminar: "Borrar",
  };

  return { label: defaultLabels[accion], available: true };
};

export const getPermisoIcon = (tipo: string, modulo?: string) => {
  if (modulo === "ventas" && tipo === "editar") return "📄";
  if (tipo === "eliminar" && ["ventas", "pedidos", "compras", "devoluciones"].includes(modulo || "")) return "🚫";

  switch (tipo) {
    case 'ver': return '👁️';
    case 'crear': return '➕';
    case 'editar': return '✏️';
    case 'eliminar': return '🗑️';
    default: return '';
  }
};
