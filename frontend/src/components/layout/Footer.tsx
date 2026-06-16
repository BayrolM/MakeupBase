import { Instagram, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a0a14" }} className="text-white">
      {/* Top accent gradient line */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, #c47b96 0%, #e092b2 40%, #a85d77 70%, #7b1347 100%)",
        }}
      />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          {/* Left Column Group: Brand + Legal */}
          <div className="flex flex-col gap-10">
            {/* Brand + Description */}
            <div className="space-y-4">
              <img
                src="/logo.png"
                alt="Glamour ML"
                className="h-16 w-auto object-contain"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(196,123,150,0.25))",
                }}
              />
              <p className="text-white/60 text-[13px] leading-relaxed italic max-w-[280px]">
                Elevando tu rutina de belleza con productos de alta gama y
                fórmulas exclusivas.
              </p>
            </div>

            {/* Información Legal */}
            <div>
              <h4
                className="font-semibold mb-5 tracking-wider"
                style={{ fontSize: "15px", color: "white" }}
              >
                Información Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                  >
                    Políticas de Envío
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                  >
                    Cambios y Devoluciones
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                  >
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                  >
                    Términos y Condiciones
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column Group: Contact + Social */}
          <div className="flex flex-col gap-10 items-start md:items-end">
            
            {/* Contacto */}
            <div>
              <h4
                className="font-semibold mb-5 tracking-wider text-left"
                style={{ fontSize: "15px", color: "white" }}
              >
                Contacto
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#c47b96] shrink-0" />
                  <span className="text-white/70 text-[13px]">
                    Calle 31C #89-35, Medellín
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#c47b96] shrink-0" />
                  <span className="text-white/70 text-[13px]">
                    WhatsApp: +57 321 525 7246
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#c47b96] shrink-0" />
                  <span className="text-white/70 text-[13px]">
                    hola@glamourml.com
                  </span>
                </li>
              </ul>
            </div>

            {/* Síguenos */}
            <div className="w-full md:w-auto">
              <h4
                className="font-semibold mb-5 tracking-wider text-left"
                style={{ fontSize: "15px", color: "white" }}
              >
                Síguenos
              </h4>
              <div className="flex gap-3 justify-start">
                <a
                  href="https://www.instagram.com/glamourml_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
                  style={{ backgroundColor: "rgba(196,123,150,0.2)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#c47b96")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(196,123,150,0.2)")
                  }
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@glamourml_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
                  style={{ backgroundColor: "rgba(196,123,150,0.2)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#c47b96")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(196,123,150,0.2)")
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar — centered */}
      <div
        style={{
          borderTop: "1px solid rgba(196,123,150,0.15)",
          backgroundColor: "#140810",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-center space-y-2">
          <p className="text-white/50 text-[11px] tracking-wider">
            © {new Date().getFullYear()} Glamour ML. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
