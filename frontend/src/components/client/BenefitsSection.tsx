import { Truck, Shield, Package, Heart } from "lucide-react";
import { C } from "../../lib/theme";

export function BenefitsSection() {
  const beneficios = [
    {
      icon: Truck,
      title: "Envío Rápido",
      description: "Entrega en 24-48 horas en Medellín",
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Protección total en tus pagos",
    },
    {
      icon: Package,
      title: "Devoluciones",
      description: "Hasta 30 días para devolver",
    },
    {
      icon: Heart,
      title: "Atención Personalizada",
      description: "Asesoría experta en belleza",
    },
  ];

  return (
    <section
      style={{
        background: C.bgHeader,
        borderTop: `1px solid ${C.accentSoft}`,
        borderBottom: `1px solid ${C.accentSoft}`,
        padding: "4rem 2rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {beneficios.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "22px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                color: C.accentDeep,
                boxShadow: `0 8px 20px ${C.shadowXs}`,
              }}
            >
              <b.icon className="w-7 h-7" />
            </div>
            <div>
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: C.textDark,
                  marginBottom: "6px",
                }}
              >
                {b.title}
              </h4>
              <p
                style={{
                  fontSize: "13px",
                  color: C.textSecondary,
                  lineHeight: 1.5,
                }}
              >
                {b.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
