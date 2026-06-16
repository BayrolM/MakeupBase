import { C } from "../../lib/theme";

interface PromoBannerProps {
  isPublic?: boolean;
  onNavigate?: (route: string) => void;
  setActiveSection: (section: "inicio" | "catalogo" | "nosotros" | "contacto") => void;
}

export function PromoBanner({ isPublic, onNavigate, setActiveSection }: PromoBannerProps) {
  return (
    <div
      className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 md:gap-0"
      style={{
        margin: "3rem 1rem 2rem",
        background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accent} 60%, ${C.accentDark} 100%)`,
        borderRadius: "20px",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "160px",
          top: "-40px",
          fontSize: "180px",
          color: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        ✿
      </div>
      <div style={{ zIndex: 1 }}>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "32px",
            fontWeight: 300,
            color: "white",
            marginBottom: "8px",
          }}
        >
          El arte de la{" "}
          <em style={{ fontStyle: "italic" }}>belleza</em> pura
        </h3>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
          Fórmulas exclusivas diseñadas para realzar tu esencia natural.
        </p>
      </div>
      <button
        onClick={() =>
          onNavigate
            ? onNavigate("catalogo")
            : setActiveSection("catalogo")
        }
        style={{
          background: "white",
          color: C.accentDeep,
          border: "none",
          padding: "14px 36px",
          borderRadius: "32px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
          zIndex: 1,
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.05)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        Explorar colección
      </button>
    </div>
  );
}
