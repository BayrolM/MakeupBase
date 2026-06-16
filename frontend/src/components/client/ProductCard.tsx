import { Package, Heart } from "lucide-react";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  accentSoft: V("accent-soft"),
  bgSoft: V("bg-soft"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  white: "#ffffff",
  shadow: V("shadow"),
  shadowSm: V("shadow-sm"),
  shadowLg: V("shadow-lg"),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

interface ProductCardProps {
  producto: any;
  categoryName?: string;
  badge?: string;
  badgeColor?: string;
  onCardClick?: () => void;
  onAddToCart?: (e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isMaxStock?: boolean;
}

export function ProductCard({
  producto,
  categoryName,
  badge,
  badgeColor,
  onCardClick,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isMaxStock,
}: ProductCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="product-card-root"
      style={{
        background: C.white,
        borderRadius: "20px",
        overflow: "hidden",
        border: `1px solid ${C.accent}`,
        cursor: onCardClick ? "pointer" : "default",
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        position: "relative",
        boxShadow: `0 4px 20px ${C.shadow}`,
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-8px)";
        el.style.boxShadow = `0 25px 50px ${C.shadowSm}`;
        el.style.borderColor = C.accentDeep;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = `0 4px 20px ${C.shadow}`;
        el.style.borderColor = C.accent;
      }}
    >
      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: badgeColor || C.accentDeep,
            color: "white",
            fontSize: "10px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "20px",
            zIndex: 1,
            letterSpacing: "0.5px",
          }}
        >
          {badge}
        </div>
      )}

      {/* Stock badge */}
      {!badge &&
        producto.stock <= producto.stockMinimo &&
        producto.stock > 0 && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: C.accentDeep,
              color: "white",
              fontSize: "10px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "20px",
              zIndex: 1,
              letterSpacing: "0.5px",
            }}
          >
            ÚLTIMAS UNIDADES
          </div>
        )}

      {/* Product Image */}
      <div
        className="product-card-img"
        style={{
          width: "100%",
          background: C.bgSoft,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package
              style={{
                width: 56,
                height: 56,
                color: C.accent,
                opacity: 0.4,
              }}
            />
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.92)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 2,
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Heart
              style={{
                width: 16,
                height: 16,
                color: isFavorite ? C.accentDeep : C.textMuted,
                fill: isFavorite ? C.accentDeep : "none",
                transition: "all 0.2s",
              }}
            />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div
        className="product-card-info"
        style={{ padding: "1.1rem 1.25rem 1.25rem", flex: 1 }}
      >
        <div
          style={{
            fontSize: "10px",
            color: C.textMuted,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "4px",
            fontWeight: 700,
          }}
        >
          {categoryName || "BELLEZA"}
        </div>
        <h4
          className="product-card-title"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            color: C.textDark,
            marginBottom: "6px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {producto.nombre}
        </h4>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <span
            className="product-card-price"
            style={{
              fontWeight: 800,
              color: C.accentDeep,
            }}
          >
            {formatCurrency(producto.precioVenta)}
          </span>
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(e);
              }}
              className="product-card-cart-btn"
              style={{
                borderRadius: "50%",
                background: isMaxStock
                  ? "#e5e7eb"
                  : `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                color: isMaxStock ? "#9ca3af" : "white",
                border: "none",
                cursor: isMaxStock ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s",
                boxShadow: isMaxStock ? "none" : `0 4px 12px ${C.shadowLg}`,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isMaxStock) e.currentTarget.style.transform = "scale(1.15)";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
