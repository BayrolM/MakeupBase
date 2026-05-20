import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import api from "./api";

export const hasPermission = (user: any, permiso: string): boolean => {
  if (!user) return false;
  if (user.id_rol === 1) return true; // Super admin
  return user.permisos?.includes(permiso) || false;
};

export type UserRole = "admin" | "vendedor" | "cliente";
export type OrderStatus =
  | "pendiente"
  | "preparado"
  | "procesando"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "carrito";
export type Status = "activo" | "inactivo";
export type TipoDocumento = "CC" | "TI" | "CE" | "PAS" | "NIT" | "OTRO";

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Status;
  permisos: {
    [modulo: string]: {
      ver: boolean;
      crear: boolean;
      editar: boolean;
      eliminar: boolean;
    };
  };
  total_usuarios?: number;
}

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento?: string;
  email: string;
  passwordHash: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  rol: UserRole;
  id_rol?: number;
  rolAsignadoId?: string;
  departamento?: string;
  estado: Status;
  fechaCreacion: string;
  foto_perfil?: string;
  permisos?: string[];
}

export interface Cliente {
  id: string;
  nombre: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  documento: string;
  numeroDocumento: string;
  estado: Status;
  totalCompras: number;
  fechaRegistro: string;
  tipoDocumento?: TipoDocumento;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
}

export interface Proveedor {
  id: string;
  tipo_proveedor: string;
  nombre: string;
  nit: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: Status;
  fechaRegistro: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Status;
}

export interface Marca {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Status;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  marcaId?: string;
  marca: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  stockFisico: number;
  imagenUrl?: string;
  estado: Status;
  fechaCreacion: string;
}

export interface Compra {
  id: string;
  proveedorId: string;
  fecha: string;
  productos: { productoId: string; cantidad: number; precioUnitario: number }[];
  total: number;
  estado: "pendiente" | "confirmada" | "anulada";
  confirmada: boolean;
  observaciones?: string;
  motivoAnulacion?: string;
}

