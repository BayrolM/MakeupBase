import { useEffect, useState } from "react";
import { Bell, ShoppingCart, Undo2, AlertTriangle, RefreshCw } from "lucide-react";
import { useStore } from "../../lib/store";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface NotificationBellProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

export function NotificationBell({ currentRoute, onNavigate }: NotificationBellProps) {
  const { notificationSummary, fetchNotificationSummary, currentUser, userType } = useStore();
  const [lastTotal, setLastTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState({ pedidos: 0, stock: 0, devoluciones: 0 });

  useEffect(() => {
    if (!currentUser || userType !== "admin") return;
    const hasAccess = currentUser.id_rol === 1 || currentUser.permisos?.includes("ver_productos");
    if (!hasAccess) return;

    fetchNotificationSummary();
    const interval = setInterval(() => {
      fetchNotificationSummary();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, userType]);

  useEffect(() => {
    if (notificationSummary.total > lastTotal) {
      toast("Nuevas alertas del sistema", {
        description: `Tienes ${notificationSummary.total} asuntos pendientes que requieren tu atención.`,
        icon: <Bell className="w-4 h-4 text-[#7b1347]" />,
      });
    }
    setLastTotal(notificationSummary.total);
  }, [notificationSummary.total]);

  useEffect(() => {
    setDismissed(prev => {
      let updated = false;
      const next = { ...prev };

      // Pedidos
      if (currentRoute === "pedidos" || notificationSummary.pedidos < prev.pedidos) {
        if (next.pedidos !== notificationSummary.pedidos) {
          next.pedidos = notificationSummary.pedidos;
          updated = true;
        }
      }
      
      // Stock
      if (currentRoute === "productos" || notificationSummary.stock < prev.stock) {
        if (next.stock !== notificationSummary.stock) {
          next.stock = notificationSummary.stock;
          updated = true;
        }
      }
      
      // Devoluciones
      if (currentRoute === "devoluciones" || notificationSummary.devoluciones < prev.devoluciones) {
        if (next.devoluciones !== notificationSummary.devoluciones) {
          next.devoluciones = notificationSummary.devoluciones;
          updated = true;
        }
      }

      return updated ? next : prev;
    });
  }, [currentRoute, notificationSummary]);

  const activePedidos = Math.max(0, notificationSummary.pedidos - dismissed.pedidos);
  const activeStock = Math.max(0, notificationSummary.stock - dismissed.stock);
  const activeDevoluciones = Math.max(0, notificationSummary.devoluciones - dismissed.devoluciones);
  const activeTotal = activePedidos + activeStock + activeDevoluciones;

  const hasAccess = currentUser && (currentUser.id_rol === 1 || currentUser.permisos?.includes("ver_productos"));
  if (!currentUser || userType !== "admin" || !hasAccess) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotificationSummary();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 100,
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            style={{
              position: "relative",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "white",
              border: "1px solid rgba(123,19,71,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(123,19,71,0.16), 0 2px 8px rgba(0,0,0,0.06)",
              color: "#7b1347",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
            className="hover:scale-110 active:scale-95 group"
          >
            <Bell
              size={22}
              strokeWidth={1.8}
              className={activeTotal > 0 ? "animate-bounce group-hover:animate-none" : ""}
            />
            {activeTotal > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #7b1347, #a85d77)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                  paddingInline: 4,
                  boxShadow: "0 2px 6px rgba(123,19,71,0.4)",
                  lineHeight: 1,
                }}
              >
                {activeTotal}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 overflow-hidden bg-white"
          sideOffset={10}
          style={{
            width: 420,
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 24px 48px -12px rgba(123,19,71,0.18), 0 8px 16px -4px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #fdf2f6 0%, #fff8fb 60%, white 100%)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              padding: "20px 22px 16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative glow */}
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(196,123,150,0.12)",
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                  Notificaciones
                </h3>
                <p style={{ fontSize: 11.5, color: "#999", marginTop: 3, fontWeight: 500 }}>
                  Actividad en tiempo real
                </p>
              </div>
              {activeTotal > 0 && (
                <span
                  style={{
                    background: "linear-gradient(135deg, #7b1347, #a85d77)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 20,
                    letterSpacing: "0.04em",
                    boxShadow: "0 4px 12px rgba(123,19,71,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeTotal} nueva{activeTotal > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{ background: "white", maxHeight: "55vh", overflowY: "auto" }} className="sidebar-scroll">
            {activeTotal === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06)",
                  }}
                >
                  <Bell size={24} color="#ccc" strokeWidth={1.4} />
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#555", margin: 0 }}>Sin alertas pendientes</p>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Todo está bajo control.</p>
              </div>
            ) : (
              <div>
                {activePedidos > 0 && (
                  <div
                    className="group"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate("pedidos");
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderBottom: "1px solid #f5f5f5",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fdf9fb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: "#7b1347",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "#fef2f8",
                        border: "1px solid rgba(123,19,71,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#7b1347",
                        flexShrink: 0,
                      }}
                    >
                      <ShoppingCart size={20} strokeWidth={1.6} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Nuevos Pedidos</p>
                      <p style={{ fontSize: 11.5, color: "#888", marginTop: 2 }}>Revisión requerida — {activePedidos} pendiente{activePedidos > 1 ? "s" : ""}</p>
                    </div>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#7b1347",
                        boxShadow: "0 0 8px rgba(123,19,71,0.5)",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                )}

                {activeStock > 0 && (
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate("productos");
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderBottom: "1px solid #f5f5f5",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fffaf7")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: "#f97316",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "#fff7ed",
                        border: "1px solid rgba(249,115,22,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ea6c00",
                        flexShrink: 0,
                      }}
                    >
                      <AlertTriangle size={20} strokeWidth={1.6} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Stock Crítico</p>
                      <p style={{ fontSize: 11.5, color: "#888", marginTop: 2 }}>Reabastecer — {activeStock} producto{activeStock > 1 ? "s" : ""}</p>
                    </div>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#f97316",
                        boxShadow: "0 0 8px rgba(249,115,22,0.5)",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                )}

                {activeDevoluciones > 0 && (
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate("devoluciones");
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#faf8fc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: "#8b5cf6",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "#f5f3ff",
                        border: "1px solid rgba(139,92,246,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#7c3aed",
                        flexShrink: 0,
                      }}
                    >
                      <Undo2 size={20} strokeWidth={1.6} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Devoluciones</p>
                      <p style={{ fontSize: 11.5, color: "#888", marginTop: 2 }}>Acción requerida — {activeDevoluciones} solicitud{activeDevoluciones > 1 ? "es" : ""}</p>
                    </div>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#8b5cf6",
                        boxShadow: "0 0 8px rgba(139,92,246,0.5)",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: "#fafafa",
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <button
              onClick={handleRefresh}
              title="Refrescar notificaciones"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(123,19,71,0.15)",
                background: "white",
                color: "#7b1347",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#fef2f8";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(123,19,71,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "white";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(123,19,71,0.15)";
              }}
            >
              <RefreshCw size={14} strokeWidth={2} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <span style={{ fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Glamour ML Admin
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
