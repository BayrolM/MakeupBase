import { useStore } from "../../lib/store";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderKanban,
  ShoppingCart,
  Truck,
  RotateCcw,
  UserCircle,
  Building,
  ShoppingBag,
  Shield,
  Settings,
  Home,
  Store,
  Heart,
  Bell,
  LogOut,
  ChevronRight,
  User,
  Tags,
  ChevronLeft,
} from "lucide-react";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

interface AppSidebarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onLogout?: () => void;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  route: string;
  permiso?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", route: "dashboard", permiso: "ver_ventas" },
      { icon: Users, label: "Usuarios", route: "usuarios", permiso: "ver_usuarios" },
      { icon: UserCircle, label: "Clientes", route: "clientes-view", permiso: "ver_clientes" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { icon: Package, label: "Productos", route: "productos", permiso: "ver_productos" },
      { icon: FolderKanban, label: "Categorías", route: "categorias", permiso: "ver_productos" },
      { icon: Tags, label: "Marcas", route: "marcas", permiso: "ver_productos" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { icon: ShoppingCart, label: "Ventas", route: "ventas", permiso: "ver_ventas" },
      { icon: Truck, label: "Pedidos", route: "pedidos", permiso: "ver_pedidos" },
      { icon: RotateCcw, label: "Devoluciones", route: "devoluciones", permiso: "ver_devoluciones" },
      { icon: Building, label: "Proveedores", route: "proveedores", permiso: "ver_proveedores" },
      { icon: ShoppingBag, label: "Compras", route: "compras", permiso: "ver_compras" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { icon: Shield, label: "Roles y Permisos", route: "roles" }, // Solo para Admin (rol === 1)
      { icon: Settings, label: "Configuración", route: "configuracion", permiso: "ver_configuracion" },
    ],
  },
];

const clienteItems: NavItem[] = [
  { icon: Home, label: "Inicio", route: "inicio" },
  { icon: Store, label: "Catálogo", route: "catalogo" },
  { icon: Heart, label: "Favoritos", route: "favoritos" },
  { icon: Truck, label: "Mis Pedidos", route: "mis-pedidos" },
  { icon: User, label: "Mi Perfil", route: "perfil" },
];

