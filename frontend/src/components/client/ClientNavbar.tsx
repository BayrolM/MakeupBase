import { useState } from "react";
import { useStore } from "../../lib/store";
import { Heart, Package, ShoppingCart, Menu } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { MobileNavMenu } from "./MobileNavMenu";
import { UserDropdown } from "./UserDropdown";

interface ClientNavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

const COLORS = {
  accent: "#c47b96",
  accentDark: "#a85d77",
  accentDeep: "#7b1347",
  accentSoft: "#fce8f0",
};

export function ClientNavbar({
  currentRoute,
  onNavigate,
  onLogout,
}: ClientNavbarProps) {
  const { currentUser, carrito } = useStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const navLinks = [
    { label: "Inicio", route: "inicio" },
    { label: "Catálogo", route: "catalogo" },
    { label: "Nosotros", route: "nosotros" },
    { label: "Contáctanos", route: "contacto" },
  ];

  const isActive = (route: string) => currentRoute === route;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo + Nav links juntos */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Botón menú móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-foreground-secondary hover:text-foreground transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <button
                onClick={() => onNavigate("inicio")}
                className="flex items-center gap-3 shrink-0 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shadow-sm bg-black shrink-0">
                  <img
                    src="/logo.png"
                    alt="Glamour ML"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span
                    className="text-foreground font-bold"
                    style={{ fontSize: "18px", letterSpacing: "-0.01em" }}
                  >
                    GLAMOUR ML
                  </span>
                  <span
                    className="text-foreground-secondary"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                  >
                    Belleza & Cuidado Personal
                  </span>
                </div>
              </button>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ label, route }) => (
                  <button
                    key={route}
                    onClick={() => onNavigate(route)}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer font-medium ${
                      isActive(route)
                        ? "bg-[#fce8f0] text-ring shadow-sm"
                        : "text-gray-600 hover:text-ring hover:bg-[#fce8f0]/60"
                    }`}
                    style={{ fontSize: "14px" }}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Íconos derecha */}
            <div className="flex items-center gap-1">
              {/* Favoritos */}
              <button
                onClick={() => onNavigate("favoritos")}
                title="Favoritos"
                className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                  isActive("favoritos")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-secondary hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Heart className="w-5 h-5" />
              </button>

              {/* Carrito */}
              <button
                onClick={() => setIsCartOpen(true)}
                title="Carrito"
                className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                  isCartOpen
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-secondary hover:text-primary hover:bg-primary/5"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--luxury-pink)",
                      border: "2px solid white",
                      boxShadow: "0 0 6px var(--luxury-shadow)",
                    }}
                  />
                )}
              </button>

              {/* Mis Pedidos (Solo Logueado) */}
              {currentUser && (
                <button
                  onClick={() => onNavigate("mis-pedidos")}
                  title="Mis Pedidos"
                  className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive("mis-pedidos")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground-secondary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Package className="w-5 h-5" />
                </button>
              )}

              {/* Tema (Solo Logueado, Inline) - Preserved from original */}
              {currentUser && <div className="flex items-center px-1"></div>}

              {/* Acceso / Usuario */}
              {currentUser ? (
                <UserDropdown onNavigate={onNavigate} onLogout={onLogout} />
              ) : (
                <div className="flex items-center gap-3 ml-2 h-10">
                  <button
                    onClick={() => onNavigate("login")}
                    className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-primary/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer h-full whitespace-nowrap"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => onNavigate("register")}
                    className="px-4 sm:px-6 py-0 h-9 text-xs sm:text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-95 hover:brightness-110 hover:shadow-lg cursor-pointer whitespace-nowrap"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
                      boxShadow: `0 4px 12px ${COLORS.accent}40`,
                    }}
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        navLinks={navLinks}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        onNavigate={onNavigate}
      />
    </>
  );
}
