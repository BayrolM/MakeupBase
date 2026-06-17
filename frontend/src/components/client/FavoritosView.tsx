import { useState, useMemo, useEffect } from "react";
import { useStore } from "../../lib/store";
import { ProductCard } from "./ProductCard";
import { Heart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "../layout/Footer";

import { C } from "../../lib/theme";

export function FavoritosView({
  onNavigate,
  onViewProduct,
}: {
  onNavigate?: (route: string) => void;
  onViewProduct?: (productId: string) => void;
} = {}) {
  const { currentUser, favoritos, toggleFavorito, addToCarrito, productos, categorias, carrito } =
    useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Filtrado de favoritos
  const filteredFavorites = useMemo(() => {
    let list = productos.filter((p) => favoritos.includes(p.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || (p.descripcion && p.descripcion.toLowerCase().includes(q)));
    }
    return list;
  }, [productos, favoritos, searchQuery]);

  // Resetear paginación al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredFavorites.length / ITEMS_PER_PAGE) || 1;
  const paginatedFavorites = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFavorites.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFavorites, currentPage]);

  const hasAnyFavorites = favoritos.length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
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
            {favoritos.length} {favoritos.length === 1 ? "producto guardado" : "productos guardados"}
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
        className="px-4 sm:px-8 pt-6 flex-1"
        style={{
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          paddingBottom: "160px", // Forced explicit spacing
        }}
      >
        {!hasAnyFavorites ? (
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
          <>
            {/* Barra de Búsqueda */}
            <div className="mb-12 relative w-full">
              <Search 
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  width: "20px",
                  height: "20px",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Buscar en mis favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: "16px",
                  border: `1px solid ${C.accentSoft}`,
                  background: C.white,
                  fontSize: "15px",
                  color: C.textDark,
                  outline: "none",
                  boxShadow: `0 4px 15px ${C.shadowSm}`,
                  transition: "border-color 0.3s, box-shadow 0.3s"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.accentDeep;
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(196,123,150,0.2)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.accentSoft;
                  e.currentTarget.style.boxShadow = `0 4px 15px ${C.shadowSm}`;
                }}
              />
            </div>

            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: C.textMuted, fontSize: "16px" }}>
                  No se encontraron productos que coincidan con "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-sm underline"
                  style={{ color: C.accentDeep }}
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <>
                <div
                  className="grid gap-4 sm:gap-6"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  }}
                >
                  {paginatedFavorites.map((producto) => {
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
                        isFavorite={true}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          toggleFavorito(producto.id);
                          if (currentUser) {
                            toast.success("Favoritos actualizado", {
                              description: `Se eliminó ${producto.nombre} de tu lista.`,
                            });
                          }
                        }}
                        onCardClick={() => onViewProduct?.(producto.id)}
                        onAddToCart={(e) => {
                          e.stopPropagation();
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

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl transition-all disabled:opacity-50"
                      style={{
                        background: currentPage === 1 ? C.bgSoft : C.white,
                        border: `1px solid ${C.accentSoft}`,
                        color: C.textDark,
                        boxShadow: `0 2px 8px ${C.shadowSm}`,
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span style={{ color: C.textMuted, fontSize: "14px", fontWeight: 500 }}>
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl transition-all disabled:opacity-50"
                      style={{
                        background: currentPage === totalPages ? C.bgSoft : C.white,
                        border: `1px solid ${C.accentSoft}`,
                        color: C.textDark,
                        boxShadow: `0 2px 8px ${C.shadowSm}`,
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
