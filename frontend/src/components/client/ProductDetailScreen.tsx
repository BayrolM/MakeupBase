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
      className="min-h-screen pb-24"
      style={{
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div 
        className="h-[40vh] w-full absolute top-0 left-0 z-0"
        style={{
          background: `linear-gradient(to bottom, ${C.accentSoft}40, transparent)`,
        }}
      />
      
      <div className="max-w-[1200px] mx-auto px-6 pt-10 relative z-10">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-sm font-semibold text-gray-700 mb-10"
          style={{ cursor: "pointer" }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16 items-start">
          <div className="flex justify-center md:justify-end pr-0 md:pr-8">
            <div
              className="group relative w-full max-w-[400px] aspect-square rounded-[2rem] overflow-hidden bg-white shadow-xl"
              style={{
                boxShadow: `0 30px 60px -15px ${C.shadow}`,
              }}
            >
            {producto.imagenUrl ? (
              <img
                src={producto.imagenUrl}
                alt={producto.nombre}
                className="w-full h-full object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ background: "#ffffff" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="w-32 h-32 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-4xl">
                  💄
                </div>
              </div>
            )}
            
            {/* Stock Badge on Image */}
            {!stockAvailable && (
              <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                Agotado
              </div>
            )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-4 md:pt-8 lg:pt-10">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-max"
              style={{
                color: C.accentDeep,
                background: `${C.accent}20`,
                border: `1px solid ${C.accent}40`
              }}
            >
              {categoryName}
            </span>
            
            <h1
              className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                color: C.textDark,
              }}
            >
              {producto.nombre}
            </h1>
            
            <p
              className="text-lg leading-relaxed mb-10"
              style={{ color: C.textMuted }}
            >
              {producto.descripcion}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div
                className="bg-white p-6 rounded-3xl border transition-all hover:shadow-md"
                style={{ borderColor: C.accentSoft }}
              >
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Precio
                </span>
                <p
                  className="text-3xl font-extrabold"
                  style={{ color: C.accentDeep }}
                >
                  {formatCurrency(producto.precioVenta)}
                </p>
              </div>

              <div
                className="bg-white p-6 rounded-3xl border transition-all hover:shadow-md"
                style={{ borderColor: C.accentSoft }}
              >
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Disponibilidad
                </span>
                <p
                  className="text-lg font-bold mt-2"
                  style={{ color: stockAvailable ? "#16a34a" : "#dc2626" }}
                >
                  {stockAvailable
                    ? `${availableQuantity} unidades`
                    : "Agotado"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-end mb-8">
              {/* Quantity Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pl-2">
                  Cantidad
                </span>
                <div
                  className="flex items-center bg-gray-50 rounded-full p-1.5 border w-[130px]"
                  style={{ borderColor: C.accentSoft }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg text-gray-600 hover:text-black hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span
                    className="flex-1 text-center text-lg font-bold"
                    style={{ color: C.textDark }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(availableQuantity || 1, quantity + 1))
                    }
                    disabled={!stockAvailable || quantity >= availableQuantity}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg text-gray-600 hover:text-black hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!stockAvailable || availableQuantity === 0}
                className="flex-1 group relative overflow-hidden rounded-full border-none text-white px-8 py-0 h-[52px] font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] whitespace-nowrap"
                style={{
                  background: stockAvailable
                    ? `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`
                    : "#9ca3af",
                  boxShadow: stockAvailable ? `0 10px 25px -5px ${C.accent}60` : 'none',
                }}
              >
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Agregar al carrito</span>
                
                {/* Shine effect */}
                {stockAvailable && (
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                )}
              </button>
            </div>

            {/* Info Footer */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white">
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Envío exprés disponible en Medellín. Compra segura garantizada.
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Para productos exclusivos, consulta con atención al cliente.
              </p>
            </div>
            
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
