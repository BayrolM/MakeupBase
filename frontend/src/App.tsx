import { StoreProvider, useStore, UserRole, Cliente } from "./lib/store";
import { ThemeProvider } from "./lib/theme-context";
import { AppSidebar } from "./components/layout/AppSidebar";
import { Dashboard } from "./components/Dashboard/DashboardMain";
import { SidebarProvider } from "./components/ui/sidebar";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate, Routes, Route } from "react-router-dom";
import { UsuariosModule } from "./components/modules/UsuariosModule";
import { ClientesViewModule } from "./components/modules/ClientesViewModule";
import { ProductsModule } from "./components/modules/ProductsModule";
import { CategoriasModule } from "./components/modules/CategoriasModule";
import { ProveedoresModule } from "./components/modules/ProveedoresModule";
import { VentasModule } from "./components/modules/VentasModule";
import { ComprasModule } from "./components/modules/ComprasModule";
import { PedidosModule } from "./components/modules/PedidosModule";
import { DevolucionesModule } from "./components/modules/DevolucionesModule";
import { MarcasModule } from "./components/modules/MarcasModule";
import { RolesPermisosModule } from "./components/modules/RolesPermisosModule";
import { PerfilUsuarioModule } from "./components/modules/PerfilUsuarioModule";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPageColombia } from "./components/auth/RegisterPageColombia";
import { RecoverPage } from "./components/auth/RecoverPage";
import { InicioView } from "./components/client/InicioView";
import { CatalogoView } from "./components/client/CatalogoView";
import { FavoritosView } from "./components/client/FavoritosView";
import { MisPedidosView } from "./components/client/MisPedidosView";
import { NosotrosView } from "./components/client/NosotrosView";
import { ContactoView } from "./components/client/ContactoView";
import { PerfilView } from "./components/client/PerfilView";
import { CheckoutView } from "./components/client/CheckoutView";
import { NotificationBell } from "./components/layout/NotificationBell";
import { ClientNavbar } from "./components/client/ClientNavbar";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Lock, X } from "lucide-react";
import { authService } from "./services/authService";
import { orderService } from "./services/orderService";
import { productService } from "./services/productService";
import { categoryService } from "./services/categoryService";
import { providerService } from "./services/providerService";
import { purchaseService } from "./services/purchaseService";
import { userService } from "./services/userService";
import { marcaService } from "./services/marcaService";

// Mapa bidireccional: ruta interna → path de URL
const ROUTE_TO_PATH: Record<string, string> = {
  // Admin
  dashboard: "/dashboard",
  usuarios: "/usuarios",
  "clientes-view": "/clientes",
  productos: "/productos",
  categorias: "/categorias",
  marcas: "/marcas",
  ventas: "/ventas",
  pedidos: "/pedidos",
  devoluciones: "/devoluciones",
  proveedores: "/proveedores",
  compras: "/compras",
  configuracion: "/configuracion",
  roles: "/roles",
  // Cliente
  inicio: "/",
  catalogo: "/catalogo",
  favoritos: "/favoritos",
  "mis-pedidos": "/mis-pedidos",
  historial: "/historial",
  perfil: "/perfil",
  checkout: "/checkout",
  nosotros: "/nosotros",
  contacto: "/contacto",
  // Auth
  login: "/login",
  register: "/register",
  recover: "/recover",
};

const PATH_TO_ROUTE: Record<string, string> = Object.fromEntries(
  Object.entries(ROUTE_TO_PATH).map(([k, v]) => [v, k])
);

type Route =
  | "dashboard" | "usuarios" | "clientes-view" | "productos" | "categorias"
  | "marcas" | "ventas" | "pedidos" | "devoluciones" | "clientes"
  | "proveedores" | "compras" | "configuracion" | "roles"
  | "inicio" | "catalogo" | "favoritos" | "mis-pedidos" | "historial"
  | "perfil" | "checkout" | "nosotros" | "contacto";

type AuthPage = "login" | "register" | "recover";

