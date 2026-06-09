import { useState } from "react";
import { useStore } from "../../lib/store";
import { ProductCard } from "./ProductCard";
import { Heart, Package } from "lucide-react";
import { toast } from "sonner";

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgHeader: V("bg-header"),
  bgSoft: V("bg-soft"),
  accent: V("pink-soft"),
  accentDeep: V("pink"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  shadowSm: V("shadow-sm"),
  shadow: V("shadow"),
  shadowLg: V("shadow-lg"),
  white: "#ffffff",
};

export function FavoritosView({
  onNavigate,
  onViewProduct,
}: {
  onNavigate?: (route: string) => void;
  onViewProduct?: (productId: string) => void;
} = {}) {
  const { favoritos, toggleFavorito, addToCarrito, productos, categorias, carrito } =
    useStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const favoritosProducts = productos.filter((p) => favoritos.includes(p.id));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── HERO HEADER LUXURY ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: "40px 0",
          position: "relative",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          className="px-4 sm:px-8"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                style={{ width: 24, height: 24, color: C.white, fill: C.white }}
              />
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                color: C.white,
                margin: 0,
              }}
            >
              Mis Favoritos
            </h1>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "16px",
              margin: "0 0 0 64px",
            }}
          >
            {favoritosProducts.length}{" "}
            {favoritosProducts.length === 1
              ? "producto guardado"
              : "productos guardados"}
          </p>
        </div>

        {/* Decoración */}
        <div
          style={{
            position: "absolute",
            right: "5%",
            top: "-20%",
            fontSize: "150px",
            opacity: 0.05,
            transform: "rotate(15deg)",
            pointerEvents: "none",
          }}
        >
          ✿
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div
        className="px-4 sm:px-8 pb-16 pt-6"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {favoritosProducts.length === 0 ? (
          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "64px 32px",
              textAlign: "center",
              boxShadow: `0 10px 40px ${C.shadowSm}`,
              border: `1px solid ${C.accent}`,
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
              }}
            >
              <Heart
                style={{
                  width: 32,
                  height: 32,
                  color: C.accentDeep,
                  opacity: 0.5,
                }}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "12px",
              }}
            >
              Tu lista de deseos está vacía
            </h3>
            <p
              style={{
                color: C.textMuted,
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              Explora nuestro catálogo y guarda los productos que más te gusten
              para tenerlos siempre a la mano.
            </p>
            <button
              onClick={() => onNavigate?.("catalogo")}
              style={{
                background: `linear-gradient(135deg, ${C.accentDeep} 0%, #a85d77 100%)`,
                color: C.white,
                border: "none",
                padding: "14px 32px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: `0 8px 24px ${C.shadowSm}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 30px ${C.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${C.shadowSm}`;
              }}
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {favoritosProducts.map((producto) => {
              const categoria = categorias.find(
                (c) => c.id === producto.categoriaId,
              );
              const currentCartQty = carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
              const isMaxStock = currentCartQty >= producto.stock;
              return (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  categoryName={categoria?.nombre}
                  isFavorite={true} // Por estar en esta vista, siempre es favorito
                  onToggleFavorite={() => {
                    toggleFavorito(producto.id);
                    toast.success("Favoritos actualizado", {
                      description: `Se eliminó ${producto.nombre} de tu lista.`,
                    });
                  }}
                  onCardClick={() => onViewProduct?.(producto.id)}
                  onAddToCart={() => {
                    const currentCartQty = carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
                    if (currentCartQty >= producto.stock) {
                      toast.error("Stock máximo alcanzado", {
                        description: `No puedes agregar más unidades de ${producto.nombre}.`,
                      });
                      return;
                    }
                    addToCarrito(producto.id, 1);
                    toast.success("Producto agregado", {
                      description: `${producto.nombre} se agregó al carrito`,
                    });
                  }}
                  isMaxStock={isMaxStock}
                />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
