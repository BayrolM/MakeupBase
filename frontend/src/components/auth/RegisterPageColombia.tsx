import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserRole } from "../../lib/store";
import {
  ChevronLeft,
  User,
  Hash,
  Mail,
  Phone,
  Lock,
  MapPin,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
} from "lucide-react";
import { validateField as validateUserField } from "../../utils/usuarioUtils";

const C = {
  bgDeep: '#2e1020',
  pink: '#7b1347',
  pinkSoft: '#c47b96',
  accentDark: '#a85d77',
  accentSoft: '#fce8f0',
  cream: '#fffff2',
  textDark: '#1a1a1a',
  textMuted: '#6b7280',
  white: '#ffffff',
  danger: '#ef4444',
  success: '#10b981',
};

/* ── Luxury Style Helpers ── */
const inputStyle = (hasError: boolean) => ({
  width: "100%",
  height: "50px",
  borderRadius: "14px",
  border: `1.5px solid ${hasError ? C.danger : C.accentSoft}`,
  padding: "0 16px 0 48px",
  fontSize: "14px",
  color: C.textDark,
  outline: "none",
  background: "rgba(255, 255, 255, 0.6)",
  boxSizing: "border-box" as const,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
});

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>) => {
  e.currentTarget.style.borderColor = C.pink;
  e.currentTarget.style.background = '#ffffff';
  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(123, 19, 71, 0.08)';
};

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>, hasError: boolean) => {
  e.currentTarget.style.borderColor = hasError ? C.danger : C.accentSoft;
  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
  e.currentTarget.style.boxShadow = 'none';
};

interface RegisterPageProps {
  onRegister: (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
    tipoDocumento: string;
    documento: string;
    direccion: string;
    ciudad: string;
    departamento: string;
  }) => void | Promise<void>;
  onNavigateToLogin: () => void;
  onBack?: () => void;
}

