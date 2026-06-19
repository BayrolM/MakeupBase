import { useState } from "react";
import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

// Constantes de estilos reutilizables
const COLORS = {
  bg: "#1a0a14",
  bgBottom: "#140810",
  gradient: "linear-gradient(90deg, #c47b96 0%, #e092b2 40%, #a85d77 70%, #7b1347 100%)",
  accentBorder: "rgba(196,123,150,0.15)",
};

const SECTION_TITLE = "font-semibold mb-5 tracking-wider text-[15px] text-white";
const TEXT_MUTED = "text-white/70 hover:text-[#c47b96] transition-colors text-[13px]";
const TEXT_SMALL = "text-white/60 text-[13px] leading-relaxed italic";

// Componente: Línea de gradiente superior
function GradientLine() {
  return <div style={{ height: "2px", background: COLORS.gradient }} />;
}

// Componente: Icono de contacto reutilizable
interface ContactItemProps {
  icon: React.ElementType;
  text: string;
}
function ContactItem({ icon: Icon, text }: ContactItemProps) {
  return (
    <li className="flex items-center gap-2.5 pt-2 lg:pt-6">
      <Icon className="w-4 h-4 text-[#c47b96] shrink-0" />
      <span className="text-white/70 text-[13px]">{text}</span>
    </li>
  );
}

// Componente: Botón social reutilizable
interface SocialButtonProps {
  href: string;
  children: React.ReactNode;
  label: string;
}
function SocialButton({ href, children, label }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
      style={{ backgroundColor: "rgba(196,123,150,0.2)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c47b96")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(196,123,150,0.2)")
      }
    >
      {children}
    </a>
  );
}

// Componente: Encabezado de sección
interface SectionTitleProps {
  children: React.ReactNode;
}
function SectionTitle({ children }: SectionTitleProps) {
  return <h4 className={SECTION_TITLE}>{children}</h4>;
}

// Componente: Sección del footer
interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}
function FooterSection({ title, children, align = "start" }: FooterSectionProps) {
  return (
    <div className="pt-15 lg:pt-6">
      <SectionTitle>{title}</SectionTitle>
      <div className={`text-${align}`}>{children}</div>
    </div>
  );
}

// Componente: Branding izquierdo
function BrandSection() {
  return (
    <div className="flex flex-col gap-5">
      <img
        src="/logo.png"
        alt="Glamour ML"
        className="h-14 w-auto object-contain"
        style={{ filter: "drop-shadow(0 2px 8px rgba(196,123,150,0.25))", maxWidth: "140px" }}
      />
      <p className={`${TEXT_SMALL} max-w-[220px]`}>
        Elevando tu rutina de belleza con productos de alta gama y fórmulas exclusivas.
      </p>
    </div>
  );
}

