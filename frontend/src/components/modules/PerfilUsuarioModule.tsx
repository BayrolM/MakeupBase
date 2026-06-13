import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { PageHeader } from "../layout/PageHeader";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { User, Lock, Camera, ShieldCheck, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { validateField as validateUserField } from "../../utils/usuarioUtils";
import { uploadToSupabase } from "../../lib/supabaseUpload";

const D = {
  navy: "var(--luxury-pink)",
  navyMid: "#66103b",
  navyLight: "var(--luxury-accent-soft)",
  navyXlight: "#fffbfc",
  orange: "var(--luxury-pink-soft)",
  orangeLight: "#fff5f8",
  orangeMid: "#f7d9e6",
  bg: "#f8fafc",
  white: "#ffffff",
  textPrimary: "#0d1f33",
  textSecond: "#5a7082",
  textTertiary: "#8fa5b5",
  border: "#dde6ee",
  borderLight: "#eaf0f6",
  success: "#2d7a4f",
  successBg: "#eaf5ef",
  successBorder: "#b6dfc9",
  danger: "#b83232",
  dangerBg: "#fdf0f0",
  dangerBorder: "#f5c0c0",
};

/* ─────────────────────────────────────────
   Sub-componentes de layout
───────────────────────────────────────── */

/** Tarjeta base reutilizable */
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: D.white,
        border: `1px solid ${D.orangeMid}`, // Borde más visible con tono luxury
        borderRadius: 20,
        boxShadow:
          "0 15px 35px -5px rgba(123, 19, 71, 0.08), 0 10px 15px -6px rgba(0, 0, 0, 0.03)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Encabezado de sección con ícono */
function SectionHead({
  icon: Icon,
  title,
  desc,
  iconVariant = "blue",
  actions,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  iconVariant?: "blue" | "orange";
  actions?: React.ReactNode;
}) {
  const iconBg = iconVariant === "orange" ? D.orangeLight : D.navyLight;
  const iconColor = iconVariant === "orange" ? D.orange : D.navy;
  return (
    <div
      style={{
        padding: "18px 24px 16px",
        borderBottom: `1px solid ${D.borderLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={17} color={iconColor} strokeWidth={1.8} />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              color: D.textPrimary,
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: D.textTertiary,
              marginTop: 1,
            }}
          >
            {desc}
          </p>
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

/** Campo de formulario con error */
function Field({
  label,
  children,
  full,
  error,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  error?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <label
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: D.textSecond,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: D.danger,
            marginTop: 2,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Estilos para inputs */
const inputStyle = (disabled: boolean, hasError?: boolean): React.CSSProperties => ({
  height: 40,
  borderRadius: 8,
  border: `1px solid ${hasError ? D.danger : disabled ? D.borderLight : D.border}`,
  background: disabled ? D.navyXlight : D.white,
  fontSize: 13,
  color: D.textPrimary,
  paddingLeft: 12,
  paddingRight: 12,
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

/** Botón primario navy */
function BtnNavy({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "0 18px",
        height: 38,
        borderRadius: 8,
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${D.navy}`,
        background: disabled ? D.navyLight : D.navy,
        color: D.white,
        transition: "background 0.15s",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

/** Botón naranja */
function BtnOrange({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "0 18px",
        height: 38,
        borderRadius: 8,
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${D.orange}`,
        background: disabled ? D.orangeMid : D.orange,
        color: D.white,
        transition: "background 0.15s",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

/** Botón fantasma */
function BtnGhost({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "0 16px",
        height: 38,
        borderRadius: 8,
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 400,
        cursor: "pointer",
        border: `1px solid ${D.border}`,
        background: "transparent",
        color: D.textSecond,
        transition: "background 0.12s",
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   Componente principal
───────────────────────────────────────── */
export function PerfilUsuarioModule() {
  const { currentUser, setCurrentUser } = useStore();
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error states for field-level validation
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [infoFormData, setInfoFormData] = useState({
    nombre: currentUser?.nombres || "",
    apellido: currentUser?.apellidos || "",
    tipoDocumento: currentUser?.tipoDocumento || "CC",
    numeroDocumento: currentUser?.numeroDocumento || "",
    telefono: currentUser?.telefono || "",
    direccion: currentUser?.direccion || "",
    ciudad: currentUser?.ciudad || "",
    departamento: currentUser?.departamento || "",
    pais: currentUser?.pais || "Colombia",
    email: currentUser?.email || "",
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentUser) {
      setInfoFormData({
        nombre: currentUser.nombres || "",
        apellido: currentUser.apellidos || "",
        tipoDocumento: currentUser.tipoDocumento || "CC",
        numeroDocumento:
          currentUser.numeroDocumento || "",
        telefono: currentUser.telefono || "",
        direccion: currentUser.direccion || "",
        ciudad: currentUser.ciudad || "",
        departamento: currentUser.departamento || "",
        pais: currentUser.pais || "Colombia",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  // ── Field validation using the same rules as the Register page ──
  const validateInfoField = (name: string, value: string): string => {
    // Map the form field names to validateUserField names
    const fieldMap: Record<string, string> = {
      nombre: "nombres",
      apellido: "apellidos",
      numeroDocumento: "numeroDocumento",
      email: "email",
      telefono: "telefono",
      direccion: "direccion",
      ciudad: "ciudad",
      departamento: "departamento",
    };

    const validationName = fieldMap[name];
    if (!validationName) return "";

    return validateUserField(validationName, value) || "";
  };

  const handleInfoChange = (field: string, value: string) => {
    let finalValue = value;

    // Input filtering (same as Register page)
    if (field === "numeroDocumento") {
      if (infoFormData.tipoDocumento === "PAS") {
        finalValue = value.replace(/[^a-zA-Z0-9]/g, "");
      } else {
        finalValue = value.replace(/[^0-9]/g, "");
      }
    } else if (field === "telefono") {
      finalValue = value.replace(/[^0-9]/g, "");
    }

    setInfoFormData((prev) => ({ ...prev, [field]: finalValue }));

    // Real-time validation
    const error = validateInfoField(field, finalValue);
    setInfoErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSaveInfo = async () => {
    if (!currentUser) return;

    // Validate all fields
    const fieldsToValidate = [
      "nombre", "apellido", "numeroDocumento",
      "email", "telefono", "direccion", "ciudad", "departamento"
    ];
    const newErrors: Record<string, string> = {};

    fieldsToValidate.forEach((field) => {
      const value = (infoFormData as any)[field] || "";
      const error = validateInfoField(field, value);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setInfoErrors(newErrors);
      toast.error("Corrige los errores antes de guardar");
      return;
    }

    setIsSavingInfo(true);
    try {
      await authService.updateProfile({
        nombres: infoFormData.nombre.trim(),
        apellidos: infoFormData.apellido.trim(),
        telefono: infoFormData.telefono.trim(),
        direccion: infoFormData.direccion.trim(),
        ciudad: infoFormData.ciudad.trim(),
        departamento: infoFormData.departamento.trim(),
        documento: infoFormData.numeroDocumento.trim(),
        tipo_documento: infoFormData.tipoDocumento,
      } as any);

      setCurrentUser({
        ...currentUser,
        nombres: infoFormData.nombre.trim(),
        apellidos: infoFormData.apellido.trim(),
        tipoDocumento: infoFormData.tipoDocumento as any,
        numeroDocumento: infoFormData.numeroDocumento.trim(),
        telefono: infoFormData.telefono.trim(),
        direccion: infoFormData.direccion.trim(),
        ciudad: infoFormData.ciudad.trim(),
        departamento: infoFormData.departamento.trim(),
        pais: infoFormData.pais.trim(),
        email: infoFormData.email.trim(),
      });

      toast.success("Información actualizada correctamente");
      setIsEditingInfo(false);
      setInfoErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error("Error al guardar", {
        description: error.message || "No se pudo actualizar el perfil",
      });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // ── Password validation (same rules as Register page) ──
  const validatePasswordField = (name: string, value: string): string => {
    if (name === "currentPassword") {
      if (!value) return "La contraseña actual es obligatoria";
      return "";
    }
    if (name === "newPassword") {
      if (!value) return "La nueva contraseña es obligatoria";
      if (value.length < 8) return "Mínimo 8 caracteres";
      if (!/[a-z]/.test(value)) return "Debe tener al menos una minúscula";
      if (!/[A-Z]/.test(value)) return "Debe tener al menos una mayúscula";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Debe tener un carácter especial";
      return "";
    }
    if (name === "confirmPassword") {
      if (!value) return "Confirma tu contraseña";
      if (value !== passwordFormData.newPassword) return "Las contraseñas no coinciden";
      return "";
    }
    return "";
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validatePasswordField(field, value);
    setPasswordErrors((prev) => ({ ...prev, [field]: error }));

    // If changing newPassword, also re-validate confirmPassword
    if (field === "newPassword" && passwordFormData.confirmPassword) {
      const confirmError =
        value !== passwordFormData.confirmPassword
          ? "Las contraseñas no coinciden"
          : "";
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSavePassword = async () => {
    if (!currentUser) return;

    // Validate all password fields
    const newErrors: Record<string, string> = {};
    const fields = ["currentPassword", "newPassword", "confirmPassword"];
    fields.forEach((field) => {
      const value = (passwordFormData as any)[field] || "";
      const error = validatePasswordField(field, value);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      toast.error("Corrige los errores antes de continuar");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.changePassword(
        passwordFormData.currentPassword,
        passwordFormData.newPassword
      );

      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      toast.success("Contraseña actualizada correctamente");
    } catch (error: any) {
      console.error(error);
      toast.error("Error al cambiar contraseña", {
        description: error.message || "La contraseña actual es incorrecta",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo imágenes");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Máximo 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoFile || !currentUser) return;
    setIsSavingPhoto(true);
    try {
      const { secure_url } = await uploadToSupabase(photoFile, "avatar");
      await authService.updateProfile({ foto_perfil: secure_url });
      setCurrentUser({ ...currentUser, foto_perfil: secure_url });
      toast.success("Foto de perfil actualizada");
      setPhotoFile(null);
      setPreviewPhoto(null);
    } catch (error: any) {
      toast.error(error.message || "Error al subir la foto");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score <= 1) return { level: score, label: "Muy débil", color: D.danger };
    if (score === 2) return { level: score, label: "Débil", color: "#e67e22" };
    if (score === 3) return { level: score, label: "Media", color: "#f1c40f" };
    if (score === 4) return { level: score, label: "Fuerte", color: "#27ae60" };
    return { level: score, label: "Muy fuerte", color: D.success };
  };

  /* Iniciales del avatar */
  const initials =
    `${(currentUser?.nombres || "").charAt(0)}${(currentUser?.apellidos || "").charAt(0)}`.toUpperCase();

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: D.bg,
        }}
      >
        <p style={{ color: D.textSecond }}>Usuario no encontrado</p>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(passwordFormData.newPassword);

  /* ── Render ── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: D.bg,
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: 48,
      }}
    >
      <style>{`
        .perfil-wrapper {
          padding: 16px 16px 0;
        }
        .perfil-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }
        .perfil-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .perfil-wrapper {
            padding: 32px 32px 0;
          }
          .perfil-container {
            grid-template-columns: 240px 1fr;
          }
          .perfil-form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px 20px;
          }
        }
      `}</style>
      <PageHeader
        title="Mi perfil"
        subtitle="Administra tu información personal y credenciales de acceso"
        icon={User}
      />

      <div className="perfil-wrapper">
        {/* ── Layout: sidebar + panel ── */}
        <div className="perfil-container">
          {/* ══════════════ SIDEBAR ══════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Avatar card */}
            <Card
              style={{
                padding: "28px 20px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {/* Avatar + botón cámara */}
              <div
                style={{
                  position: "relative",
                  width: 96,
                  height: 96,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: D.navy,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 500,
                    color: D.white,
                    letterSpacing: -1,
                    border: `3px solid ${D.white}`,
                    outline: `2px solid ${D.border}`,
                    overflow: "hidden",
                  }}
                >
                  {previewPhoto || currentUser.foto_perfil ? (
                    <img
                      src={previewPhoto || currentUser.foto_perfil}
                      alt="Foto de perfil"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <label
                  htmlFor="photo-upload"
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: D.orange,
                    border: `2px solid ${D.white}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Cambiar foto"
                >
                  <Camera size={13} color={D.white} strokeWidth={2.2} />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Nombre y email */}
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 500,
                  color: D.textPrimary,
                }}
              >
                {currentUser.nombres} {currentUser.apellidos}
              </p>
              <p
                style={{
                  margin: "2px 0 10px",
                  fontSize: 12,
                  color: D.textTertiary,
                }}
              >
                {currentUser.email}
              </p>

              {/* Badge de rol */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: D.navyLight,
                  color: D.navy,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                <ShieldCheck size={12} strokeWidth={2} />
                {currentUser.rol}
              </span>

              <p
                style={{
                  fontSize: 11,
                  color: D.textTertiary,
                  marginTop: 14,
                  lineHeight: 1.5,
                }}
              >
                JPG, PNG o WEBP · máx. 5 MB
              </p>

              {/* Confirmar foto nueva */}
              {photoFile && (
                <BtnOrange onClick={handleSavePhoto} disabled={isSavingPhoto}>
                  <Camera size={14} />
                  {isSavingPhoto ? "Guardando..." : "Confirmar foto"}
                </BtnOrange>
              )}
            </Card>

            {/* Nav lateral */}
            <Card style={{ overflow: "hidden" }}>
              {[
                { icon: User, label: "Información personal", active: true },
              ].map(({ icon: Icon, label, active }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    color: active ? D.orange : D.textSecond,
                    background: active ? D.orangeLight : "transparent",
                    borderLeft: active
                      ? `3px solid ${D.orange}`
                      : "3px solid transparent",
                    borderBottom: `1px solid ${D.borderLight}`,
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    color={active ? D.orange : D.textSecond}
                  />
                  {label}
                </div>
              ))}
            </Card>
          </div>

          {/* ══════════════ PANEL PRINCIPAL ══════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* ── Información personal ── */}
            <Card>
              <SectionHead
                icon={User}
                title="Información personal"
                desc="Datos de contacto y ubicación"
                iconVariant="blue"
                actions={
                  !isEditingInfo ? (
                    <BtnGhost onClick={() => setIsEditingInfo(true)}>
                      Editar perfil
                    </BtnGhost>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <BtnGhost onClick={() => {
                        setIsEditingInfo(false);
                        setInfoErrors({});
                        // Reset form to current user data
                        if (currentUser) {
                          setInfoFormData({
                            nombre: currentUser.nombres || "",
                            apellido: currentUser.apellidos || "",
                            tipoDocumento: currentUser.tipoDocumento || "CC",
                            numeroDocumento: currentUser.numeroDocumento || "",
                            telefono: currentUser.telefono || "",
                            direccion: currentUser.direccion || "",
                            ciudad: currentUser.ciudad || "",
                            departamento: currentUser.departamento || "",
                            pais: currentUser.pais || "Colombia",
                            email: currentUser.email || "",
                          });
                        }
                      }}>
                        Descartar
                      </BtnGhost>
                      <BtnNavy onClick={handleSaveInfo} disabled={isSavingInfo}>
                        <Save size={14} />
                        {isSavingInfo ? "Guardando..." : "Guardar cambios"}
                      </BtnNavy>
                    </div>
                  )
                }
              />

              <div style={{ padding: "22px 24px" }}>
                <div className="perfil-form-grid">
                  <Field label="Nombre *" error={infoErrors.nombre}>
                    <Input
                      value={infoFormData.nombre}
                      onChange={(e) =>
                        handleInfoChange("nombre", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.nombre)}
                      placeholder="Tu nombre"
                      maxLength={30}
                    />
                  </Field>

                  <Field label="Apellidos *" error={infoErrors.apellido}>
                    <Input
                      value={infoFormData.apellido}
                      onChange={(e) =>
                        handleInfoChange("apellido", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.apellido)}
                      placeholder="Tus apellidos"
                      maxLength={30}
                    />
                  </Field>

                  <Field label="Tipo de identificación *">
                    <Select
                      value={infoFormData.tipoDocumento}
                      onValueChange={(v) => {
                        handleInfoChange("tipoDocumento", v);
                        // Re-filter document number when type changes
                        if (v !== "PAS" && infoFormData.numeroDocumento) {
                          const filtered = infoFormData.numeroDocumento.replace(/[^0-9]/g, "");
                          setInfoFormData((prev) => ({ ...prev, tipoDocumento: v, numeroDocumento: filtered }));
                        }
                      }}
                      disabled={!isEditingInfo}
                    >
                      <SelectTrigger
                        style={{
                          ...inputStyle(!isEditingInfo),
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="CE">
                          Cédula de Extranjería
                        </SelectItem>
                        <SelectItem value="PAS">Pasaporte</SelectItem>
                        <SelectItem value="NIT">NIT (Empresas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Número de documento *" error={infoErrors.numeroDocumento}>
                    <Input
                      value={infoFormData.numeroDocumento}
                      onChange={(e) =>
                        handleInfoChange("numeroDocumento", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.numeroDocumento)}
                      placeholder="8 a 15 caracteres"
                      maxLength={15}
                    />
                  </Field>

                  <Field label="Correo electrónico *" error={infoErrors.email}>
                    <Input
                      type="email"
                      value={infoFormData.email}
                      onChange={(e) =>
                        handleInfoChange("email", e.target.value)
                      }
                      disabled={true}
                      style={inputStyle(true, !!infoErrors.email)}
                      placeholder="correo@empresa.co"
                    />
                  </Field>

                  <Field label="Teléfono móvil *" error={infoErrors.telefono}>
                    <Input
                      value={infoFormData.telefono}
                      onChange={(e) =>
                        handleInfoChange("telefono", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.telefono)}
                      placeholder="3001234567"
                      maxLength={20}
                    />
                  </Field>

                  <Field label="Dirección *" full error={infoErrors.direccion}>
                    <Input
                      value={infoFormData.direccion}
                      onChange={(e) =>
                        handleInfoChange("direccion", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.direccion)}
                      placeholder="Calle, carrera, número..."
                      maxLength={30}
                    />
                  </Field>

                  <Field label="Ciudad *" error={infoErrors.ciudad}>
                    <Input
                      value={infoFormData.ciudad}
                      onChange={(e) =>
                        handleInfoChange("ciudad", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.ciudad)}
                      placeholder="Tu ciudad"
                      maxLength={50}
                    />
                  </Field>

                  <Field label="Departamento *" error={infoErrors.departamento}>
                    <Input
                      value={infoFormData.departamento}
                      onChange={(e) =>
                        handleInfoChange("departamento", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo, !!infoErrors.departamento)}
                      placeholder="Antioquia, Cundinamarca..."
                      maxLength={50}
                    />
                  </Field>

                  <Field label="País" full>
                    <Input
                      value={infoFormData.pais}
                      onChange={(e) => handleInfoChange("pais", e.target.value)}
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Colombia"
                    />
                  </Field>
                </div>
              </div>
            </Card>

            {/* ── Cambiar contraseña ── */}
            <Card>
              <SectionHead
                icon={Lock}
                title="Cambiar contraseña"
                desc="Actualiza tus credenciales de acceso"
                iconVariant="orange"
              />

              <div style={{ padding: "22px 24px" }}>
                <div className="perfil-form-grid">
                  <Field label="Contraseña actual *" full error={passwordErrors.currentPassword}>
                    <Input
                      type="password"
                      value={passwordFormData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      style={inputStyle(false, !!passwordErrors.currentPassword)}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </Field>

                  <Field label="Nueva contraseña *" error={passwordErrors.newPassword}>
                    <div style={{ position: "relative" }}>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordFormData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                        style={{
                          ...inputStyle(false, !!passwordErrors.newPassword),
                          paddingRight: 40,
                        }}
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: D.textTertiary,
                          padding: 4,
                        }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {passwordFormData.newPassword && (
                      <div style={{ marginTop: 6 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            marginBottom: 4,
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: 4,
                                borderRadius: 2,
                                background:
                                  i <= passwordStrength.level
                                    ? passwordStrength.color
                                    : D.borderLight,
                                transition: "background 0.3s ease",
                              }}
                            />
                          ))}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            fontWeight: 600,
                            color: passwordStrength.color,
                          }}
                        >
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmar contraseña *" error={passwordErrors.confirmPassword}>
                    <div style={{ position: "relative" }}>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordFormData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange("confirmPassword", e.target.value)
                        }
                        style={{
                          ...inputStyle(false, !!passwordErrors.confirmPassword),
                          paddingRight: 40,
                        }}
                        placeholder="Repite la nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: D.textTertiary,
                          padding: 4,
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Password requirements hint */}
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    background: D.navyXlight,
                    borderRadius: 8,
                    border: `1px solid ${D.borderLight}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 600,
                      color: D.textSecond,
                      marginBottom: 6,
                    }}
                  >
                    La contraseña debe cumplir:
                  </p>
                  {[
                    { rule: "Mínimo 8 caracteres", met: passwordFormData.newPassword.length >= 8 },
                    { rule: "Al menos una letra minúscula", met: /[a-z]/.test(passwordFormData.newPassword) },
                    { rule: "Al menos una letra mayúscula", met: /[A-Z]/.test(passwordFormData.newPassword) },
                    { rule: "Al menos un carácter especial (!@#$%...)", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordFormData.newPassword) },
                  ].map(({ rule, met }) => (
                    <div
                      key={rule}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 3,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: !passwordFormData.newPassword
                            ? D.textTertiary
                            : met
                            ? D.success
                            : D.danger,
                          transition: "background 0.2s",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: !passwordFormData.newPassword
                            ? D.textTertiary
                            : met
                            ? D.success
                            : D.danger,
                          fontWeight: met ? 500 : 400,
                          transition: "color 0.2s",
                        }}
                      >
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <BtnGhost
                    onClick={() => {
                      setPasswordFormData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordErrors({});
                    }}
                  >
                    Cancelar
                  </BtnGhost>
                  <BtnOrange
                    onClick={handleSavePassword}
                    disabled={isSavingPassword}
                  >
                    <Lock size={14} />
                    {isSavingPassword
                      ? "Actualizando..."
                      : "Actualizar contraseña"}
                  </BtnOrange>
                </div>
              </div>
            </Card>
          </div>
          {/* ══ fin panel principal ══ */}
        </div>
      </div>
    </div>
  );
}
