import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useStore } from "../../lib/store";
import type { Categoria, Marca, Producto } from "../../lib/store";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { marcaService } from "../../services/marcaService";
import { C } from "../../lib/theme";

// Componentes extraídos
import { HeroCarousel } from "./HeroCarousel";
import { PromoBanner } from "./PromoBanner";
import { CategoriesSection } from "./CategoriesSection";
import { FeaturedProducts } from "./FeaturedProducts";
import { BenefitsSection } from "./BenefitsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { Footer } from "../layout/Footer";

interface InicioViewProps {
  isPublic?: boolean;
  onNavigate?: (route: string, categoryId?: string) => void;
  onViewProduct?: (productId: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

type Section = "inicio" | "catalogo" | "nosotros" | "contacto";

export function InicioView({
  isPublic = false,
  onNavigate,
  onViewProduct,
}: InicioViewProps = {}) {
  const {
    productos,
    categorias,
    addToCarrito,
    carrito,
    setProductos,
    setCategorias,
    setMarcas,
    favoritos,
    toggleFavorito,
  } = useStore();
  
  const [activeSection, setActiveSection] = useState<Section>("inicio");
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Cargar datos si el store está vacío
  useEffect(() => {
    const loadDataIfNeeded = async () => {
      setIsLoadingData(true);
      try {
        const [catsRes, brandsRes, prodsRes] = await Promise.all([
          categoryService.getAll({ limit: 100 }),
          marcaService.getAll(),
          productService.getAll({ limit: 100 }),
        ]);

        const mappedCats: Categoria[] = catsRes.data.map((cat: any) => ({
          id: cat.id_categoria.toString(),
          nombre: cat.nombre,
          descripcion: cat.descripcion || "",
          estado: cat.estado ? "activo" : "inactivo",
        }));
        setCategorias(mappedCats);

        const mappedBrands: Marca[] = brandsRes.data.map((brand: any) => ({
          id: brand.id_marca.toString(),
          nombre: brand.nombre,
          descripcion: brand.descripcion || "",
          estado: brand.estado ? "activo" : "inactivo",
        }));
        setMarcas(mappedBrands);

        const mappedProds: Producto[] = prodsRes.data.map((prod: any) => ({
          id: prod.id_producto.toString(),
          nombre: prod.nombre,
          descripcion: prod.descripcion || "",
          categoriaId: prod.id_categoria.toString(),
          marca: prod.nombre_marca || "Genérica",
          precioCompra: Number(prod.costo_promedio) || 0,
          precioVenta: Number(prod.precio_venta) || 0,
          stock: prod.stock_actual || 0,
          stockMinimo: prod.stock_min || 0,
          stockMaximo: prod.stock_max || 100,
          stockFisico: prod.stock_fisico || 0,
          imagenUrl: prod.imagen_url || undefined,
          estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
          fechaCreacion: new Date().toISOString(),
        }));
        setProductos(mappedProds);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    // Solo cargar si no hay datos disponibles
    if (productos.length === 0 || categorias.length === 0) {
      loadDataIfNeeded();
    }
  }, [productos.length, categorias.length, setCategorias, setMarcas, setProductos]);

  const productosDestacados = productos
    .filter((p) => p.estado === "activo" && p.stock > 0)
    .slice(0, 8);

  const categoriasDestacadas = categorias.slice(0, 6);

  const handleAddToCart = (productoId: string, quantity = 1) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    const currentCartQty = carrito.find((item) => item.productoId === productoId)?.cantidad || 0;
    if (currentCartQty + quantity > producto.stock) {
      toast.error("Stock máximo alcanzado", {
        description: `No puedes agregar más unidades de este producto.`,
      });
      return;
    }
    addToCarrito(productoId, quantity);
    toast.success("Producto agregado", {
      description: `Se agregaron ${quantity} ${quantity === 1 ? "unidad" : "unidades"} al carrito`,
    });
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "inicio":
        return (
          <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.white }}>
            <HeroCarousel
              isPublic={isPublic}
              onNavigate={onNavigate}
              setActiveSection={setActiveSection}
            />

            <PromoBanner
              isPublic={isPublic}
              onNavigate={onNavigate}
              setActiveSection={setActiveSection}
            />

            <CategoriesSection
              categoriasDestacadas={categoriasDestacadas}
              productos={productos}
              onNavigate={onNavigate}
              setActiveSection={setActiveSection}
            />

            <FeaturedProducts
              productosDestacados={productosDestacados}
              categorias={categorias}
              carrito={carrito}
              favoritos={favoritos}
              handleAddToCart={handleAddToCart}
              toggleFavorito={toggleFavorito}
              onViewProduct={onViewProduct}
              onNavigate={onNavigate}
              setActiveSection={setActiveSection}
            />

            <BenefitsSection />
            <TestimonialsSection />
            <Footer />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {isLoadingData ? (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p style={{ color: C.textMuted }}>Cargando datos...</p>
          </div>
        </div>
      ) : (
        renderSectionContent()
      )}
    </div>
  );
}