// Componente: Información legal
function LegalSection() {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const legalLinks = [
    { id: "envios", label: "Políticas de Envío" },
    { id: "devoluciones", label: "Cambios y Devoluciones" },
    { id: "terminos", label: "Términos y Condiciones" },
  ];

  return (
    <FooterSection title="Información Legal">
      <ul className="space-y-3 pt-2 lg:pt-6">
        {legalLinks.map((item, idx) => (
          <li key={idx}>
            <button
              onClick={() => setOpenModal(item.id)}
              className={TEXT_MUTED}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Modales */}
      <Dialog open={openModal === "envios"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center text-white font-bold text-xl shrink-0 luxury-icon-gradient"
                style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)' }}
              >
                P
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Políticas de Envío
                </DialogTitle>
              </div>
            </div>
          </div>
          <div className="px-4 md:px-6 py-5 flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Todos nuestros envíos se realizan a través de empresas de mensajería de terceros especializadas en logística.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Una vez despachado el producto desde nuestras instalaciones, te proporcionaremos un número de guía oficial para que puedas rastrear tu paquete en tiempo real a través de la plataforma del transportista.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Los tiempos de entrega pueden variar dependiendo de la ciudad de destino y las políticas propias de la empresa transportadora. No nos hacemos responsables por retrasos ocasionados por factores externos a nuestra operación.
              </p>
            </div>
          </div>
          <div className="px-4 md:px-6 pb-6 pt-2">
            <button
              onClick={() => setOpenModal(null)}
              className="w-full h-11 rounded-xl text-white font-bold text-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)' }}
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "devoluciones"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center text-white font-bold text-xl shrink-0 luxury-icon-gradient"
                style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)' }}
              >
                C
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Cambios y Devoluciones
                </DialogTitle>
              </div>
            </div>
          </div>
          <div className="px-4 md:px-6 py-5 flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                En Glamour ML, nos esforzamos por brindarte productos de la mejor calidad. Sin embargo, el producto solo podrá ser cambiado bajo las siguientes condiciones:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 leading-relaxed mb-3">
                <li>Si se muestra evidencia clara de que el producto llegó dañado o defectuoso.</li>
                <li>Si llegó un producto incorrecto (diferente al que aparece en tu orden de compra y comprobante).</li>
              </ul>
              <p className="text-sm text-gray-700 leading-relaxed">
                Para iniciar un proceso de cambio, es indispensable que nos contactes en un plazo máximo de 48 horas tras haber recibido tu pedido, adjuntando fotografías legibles que evidencien el estado del paquete y del producto. Los productos deben permanecer sin uso y en su empaque original.
              </p>
            </div>
          </div>
          <div className="px-4 md:px-6 pb-6 pt-2">
            <button
              onClick={() => setOpenModal(null)}
              className="w-full h-11 rounded-xl text-white font-bold text-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)' }}
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "terminos"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="bg-white border-0 max-w-lg rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center text-white font-bold text-xl shrink-0 luxury-icon-gradient"
                style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)' }}
              >
                T
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Términos y Condiciones
                </DialogTitle>
              </div>
            </div>
          </div>
          <div className="px-4 md:px-6 py-5 flex flex-col gap-4 max-h-[50vh] overflow-y-auto">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
              <p className="mb-4">
                <strong>1. Aceptación de los términos</strong><br/>
                Al registrarse y crear una cuenta en Glamour ML, el usuario acepta de manera expresa, libre y voluntaria los siguientes términos y condiciones de uso y la política de tratamiento de datos personales.
              </p>
              <p className="mb-4">
                <strong>2. Privacidad y Tratamiento de Datos</strong><br/>
                De acuerdo con la Ley de Protección de Datos Personales, autorizo a Glamour ML para la recolección, almacenamiento y uso de mis datos personales con fines comerciales y de prestación de servicios. Glamour ML se compromete a no compartir, vender ni distribuir esta información con terceros no autorizados.
              </p>
              <p className="mb-4">
                <strong>3. Uso de la Cuenta</strong><br/>
                El usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. La cuenta es personal e intransferible.
              </p>
              <p className="mb-4">
                <strong>4. Políticas de Compra</strong><br/>
                Todas las compras realizadas a través de la plataforma están sujetas a disponibilidad de inventario y confirmación de pago. Nos reservamos el derecho de cancelar cualquier pedido que presente irregularidades.
              </p>
              <p className="mb-0">
                <strong>5. Modificaciones</strong><br/>
                Glamour ML se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán notificados y aplicarán para las actividades posteriores a su publicación.
              </p>
            </div>
          </div>
          <div className="px-4 md:px-6 pb-6 pt-2">
            <button
              onClick={() => setOpenModal(null)}
              className="w-full h-11 rounded-xl text-white font-bold text-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)' }}
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FooterSection>
  );
}

// Componente: Información de contacto
function ContactSection() {
  return (
    <FooterSection title="Contacto">
      <ul className="space-y-3">
        <ContactItem
          icon={MapPin}
          text="Calle 31C #89-35, Medellín"
        />
        <ContactItem
          icon={Phone}
          text="WhatsApp: +57 321 525 7246"
        />
        <ContactItem
          icon={Mail}
          text="hola@glamourml.com"
        />
      </ul>
    </FooterSection>
  );
}

// Componente: Redes sociales
function SocialSection() {
  return (
    <div className="w-full md:w-auto pt-2 lg:pt-6">
      <SectionTitle>Síguenos</SectionTitle>
      <div className="flex gap-3 justify-start pt-3">
        <SocialButton
          href="https://www.instagram.com/glamourml_/"
          label="Instagram"
        >
          <Instagram className="w-4 h-4" />
        </SocialButton>
        <SocialButton
          href="https://www.tiktok.com/@glamourml_"
          label="TikTok"
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
        </SocialButton>
      </div>
    </div>
  );
}

// Componente: Barra inferior
function BottomBar() {
  return (
    <div style={{ borderTop: COLORS.accentBorder, backgroundColor: COLORS.bgBottom }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-center space-y-2">
        <p className="text-white/50 text-[11px] tracking-wider">
          © {new Date().getFullYear()} Glamour ML. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}

// Componente: Layout principal del footer
function FooterContent() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pt-14 lg:pt-20 lg:pb-32 ">
        {/* Columna 1: Brand */}
        <BrandSection />

        {/* Columna 2: Legal */}
        <LegalSection />

        {/* Columna 3: Contacto */}
        <ContactSection />

        {/* Columna 4: Redes sociales */}
        <SocialSection />
      </div>
    </div>
  );
}

// Componente principal
export function Footer() {
  return (
    <footer style={{ backgroundColor: COLORS.bg }} className="text-white">
      <GradientLine />
      <FooterContent />
      <BottomBar />
    </footer>
  );
}