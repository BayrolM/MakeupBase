import { C } from "../../lib/theme";

export function TestimonialsSection() {
  return (
    <section style={{ padding: "5rem 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "42px",
            fontWeight: 300,
            color: C.textDark,
          }}
        >
          Lo que dicen nuestras{" "}
          <span
            style={{
              color: C.accent,
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            clientas
          </span>
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {[
          {
            initials: "MP",
            name: "María Paula",
            color: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
            text: '"Los productos son increíbles. El nivel de atención y la calidad superaron mis expectativas. En 3 semanas noté diferencia real en mi piel."',
          },
          {
            initials: "VS",
            name: "Valentina S.",
            color: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
            text: '"Llevo 2 años comprando aquí. El envío es rapidísimo y el empaque es toda una experiencia de lujo. Mi marca favorita sin duda."',
          },
          {
            initials: "LG",
            name: "Laura G.",
            color: `linear-gradient(135deg, ${C.accentDeep}, ${C.accentDark})`,
            text: '"Asesoría experta que realmente entiende lo que tu piel necesita. Productos originales y de altísima calidad. ¡Totalmente recomendado!"',
          },
        ].map((t) => (
          <div
            key={t.name}
            style={{
              background: "white",
              border: `1px solid ${C.accent}`,
              borderRadius: "24px",
              padding: "2rem",
              boxShadow: "0 5px 15px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "1.2rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: t.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {t.initials}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: C.textDark,
                  }}
                >
                  {t.name}
                </div>
                <div style={{ color: "#f59e0b", fontSize: "12px" }}>
                  ★★★★★
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: C.textSecondary,
                lineHeight: 1.7,
                fontStyle: "italic",
              }}
            >
              {t.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