function NavItemComponent({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const { state } = useSidebar();

  return (
    <button
      onClick={onClick}
      className={`sidebar-nav-item w-full text-left ${isActive ? "active" : ""} ${state === "collapsed" ? "justify-center" : ""}`}
      style={{ paddingLeft: state === "collapsed" ? 0 : undefined, paddingRight: state === "collapsed" ? 0 : undefined }}
      title={state === "collapsed" ? item.label : undefined}
    >
      <Icon className={`nav-icon ${state === "collapsed" ? "mx-auto" : "shrink-0"}`} />
      {state === "expanded" && (
        <>
          <span className="nav-label">{item.label}</span>
          {isActive && (
            <ChevronRight className="ml-auto w-3.5 h-3.5 text-[#e0a0be] opacity-60 shrink-0" />
          )}
        </>
      )}
    </button>
  );
}

function NavGroupComponent({
  group,
  currentRoute,
  onNavigate,
}: {
  group: NavGroup;
  currentRoute: string;
  onNavigate: (route: string) => void;
}) {
  const { state } = useSidebar();

  return (
    <div className="mb-4">
      {state === "expanded" && (
        <div className="px-6 py-2">
          <span
            style={{
              fontSize: "0.625rem",
              letterSpacing: "1.5px",
              color: "rgba(200, 130, 155, 0.5)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {group.label}
          </span>
        </div>
      )}
      <div className="flex flex-col">
        {group.items.map((item) => (
          <NavItemComponent
            key={item.route}
            item={item}
            isActive={currentRoute === item.route}
            onClick={() => onNavigate(item.route)}
          />
        ))}
      </div>
    </div>
  );
}

export function AppSidebar({
  onNavigate,
  currentRoute,
  onLogout,
}: AppSidebarProps) {
  const { currentUser, userType } = useStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { toggleSidebar, state } = useSidebar();

  const userInitial = currentUser?.nombres?.charAt(0) || "U";
  const userName = currentUser?.nombres || "Usuario";
  const rawRole = currentUser?.rol || (userType === "admin" ? "admin" : "cliente");
  const userRole = rawRole === "admin" ? "Administrador" : rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

  return (
    <Sidebar
      collapsible="icon"
      className="border-none overflow-hidden"
      style={{ "--sidebar-width": "280px" } as React.CSSProperties}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
            radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.35) 0%, transparent 45%),
            linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <SidebarHeader className={`p-6 flex flex-col items-center border-none relative ${state === "collapsed" ? "px-2" : ""}`}>
          <button
            onClick={toggleSidebar}
            className={`absolute z-50 p-1 cursor-pointer text-white/70 hover:text-white transition-colors duration-300 ${
              state === "collapsed" ? "top-2 left-1/2 -translate-x-1/2" : "top-4 right-4"
            }`}
            title={state === "expanded" ? "Comprimir menú" : "Expandir menú"}
          >
            {state === "collapsed" ? (
              <ChevronRight className="w-5 h-5 transition-transform duration-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>

          <div
            className={`rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${state === "collapsed" ? "w-10 h-10 mt-8" : "w-20 h-20"}`}
            style={{
              background:
                "radial-gradient(circle at 40% 35%, #3a1525, #160810)",
              border: "1.5px solid rgba(210,140,165,0.5)",
              boxShadow:
                "0 0 20px rgba(140,60,90,0.4), inset 0 0 20px rgba(140,60,90,0.1)",
            }}
          >
            <img
              src="/logo.png"
              alt="Glamour ML"
              className={`${state === "collapsed" ? "w-7 h-7" : "w-14 h-14"} object-contain transition-all duration-300`}
            />
          </div>

          {state === "expanded" && (
            <div className="text-center mt-3 space-y-1">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  letterSpacing: "2.5px",
                  color: "#fff",
                  textTransform: "uppercase",
                  textShadow: `
                    0 0 10px rgba(225,155,178,0.9),
                    0 0 22px rgba(160,80,110,0.6),
                    1px 1px 0 rgba(20,0,8,0.95),
                    -1px -1px 0 rgba(20,0,8,0.95)
                  `,
                }}
              >
                GLAMOUR ML
              </h2>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full"
                style={{
                  background: "rgba(160, 80, 110, 0.2)",
                  border: "1px solid rgba(210, 140, 165, 0.3)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: userType === "admin" ? "#e0a0be" : "#c47b96",
                  }}
                />
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(220,160,180,0.8)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  {userType === "admin" ? `Panel ${userRole}` : "Cliente"}
                </span>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className={`flex-1 bg-transparent sidebar-scroll overflow-y-auto ${state === "collapsed" ? "px-1" : "px-2"}`}>
          <div className="py-2">
            {userType === "admin"
              ? adminGroups.map((group) => {
                  const filteredItems = group.items.filter((item) => {
                    // Si el rol es 1 (Administrador), tiene acceso a todo de forma automática
                    if (currentUser?.id_rol === 1) return true;

                    // El módulo de roles y permisos es estrictamente exclusivo del administrador (rol === 1)
                    if (item.route === "roles") return false;

                    // Validar si cuenta con el permiso requerido
                    if (item.permiso) {
                      return currentUser?.permisos?.includes(item.permiso);
                    }

                    return false;
                  });

                  if (filteredItems.length === 0) return null;

                  return (
                    <NavGroupComponent
                      key={group.label}
                      group={{ ...group, items: filteredItems }}
                      currentRoute={currentRoute}
                      onNavigate={onNavigate}
                    />
                  );
                })
              : clienteItems.map((item) => (
                  <NavItemComponent
                    key={item.route}
                    item={item}
                    isActive={currentRoute === item.route}
                    onClick={() => onNavigate(item.route)}
                  />
                ))}
          </div>
        </SidebarContent>

        <SidebarFooter className={`p-4 border-none space-y-3 ${state === "collapsed" ? "px-2" : ""}`}>
          <button
            onClick={() => onNavigate("configuracion")}
            className={`sidebar-profile-btn ${state === "collapsed" ? "justify-center p-2 w-auto mx-auto aspect-square" : ""}`}
            style={{ 
              paddingLeft: state === "collapsed" ? 0 : undefined, 
              paddingRight: state === "collapsed" ? 0 : undefined,
              background: state === "collapsed" ? "transparent" : undefined,
              border: state === "collapsed" ? "none" : undefined
            }}
            title={state === "collapsed" ? "Configuración" : undefined}
          >
            <div
              className={`sidebar-profile-avatar shrink-0 ${state === "collapsed" ? "w-8 h-8 text-xs" : ""}`}
              style={{
                background: "linear-gradient(135deg, #7b1347 0%, #a85d77 100%)",
              }}
            >
              {userInitial}
            </div>

            {state === "expanded" && (
              <>
                <div className="sidebar-profile-info">
                  <p className="sidebar-profile-name">{userName}</p>
                  <p className="sidebar-profile-role">
                    {userRole}
                  </p>
                </div>

                <Settings className="sidebar-profile-icon" />
              </>
            )}
          </button>

          <div className="sidebar-logout-wrapper">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className={`sidebar-logout-btn ${state === "collapsed" ? "justify-center p-2 w-auto mx-auto aspect-square" : ""}`}
              style={{ 
                paddingLeft: state === "collapsed" ? 0 : undefined, 
                paddingRight: state === "collapsed" ? 0 : undefined,
                background: state === "collapsed" ? "transparent" : undefined,
                border: state === "collapsed" ? "none" : undefined
              }}
              title={state === "collapsed" ? "Cerrar sesión" : undefined}
            >
              <LogOut className={`logout-icon ${state === "collapsed" ? "mr-0" : ""}`} />
              {state === "expanded" && <span className="logout-text">Cerrar sesión</span>}
            </button>
          </div>
        </SidebarFooter>
      </div>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={() => onLogout?.()}
      />
    </Sidebar>
  );
}
