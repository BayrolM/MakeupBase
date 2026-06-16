import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "../layout/Footer";

/* ── Luxury CSS variable helpers ── */
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

export function ContactoView({
  onNavigate,
}: {
  onNavigate?: (route: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fields, setFields] = useState({
    nombre: "",
    asunto: "",
    mensaje: "",
  });

  const [errors, setErrors] = useState({
    nombre: "",
    asunto: "",
    mensaje: "",
  });

  const [touched, setTouched] = useState({
    nombre: false,
    asunto: false,
    mensaje: false,
  });

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "nombre") {
      if (!value.trim()) {
        error = "El nombre completo es requerido.";
      } else if (value.trim().length < 3) {
        error = "El nombre debe tener al menos 3 caracteres.";
      }
    } else if (name === "asunto") {
      if (!value.trim()) {
        error = "El asunto es requerido.";
      } else if (value.trim().length < 4) {
        error = "El asunto debe tener al menos 4 caracteres.";
      }
    } else if (name === "mensaje") {
      if (!value.trim()) {
        error = "El mensaje es requerido.";
      } else if (value.trim().length < 10) {
        error = "El mensaje debe tener al menos 10 caracteres.";
      }
    }
    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newTouched = { nombre: true, asunto: true, mensaje: true };
    setTouched(newTouched);

    const newErrors = {
      nombre: validateField("nombre", fields.nombre),
      asunto: validateField("asunto", fields.asunto),
      mensaje: validateField("mensaje", fields.mensaje),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) {
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    setIsSubmitting(true);

    const text = `Hola Glamour ML, me contacto desde la web.\n\n*Nombre:* ${fields.nombre}\n*Asunto:* ${fields.asunto}\n\n*Mensaje:*\n${fields.mensaje}`;
    const phoneNumber = "573215257246";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      toast.success("¡Redirigiendo a WhatsApp!", {
        description: "Se abrirá el chat para enviar tu mensaje.",
      });
      setIsSubmitting(false);
      
      setFields({ nombre: "", asunto: "", mensaje: "" });
      setErrors({ nombre: "", asunto: "", mensaje: "" });
      setTouched({ nombre: false, asunto: false, mensaje: false });
    }, 800);
  };

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
          padding: "80px 0",
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
            Atención Exclusiva
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "18px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Brindamos una experiencia de asesoría personalizada a la altura de tus expectativas. Nuestro equipo de expertos está a tu entera disposición.
          </p>
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
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}
          className="md:grid-cols-2"
        >
          {/* Formulario */}
          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "40px",
              border: `1px solid ${C.accent}`,
              boxShadow: `0 8px 30px ${C.shadowSm}`,
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "24px",
              }}
            >
              Envíanos un mensaje
            </h3>
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.textMuted,
                    marginBottom: "8px",
                  }}
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={fields.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej. María Pérez"
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    border: `1px solid ${touched.nombre && errors.nombre ? "#f43f5e" : C.accentDark}`,
                    padding: "0 16px",
                    outline: "none",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                />
                {touched.nombre && errors.nombre && (
                  <span style={{ color: "#f43f5e", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {errors.nombre}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.textMuted,
                    marginBottom: "8px",
                  }}
                >
                  Asunto
                </label>
                <input
                  type="text"
                  name="asunto"
                  value={fields.asunto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="¿En qué te podemos ayudar?"
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    border: `1px solid ${touched.asunto && errors.asunto ? "#f43f5e" : C.accentDark}`,
                    padding: "0 16px",
                    outline: "none",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                />
                {touched.asunto && errors.asunto && (
                  <span style={{ color: "#f43f5e", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {errors.asunto}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.textMuted,
                    marginBottom: "8px",
                  }}
                >
                  Mensaje
                </label>
                <textarea
                  name="mensaje"
                  value={fields.mensaje}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Escribe tu mensaje aquí..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    borderRadius: "12px",
                    border: `1px solid ${touched.mensaje && errors.mensaje ? "#f43f5e" : C.accentDark}`,
                    padding: "16px",
                    outline: "none",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    resize: "vertical",
                    transition: "border-color 0.2s ease",
                  }}
                />
                {touched.mensaje && errors.mensaje && (
                  <span style={{ color: "#f43f5e", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {errors.mensaje}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  background: isSubmitting
                    ? "#e5e7eb"
                    : `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                  color: isSubmitting ? "#9ca3af" : C.white,
                  border: "none",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: isSubmitting ? "none" : `0 8px 20px ${C.shadowSm}`,
                  marginTop: "8px",
                }}
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send style={{ width: 18, height: 18 }} /> Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info de contacto */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div
              style={{
                background: C.white,
                borderRadius: "24px",
                padding: "40px",
                border: `1px solid ${C.accent}`,
                boxShadow: `0 8px 30px ${C.shadowSm}`,
                height: "100%",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: C.textDark,
                  marginBottom: "32px",
                }}
              >
                Información Directa
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "32px",
                }}
              >
                <div style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: C.bgSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin
                      style={{ width: 22, height: 22, color: C.accentDeep }}
                    />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        marginBottom: "4px",
                      }}
                    >
                      Ubicación
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: C.textMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      Calle 31C #89-35
                      <br />
                      Medellín, Colombia
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: C.bgSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Phone
                      style={{ width: 22, height: 22, color: C.accentDeep }}
                    />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        marginBottom: "4px",
                      }}
                    >
                      Teléfono / WhatsApp
                    </h4>
                    <p style={{ fontSize: "14px", color: C.textMuted }}>
                      +57 321 525 7246
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: C.bgSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Mail
                      style={{ width: 22, height: 22, color: C.accentDeep }}
                    />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        marginBottom: "4px",
                      }}
                    >
                      Correo Electrónico
                    </h4>
                    <p style={{ fontSize: "14px", color: C.textMuted }}>
                      contacto@glamourml.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Redes Sociales mock */}
              <div
                style={{
                  marginTop: "48px",
                  paddingTop: "32px",
                  borderTop: `1px dashed ${C.accent}`,
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: C.textDark,
                    marginBottom: "16px",
                  }}
                >
                  Síguenos en redes sociales
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { name: "Instagram", url: "https://www.instagram.com/glamourml_/" },
                    { name: "TikTok", url: "https://www.tiktok.com/@glamourml_" }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: `1px solid ${C.accent}`,
                        fontSize: "13px",
                        color: C.textMuted,
                        cursor: "pointer",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accentDeep;
                        e.currentTarget.style.color = C.accentDeep;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.color = C.textMuted;
                      }}
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