export interface Venta {
  id: string;
  clienteId: string;
  pedidoId?: string;
  fecha: string;
  productos: { productoId: string; cantidad: number; precioUnitario: number }[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  estado: "activo" | "anulada";
  metodoPago: "Efectivo" | "Transferencia";
  motivoAnulacion?: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  fecha: string;
  productos: { productoId: string; cantidad: number; precioUnitario: number }[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  estado: OrderStatus;
  direccionEnvio: string;
  pago_confirmado: boolean;
  comprobante_url?: string;
  motivoAnulacion?: string;
  id_usuario_empleado?: string;
}

export interface Devolucion {
  id: string;
  ventaId: string;
  clienteId: string;
  fecha: string;
  motivo: string;
  productos: { productoId: string; cantidad: number }[];
  estado: "pendiente" | "en_revision" | "aprobada" | "rechazada" | "anulada";
  evidencias: string[];
  totalDevuelto: number;
  motivoDecision?: string;
  motivoAnulacion?: string;
  fechaAnulacion?: string;
}

export interface NotificationSummary {
  pedidos: number;
  stock: number;
  devoluciones: number;
  total: number;
}

// ─── Contextos separados: estado vs acciones ─────────────────────────────────
// Separar estado de acciones evita que un cambio en cualquier entidad
// recalcule el objeto de acciones (que es estable) y cause re-renders en cascada.

interface StoreState {
  users: User[];
  clientes: Cliente[];
  proveedores: Proveedor[];
  categorias: Categoria[];
  marcas: Marca[];
  productos: Producto[];
  compras: Compra[];
  ventas: Venta[];
  pedidos: Pedido[];
  devoluciones: Devolucion[];
  roles: Rol[];
  currentUser: User | null;
  userType: "admin" | "cliente";
  favoritos: string[];
  carrito: { productoId: string; cantidad: number }[];
  notificationSummary: NotificationSummary;
}

interface StoreActions {
  addUser: (user: Omit<User, "id" | "fechaCreacion">) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addCliente: (cliente: Omit<Cliente, "id" | "fechaRegistro">) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addProveedor: (proveedor: Omit<Proveedor, "id" | "fechaRegistro">) => void;
  updateProveedor: (id: string, proveedor: Partial<Proveedor>) => void;
  deleteProveedor: (id: string) => void;
  addCategoria: (categoria: Omit<Categoria, "id">) => void;
  updateCategoria: (id: string, categoria: Partial<Categoria>) => void;
  deleteCategoria: (id: string) => void;
  addProducto: (producto: Omit<Producto, "id" | "fechaCreacion">) => void;
  updateProducto: (id: string, producto: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
  updateStock: (productoId: string, cantidad: number) => void;
  addCompra: (compra: Omit<Compra, "id">) => void;
  updateCompra: (id: string, compra: Partial<Compra>) => void;
  confirmarCompra: (id: string) => void;
  addVenta: (venta: Omit<Venta, "id">) => void;
  updateVenta: (id: string, venta: Partial<Venta>) => void;
  anularVenta: (id: string, motivo: string) => void;
  addPedido: (pedido: Omit<Pedido, "id"> | Pedido) => void;
  updatePedido: (id: string, pedido: Partial<Pedido>) => void;
  updatePedidoEstado: (id: string, estado: OrderStatus, motivo?: string) => void;
  addDevolucion: (devolucion: Omit<Devolucion, "id">) => void;
  updateDevolucion: (id: string, devolucion: Partial<Devolucion>) => void;
  setRoles: (roles: Rol[]) => void;
  addRol: (rol: Omit<Rol, "id">) => void;
  updateRol: (id: string, rolData: Partial<Rol>) => void;
  deleteRol: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  setUserType: (type: "admin" | "cliente") => void;
  toggleFavorito: (productoId: string) => void;
  addToCarrito: (productoId: string, cantidad: number) => void;
  removeFromCarrito: (productoId: string) => void;
  updateCarritoQuantity: (productoId: string, cantidad: number) => void;
  clearCarrito: () => void;
  setProductos: (productos: Producto[]) => void;
  setCategorias: (categorias: Categoria[]) => void;
  setProveedores: (proveedores: Proveedor[]) => void;
  setCompras: (compras: Compra[]) => void;
  setUsers: (users: User[]) => void;
  setClientes: (clientes: Cliente[]) => void;
  setVentas: (ventas: Venta[]) => void;
  setPedidos: (pedidos: Pedido[]) => void;
  setDevoluciones: (devoluciones: Devolucion[]) => void;
  setMarcas: (marcas: Marca[]) => void;
  fetchNotificationSummary: () => Promise<void>;
}

const StoreStateContext = createContext<StoreState | undefined>(undefined);
const StoreActionsContext = createContext<StoreActions | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);
const getCurrentDate = () => new Date().toISOString().split("T")[0];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [userType, setUserType] = useState<"admin" | "cliente">("cliente");
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    const saved = localStorage.getItem("gml_favoritos");
    return saved ? JSON.parse(saved) : [];
  });
  const [carrito, setCarrito] = useState<{ productoId: string; cantidad: number }[]>(() => {
    const saved = localStorage.getItem("gml_carrito");
    return saved ? JSON.parse(saved) : [];
  });
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary>({
    pedidos: 0, stock: 0, devoluciones: 0, total: 0,
  });

  // Ref para acceder a productos dentro de callbacks estables sin re-crearlos
  const productosRef = useRef(productos);
  productosRef.current = productos;

  useEffect(() => {
    localStorage.setItem("gml_favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem("gml_carrito", JSON.stringify(carrito));
  }, [carrito]);

  // ─── Estado (se recalcula solo cuando cambia algún dato) ──────────────────
  const state: StoreState = {
    users, clientes, proveedores, categorias, marcas, productos,
    compras, ventas, pedidos, devoluciones, roles,
    currentUser, userType, favoritos, carrito, notificationSummary,
  };

  // ─── Acciones (estables — no dependen de estado, usan refs donde necesario) ─
  const fetchNotificationSummary = useCallback(async () => {
    try {
      const response = await api.get("/notifications/summary");
      if (response.data.ok) setNotificationSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching notification summary:", error);
    }
  }, []);

  const actions: StoreActions = {
    // Users
    addUser: useCallback((user) => setUsers((prev) => [{ ...user, id: generateId(), fechaCreacion: getCurrentDate() }, ...prev]), []),
    updateUser: useCallback((id, data) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...data } : u)), []),
    deleteUser: useCallback((id) => setUsers((prev) => prev.filter((u) => u.id !== id)), []),

    // Clientes
    addCliente: useCallback((cliente) => setClientes((prev) => [{ ...cliente, id: generateId(), fechaRegistro: getCurrentDate(), totalCompras: 0 }, ...prev]), []),
    updateCliente: useCallback((id, data) => setClientes((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c)), []),
    deleteCliente: useCallback((id) => setClientes((prev) => prev.filter((c) => c.id !== id)), []),

    // Proveedores
    addProveedor: useCallback((proveedor) => setProveedores((prev) => [{ ...proveedor, id: generateId(), fechaRegistro: getCurrentDate() }, ...prev]), []),
    updateProveedor: useCallback((id, data) => setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p)), []),
    deleteProveedor: useCallback((id) => setProveedores((prev) => prev.filter((p) => p.id !== id)), []),

    // Categorias
    addCategoria: useCallback((categoria) => setCategorias((prev) => [{ ...categoria, id: generateId() }, ...prev]), []),
    updateCategoria: useCallback((id, data) => setCategorias((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c)), []),
    deleteCategoria: useCallback((id) => setCategorias((prev) => prev.filter((c) => c.id !== id)), []),

    // Productos
    addProducto: useCallback((producto) => setProductos((prev) => [{ ...producto, id: generateId(), fechaCreacion: getCurrentDate() }, ...prev]), []),
    updateProducto: useCallback((id, data) => {
      setProductos((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
      fetchNotificationSummary();
    }, [fetchNotificationSummary]),
    deleteProducto: useCallback((id) => setProductos((prev) => prev.filter((p) => p.id !== id)), []),
    updateStock: useCallback((productoId, cantidad) => setProductos((prev) => prev.map((p) => p.id === productoId ? { ...p, stock: p.stock + cantidad } : p)), []),

    // Compras
    addCompra: useCallback((compra) => setCompras((prev) => [{ ...compra, id: generateId() }, ...prev]), []),
    updateCompra: useCallback((id, data) => setCompras((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c)), []),
    confirmarCompra: useCallback((id) => {
      setCompras((prev) => prev.map((c) => c.id === id && !c.confirmada ? { ...c, confirmada: true, estado: "confirmada" as const } : c));
      fetchNotificationSummary();
    }, [fetchNotificationSummary]),

    // Ventas
    addVenta: useCallback((venta) => {
      setVentas((prev) => [{ ...venta, id: generateId() }, ...prev]);
      setClientes((prev) => prev.map((c) => c.id === venta.clienteId ? { ...c, totalCompras: c.totalCompras + 1 } : c));
      fetchNotificationSummary();
    }, [fetchNotificationSummary]),
    updateVenta: useCallback((id, data) => setVentas((prev) => prev.map((v) => v.id === id ? { ...v, ...data } : v)), []),
    anularVenta: useCallback((id, motivo) => setVentas((prev) => prev.map((v) => v.id === id && v.estado === "activo" ? { ...v, estado: "anulada" as const, motivoAnulacion: motivo } : v)), []),

    // Pedidos
    addPedido: useCallback((pedido) => setPedidos((prev) => [{ ...pedido, id: "id" in pedido ? pedido.id : generateId() }, ...prev]), []),
    updatePedido: useCallback((id, data) => setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p)), []),
    updatePedidoEstado: useCallback((id, estado, motivo) => {
      setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado, motivoAnulacion: motivo } : p));
      fetchNotificationSummary();
    }, [fetchNotificationSummary]),

    // Devoluciones
    addDevolucion: useCallback((devolucion) => setDevoluciones((prev) => [{ ...devolucion, id: generateId() }, ...prev]), []),
    updateDevolucion: useCallback((id, data) => {
      setDevoluciones((prev) => prev.map((d) => d.id === id ? { ...d, ...data } : d));
      fetchNotificationSummary();
    }, [fetchNotificationSummary]),

    // Roles
    setRoles: useCallback((newRoles) => setRoles(newRoles), []),
    addRol: useCallback((rol) => setRoles((prev) => [{ ...rol, id: generateId() }, ...prev]), []),
    updateRol: useCallback((id, data) => setRoles((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r)), []),
    deleteRol: useCallback((id) => setRoles((prev) => prev.filter((r) => r.id !== id)), []),

    // Auth
    setCurrentUser: useCallback((user: User | null) => {
      setCurrentUserState(user);
      setUserType(user ? (user.rol === "cliente" ? "cliente" : "admin") : "cliente");
    }, []),
    setUserType: useCallback((type) => setUserType(type), []),

    // Carrito y favoritos
    toggleFavorito: useCallback((productoId) => setFavoritos((prev) => prev.includes(productoId) ? prev.filter((id) => id !== productoId) : [...prev, productoId]), []),
    addToCarrito: useCallback((productoId, cantidad) => {
      const producto = productosRef.current.find((p) => p.id === productoId);
      if (!producto) return;
      setCarrito((prev) => {
        const existing = prev.find((item) => item.productoId === productoId);
        if (existing) {
          const newQty = Math.min(existing.cantidad + cantidad, producto.stock);
          return prev.map((item) => item.productoId === productoId ? { ...item, cantidad: newQty } : item);
        }
        return [...prev, { productoId, cantidad: Math.min(cantidad, producto.stock) }];
      });
    }, []),
    removeFromCarrito: useCallback((productoId) => setCarrito((prev) => prev.filter((item) => item.productoId !== productoId)), []),
    updateCarritoQuantity: useCallback((productoId, cantidad) => {
      const producto = productosRef.current.find((p) => p.id === productoId);
      if (!producto) return;
      setCarrito((prev) => {
        if (cantidad <= 0) return prev.filter((item) => item.productoId !== productoId);
        const validated = Math.max(1, Math.min(cantidad, producto.stock));
        return prev.map((item) => item.productoId === productoId ? { ...item, cantidad: validated } : item);
      });
    }, []),
    clearCarrito: useCallback(() => setCarrito([]), []),

    // Setters bulk
    setProductos: useCallback((p) => setProductos(p), []),
    setCategorias: useCallback((c) => setCategorias(c), []),
    setProveedores: useCallback((p) => setProveedores(p), []),
    setCompras: useCallback((c) => setCompras(c), []),
    setUsers: useCallback((u) => setUsers(u), []),
    setClientes: useCallback((c) => setClientes(c), []),
    setVentas: useCallback((v) => setVentas(v), []),
    setPedidos: useCallback((p) => setPedidos(p), []),
    setDevoluciones: useCallback((d) => setDevoluciones(d), []),
    setMarcas: useCallback((m) => setMarcas(m), []),
    fetchNotificationSummary,
  };

  return (
    <StoreStateContext.Provider value={state}>
      <StoreActionsContext.Provider value={actions}>
        {children}
      </StoreActionsContext.Provider>
    </StoreStateContext.Provider>
  );
}

// Hook unificado — mantiene la misma API que antes para no romper nada
export function useStore(): StoreState & StoreActions {
  const state = useContext(StoreStateContext);
  const actions = useContext(StoreActionsContext);
  if (!state || !actions) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return { ...state, ...actions };
}
