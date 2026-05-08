import { useStore } from "../lib/store";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
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
  X,
  ChevronRight,
  User,
} from "lucide-react";

interface AppSidebarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onLogout?: () => void;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  route: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", route: "dashboard" },
      { icon: Users, label: "Usuarios", route: "usuarios" },
      { icon: UserCircle, label: "Clientes", route: "clientes-view" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { icon: Package, label: "Productos", route: "productos" },
      { icon: FolderKanban, label: "Categorías", route: "categorias" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { icon: ShoppingCart, label: "Ventas", route: "ventas" },
      { icon: Truck, label: "Pedidos", route: "pedidos" },
      { icon: RotateCcw, label: "Devoluciones", route: "devoluciones" },
      { icon: Building, label: "Proveedores", route: "proveedores" },
      { icon: ShoppingBag, label: "Compras", route: "compras" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { icon: Shield, label: "Roles y Permisos", route: "roles" },
      { icon: Settings, label: "Configuración", route: "configuracion" },
    ],
  },
];

const clienteItems: NavItem[] = [
  { icon: Home, label: "Inicio", route: "inicio" },
  { icon: Store, label: "Catálogo", route: "catalogo" },
  { icon: Heart, label: "Favoritos", route: "favoritos" },
  { icon: Truck, label: "Mis Pedidos", route: "mis-pedidos" },
  { icon: Bell, label: "Historial", route: "historial" },
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

  return (
    <button
      onClick={onClick}
      className={`sidebar-nav-item w-full text-left ${isActive ? "active" : ""}`}
    >
      <Icon className="nav-icon" />
      <span className="nav-label">{item.label}</span>
      {isActive && (
        <ChevronRight className="ml-auto w-3.5 h-3.5 text-[#e0a0be] opacity-60" />
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
  return (
    <div className="mb-4">
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

  const userInitial = currentUser?.nombres?.charAt(0) || "U";
  const userName = currentUser?.nombres || "Usuario";
  const userRole =
    userType === "admin"
      ? "Administrador"
      : currentUser?.rol || "Cliente";

  return (
    <Sidebar
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
        <SidebarHeader className="p-6 flex flex-col items-center border-none">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "radial-gradient(circle at 40% 35%, #3a1525, #160810)",
              border: "1.5px solid rgba(210,140,165,0.5)",
              boxShadow: "0 0 20px rgba(140,60,90,0.4), inset 0 0 20px rgba(140,60,90,0.1)",
            }}
          >
            <img
              src="/logo.png"
              alt="Glamour ML"
              className="w-14 h-14 object-contain"
            />
          </div>

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
                {userType === "admin" ? "Panel Admin" : "Cliente"}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 bg-transparent sidebar-scroll overflow-y-auto px-2">
          <div className="py-2">
            {userType === "admin"
              ? adminGroups.map((group) => (
                  <NavGroupComponent
                    key={group.label}
                    group={group}
                    currentRoute={currentRoute}
                    onNavigate={onNavigate}
                  />
                ))
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

        <SidebarFooter className="p-4 border-none space-y-3">
          <button
            onClick={() => onNavigate("configuracion")}
            className="sidebar-profile-btn"
          >
            <div
              className="sidebar-profile-avatar"
              style={{
                background: "linear-gradient(135deg, #7b1347 0%, #a85d77 100%)",
              }}
            >
              {userInitial}
            </div>

            <div className="sidebar-profile-info">
              <p className="sidebar-profile-name">{userName}</p>
              <p className="sidebar-profile-role">
                {userRole === "admin" ? "Administrador" : userRole}
              </p>
            </div>

            <Settings className="sidebar-profile-icon" />
          </button>

          <div className="sidebar-logout-wrapper">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="sidebar-logout-btn"
            >
              <LogOut className="logout-icon" />
              <span className="logout-text">Cerrar sesión</span>
            </button>
          </div>
        </SidebarFooter>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent
          className="border-0 max-w-sm rounded-2xl shadow-2xl p-0 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #fff 0%, #fff5f8 100%)",
          }}
        >
          <div className="flex flex-col items-center text-center px-6 pt-8 pb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(196,123,150,0.15) 0%, rgba(224,160,190,0.1) 100%)",
                border: "1px solid rgba(196, 123, 150, 0.25)",
              }}
            >
              <LogOut
                className="w-7 h-7"
                style={{ color: "var(--luxury-pink)" }}
              />
            </div>

            <DialogTitle
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--luxury-deep)",
                letterSpacing: "0.5px",
              }}
            >
              ¿Cerrar sesión?
            </DialogTitle>

            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--luxury-text-secondary)" }}
            >
              Tu sesión se cerrará y tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </p>
          </div>

          <div className="flex gap-3 px-6 pb-6 pt-2">
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "transparent",
                border: "1px solid rgba(196, 123, 150, 0.3)",
                color: "var(--luxury-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(196, 123, 150, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Cancelar
            </button>

            <button
              onClick={() => {
                setShowLogoutDialog(false);
                onLogout?.();
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: "var(--luxury-pink)",
                border: "none",
                boxShadow: "0 4px 12px rgba(123, 19, 71, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-1px) scale(1)";
              }}
            >
              Cerrar Sesión
            </button>
          </div>

          <button
            onClick={() => setShowLogoutDialog(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full transition-colors"
            style={{ color: "rgba(75, 85, 99, 0.5)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(75, 85, 99, 0.8)";
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(75, 85, 99, 0.5)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
