import React from "react";
import { Lock } from "lucide-react";
import { Dashboard } from "../Dashboard/DashboardMain";
import { UsuariosModule } from "../modules/UsuariosModule";
import { ClientesViewModule } from "../modules/ClientesViewModule";
import { ProductsModule } from "../modules/ProductsModule";
import { CategoriasModule } from "../modules/CategoriasModule";
import { ProveedoresModule } from "../modules/ProveedoresModule";
import { VentasModule } from "../modules/VentasModule";
import { ComprasModule } from "../modules/ComprasModule";
import { PedidosModule } from "../modules/PedidosModule";
import { DevolucionesModule } from "../modules/DevolucionesModule";
import { MarcasModule } from "../modules/MarcasModule";
import { RolesPermisosModule } from "../modules/RolesPermisosModule";
import { PerfilUsuarioModule } from "../modules/PerfilUsuarioModule";

import { InicioView } from "../client/InicioView";
import { CatalogoView } from "../client/CatalogoView";
import { FavoritosView } from "../client/FavoritosView";
import { MisPedidosView } from "../client/MisPedidosView";
import { NosotrosView } from "../client/NosotrosView";
import { ContactoView } from "../client/ContactoView";
import { ProductDetailScreen } from "../client/ProductDetailScreen";
import { PerfilView } from "../client/PerfilView";
import { CheckoutView } from "../client/CheckoutView";

export type Route =
  | "dashboard"
  | "usuarios"
  | "clientes-view"
  | "productos"
  | "categorias"
  | "marcas"
  | "ventas"
  | "pedidos"
  | "devoluciones"
  | "clientes"
  | "proveedores"
  | "compras"
  | "configuracion"
  | "roles"
  | "inicio"
  | "catalogo"
  | "favoritos"
  | "mis-pedidos"
  | "perfil"
  | "checkout"
  | "producto-detalle"
  | "nosotros"
  | "contacto";

interface AppRouterProps {
  currentRoute: Route;
  setCurrentRoute: (route: Route) => void;
  userType: string;
  currentUser: any;
  isAuthenticated: boolean;
  activeCategory: string | null;
  setActiveCategory: (catId: string | null) => void;
  productDetailId: string | null;
  setProductDetailId: (id: string | null) => void;
  productDetailOrigin: Route;
  setProductDetailOrigin: (route: Route) => void;
  onRequireAuth: (page: "login" | "register") => void;
}