function AppContent() {
  const {
    userType,
    currentUser,
    setCurrentUser,
    setProductos,
    setCategorias,
    setMarcas,
    setProveedores,
    setCompras,
    setClientes,
    setPedidos,
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  // Derivar la ruta interna desde la URL actual
  const routeFromPath = (PATH_TO_ROUTE[location.pathname] ?? "inicio") as Route;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [recoverToken, setRecoverToken] = useState<string | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // La ruta actual se lee de la URL; navegar actualiza la URL
  const currentRoute = routeFromPath;

  const navigateTo = (route: string) => {
    const path = ROUTE_TO_PATH[route] ?? "/";
    navigate(path);
  };

  // Scroll al inicio al cambiar de ruta
  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const loadPublicData = async () => {
    try {
      const categoriesData = await categoryService.getAll({ limit: 100 });
      const mappedCategories = categoriesData.data.map((cat: any) => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || "",
        estado: cat.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setCategorias(mappedCategories);

      const brandsData = await marcaService.getAll();
      const mappedBrands = brandsData.data.map((brand: any) => ({
        id: brand.id_marca.toString(),
        nombre: brand.nombre,
        descripcion: brand.descripcion || "",
        estado: brand.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setMarcas(mappedBrands);

      const productsResponse = await productService.getAll({ limit: 100 });
      const mappedProducts = productsResponse.data.map((prod) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        stockFisico: prod.stock_fisico || 0,
        imagenUrl: prod.imagen_url || undefined,
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mappedProducts);
    } catch (error) {
      console.error("Error cargando datos públicos:", error);
    }
  };

  const loadPrivateData = async (userRol?: string | number) => {
    const role = userRol || currentUser?.rol || userType;
    const isAdmin = role === "admin" || role === 1;
    try {
      if (isAdmin) {
        const providersData = await providerService.getAll();
        setProveedores(providersData.map((prov) => ({
          id: prov.id_proveedor.toString(),
          tipo_proveedor: prov.tipo_proveedor || "Persona Natural",
          nombre: prov.nombre,
          email: prov.email || "",
          telefono: prov.telefono || "",
          nit: prov.documento_nit || "",
          direccion: prov.direccion || "",
          estado: prov.estado ? ("activo" as const) : ("inactivo" as const),
          fechaRegistro: prov.fecha_registro || new Date().toISOString(),
        })));

        const purchasesData = await purchaseService.getAll();
        const purchasesArray = Array.isArray(purchasesData) ? purchasesData : (purchasesData as any).data || [];
        setCompras(purchasesArray.map((purch: any) => ({
          id: purch.id_compra.toString(),
          proveedorId: purch.id_proveedor.toString(),
          fecha: purch.fecha_compra,
          total: Number(purch.total) || 0,
          estado: purch.estado === true || purch.estado === 1 ? ("confirmada" as const) : ("anulada" as const),
          confirmada: !!purch.estado,
          observaciones: purch.observaciones || "",
          productos: (purch.productos || []).map((p: any) => ({
            productoId: p.id_producto.toString(),
            cantidad: Number(p.cantidad),
            precioUnitario: Number(p.precio_unitario),
          })),
        })));

        const clientsData = await userService.getAll({ id_rol: 2 });
        const mappedClients: Cliente[] = clientsData.data.map((c: any) => {
          const nombres = c.nombres || c.nombre || "";
          const apellidos = c.apellidos || c.apellido || "";
          return {
            id: c.id_usuario.toString(),
            nombre: `${nombres} ${apellidos}`.trim() || "Sin Nombre",
            nombres, apellidos,
            email: c.email,
            telefono: c.telefono || "",
            documento: c.documento || "",
            numeroDocumento: c.documento || "",
            estado: c.estado ? ("activo" as const) : ("inactivo" as const),
            totalCompras: Number(c.total_ventas) || 0,
            foto_perfil: c.foto_perfil,
            fechaRegistro: c.get_fecha_creacion || c.fecha_creacion || new Date().toISOString(),
          };
        });
        setClientes(mappedClients);
      }

      const ordersData = await orderService.getAll({ limit: 100 });
      setPedidos(ordersData.data.map((o: any) => ({
        id: o.id_pedido?.toString() || "0",
        clienteId: (o.id_usuario_cliente || o.id_usuario)?.toString() || "0",
        fecha: o.fecha_pedido,
        total: Number(o.total) || 0,
        subtotal: (Number(o.total) || 0) / 1.19,
        iva: (Number(o.total) || 0) - (Number(o.total) || 0) / 1.19,
        costoEnvio: 0,
        estado: o.estado as any,
        direccionEnvio: o.direccion || "",
        pago_confirmado: !!o.pago_confirmado,
        comprobante_url: o.comprobante_url || "",
        fechaVenta: o.fecha_venta || null,
        productos: (o.items || []).map((i: any) => ({
          productoId: (i.id_producto || i.id_detalle_pedido)?.toString() || "0",
          cantidad: i.cantidad || 0,
          precioUnitario: Number(i.precio_unitario) || 0,
        })),
      })));
    } catch (error) {
      console.error("Error cargando datos privados:", error);
    }
  };

  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getProfile();
        const user = {
          id: profile.id_usuario.toString(),
          nombres: profile.nombres,
          apellidos: profile.apellidos,
          email: profile.email,
          telefono: profile.telefono,
          direccion: profile.direccion || "",
          ciudad: profile.ciudad || "",
          departamento: profile.departamento || "",
          id_rol: Number(profile.id_rol),
          foto_perfil: profile.foto_perfil,
          rol: Number(profile.id_rol) === 1 ? ("admin" as const) : Number(profile.id_rol) === 2 ? ("cliente" as const) : ("vendedor" as const),
          permisos: profile.permisos || [],
          estado: "activo" as const,
          tipoDocumento: "CC" as const,
          numeroDocumento: "",
          passwordHash: "",
          fechaCreacion: new Date().toISOString(),
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
        await loadPublicData();
        await loadPrivateData(user.rol);
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        authService.logout();
        await loadPublicData();
      }
    } else {
      await loadPublicData();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
    // Token de recuperación en la URL (/?token=xxx)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setRecoverToken(token);
      setAuthPage("recover");
      setShowAuthPage(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirigir al dashboard/inicio cuando cambia el tipo de usuario tras login
  useEffect(() => {
    if (isAuthenticated) {
      navigateTo(userType === "admin" ? "dashboard" : "inicio");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      const profile = await authService.getProfile();
      const user = {
        id: profile.id_usuario.toString(),
        nombres: profile.nombres,
        apellidos: profile.apellidos,
        email: profile.email,
        telefono: profile.telefono,
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        departamento: profile.departamento || "",
        id_rol: Number(profile.id_rol),
        foto_perfil: profile.foto_perfil,
        rol: Number(profile.id_rol) === 1 ? ("admin" as const) : Number(profile.id_rol) === 2 ? ("cliente" as const) : ("vendedor" as const),
        permisos: profile.permisos || [],
        estado: "activo" as const,
        tipoDocumento: "CC" as const,
        numeroDocumento: "",
        passwordHash: "",
        fechaCreacion: new Date().toISOString(),
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadPublicData();
      await loadPrivateData(user.rol);
      setShowAuthPage(false);
      navigateTo(user.rol === "cliente" ? "inicio" : "dashboard");
      toast.success("¡Bienvenido!", { description: `Has iniciado sesión como ${user.nombres}` });
      return true;
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.code === "USER_INACTIVE") {
        setShowInactiveModal(true);
        return false;
      }
      toast.error("Error al iniciar sesión", { description: error.message || "Credenciales incorrectas" });
      return false;
    }
  };

  const handleRegister = async (data: {
    nombre: string; apellido: string; email: string; telefono: string;
    password: string; rol: UserRole; tipoDocumento: string; documento: string;
    direccion: string; ciudad: string; departamento: string;
  }) => {
    try {
      await authService.register({
        nombres: data.nombre, apellidos: data.apellido, email: data.email,
        telefono: data.telefono, password: data.password,
        id_rol: data.rol === "admin" ? 1 : 2,
        tipo_documento: data.tipoDocumento, documento: data.documento,
        direccion: data.direccion, ciudad: data.ciudad, departamento: data.departamento,
      });
      toast.success("¡Registro exitoso!", { description: "Ahora puedes iniciar sesión" });
      setAuthPage("login");
    } catch (error: any) {
      toast.error("Error al registrar", { description: error.message });
    }
  };

  const handleRecover = (email: string) => {
    console.log("Recovering password for:", email);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthPage("login");
    navigateTo("inicio");
    toast.info("Sesión cerrada", { description: "Has cerrado sesión correctamente" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  // Páginas de autenticación (login, register, recover)
  if (showAuthPage && !isAuthenticated) {
    let authContent;
    switch (authPage) {
      case "login":
        authContent = (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => setAuthPage("register")}
            onNavigateToRecover={() => setAuthPage("recover")}
            onBack={() => { setShowAuthPage(false); navigateTo("inicio"); }}
          />
        );
        break;
      case "register":
        authContent = (
          <RegisterPageColombia
            onRegister={handleRegister}
            onNavigateToLogin={() => setAuthPage("login")}
            onBack={() => { setShowAuthPage(false); navigateTo("inicio"); }}
          />
        );
        break;
      case "recover":
        authContent = (
          <RecoverPage
            initialToken={recoverToken}
            onRecover={handleRecover}
            onNavigateToLogin={() => { setAuthPage("login"); setRecoverToken(undefined); }}
            onBack={() => { setShowAuthPage(false); setRecoverToken(undefined); navigateTo("inicio"); }}
          />
        );
        break;
    }
    return (
      <>
        {authContent}
        <Dialog open={showInactiveModal} onOpenChange={setShowInactiveModal}>
          <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}>
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-gray-900 leading-tight">Cuenta inactiva</DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">No puedes iniciar sesión en este momento</DialogDescription>
                </div>
              </div>
              <button onClick={() => setShowInactiveModal(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "#fff0f5", borderRadius: "12px", padding: "16px", border: "1px solid #f0d5e0", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <Lock style={{ color: "#c47b96", width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5, fontWeight: 600, marginBottom: 4 }}>Tu cuenta ha sido desactivada</p>
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>No tienes permiso para iniciar sesión. Si crees que esto es un error, comunícate con el administrador del sistema.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 pb-6 pt-2">
              <button onClick={() => setShowInactiveModal(false)} className="rounded-lg font-semibold px-6 h-10 text-sm text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#c47b96" }}>Entendido</button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  function AccesoDenegado() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-8 rounded-2xl text-center space-y-6" style={{ background: "rgba(46, 16, 32, 0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(210, 140, 165, 0.2)", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)" }}>
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center animate-pulse" style={{ background: "rgba(140, 70, 90, 0.2)", border: "1.5px solid rgba(210, 140, 165, 0.4)", boxShadow: "0 0 20px rgba(140, 60, 90, 0.3)" }}>
            <Lock className="w-8 h-8 text-[#e0a0be]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>ACCESO RESTRINGIDO</h2>
            <p className="text-sm text-gray-300">No tienes los permisos necesarios para visualizar este módulo.</p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-400 italic">Comunícate con el administrador del sistema si crees que esto es un error.</p>
          </div>
        </div>
      </div>
    );
  }

  const adminRoutes = ["dashboard","usuarios","clientes-view","productos","categorias","marcas","ventas","pedidos","devoluciones","clientes","proveedores","compras","configuracion","roles"];
  const routePermissions: Record<string, string> = {
    dashboard: "ver_ventas", usuarios: "ver_usuarios", "clientes-view": "ver_clientes",
    productos: "ver_productos", categorias: "ver_productos", marcas: "ver_productos",
    ventas: "ver_ventas", pedidos: "ver_pedidos", devoluciones: "ver_devoluciones",
    clientes: "ver_clientes", proveedores: "ver_proveedores", compras: "ver_compras",
    configuracion: "ver_configuracion",
  };

  // Protección de rutas admin para clientes
  if (adminRoutes.includes(currentRoute) && userType === "cliente") {
    return <Navigate to="/" replace />;
  }

  // Protección de permisos para empleados (no super admin)
  if (adminRoutes.includes(currentRoute) && currentUser && currentUser.id_rol !== 1) {
    if (currentRoute === "roles") return <AccesoDenegado />;
    const requiredPerm = routePermissions[currentRoute];
    if (requiredPerm && !currentUser.permisos?.includes(requiredPerm)) return <AccesoDenegado />;
  }

  // Helper para navegar y manejar rutas de auth
  const handleNavigate = (route: string, catId?: string) => {
    if (route === "login" || route === "register") {
      setShowAuthPage(true);
      setAuthPage(route as AuthPage);
      return;
    }
    if (route === "catalogo") setActiveCategory(catId ?? null);
    navigateTo(route);
  };

  // Rutas protegidas que requieren autenticación
  const requireAuth = () => {
    if (!isAuthenticated) {
      setShowAuthPage(true);
      setAuthPage("login");
      return true;
    }
    return false;
  };

  // Layout cliente
  if (userType === "cliente") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ClientNavbar
          currentRoute={currentRoute}
          onNavigate={(route) => {
            if (route === "mis-pedidos" || route === "perfil" || route === "checkout") {
              if (requireAuth()) return;
            }
            handleNavigate(route);
          }}
          onLogout={handleLogout}
        />
        <main ref={scrollContainerRef} className="flex-1">
          <Routes>
            <Route path="/" element={<InicioView isPublic={!isAuthenticated} onNavigate={handleNavigate} />} />
            <Route path="/catalogo" element={<CatalogoView initialCategory={activeCategory || "all"} onClearCategory={() => setActiveCategory(null)} />} />
            <Route path="/favoritos" element={<FavoritosView onNavigate={(r) => navigateTo(r)} />} />
            <Route path="/mis-pedidos" element={isAuthenticated ? <MisPedidosView onNavigate={(r) => navigateTo(r)} /> : <Navigate to="/" replace />} />
            <Route path="/nosotros" element={<NosotrosView onNavigate={(r) => navigateTo(r)} />} />
            <Route path="/contacto" element={<ContactoView onNavigate={(r) => navigateTo(r)} />} />
            <Route path="/perfil" element={isAuthenticated ? <PerfilView /> : <Navigate to="/" replace />} />
            <Route path="/checkout" element={isAuthenticated ? <CheckoutView onBack={() => navigateTo("inicio")} onComplete={() => navigateTo("mis-pedidos")} /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Layout admin
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          onNavigate={(route) => { if (route === "catalogo") setActiveCategory(null); navigateTo(route); }}
          currentRoute={currentRoute}
          onLogout={handleLogout}
        />
        <main ref={scrollContainerRef} className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<UsuariosModule />} />
            <Route path="/clientes" element={<ClientesViewModule />} />
            <Route path="/productos" element={<ProductsModule />} />
            <Route path="/categorias" element={<CategoriasModule />} />
            <Route path="/marcas" element={<MarcasModule />} />
            <Route path="/ventas" element={<VentasModule />} />
            <Route path="/pedidos" element={<PedidosModule />} />
            <Route path="/devoluciones" element={<DevolucionesModule />} />
            <Route path="/proveedores" element={<ProveedoresModule />} />
            <Route path="/compras" element={<ComprasModule />} />
            <Route path="/configuracion" element={<PerfilUsuarioModule />} />
            <Route path="/roles" element={<RolesPermisosModule />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <NotificationBell />
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AppContent />
        <Toaster />
      </StoreProvider>
    </ThemeProvider>
  );
}
