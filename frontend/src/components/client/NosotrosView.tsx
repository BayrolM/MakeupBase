import { ArrowLeft, Sparkles, Heart, Shield, Star } from "lucide-react";
import { Footer } from "../layout/Footer";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V("bg-soft"),
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  shadowSm: V("shadow-sm"),
  shadow: V("shadow"),
  white: "#ffffff",
};

export function NosotrosView({
  onNavigate,
}: {
  onNavigate?: (route: string) => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
      }}
    >
      {/* Back Button (Top Left Overlay) */}
      {onNavigate && (
        <button
          onClick={() => onNavigate("inicio")}
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.8)",
            background: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "8px 16px",
            borderRadius: "30px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            cursor: "pointer",
            fontWeight: 600,
            zIndex: 10,
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = C.white;
            e.currentTarget.style.background = "rgba(0,0,0,0.3)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.background = "rgba(0,0,0,0.15)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Volver al inicio
        </button>
      )}

      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: "100px 0 80px",
          position: "relative",
          overflow: "hidden",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "56px",
              fontWeight: 600,
              color: C.white,
              margin: "0 0 16px 0",
              lineHeight: 1.1,
            }}
          >
            Nuestra Esencia
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "18px",
              maxWidth: "650px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            En Glamour ML, concebimos el maquillaje no como un simple producto, 
            sino como el arte de revelar tu esencia más pura y empoderar tu presencia con absoluta sofisticación.
          </p>
        </div>

        {/* Decoración */}
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "-30%",
            fontSize: "200px",
            opacity: 0.05,
            transform: "rotate(15deg)",
            pointerEvents: "none",
          }}
        >
          ✿
        </div>
        <div
          style={{
            position: "absolute",
            left: "-5%",
            bottom: "-20%",
            fontSize: "150px",
            opacity: 0.05,
            transform: "rotate(-15deg)",
            pointerEvents: "none",
          }}
        >
          ✦
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "0 32px 80px 32px",
        }}
      >
        {/* Misión y Visión */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
            marginBottom: "64px",
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "40px",
              border: `1px solid ${C.accent}`,
              boxShadow: `0 8px 30px ${C.shadowSm}`,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Sparkles
                style={{ width: 24, height: 24, color: C.accentDeep }}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "16px",
              }}
            >
              Nuestra Misión
            </h3>
            <p
              style={{ color: C.textMuted, fontSize: "15px", lineHeight: 1.7 }}
            >
              Ofrecer acceso exclusivo a alta cosmética internacional que inspire una profunda confianza y eleve el ritual diario de belleza. Curamos meticulosamente cada pieza de nuestra colección para garantizar fórmulas magistrales y estándares inquebrantables de excelencia.
            </p>
          </div>

          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "40px",
              border: `1px solid ${C.accent}`,
              boxShadow: `0 8px 30px ${C.shadowSm}`,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Star style={{ width: 24, height: 24, color: C.accentDeep }} />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "16px",
              }}
            >
              Nuestra Visión
            </h3>
            <p
              style={{ color: C.textMuted, fontSize: "15px", lineHeight: 1.7 }}
            >
              Consolidarnos como la boutique referente en el mercado del lujo y cuidado personal a nivel nacional, siendo reconocidos por una curaduría impecable, innovación constante y una devoción absoluta hacia nuestra selecta comunidad de clientes.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "12px",
              color: C.accentDeep,
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            Nuestros Pilares
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "36px",
              fontWeight: 600,
              color: C.textDark,
              marginBottom: "40px",
            }}
          >
            Valores de Marca
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                icon: Heart,
                title: "Excelencia",
                desc: "Nuestra devoción por el detalle se refleja en cada experiencia y producto que entregamos.",
              },
              {
                icon: Shield,
                title: "Autenticidad",
                desc: "Garantizamos el origen, exclusividad y pureza de cada fórmula en nuestra boutique.",
              },
              {
                icon: Sparkles,
                title: "Vanguardia",
                desc: "Anticipamos las tendencias globales de la alta cosmética para evolucionar tu rutina.",
              },
            ].map((valor, idx) => (
              <div
                key={idx}
                style={{
                  background: C.bgSoft,
                  borderRadius: "20px",
                  padding: "32px 20px",
                  border: `1px solid ${C.accent}`,
                  transition: "transform 0.3s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                    boxShadow: `0 4px 12px ${C.shadowSm}`,
                  }}
                >
                  <valor.icon
                    style={{ width: 20, height: 20, color: C.accentDeep }}
                  />
                </div>
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.textDark,
                    marginBottom: "8px",
                  }}
                >
                  {valor.title}
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: C.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {valor.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