export function RegisterPageColombia({
  onRegister,
  onNavigateToLogin,
  onBack,
}: RegisterPageProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: "CC",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    ciudad: "",
    departamento: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ["numeroDocumento", "nombres", "apellidos"];
      case 2:
        return ["email", "telefono", "departamento", "ciudad", "direccion"];
      case 3:
        return ["password", "confirmPassword"];
      default:
        return [];
    }
  };

  const handleNextStep = () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const newErrors: Record<string, string> = {};
    
    fieldsToValidate.forEach((f) => {
      const err = validateField(f, (formData as any)[f] || "");
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    const clearedErrors = { ...errors };
    fieldsToValidate.forEach((f) => delete clearedErrors[f]);
    setErrors(clearedErrors);

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const validateField = (name: string, value: string) => {
    const fieldName = name === "password" ? "passwordHash" : name;
    const error = validateUserField(fieldName, value);
    if (error) return error;

    if (name === "confirmPassword") {
      if (!value) return "Confirma tu contraseña";
      if (value !== formData.password) return "Las contraseñas no coinciden";
    }

    return "";
  };

  const handleChange = (name: string, value: string) => {
    let finalValue = value;
    if (name === "numeroDocumento") {
      if (formData.tipoDocumento === "PAS") {
        finalValue = value.replace(/[^a-zA-Z0-9]/g, "");
      } else {
        finalValue = value.replace(/[^0-9]/g, "");
      }
    } else if (name === "telefono") {
      finalValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    const error = validateField(name, finalValue);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "password") {
      if (formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            finalValue !== formData.confirmPassword
              ? "Las contraseñas no coinciden"
              : "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = [
      "nombres",
      "apellidos",
      "numeroDocumento",
      "email",
      "telefono",
      "password",
      "confirmPassword",
      "direccion",
      "ciudad",
      "departamento",
    ];
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const err = validateField(f, (formData as any)[f] || "");
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onRegister({
        nombre: formData.nombres.trim(),
        apellido: formData.apellidos.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        rol: "cliente",
        tipoDocumento: formData.tipoDocumento,
        documento: formData.numeroDocumento.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        departamento: formData.departamento.trim(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fieldProps = (name: string) => ({
    value: (formData as any)[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(name, e.target.value),
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: 'radial-gradient(ellipse at 50% 0%, #fffbfd 0%, #fff5f8 100%)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'rgba(196, 123, 150, 0.25)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '500px', height: '500px', background: 'rgba(123, 19, 71, 0.12)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none' }} />

      <div
        style={{
          width: "100%",
          maxWidth: "1040px",
          display: "flex",
          flexDirection: "row",
          background: C.white,
          borderRadius: "32px",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(46, 16, 32, 0.08)",
          border: `1px solid rgba(252, 232, 240, 0.8)`,
          zIndex: 2,
          position: "relative",
        }}
        className="flex-col md:flex-row"
      >
        <div
          className="hidden md:flex flex-col justify-between p-8 md:p-12"
          style={{
            flex: 1.1,
            background: 'linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)',
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196, 123, 150, 0.25) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '-15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(123, 19, 71, 0.4) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: "relative", zIndex: 2 }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: C.pinkSoft,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "40px",
                  transition: "all 0.3s ease",
                  padding: "8px 16px",
                  borderRadius: "20px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.cream;
                  e.currentTarget.style.transform = 'translateX(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.pinkSoft;
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
                Volver al portal
              </button>
            )}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: `2px solid ${C.pinkSoft}`,
                boxShadow: `0 0 20px rgba(196, 123, 150, 0.4)`,
                marginBottom: "24px",
              }}
            >
              <img
                src="/logo.png"
                alt="Glamour ML Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "36px",
                fontWeight: 600,
                color: C.cream,
                lineHeight: 1.1,
                marginBottom: "16px",
              }}
            >
              Únete a<br />
              Glamour ML
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 242, 0.75)",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              Crea tu cuenta de acceso exclusivo para poder pedir a través de nuestro sitio web, registra tus pedidos y conoce más de nuestros productos.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {[
              "Catálogo exclusivo de todos nuestros productos",
              "Gestión y seguimiento de tus pedidos",
              "Seguridad en el envío",
            ].map((item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: C.pinkSoft,
                    }}
                  />
                </div>
                <span
                  style={{ color: "rgba(255, 255, 242, 0.7)", fontSize: "13px", fontWeight: 500 }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: C.white,
          }}
          className="sidebar-scroll p-8 md:p-12"
        >
          <div
            className="md:hidden"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 24px 16px 24px",
            }}
          >
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: C.pinkSoft,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} /> Volver
              </button>
            )}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                overflow: "hidden",
                border: `1.5px solid ${C.pinkSoft}`,
                background: "transparent",
              }}
            >
              <img
                src="/logo.png"
                alt="Glamour ML"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto" }}>
            <div>
              <div style={{ marginBottom: "36px" }}>
                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "32px",
                    fontWeight: 600,
                    color: C.textDark,
                    margin: "0 0 8px 0",
                    letterSpacing: "-0.5px"
                  }}
                >
                  Registrarse
                </h1>
                <p style={{ color: C.textMuted, fontSize: "14px", margin: 0 }}>
                  Completa tus datos profesionales para crear tu cuenta.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "28px" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "0 8px" }}>
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "8px",
                      right: "8px",
                      height: "2px",
                      background: C.accentSoft,
                      transform: "translateY(-50%)",
                      zIndex: 1,
                    }} />
                    
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "8px",
                      height: "2px",
                      background: C.pink,
                      width: `calc(${((currentStep - 1) / 2) * 100}% - 16px)`,
                      transform: "translateY(-50%)",
                      transition: "width 0.4s ease-in-out",
                      zIndex: 2,
                    }} />

                    {[1, 2, 3].map((step) => {
                      const isActiveOrCompleted = currentStep >= step;
                      return (
                        <div
                          key={step}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: isActiveOrCompleted ? C.pink : C.accentSoft,
                            color: isActiveOrCompleted ? C.white : C.textMuted,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700,
                            zIndex: 3,
                            transition: "all 0.4s ease-in-out",
                            border: isActiveOrCompleted ? `2.5px solid ${C.pink}` : `2.5px solid ${C.accentSoft}`,
                            boxShadow: isActiveOrCompleted ? "0 0 14px rgba(123, 19, 71, 0.25)" : "none",
                          }}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    {[
                      { label: 'Identidad', align: "left" as const },
                      { label: 'Ubicación', align: "center" as const },
                      { label: 'Seguridad', align: "right" as const }
                    ].map((item, idx) => {
                      const step = idx + 1;
                      const isActive = currentStep === step;
                      const isCompleted = currentStep > step;
                      return (
                        <span
                          key={step}
                          style={{
                            fontSize: "12px",
                            fontWeight: isActive || isCompleted ? 700 : 500,
                            color: isActive || isCompleted ? C.pink : C.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            width: "80px",
                            textAlign: item.align,
                            transition: "color 0.3s ease",
                          }}
                        >
                          {item.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {currentStep === 1 && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: C.pinkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "4px",
                        }}
                      >
                        Identificación
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Tipo Doc. <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <CreditCard
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18, zIndex: 10, pointerEvents: "none" }}
                            />
                            <Select
                              value={formData.tipoDocumento}
                              onValueChange={(v) => {
                                setFormData((p) => {
                                  const updated = { ...p, tipoDocumento: v };
                                  if (v !== "PAS" && p.numeroDocumento) {
                                    updated.numeroDocumento = p.numeroDocumento.replace(/[^0-9]/g, "");
                                  }
                                  return updated;
                                });
                              }}
                            >
                              <SelectTrigger
                                style={inputStyle(!!errors.tipoDocumento)}
                                onFocus={handleInputFocus}
                                onBlur={(e) => handleInputBlur(e, !!errors.tipoDocumento)}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                style={{
                                  background: C.white,
                                  border: `1px solid ${C.accentSoft}`,
                                  borderRadius: "14px",
                                }}
                              >
                                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                <SelectItem value="PAS">Pasaporte</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {errors.tipoDocumento && (
                            <p style={{ color: C.danger, fontSize: '11px', fontWeight: 600, margin: 0, marginTop: '2px' }}>
                              {errors.tipoDocumento}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Número <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Hash
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("numeroDocumento")}
                              placeholder="8 a 15 caracteres"
                              maxLength={15}
                              style={inputStyle(!!errors.numeroDocumento)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.numeroDocumento)
                              }
                            />
                          </div>
                          {errors.numeroDocumento && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.numeroDocumento}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: C.pinkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "4px",
                        }}
                      >
                        Datos Personales
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Nombre <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <User
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("nombres")}
                              placeholder="Máx 30"
                              maxLength={30}
                              style={inputStyle(!!errors.nombres)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.nombres)
                              }
                            />
                          </div>
                          {errors.nombres && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.nombres}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Apellido <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <User
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("apellidos")}
                              placeholder="Máx 30"
                              maxLength={30}
                              style={inputStyle(!!errors.apellidos)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.apellidos)
                              }
                            />
                          </div>
                          {errors.apellidos && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.apellidos}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: C.pinkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "4px",
                        }}
                      >
                        Contacto
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Email <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Mail
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("email")}
                              type="email"
                              placeholder="ejemplo@glamour.com"
                              maxLength={40}
                              style={inputStyle(!!errors.email)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.email)
                              }
                            />
                          </div>
                          {errors.email && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Teléfono <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Phone
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("telefono")}
                              placeholder="Mín 10 dígitos"
                              maxLength={20}
                              style={inputStyle(!!errors.telefono)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.telefono)
                              }
                            />
                          </div>
                          {errors.telefono && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: C.pinkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "4px",
                        }}
                      >
                        Residencia
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Ciudad
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Building2
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("ciudad")}
                              placeholder="Mín 10 caracteres"
                              maxLength={50}
                              style={inputStyle(!!errors.ciudad)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.ciudad)
                              }
                            />
                          </div>
                          {errors.ciudad && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.ciudad}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Dpto
                          </label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <MapPin
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              {...fieldProps("departamento")}
                              placeholder="Antioquia"
                              maxLength={50}
                              style={inputStyle(!!errors.departamento)}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.departamento)
                              }
                            />
                          </div>
                          {errors.departamento && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.departamento}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginTop: "8px"
                        }}
                      >
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: C.textDark,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Dirección
                        </label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <MapPin
                            style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                          />
                          <input
                            {...fieldProps("direccion")}
                            placeholder="Mín 10 caracteres"
                            maxLength={30}
                            style={inputStyle(!!errors.direccion)}
                            onFocus={handleInputFocus}
                            onBlur={(e) =>
                              handleInputBlur(e, !!errors.direccion)
                            }
                          />
                        </div>
                        {errors.direccion && (
                          <p
                            style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                          >
                            {errors.direccion}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: C.pinkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "4px",
                        }}
                      >
                        Seguridad
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Contraseña <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: 'flex', alignItems: 'center' }}>
                            <Lock
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) =>
                                handleChange("password", e.target.value)
                              }
                              placeholder="Mínimo 8 chars"
                              maxLength={225}
                              style={{
                                ...inputStyle(!!errors.password),
                                padding: "0 48px 0 48px",
                              }}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.password)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((p) => !p)}
                              style={{
                                position: "absolute",
                                right: "16px",
                                background: "none",
                                border: "none",
                                color: C.pinkSoft,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {showPassword ? (
                                <EyeOff style={{ width: 18, height: 18 }} />
                              ) : (
                                <Eye style={{ width: 18, height: 18 }} />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: C.textDark,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Confirmar <span style={{ color: C.danger }}>*</span>
                          </label>
                          <div style={{ position: "relative", display: 'flex', alignItems: 'center' }}>
                            <Lock
                              style={{ position: "absolute", left: "16px", color: C.pinkSoft, width: 18, height: 18 }}
                            />
                            <input
                              type={showConfirm ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                handleChange("confirmPassword", e.target.value)
                              }
                              placeholder="Repite contraseña"
                              maxLength={225}
                              style={{
                                ...inputStyle(!!errors.confirmPassword),
                                padding: "0 48px 0 48px",
                              }}
                              onFocus={handleInputFocus}
                              onBlur={(e) =>
                                handleInputBlur(e, !!errors.confirmPassword)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((p) => !p)}
                              style={{
                                position: "absolute",
                                right: "16px",
                                background: "none",
                                border: "none",
                                color: C.pinkSoft,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {showConfirm ? (
                                <EyeOff style={{ width: 18, height: 18 }} />
                              ) : (
                                <Eye style={{ width: 18, height: 18 }} />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p
                              style={{ color: C.danger, fontSize: "11px", fontWeight: 600, margin: 0, marginTop: "2px" }}
                            >
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      style={{
                        flex: 1,
                        height: "52px",
                        borderRadius: "14px",
                        background: C.white,
                        color: C.pink,
                        border: `2px solid ${C.pink}`,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        boxShadow: "0 4px 12px rgba(123, 19, 71, 0.04)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.accentSoft;
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(123, 19, 71, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = C.white;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 19, 71, 0.04)";
                      }}
                    >
                      Atrás
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      style={{
                        flex: 1,
                        height: "52px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #7b1347 0%, #a85d77 100%)",
                        color: C.white,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        boxShadow: "0 8px 24px rgba(123, 19, 71, 0.2)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 12px 28px rgba(123, 19, 71, 0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(123, 19, 71, 0.2)";
                      }}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        height: "52px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #7b1347 0%, #a85d77 100%)",
                        color: C.white,
                        border: "none",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        boxShadow: "0 8px 24px rgba(123, 19, 71, 0.2)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isLoading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 12px 28px rgba(123, 19, 71, 0.35)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(123, 19, 71, 0.2)";
                        }
                      }}
                    >
                      {isLoading ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "16px",
                              height: "16px",
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: C.white,
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          Registrando...
                        </span>
                      ) : (
                        "Crear mi cuenta"
                      )}
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '36px', textAlign: 'center', paddingTop: '24px', borderTop: `1px solid ${C.accentSoft}` }}>
                  <span style={{ color: C.textMuted, fontSize: '13px', marginRight: '6px' }}>
                    ¿Ya tienes cuenta?
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    style={{ background: 'none', border: 'none', color: C.pink, cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'color 0.2s', padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.color = C.accentDark}
                    onMouseLeave={(e) => e.currentTarget.style.color = C.pink}
                  >
                    Inicia sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
