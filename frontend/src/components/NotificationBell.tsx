import React, { useEffect, useState } from "react";
import { Bell, ShoppingCart, Undo2, AlertTriangle } from "lucide-react";
import { useStore } from "../lib/store";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";

export function NotificationBell() {
  const { notificationSummary, fetchNotificationSummary, currentUser, userType } = useStore();
  const [lastTotal, setLastTotal] = useState(0);

  useEffect(() => {
    // Solo para admins
    if (!currentUser || userType !== "admin") return;

    // Carga inicial
    fetchNotificationSummary();

    // Polling cada 10 segundos para sensación "en vivo"
    const interval = setInterval(() => {
      fetchNotificationSummary();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, userType]);

  useEffect(() => {
    // Si el total aumenta, mostramos un toast
    if (notificationSummary.total > lastTotal) {
      toast("Nuevas alertas del sistema", {
        description: `Tienes ${notificationSummary.total} asuntos pendientes que requieren tu atención.`,
        icon: <Bell className="w-4 h-4 text-[#7b1347]" />,
      });
    }
    setLastTotal(notificationSummary.total);
  }, [notificationSummary.total]);

  // Si no es admin, no renderizar nada
  if (!currentUser || userType !== "admin") {
    return null;
  }

  const S = {
    floating: {
      position: "fixed" as const,
      top: "1.5rem",
      right: "1.5rem",
      zIndex: 100,
    },
    bellBtn: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--luxury-pink-soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 12px 40px rgba(123, 19, 71, 0.18)",
      color: "var(--luxury-pink)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    badge: {
      position: "absolute" as const,
      top: -2,
      right: -2,
      background: "var(--luxury-pink)",
      color: "white",
      border: "2px solid white",
      fontSize: "10px",
      padding: "2px 6px",
    }
  };

  return (
    <div style={S.floating}>
      <Popover>
        <PopoverTrigger asChild>
          <button 
            style={S.bellBtn} 
            className="hover:scale-110 active:scale-95 hover:shadow-luxury-pink/20 group"
          >
            <Bell 
              size={24} 
              className={notificationSummary.total > 0 ? "animate-bounce group-hover:animate-none" : ""} 
            />
            {notificationSummary.total > 0 && (
              <Badge style={S.badge} className="rounded-full h-5 min-w-[20px] flex items-center justify-center">
                {notificationSummary.total}
              </Badge>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl border-luxury-accent-soft shadow-2xl mr-4 mt-2 bg-white">
          <div className="bg-white p-4 border-b border-luxury-accent-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-luxury-pink flex items-center gap-2">
                <Bell size={18} />
                Notificaciones
              </h3>
              {notificationSummary.total > 0 && (
                <span className="text-[10px] bg-luxury-pink text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Urgente
                </span>
              )}
            </div>
            <p className="text-[11px] text-luxury-text-secondary mt-1">Actividad crítica de la plataforma</p>
          </div>
          
          <div className="p-2 bg-white">
            {notificationSummary.total === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-luxury-bg-soft rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-luxury-pink-soft opacity-50" />
                </div>
                <p className="text-sm font-medium text-luxury-text-secondary">Sin alertas pendientes</p>
                <p className="text-xs text-luxury-text-muted mt-1">¡Buen trabajo!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notificationSummary.pedidos > 0 && (
                  <div className="flex items-center gap-3 p-3 hover:bg-luxury-bg-soft rounded-xl cursor-pointer transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#7b1347] group-hover:scale-110 transition-transform">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Pedidos Nuevos</p>
                      <p className="text-[11px] text-luxury-text-secondary">Revisión requerida ({notificationSummary.pedidos})</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-luxury-pink"></div>
                  </div>
                )}

                {notificationSummary.stock > 0 && (
                  <div className="flex items-center gap-3 p-3 hover:bg-luxury-bg-soft rounded-xl cursor-pointer transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Stock Crítico</p>
                      <p className="text-[11px] text-luxury-text-secondary">{notificationSummary.stock} productos agotados</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  </div>
                )}

                {notificationSummary.devoluciones > 0 && (
                  <div className="flex items-center gap-3 p-3 hover:bg-luxury-bg-soft rounded-xl cursor-pointer transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                      <Undo2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Devoluciones</p>
                      <p className="text-[11px] text-luxury-text-secondary">{notificationSummary.devoluciones} pendientes</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-white border-t border-luxury-accent-soft flex justify-between items-center">
            <button 
              onClick={() => fetchNotificationSummary()}
              className="text-[10px] font-bold text-luxury-pink hover:text-luxury-pink-soft transition-colors uppercase tracking-widest"
            >
              Refrescar
            </button>
            <span className="text-[9px] text-luxury-text-muted">Glamour ML Admin</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
