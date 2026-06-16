import { Tag } from "lucide-react";
import { C } from "../../lib/theme";
import type { Categoria, Producto } from "../../lib/store";

interface CategoriesSectionProps {
  categoriasDestacadas: Categoria[];
  productos: Producto[];
  onNavigate?: (route: string, categoryId?: string) => void;
  setActiveSection: (section: "inicio" | "catalogo" | "nosotros" | "contacto") => void;
}

export function CategoriesSection({
  categoriasDestacadas,
  productos,
  onNavigate,
  setActiveSection,
}: CategoriesSectionProps) {
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
          Explora por{" "}
          <span
            style={{
              color: C.accent,
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            categoría
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
          Ver todas →
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {categoriasDestacadas.map((cat) => (
          <div
            key={cat.id}
            onClick={() =>
              onNavigate
                ? onNavigate("catalogo", cat.id)
                : setActiveSection("catalogo")
            }
            className="category-card"
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "2rem 1rem",
              textAlign: "center",
              border: `1px solid ${C.accent}`,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="cat-icon-box"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                color: C.accentDeep,
              }}
            >
              <Tag className="w-6 h-6" />
            </div>
            <div
              className="cat-title"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: C.textDark,
                marginBottom: "4px",
              }}
            >
              {cat.nombre}
            </div>
            <div
              className="cat-subtitle"
              style={{ fontSize: "12px", color: C.textMuted }}
            >
              {
                productos.filter(
                  (p) =>
                    p.categoriaId === cat.id && p.estado === "activo",
                ).length
              }{" "}
              productos
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
