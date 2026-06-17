import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { ProductCard } from "./ProductCard";
import { toast } from "sonner";
import { C } from "../../lib/theme";
import type { Producto, Categoria, CartItem } from "../../lib/store";

interface FeaturedProductsProps {
  productosDestacados: Producto[];
  categorias: Categoria[];
  carrito: CartItem[];
  favoritos: string[];
  handleAddToCart: (productoId: string) => void;
  toggleFavorito: (productoId: string) => void;
  onViewProduct?: (productId: string) => void;
  onNavigate?: (route: string) => void;
  setActiveSection: (section: "inicio" | "catalogo" | "nosotros" | "contacto") => void;
}

export function FeaturedProducts({
  productosDestacados,
  categorias,
  carrito,
  favoritos,
  currentUser,
  handleAddToCart,
  toggleFavorito,
  onViewProduct,
  onNavigate,
  setActiveSection,
}: FeaturedProductsProps) {
  return (
    <section style={{ padding: "0 1rem 3rem" }} className="sm:!px-8 sm:!pb-20">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h2
          className="text-2xl sm:text-4xl"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            color: C.textDark,
          }}
        >
          Nuestros{" "}
          <span
            style={{
              color: C.accent,
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            más amados
          </span>
        </h2>
        <button
          onClick={() =>
            onNavigate
              ? onNavigate("catalogo")
              : setActiveSection("catalogo")
          }
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: C.accentDeep,
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          Ver todos →
        </button>
      </div>
      {/* Desktop Grid */}
      <div
        className="products-desktop-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        {productosDestacados.map((producto, index) => {
          const categoria = categorias.find(
            (c) => c.id === producto.categoriaId,
          );
          const badges = [
            { label: "MÁS VENDIDO", color: C.accentDeep },
            { label: "NUEVO", color: C.accent },
          ];
          const currentCartQty = carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
          const isMaxStock = currentCartQty >= producto.stock;
          return (
            <ProductCard
              key={producto.id}
              producto={producto}
              categoryName={categoria?.nombre}
              badge={badges[index]?.label}
              badgeColor={badges[index]?.color}
              onCardClick={() => onViewProduct?.(producto.id)}
              onAddToCart={() => handleAddToCart(producto.id)}
              isFavorite={favoritos.includes(producto.id)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                toggleFavorito(producto.id);
                if (currentUser) {
                  toast.success(
                    favoritos.includes(producto.id)
                      ? "Eliminado de favoritos"
                      : "Agregado a favoritos",
                    {
                      description: producto.nombre,
                    }
                  );
                }
              }}
              isMaxStock={isMaxStock}
            />
          );
        })}
      </div>

      {/* Mobile Carousel */}
      <div className="products-mobile-carousel">
        <Carousel
          opts={{ align: "start", dragFree: true }}
          className="w-full"
        >
          <CarouselContent>
            {productosDestacados.map((producto, index) => {
              const categoria = categorias.find(
                (c) => c.id === producto.categoriaId,
              );
              const badges = [
                { label: "MÁS VENDIDO", color: C.accentDeep },
                { label: "NUEVO", color: C.accent },
              ];
              const currentCartQty = carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
              const isMaxStock = currentCartQty >= producto.stock;
              return (
                <CarouselItem key={producto.id} className="basis-[60%] sm:basis-[42%]" style={{ paddingLeft: "16px" }}>
                  <div style={{ padding: "16px 0" }}>
                    <ProductCard
                      producto={producto}
                      categoryName={categoria?.nombre}
                      badge={badges[index]?.label}
                      badgeColor={badges[index]?.color}
                      onCardClick={() => onViewProduct?.(producto.id)}
                      onAddToCart={() => handleAddToCart(producto.id)}
                      isFavorite={favoritos.includes(producto.id)}
                      onToggleFavorite={(e) => {
                        e.stopPropagation();
                        toggleFavorito(producto.id);
                        if (currentUser) {
                          toast.success(
                            favoritos.includes(producto.id)
                              ? "Eliminado de favoritos"
                              : "Agregado a favoritos",
                            {
                              description: producto.nombre,
                            }
                          );
                        }
                      }}
                      isMaxStock={isMaxStock}
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
