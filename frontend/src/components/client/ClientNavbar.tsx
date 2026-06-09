import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "../../lib/store";
import {
  Heart,
  Package,
  User,
  LogOut,
  ChevronDown,
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Loader2,
  Menu,
  Instagram,
  Facebook,
  ChevronRight,
} from "lucide-react";
import { LogoutConfirmDialog } from "../layout/LogoutConfirmDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { productService } from "../../services/productService";
import { toast } from "sonner";

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
  const {
    currentUser,
    favoritos,
    carrito,
    productos,
    removeFromCarrito,
    updateCarritoQuantity,
  } = useStore();

  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {},
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stockIssues, setStockIssues] = useState<
    Record<string, { available: number; requested: number }>
  >({});
  const [isValidating, setIsValidating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalFavoritos = (favoritos as any[])?.length ?? 0;
  const cartItemCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // Lógica de Carrito
  const getLiveQuantity = (item: (typeof carrito)[number]) => {
    const draft = quantityInputs[item.productoId];
    if (draft && /^\d+$/.test(draft)) {
      return Math.min(
        productos.find((p) => p.id === item.productoId)?.stock ?? item.cantidad,
        parseInt(draft, 10),
      );
    }
    return item.cantidad;
  };

  const cartTotal = carrito.reduce((sum, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    const cantidad = getLiveQuantity(item);
    return sum + (producto ? producto.precioVenta * cantidad : 0);
  }, 0);

  const total = cartTotal;

  // Use a ref so validateStock doesn't re-create on every carrito change
  const carritoRef = useRef(carrito);
  carritoRef.current = carrito;

  const validateStock = useCallback(async () => {
    const currentCarrito = carritoRef.current;
    if (currentCarrito.length === 0) return;
    setIsValidating(true);
    const issues: Record<string, { available: number; requested: number }> = {};
    try {
      for (const item of currentCarrito) {
        try {
          const freshProduct = await productService.getById(
            parseInt(item.productoId, 10),
          );
          const availableStock = freshProduct.stock_actual;
          if (availableStock <= 0) {
            issues[item.productoId] = {
              available: 0,
              requested: item.cantidad,
            };
          } else if (item.cantidad > availableStock) {
            issues[item.productoId] = {
              available: availableStock,
              requested: item.cantidad,
            };
            updateCarritoQuantity(item.productoId, availableStock);
          }
        } catch {
          /* skip if fetch fails */
        }
      }
      setStockIssues(issues);
      if (Object.keys(issues).length > 0) {
        const outOfStock = Object.values(issues).filter(
          (i) => i.available === 0,
        ).length;
        if (outOfStock > 0)
          toast.warning(`${outOfStock} producto(s) sin stock disponible`);
      }
    } finally {
      setIsValidating(false);
    }
  }, [updateCarritoQuantity]);

  // Only validate when the cart OPENS, not on every quantity change
  useEffect(() => {
    if (isCartOpen && carritoRef.current.length > 0) validateStock();
    if (!isCartOpen) setStockIssues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartOpen]);

  const hasBlockingIssues = Object.values(stockIssues).some(
    (i) => i.available === 0,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
              {/* Carrito (Solo Logueado) */}

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

              {/* Tema (Solo Logueado, Inline) */}
              {currentUser && <div className="flex items-center px-1"></div>}

              {/* Acceso / Usuario */}
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-primary/5 transition-colors"
                  >
                    {currentUser?.foto_perfil ? (
                      <img
                        src={currentUser.foto_perfil}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">
                          {currentUser?.nombres?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <style>{`
                        @keyframes dropdownFade {
                          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                          to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                      `}</style>
                      <div
                        className="absolute right-0 top-full mt-3 w-64 rounded-2xl overflow-hidden z-50"
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #f0d5e0",
                          boxShadow: "0 20px 40px -10px rgba(196,123,150,0.25)",
                          animation: "dropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                          transformOrigin: "top right",
                        }}
                      >
                        {/* Header Profile Area */}
                        <div 
                          className="px-5 py-4 flex items-center gap-3"
                          style={{ 
                            background: "linear-gradient(to right, #fff8fb, #ffffff)",
                            borderBottom: "1px solid #f0d5e0" 
                          }}
                        >
                          {currentUser?.foto_perfil ? (
                            <img
                              src={currentUser.foto_perfil}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover shadow-sm"
                              style={{ border: "2px solid #ffffff" }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                              style={{ background: "#f0d5e0", border: "2px solid #ffffff" }}
                            >
                              <span style={{ color: "#c47b96", fontWeight: "bold" }}>
                                {currentUser?.nombres?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p 
                              className="text-sm font-bold truncate" 
                              style={{ color: "#1a1a1a" }}
                            >
                              {currentUser?.nombres} {currentUser?.apellidos}
                            </p>
                            <p 
                              className="text-xs truncate" 
                              style={{ color: "#666666" }}
                            >
                              {currentUser?.email}
                            </p>
                          </div>
                        </div>

                        {/* Menu Options */}
                        <div className="p-2 flex flex-col gap-1 bg-white">
                          <button
                            onClick={() => {
                              onNavigate("perfil");
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left font-medium group"
                            style={{ color: "#1a1a1a" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fff8fb";
                              e.currentTarget.style.color = "#c47b96";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#1a1a1a";
                            }}
                          >
                            <div className="p-1.5 rounded-lg transition-colors group-hover:bg-white group-hover:shadow-sm" style={{ color: "#666666" }}>
                              <User className="w-4 h-4 transition-colors" />
                            </div>
                            Mi Perfil
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowLogoutConfirm(true);
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left font-medium group"
                            style={{ color: "#1a1a1a" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fef2f2"; // red-50
                              e.currentTarget.style.color = "#dc2626"; // red-600
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#1a1a1a";
                            }}
                          >
                            <div className="p-1.5 rounded-lg transition-colors group-hover:bg-white group-hover:shadow-sm" style={{ color: "#666666" }}>
                              <LogOut className="w-4 h-4 transition-colors" />
                            </div>
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2 h-10">
                  <button
                    onClick={() => onNavigate("login")}
                    className="px-5 py-2 text-sm font-semibold text-primary/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer h-full"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => onNavigate("register")}
                    className="hidden sm:block px-6 py-0 h-9 text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-95 hover:brightness-110 hover:shadow-lg cursor-pointer"
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

      {/* Menú Móvil Lateral */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent 
          side="left" 
          className="w-[320px] p-0 flex flex-col" 
          style={{ 
            background: "var(--luxury-bg-soft)", 
            borderRight: "1px solid var(--luxury-accent-soft)" 
          }}
        >
          <SheetHeader 
            className="p-8 text-left" 
            style={{ 
              background: "var(--luxury-bg-header)", 
              borderBottom: "1px solid var(--luxury-accent-soft)" 
            }}
          >
            <div 
              style={{ 
                height: "3px", 
                background: "linear-gradient(90deg, var(--luxury-pink-soft), var(--luxury-pink))", 
                borderRadius: "4px", 
                marginBottom: "16px", 
                width: "40px" 
              }} 
            />
            <SheetTitle 
              className="font-serif text-2xl font-bold flex items-center gap-3" 
              style={{ color: "var(--luxury-text-dark)" }}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 shadow-sm border border-border">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              GLAMOUR ML
            </SheetTitle>
            <SheetDescription style={{ color: "var(--luxury-text-muted)" }}>
              Descubre tu belleza interior
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="flex flex-col px-4 gap-2">
              {navLinks.map(({ label, route }) => {
                const active = isActive(route);
                return (
                  <button
                    key={route}
                    onClick={() => {
                      onNavigate(route);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 text-left font-medium ${
                      active
                        ? "shadow-sm"
                        : "hover:bg-white hover:shadow-sm hover:-translate-y-0.5"
                    }`}
                    style={{ 
                      fontSize: "15px",
                      background: active ? "var(--luxury-accent-soft)" : "transparent",
                      color: active ? "var(--luxury-pink)" : "var(--luxury-text-dark)",
                      border: active ? "1px solid var(--luxury-accent)" : "1px solid transparent"
                    }}
                  >
                    {label}
                    {active ? (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--luxury-pink)" }} />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Menu Footer */}
          <div 
            className="p-8 mt-auto" 
            style={{ 
              borderTop: "1px dashed var(--luxury-accent-soft)", 
              background: "rgba(255,255,255,0.4)" 
            }}
          >
             <div className="flex items-center justify-center gap-4 mb-6">
                <button 
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:scale-110 transition-all duration-300"
                  style={{ border: "1px solid var(--luxury-accent-soft)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--luxury-pink)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                >
                  <Instagram className="w-5 h-5" />
                </button>
                <button 
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:scale-110 transition-all duration-300"
                  style={{ border: "1px solid var(--luxury-accent-soft)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--luxury-pink)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                >
                  <Facebook className="w-5 h-5" />
                </button>
             </div>
             <p className="text-center text-xs" style={{ color: "var(--luxury-text-muted)" }}>
               © 2024 Glamour ML. Todos los derechos reservados.
             </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Drawer del Carrito */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent
          className="p-0"
          style={{
            maxWidth: "440px",
            background: "var(--luxury-bg-soft)",
            borderLeft: "1px solid var(--luxury-accent-soft)",
          }}
        >
          <SheetDescription className="sr-only">
            Resumen de productos agregados a tu carrito de compras
          </SheetDescription>
          <div className="flex flex-col h-full">
            <SheetHeader
              className="p-6"
              style={{
                borderBottom: "1px solid var(--luxury-accent-soft)",
                background: "var(--luxury-bg-header)",
              }}
            >
              <div
                style={{
                  height: "3px",
                  background:
                    "linear-gradient(90deg, var(--luxury-pink-soft), var(--luxury-pink))",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              />
              <SheetTitle
                className="flex items-center gap-3 font-serif text-xl font-bold"
                style={{ color: "var(--luxury-text-dark)" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, var(--luxury-pink-soft), var(--luxury-pink))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px var(--luxury-shadow)",
                  }}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                Mi Carrito
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--luxury-text-muted)",
                    textTransform: "none",
                  }}
                >
                  ({cartItemCount}{" "}
                  {cartItemCount === 1 ? "producto" : "productos"})
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "var(--luxury-accent-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <ShoppingCart
                      className="w-10 h-10"
                      style={{ color: "var(--luxury-pink-soft)" }}
                    />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--luxury-text-dark)",
                    }}
                  >
                    Tu carrito está vacío
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--luxury-text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    Descubre nuestros productos en el catálogo
                  </p>
                  <button
                    onClick={() => {
                      onNavigate("catalogo");
                      setIsCartOpen(false);
                    }}
                    style={{
                      marginTop: "24px",
                      padding: "10px 32px",
                      borderRadius: "14px",
                      border: "1.5px solid var(--luxury-pink-soft)",
                      background: "transparent",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--luxury-pink)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--luxury-accent-soft)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Ir al catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => {
                    const producto = productos.find(
                      (p) => p.id === item.productoId,
                    );
                    if (!producto) return null;

                    const inputValue =
                      quantityInputs[item.productoId] ?? String(item.cantidad);

                    const hasStockIssue =
                      stockIssues[item.productoId]?.available === 0;

                    return (
                      <div
                        key={item.productoId}
                        className={`flex gap-4 p-4 rounded-xl transition-all ${
                          hasStockIssue ? "bg-red-50/50 border-red-200" : ""
                        }`}
                        style={{
                          border: hasStockIssue
                            ? undefined
                            : "1.5px solid var(--luxury-accent-soft)",
                          background: hasStockIssue ? undefined : "white",
                          boxShadow: hasStockIssue
                            ? undefined
                            : "0 2px 12px var(--luxury-shadow-xs)",
                        }}
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                          <img
                            src={
                              producto.imagenUrl ||
                              "https://via.placeholder.com/80"
                            }
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {producto.nombre}
                            </h4>
                            <button
                              onClick={() => {
                                removeFromCarrito(item.productoId);
                                setStockIssues((prev) => {
                                  const next = { ...prev };
                                  delete next[item.productoId];
                                  return next;
                                });
                              }}
                              className="text-foreground-secondary hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p
                            className="text-sm font-bold mt-1"
                            style={{ color: "var(--luxury-pink)" }}
                          >
                            {formatCurrency(producto.precioVenta)}
                          </p>

                          {stockIssues[item.productoId] && (
                            <div className="flex items-center gap-1.5 mt-2 text-amber-600">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-[11px] font-medium leading-tight">
                                {stockIssues[item.productoId].available === 0
                                  ? "Agotado — por favor retíralo"
                                  : `Quedan ${stockIssues[item.productoId].available} unidades`}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center mt-3">
                            <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-1">
                              <button
                                onClick={() => {
                                  const next = item.cantidad - 1;
                                  if (next >= 1) {
                                    updateCarritoQuantity(
                                      item.productoId,
                                      next,
                                    );
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: String(next),
                                    }));
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-foreground transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={producto.stock}
                                step={1}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="quantity-input text-xs font-bold w-20 text-center rounded-lg border border-border bg-white"
                                value={inputValue}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (/^\d*$/.test(raw)) {
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: raw,
                                    }));
                                  }
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value;
                                  const parsed = parseInt(raw, 10);

                                  if (Number.isNaN(parsed) || parsed < 1) {
                                    updateCarritoQuantity(item.productoId, 1);
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: "1",
                                    }));
                                    return;
                                  }

                                  if (parsed > producto.stock) {
                                    toast.error(
                                      `Sólo hay ${producto.stock} unidades disponibles de ${producto.nombre}`,
                                    );
                                    updateCarritoQuantity(
                                      item.productoId,
                                      producto.stock,
                                    );
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: String(producto.stock),
                                    }));
                                    return;
                                  }

                                  updateCarritoQuantity(
                                    item.productoId,
                                    parsed,
                                  );
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.productoId]: String(parsed),
                                  }));
                                }}
                              />
                              <button
                                onClick={() => {
                                  const next = item.cantidad + 1;
                                  if (next <= producto.stock) {
                                    updateCarritoQuantity(
                                      item.productoId,
                                      next,
                                    );
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: String(next),
                                    }));
                                  }
                                }}
                                disabled={
                                  item.cantidad >= producto.stock ||
                                  hasStockIssue
                                }
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-foreground transition-colors disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div
                className="p-6"
                style={{
                  borderTop: "1px solid var(--luxury-accent-soft)",
                  background: "var(--luxury-bg-header)",
                }}
              >
                <div className="space-y-3 mb-6">
                  <div
                    className="flex justify-between text-sm"
                    style={{ color: "var(--luxury-text-secondary)" }}
                  >
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div
                    className="flex justify-between text-lg font-bold pt-4"
                    style={{
                      borderTop: "1.5px dashed var(--luxury-accent-soft)",
                    }}
                  >
                    <span style={{ color: "var(--luxury-text-dark)" }}>
                      Total
                    </span>
                    <span style={{ color: "var(--luxury-pink)" }}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {isValidating && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-xs text-foreground-secondary">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Validando stock disponible...
                  </div>
                )}
                {/* ====MANEJO DE PAGO DE USUARIO NO AUTENTICADO DESDE EL CARRITO==== */}
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (currentUser) {
                      onNavigate("checkout");
                    } else {
                      onNavigate("login");
                    }
                  }}
                  disabled={
                    carrito.length === 0 || hasBlockingIssues || isValidating
                  }
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  style={{
                    background: hasBlockingIssues
                      ? "#cbd5e1"
                      : "linear-gradient(135deg, var(--luxury-pink-soft) 0%, var(--luxury-pink) 100%)",
                    boxShadow: hasBlockingIssues
                      ? "none"
                      : "0 10px 20px var(--luxury-shadow)",
                  }}
                >
                  {hasBlockingIssues ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      PROBLEMAS DE STOCK
                    </>
                  ) : (
                    "IR A PAGAR 🎀"
                  )}
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={onLogout}
      />
    </>
  );
}
