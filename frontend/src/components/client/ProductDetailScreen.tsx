import { useMemo, useState } from "react";
import { useStore, type Categoria, type Producto } from "../../lib/store";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  accent: V("pink-soft"),
  accentDeep: V("pink"),
  accentSoft: V("accent-soft"),
  bgSoft: V("bg-soft"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  white: "#ffffff",
  shadow: V("shadow"),
  shadowLg: V("shadow-lg"),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

interface ProductDetailScreenProps {
  productId: string | null;
  onBack: () => void;
}

export function ProductDetailScreen({ productId, onBack }: ProductDetailScreenProps) {
  const { productos, categorias, carrito, addToCarrito } = useStore();
  const [quantity, setQuantity] = useState(1);

  const producto = useMemo(
    () => productos.find((p) => p.id === productId) || null,
    [productos, productId],
  );

  if (!productId || !producto) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bgSoft,
          fontFamily: "'DM Sans', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            width: "100%",
            background: C.white,
            borderRadius: "24px",
            padding: "3rem",
            boxShadow: `0 30px 60px ${C.shadow}`,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: C.textDark, fontSize: "18px" }}>
            Producto no encontrado.
          </p>
          <button
            onClick={onBack}
            style={{
              marginTop: "24px",
              color: C.accentDeep,
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "12px 20px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const categoryName =
    categorias.find((c) => c.id === producto.categoriaId)?.nombre || "Belleza";
  const currentCartQty =
    carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
  const availableQuantity = Math.max(0, producto.stock - currentCartQty);
  const stockAvailable = producto.stock > 0;

  const handleAddToCart = () => {
    if (!stockAvailable || availableQuantity === 0) return;
    addToCarrito(producto.id, Math.min(quantity, availableQuantity));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${C.accentSoft}`,
            color: C.textDark,
            borderRadius: "16px",
            padding: "12px 18px",
            cursor: "pointer",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "2rem",
          }}
        >
          <div
            style={{
              borderRadius: "28px",
              overflow: "hidden",
              background: C.white,
              boxShadow: `0 30px 60px ${C.shadow}`,
            }}
          >
            {producto.imagenUrl ? (
              <img
                src={producto.imagenUrl}
                alt={producto.nombre}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  minHeight: "520px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: C.bgSoft,
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accentDeep,
                    fontSize: "3rem",
                  }}
                >
                  💄
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: C.accentDeep,
                }}
              >
                {categoryName}
              </span>
              <h1
                style={{
                  margin: "1rem 0 0.75rem",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 3vw, 3rem)",
                  fontWeight: 700,
                  color: C.textDark,
                }}
              >
                {producto.nombre}
              </h1>
              <p
                style={{
                  color: C.textMuted,
                  fontSize: "15px",
                  lineHeight: 1.75,
                  marginBottom: "1.5rem",
                }}
              >
                {producto.descripcion}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  background: C.white,
                  borderRadius: "20px",
                  border: `1px solid ${C.accentSoft}`,
                  padding: "1.5rem",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: C.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Precio
                </span>
                <p
                  style={{
                    margin: "0.75rem 0 0",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: C.accentDeep,
                  }}
                >
                  {formatCurrency(producto.precioVenta)}
                </p>
              </div>

              <div
                style={{
                  background: C.white,
                  borderRadius: "20px",
                  border: `1px solid ${C.accentSoft}`,
                  padding: "1.5rem",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: C.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Disponibilidad
                </span>
                <p
                  style={{
                    margin: "0.75rem 0 0",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: stockAvailable ? "#16a34a" : "#dc2626",
                  }}
                >
                  {stockAvailable
                    ? `${availableQuantity} unidades disponibles`
                    : "Agotado"}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "18px",
                  border: `1px solid ${C.accentSoft}`,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: "56px",
                    height: "56px",
                    border: "none",
                    background: C.bgSoft,
                    cursor: quantity <= 1 ? "not-allowed" : "pointer",
                    fontSize: "22px",
                    color: C.textDark,
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: "72px",
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: C.textDark,
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(availableQuantity || 1, quantity + 1))
                  }
                  disabled={!stockAvailable || quantity >= availableQuantity}
                  style={{
                    width: "56px",
                    height: "56px",
                    border: "none",
                    background: C.bgSoft,
                    cursor:
                      !stockAvailable || quantity >= availableQuantity
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "22px",
                    color: C.textDark,
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!stockAvailable || availableQuantity === 0}
                style={{
                  flex: 1,
                  minWidth: "220px",
                  borderRadius: "18px",
                  border: "none",
                  background: stockAvailable
                    ? `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`
                    : "#e5e7eb",
                  color: stockAvailable ? C.white : C.textMuted,
                  padding: "16px 20px",
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: stockAvailable ? "pointer" : "not-allowed",
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: C.textMuted,
                lineHeight: 1.75,
              }}
            >
              <p style={{ margin: 0, fontSize: "13px" }}>
                Envío exprés disponible en Medellín. Compra segura y apoyo
                personalizado disponible.
              </p>
              <p style={{ margin: "0.85rem 0 0", fontSize: "13px" }}>
                Para productos exclusivos y kits especiales, consulta con
                nuestro equipo de atención.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
