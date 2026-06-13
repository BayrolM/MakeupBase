import { useState, useEffect, useCallback } from "react";
import { useStore } from "../../lib/store";
import { ProductCard } from "./ProductCard";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { productService, type Product } from "../../services/productService";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  accentSoft: V("accent-soft"),
  bgSoft: V("bg-soft"),
  bgHeader: V("bg-header"),
  textDark: V("text-dark"),
  textSecondary: V("text-secondary"),
  textMuted: V("text-muted"),
  white: "#ffffff",
  deep: V("deep"),
  cream: V("cream"),
  shadow: V("shadow"),
  shadowXs: V("shadow-xs"),
  shadowSm: V("shadow-sm"),
  shadowLg: V("shadow-lg"),
};

const ITEMS_PER_PAGE = 20;

export function CatalogoView({
  initialCategory = "all",
  onClearCategory,
  onViewProduct,
}: {
  initialCategory?: string;
  onClearCategory?: () => void;
  onViewProduct?: (productId: string) => void;
} = {}) {
  const { addToCarrito, carrito, favoritos, toggleFavorito, categorias } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [showFilters, setShowFilters] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const fetchProducts = useCallback(async (page: number, search: string, category: string, price: number[]) => {
    setIsLoading(true);
    try {
      const filters: Record<string, any> = {
        page,
        limit: ITEMS_PER_PAGE,
        estado: "true",
      };
      if (search) filters.q = search;
      if (category && category !== "all") filters.categoria = category;
      if (price[0] > 0) filters.minPrice = price[0];
      if (price[1] < 150000) filters.maxPrice = price[1];

      const res = await productService.getAll(filters);
      setProducts(res.data || []);
      setTotalProducts(res.total || 0);
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, searchQuery, selectedCategory, priceRange);
  }, [currentPage, fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, searchQuery, selectedCategory, priceRange);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, priceRange]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 150000]);
    setCurrentPage(1);
    onClearCategory?.();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Hero Header */}
      <div
        style={{
          background: `linear-gradient(135deg, #2e1020 0%, #4a1a30 30%, #7b1347 65%, #a85d77 100%)`,
          padding: "3rem 2rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "5%",
            top: "-30px",
            fontSize: "200px",
            color: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✿
        </div>
        <div
          style={{
            position: "absolute",
            left: "10%",
            bottom: "-20px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,123,150,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-7xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              Nuestra colección
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "42px",
              fontWeight: 300,
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            Catálogo de <em style={{ fontWeight: 400 }}>Productos</em>
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "1.5rem",
              maxWidth: "420px",
            }}
          >
            Descubre nuestra selección de cosméticos premium con ingredientes exclusivos.
          </p>

          <div className="relative w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, categoría, marca..."
              className="pl-12 h-12 rounded-2xl w-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentPage(1);
                onClearCategory?.();
              }}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
                background: selectedCategory === "all" ? "rgba(255,255,255,0.2)" : "transparent",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Todos
            </button>
            {categorias.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: selectedCategory === cat.id ? "rgba(255,255,255,0.2)" : "transparent",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="shrink-0" style={{ width: "100%", maxWidth: "280px" }}>
              <div
                className="sticky top-8"
                style={{
                  background: C.bgHeader,
                  border: `1.5px solid ${C.accent}`,
                  borderLeft: `4px solid ${C.accentDeep}`,
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: `0 8px 30px ${C.shadowSm}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "12px",
                        background: C.bgSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.accentDeep,
                      }}
                    >
                      <Filter className="w-4 h-4" />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textDark }}>Filtros</h3>
                  </div>
                  <button
                    onClick={clearFilters}
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: C.accentDeep,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    Limpiar
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: C.textDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Categoría
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(v) => {
                        setSelectedCategory(v);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger
                        className="h-10 rounded-xl"
                        style={{
                          background: C.bgSoft,
                          border: `1px solid ${C.accentSoft}`,
                          color: C.textDark,
                          fontSize: "13px",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: C.white, border: `1px solid ${C.accentSoft}` }}>
                        <SelectItem value="all">Todas</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div style={{ height: "1px", background: C.accentSoft }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: C.textDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Rango de Precio
                    </label>
                    <div className="px-1">
                      <Slider
                        value={priceRange}
                        onValueChange={(v) => {
                          setPriceRange(v);
                          setCurrentPage(1);
                        }}
                        min={0}
                        max={150000}
                        step={5000}
                        className="w-full"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: C.textMuted,
                        fontWeight: 500,
                      }}
                    >
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <p style={{ fontSize: "14px", color: C.textSecondary, fontWeight: 500 }}>
                {totalProducts} {totalProducts === 1 ? "producto encontrado" : "productos encontrados"}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: C.accentDeep,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: C.accentDeep }} />
                <p style={{ fontSize: "14px", color: C.textSecondary }}>Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  background: C.bgSoft,
                  borderRadius: "24px",
                  border: `1px solid ${C.accentSoft}`,
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "1rem" }}>✿</div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "24px",
                    fontWeight: 400,
                    color: C.textDark,
                    marginBottom: "8px",
                  }}
                >
                  No se encontraron productos
                </h3>
                <p style={{ fontSize: "14px", color: C.textSecondary, marginBottom: "1.5rem" }}>
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                    color: C.white,
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "32px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {products.map((producto) => {
                    const categoria = categorias.find((c) => c.id === producto.categoriaId);
                    const currentCartQty = carrito.find((item) => item.productoId === producto.id)?.cantidad || 0;
                    const isMaxStock = currentCartQty >= producto.stock;

                    return (
                      <ProductCard
                        key={producto.id}
                        producto={producto}
                        categoryName={categoria?.nombre}
                        onCardClick={() => onViewProduct?.(producto.id)}
                        onAddToCart={() => {
                          if (isMaxStock) {
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
                        isFavorite={favoritos.includes(producto.id)}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          toggleFavorito(producto.id);
                          toast.success(
                            favoritos.includes(producto.id)
                              ? "Eliminado de favoritos"
                              : "Agregado a favoritos",
                            { description: producto.nombre }
                          );
                        }}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "2rem",
                    }}
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        border: `1px solid ${C.accentSoft}`,
                        background: C.white,
                        color: currentPage === 1 ? C.textMuted : C.accentDeep,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                        if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                          acc.push("ellipsis");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "ellipsis" ? (
                          <span key={`ellipsis-${idx}`} style={{ color: C.textMuted, padding: "0 4px" }}>...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              border: currentPage === item ? "none" : `1px solid ${C.accentSoft}`,
                              background: currentPage === item
                                ? `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`
                                : C.white,
                              color: currentPage === item ? C.white : C.textDark,
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                            }}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        border: `1px solid ${C.accentSoft}`,
                        background: C.white,
                        color: currentPage === totalPages ? C.textMuted : C.accentDeep,
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
