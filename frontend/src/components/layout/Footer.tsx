import { Instagram, MapPin, Phone, Mail } from "lucide-react";

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

// Componente: Lista de enlaces
interface LinkItem {
  href: string;
  label: string;
}
interface LinkListProps {
  items: LinkItem[];
}
function LinkList({ items }: LinkListProps) {
  return (
    <ul className="space-y-3 pt-2 lg:pt-6">
      {items.map((item, idx) => (
        <li key={idx}>
          <a href={item.href} className={TEXT_MUTED}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
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
  const legalLinks = [
    { label: "Políticas de Envío", href: "#" },
    { label: "Cambios y Devoluciones", href: "#" },
    { label: "Preguntas Frecuentes", href: "#" },
    { label: "Términos y Condiciones", href: "#" },
  ];

  return (
    <FooterSection title="Información Legal">
      <LinkList items={legalLinks} />
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