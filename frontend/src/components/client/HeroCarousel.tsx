import { useState, useEffect } from "react";
import { Sparkles, ShoppingBag } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "../ui/carousel";
import { C } from "../../lib/theme";

interface HeroCarouselProps {
  isPublic?: boolean;
  onNavigate?: (route: string) => void;
  setActiveSection: (section: "inicio" | "catalogo" | "nosotros" | "contacto") => void;
}

export function HeroCarousel({ isPublic, onNavigate, setActiveSection }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  const slides = [
    {
      image: "/hero/slide1.png",
      title: "Belleza que transforma",
      subtitle:
        "Descubre nuestra cuidada selección de cosméticos premium. Ingredientes naturales para resultados extraordinarios.",
      badge: isPublic ? "Nueva Colección 2025" : "Exclusivo para ti",
    },
    {
      image: "/hero/slide2.png",
      title: "Cuidado de la Piel",
      subtitle:
        "Rutinas personalizadas con las mejores marcas globales. Tu piel merece el lujo de lo natural.",
      badge: "Tendencias 2025",
    },
    {
      image: "/hero/slide3.png",
      title: "Fragancias de Lujo",
      subtitle:
        "Encuentra el aroma que define tu esencia. Perfumería importada con sellos de autenticidad.",
      badge: "Edición Limitada",
    },
    {
      image: "/hero/slide4.png",
      title: "Labios Irresistibles",
      subtitle:
        "Tonos vibrantes y fórmulas hidratantes. El toque final perfecto para cualquier ocasión.",
      badge: "Especial de Temporada",
    },
  ];

  return (
    <section
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "center",
        }}
        className="w-screen h-full"
        style={{ width: "100vw" }}
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, idx) => (
            <CarouselItem key={idx} className="pl-0 basis-full">
              <div
                style={{
                  position: "relative",
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Fullscreen Background Image */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: 1,
                  }}
                >
                  {/* Dark Overlay for readability */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
                      zIndex: 2,
                    }}
                  />
                </div>

                {/* Content */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 3,
                    textAlign: "center",
                    color: "white",
                    maxWidth: "900px",
                    padding: "0 2rem",
                  }}
                >
                  {/* Badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      marginBottom: "2rem",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {slide.badge}
                  </div>

                  {/* Title */}
                  <h1
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2.5rem, 6vw, 5rem)",
                      fontWeight: 300,
                      lineHeight: 1.2,
                      marginBottom: "1.5rem",
                      textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p
                    style={{
                      fontSize: "clamp(1rem, 2vw, 1.3rem)",
                      lineHeight: 1.6,
                      marginBottom: "2.5rem",
                      maxWidth: "700px",
                      margin: "0 auto 2.5rem",
                      opacity: 0.9,
                      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() =>
                      onNavigate
                        ? onNavigate("catalogo")
                        : setActiveSection("catalogo")
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      padding: "16px 40px",
                      borderRadius: "50px",
                      fontSize: "16px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                      e.currentTarget.style.boxShadow =
                        "0 15px 40px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 32px rgba(0,0,0,0.2)";
                    }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Explorar tienda
                  </button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Navigation Controls (Previous / Next) */}
        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 border-white/20 bg-black/20 hover:bg-white/20 hover:text-white text-white h-14 w-14 rounded-2xl backdrop-blur-md transition-all shadow-xl z-50" />
          <CarouselNext className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 border-white/20 bg-black/20 hover:bg-white/20 hover:text-white text-white h-14 w-14 rounded-2xl backdrop-blur-md transition-all shadow-xl z-50" />
        </div>
      </Carousel>

      {/* Progress Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "12px",
          zIndex: 50,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.width = "32px";
              e.currentTarget.style.borderRadius = "4px";
              e.currentTarget.style.background = "rgba(255,255,255,0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.width = "8px";
              e.currentTarget.style.borderRadius = "50%";
              e.currentTarget.style.background = "rgba(255,255,255,0.4)";
            }}
          />
        ))}
      </div>
    </section>
  );
}
