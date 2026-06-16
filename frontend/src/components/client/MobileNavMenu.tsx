import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { ChevronRight, Instagram } from "lucide-react";

interface MobileNavMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
  navLinks: Array<{ label: string; route: string }>;
}

export function MobileNavMenu({
  isOpen,
  onOpenChange,
  currentRoute,
  onNavigate,
  navLinks,
}: MobileNavMenuProps) {
  const isActive = (route: string) => currentRoute === route;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[320px] p-0 flex flex-col"
        style={{
          background: "var(--luxury-bg-soft)",
          borderRight: "1px solid var(--luxury-accent-soft)",
        }}
      >
        <SheetHeader
          className="p-8 text-left"
          style={{
            background: "var(--luxury-bg-header)",
            borderBottom: "1px solid var(--luxury-accent-soft)",
          }}
        >
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, var(--luxury-pink-soft), var(--luxury-pink))",
              borderRadius: "4px",
              marginBottom: "16px",
              width: "40px",
            }}
          />
          <SheetTitle
            className="font-serif text-2xl font-bold flex items-center gap-3"
            style={{ color: "var(--luxury-text-dark)" }}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 shadow-sm border border-border">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            GLAMOUR ML
          </SheetTitle>
          <SheetDescription style={{ color: "var(--luxury-text-muted)" }}>
            Descubre tu belleza interior
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="flex flex-col px-4 gap-2">
            {navLinks.map(({ label, route }) => {
              const active = isActive(route);
              return (
                <button
                  key={route}
                  onClick={() => {
                    onNavigate(route);
                    onOpenChange(false);
                  }}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 text-left font-medium ${
                    active
                      ? "shadow-sm"
                      : "hover:bg-white hover:shadow-sm hover:-translate-y-0.5"
                  }`}
                  style={{
                    fontSize: "15px",
                    background: active ? "var(--luxury-accent-soft)" : "transparent",
                    color: active ? "var(--luxury-pink)" : "var(--luxury-text-dark)",
                    border: active ? "1px solid var(--luxury-accent)" : "1px solid transparent",
                  }}
                >
                  {label}
                  {active ? (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--luxury-pink)" }} />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Menu Footer */}
        <div
          className="p-8 mt-auto"
          style={{
            borderTop: "1px dashed var(--luxury-accent-soft)",
            background: "rgba(255,255,255,0.4)",
          }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <a
              href="https://www.instagram.com/glamourml_/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:scale-110 transition-all duration-300"
              style={{ border: "1px solid var(--luxury-accent-soft)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--luxury-pink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@glamourml_"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:scale-110 transition-all duration-300"
              style={{ border: "1px solid var(--luxury-accent-soft)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--luxury-pink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
          <p className="text-center text-xs" style={{ color: "var(--luxury-text-muted)" }}>
            © 2024 Glamour ML. Todos los derechos reservados.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
