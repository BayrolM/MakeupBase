import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent } from "../ui/dialog";
import { ShoppingCart, X } from "lucide-react";
import { type Categoria, type Producto } from "../../lib/store";

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

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: Producto | null;
  categorias?: Categoria[];
  carrito: Array<{ productoId: string; cantidad: number }>;
  onAddToCart: (cantidad: number) => void;
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  producto,
  categorias = [],
  carrito,
  onAddToCart,
}: ProductDetailDialogProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setQuantity(1);
    }
  }, [open, producto]);

  if (!producto) {
    return null;
  }

  const categoryName =
    categorias.find((c) => c.id === producto.categoriaId)?.nombre || "Belleza";
  const currentCartQty =
    carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
  const availableQuantity = Math.max(0, producto.stock - currentCartQty);
  const stockAvailable = producto.stock > 0;

  const handleAddToCart = () => {
    if (!stockAvailable) {
      return;
    }
    onAddToCart(Math.min(quantity, availableQuantity));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl"
        style={{
          background: C.white,
          border: `1px solid ${C.accentSoft}`,
          borderRadius: "28px",
          padding: 0,
          overflow: "hidden",
          boxShadow: `0 30px 80px ${C.shadow}`,
        }}
      >
        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-0">
          <div
            style={{
              minHeight: "500px",
              background: C.bgSoft,
              position: "relative",
              overflow: "hidden",
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
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accentDeep,
                  }}
                >
                  💄
                </div>
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.6) 100%)",
                padding: "24px",
                color: "white",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                }}
              >
                {categoryName}
              </span>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.75rem, 2.4vw, 2.75rem)",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {producto.nombre}
              </h3>
            </div>
          </div>

          <div style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: C.accentDeep,
                  }}
                >
                  {categoryName}
                </span>
                <h4
                  style={{
                    margin: "12px 0 10px",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: C.textDark,
                  }}
                >
                  {producto.nombre}
                </h4>
                <p
                  style={{
                    color: C.textMuted,
                    fontSize: "14px",
                    lineHeight: 1.8,
                    maxWidth: "520px",
                  }}
                >
                  {producto.descripcion ||
                    "Descubre una experiencia premium de belleza con este producto diseñado para brindar resultados visibles y sensaciones exquisitas."}
                </p>
              </div>

              <DialogClose asChild>
                <button
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.92)",
                    border: `1px solid ${C.accentSoft}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  aria-label="Cerrar detalle"
                >
                  <X className="w-5 h-5" />
                </button>
              </DialogClose>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: C.bgSoft,
                  borderRadius: "18px",
                  padding: "20px",
                  border: `1px solid ${C.accentSoft}`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: C.textMuted,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 700,
                  }}
                >
                  Precio
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
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
                  background: C.bgSoft,
                  borderRadius: "18px",
                  padding: "20px",
                  border: `1px solid ${C.accentSoft}`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: C.textMuted,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 700,
                  }}
                >
                  Disponibilidad
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
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
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "16px",
                  border: `1px solid ${C.accentSoft}`,
                  overflow: "hidden",
                  minWidth: "180px",
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: "52px",
                    height: "52px",
                    background: C.bgSoft,
                    border: "none",
                    cursor: quantity <= 1 ? "not-allowed" : "pointer",
                    fontSize: "22px",
                    color: C.textDark,
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: "68px",
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
                    width: "52px",
                    height: "52px",
                    background: C.bgSoft,
                    border: "none",
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
                  padding: "16px 22px",
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: stockAvailable ? "pointer" : "not-allowed",
                  boxShadow: stockAvailable
                    ? "0 14px 36px rgba(120, 27, 70, 0.18)"
                    : "none",
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
            </div>

            <div
              style={{
                borderTop: `1px solid ${C.accentSoft}`,
                paddingTop: "20px",
                color: C.textMuted,
                display: "grid",
                gap: "10px",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.7 }}>
                Envío exprés disponible en Medellín. Compra segura y soporte
                personalizado para cualquier duda.
              </p>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.7 }}>
                Si busca un detalle más exclusivo, pregunta por nuestras ediciones
                limitadas y kits profesionales.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