function AccesoDenegado() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div 
        className="w-full max-w-md p-8 rounded-2xl text-center space-y-6"
        style={{
          background: "rgba(46, 16, 32, 0.4)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(210, 140, 165, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        }}
      >
        <div 
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center animate-pulse"
          style={{
            background: "rgba(140, 70, 90, 0.2)",
            border: "1.5px solid rgba(210, 140, 165, 0.4)",
            boxShadow: "0 0 20px rgba(140, 60, 90, 0.3)",
          }}
        >
          <Lock className="w-8 h-8 text-[#e0a0be]" />
        </div>
        
        <div className="space-y-2">
          <h2 
            className="text-xl font-semibold text-white tracking-wider"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            ACCESO RESTRINGIDO
          </h2>
          <p className="text-sm text-gray-300">
            No tienes los permisos necesarios para visualizar este módulo.
          </p>
        </div>
        
        <div className="pt-2">
          <p className="text-xs text-gray-400 italic">
            Comunícate con el administrador del sistema si crees que esto es un error.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppRouter({
  currentRoute,
  setCurrentRoute,
  userType,
  currentUser,
  isAuthenticated,
  activeCategory,
  setActiveCategory,
  productDetailId,
  setProductDetailId,
  productDetailOrigin,
  setProductDetailOrigin,
  onRequireAuth,
}: AppRouterProps) {

  const adminRoutes = [
    "dashboard",
    "usuarios",
    "clientes-view",
    "productos",
    "categorias",
    "marcas",
    "ventas",
    "pedidos",
    "devoluciones",
    "clientes",
    "proveedores",
    "compras",
    "configuracion",
    "roles",
  ];

  const routePermissions: Record<string, string> = {
    dashboard: "ver_ventas",
    usuarios: "ver_usuarios",
    "clientes-view": "ver_clientes",
    productos: "ver_productos",
    categorias: "ver_productos",
    marcas: "ver_productos",
    ventas: "ver_ventas",
    pedidos: "ver_pedidos",
    devoluciones: "ver_devoluciones",
    clientes: "ver_clientes",
    proveedores: "ver_proveedores",
    compras: "ver_compras",
    configuracion: "ver_configuracion",
  };

  if (adminRoutes.includes(currentRoute)) {
    if (userType === "cliente") {
      setCurrentRoute("inicio");
      return null;
    }

    if (currentUser && currentUser.id_rol !== 1) {
      if (currentRoute === "roles") {
        return <AccesoDenegado />;
      }
      const requiredPerm = routePermissions[currentRoute];
      if (requiredPerm && !currentUser.permisos?.includes(requiredPerm)) {
        return <AccesoDenegado />;
      }
    }
  }

  const handleNavigateClient = (route: string, catId?: string | null) => {
    if (route === "login" || route === "register") {
      onRequireAuth(route as "login" | "register");
    } else {
      if (catId) setActiveCategory(catId);
      setCurrentRoute(route as Route);
    }
  };

  const handleViewProduct = (productId: string, origin: Route) => {
    setProductDetailOrigin(origin);
    setProductDetailId(productId);
    setCurrentRoute("producto-detalle");
  };

  switch (currentRoute) {
    case "dashboard":
      return <Dashboard />;
    case "usuarios":
      return <UsuariosModule />;
    case "clientes-view":
      return <ClientesViewModule />;
    case "productos":
      return <ProductsModule />;
    case "categorias":
      return <CategoriasModule />;
    case "marcas":
      return <MarcasModule />;
    case "ventas":
      return <VentasModule />;
    case "pedidos":
      return <PedidosModule />;
    case "devoluciones":
      return <DevolucionesModule />;
    case "clientes":
      return <ClientesViewModule />;
    case "proveedores":
      return <ProveedoresModule />;
    case "compras":
      return <ComprasModule />;
    case "configuracion":
      return <PerfilUsuarioModule />;
    case "roles":
      return <RolesPermisosModule />;
      
    case "inicio":
      return (
        <InicioView
          isPublic={!isAuthenticated}
          onNavigate={handleNavigateClient}
          onViewProduct={(productId) => handleViewProduct(productId, "inicio")}
        />
      );
    case "catalogo":
      return (
        <CatalogoView
          initialCategory={activeCategory || "all"}
          onClearCategory={() => setActiveCategory(null)}
          onViewProduct={(productId) => handleViewProduct(productId, "catalogo")}
        />
      );
    case "favoritos":
      return (
        <FavoritosView
          onNavigate={(route) => setCurrentRoute(route as Route)}
          onViewProduct={(productId) => handleViewProduct(productId, "favoritos")}
        />
      );
    case "mis-pedidos":
      if (!isAuthenticated) {
        onRequireAuth("login");
        return null;
      }
      return (
        <MisPedidosView
          onNavigate={(route) => setCurrentRoute(route as Route)}
        />
      );
    case "nosotros":
      return (
        <NosotrosView
          onNavigate={(route) => setCurrentRoute(route as Route)}
        />
      );
    case "contacto":
      return (
        <ContactoView
          onNavigate={(route) => setCurrentRoute(route as Route)}
        />
      );

    case "perfil":
      if (!isAuthenticated) {
        onRequireAuth("login");
        return null;
      }
      return <PerfilView />;
    case "checkout":
      if (!isAuthenticated) {
        onRequireAuth("login");
        return null;
      }
      return (
        <CheckoutView
          onBack={() => setCurrentRoute("inicio")}
          onComplete={() => setCurrentRoute("mis-pedidos")}
        />
      );
    case "producto-detalle":
      return (
        <ProductDetailScreen
          productId={productDetailId}
          onBack={() => {
            setCurrentRoute(productDetailOrigin);
            setProductDetailId(null);
          }}
        />
      );
    default:
      return userType === "admin" ? (
        <Dashboard />
      ) : (
        <InicioView
          isPublic={!isAuthenticated}
          onNavigate={handleNavigateClient}
          onViewProduct={(productId) => handleViewProduct(productId, "inicio")}
        />
      );
  }
}
