import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { PageHeader } from "../PageHeader";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { User, Lock, Camera, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Paleta navy / naranja – solo variables
   del diseño aprobado
───────────────────────────────────────── */
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

/** Campo de formulario */
function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
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
    </div>
  );
}

/** Estilos para inputs */
const inputStyle = (disabled: boolean): React.CSSProperties => ({
  height: 40,
  borderRadius: 8,
  border: `1px solid ${disabled ? D.borderLight : D.border}`,
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
  const { currentUser, updateUser } = useStore();
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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
        // @ts-ignore
        numeroDocumento:
          currentUser.numeroDocumento || currentUser.numeroDocumento || "",
        telefono: currentUser.telefono || "",
        direccion: currentUser.direccion || "",
        ciudad: currentUser.ciudad || "",
        departamento: currentUser.departamento || "",
        pais: currentUser.pais || "Colombia",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInfoChange = (field: string, value: string) => {
    setInfoFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveInfo = async () => {
    if (!currentUser) return;
    if (
      !infoFormData.nombre.trim() ||
      !infoFormData.apellido.trim() ||
      !infoFormData.numeroDocumento.trim() ||
      !infoFormData.telefono.trim() ||
      !infoFormData.email.trim()
    ) {
      toast.error("Campos obligatorios");
      return;
    }
    if (!validateEmail(infoFormData.email)) {
      toast.error("Formato inválido");
      return;
    }

    setIsSavingInfo(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("gml_token")}`,
        },
        body: JSON.stringify({
          nombres: infoFormData.nombre.trim(),
          apellidos: infoFormData.apellido.trim(),
          tipo_documento: infoFormData.tipoDocumento,
          documento: infoFormData.numeroDocumento.trim(),
          telefono: infoFormData.telefono.trim(),
          direccion: infoFormData.direccion.trim(),
          ciudad: infoFormData.ciudad.trim(),
          departamento: infoFormData.departamento.trim(),
          pais: infoFormData.pais.trim(),
          email: infoFormData.email.trim(),
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      updateUser(currentUser.id, {
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

      toast.success("Información actualizada");
      setIsEditingInfo(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar en el servidor");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentUser) return;
    if (
      !passwordFormData.currentPassword ||
      !passwordFormData.newPassword ||
      !passwordFormData.confirmPassword
    ) {
      toast.error("Campos obligatorios");
      return;
    }
    if (passwordFormData.newPassword.length < 8) {
      toast.error("Contraseña débil");
      return;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (
      passwordFormData.currentPassword !== "admin123" &&
      passwordFormData.currentPassword !== currentUser.passwordHash
    ) {
      toast.error("Contraseña actual incorrecta");
      return;
    }
    setIsSavingPassword(true);
    updateUser(currentUser.id, { passwordHash: passwordFormData.newPassword });
    setIsSavingPassword(false);
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.success("Contraseña actualizada");
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
    toast.success("Foto actualizada");
    setIsSavingPhoto(false);
    setPhotoFile(null);
    setPreviewPhoto(null);
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
      <PageHeader
        title="Mi perfil"
        subtitle="Administra tu información personal y credenciales de acceso"
        icon={User}
      />

      <div style={{ padding: "32px 32px 0" }}>
        {/* ── Layout: sidebar + panel ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
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
                      <BtnGhost onClick={() => setIsEditingInfo(false)}>
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 20px",
                  }}
                >
                  <Field label="Nombre *">
                    <Input
                      value={infoFormData.nombre}
                      onChange={(e) =>
                        handleInfoChange("nombre", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Tu nombre"
                    />
                  </Field>

                  <Field label="Apellidos *">
                    <Input
                      value={infoFormData.apellido}
                      onChange={(e) =>
                        handleInfoChange("apellido", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Tus apellidos"
                    />
                  </Field>

                  <Field label="Tipo de identificación *">
                    <Select
                      value={infoFormData.tipoDocumento}
                      onValueChange={(v) =>
                        handleInfoChange("tipoDocumento", v)
                      }
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

                  <Field label="Número de documento *">
                    <Input
                      value={infoFormData.numeroDocumento}
                      onChange={(e) =>
                        handleInfoChange("numeroDocumento", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Número de documento"
                    />
                  </Field>

                  <Field label="Correo electrónico *">
                    <Input
                      type="email"
                      value={infoFormData.email}
                      onChange={(e) =>
                        handleInfoChange("email", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="correo@empresa.co"
                    />
                  </Field>

                  <Field label="Teléfono móvil *">
                    <Input
                      value={infoFormData.telefono}
                      onChange={(e) =>
                        handleInfoChange("telefono", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="+57 300 000 0000"
                    />
                  </Field>

                  <Field label="Dirección" full>
                    <Input
                      value={infoFormData.direccion}
                      onChange={(e) =>
                        handleInfoChange("direccion", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Calle, carrera, número..."
                    />
                  </Field>

                  <Field label="Ciudad">
                    <Input
                      value={infoFormData.ciudad}
                      onChange={(e) =>
                        handleInfoChange("ciudad", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Tu ciudad"
                    />
                  </Field>

                  <Field label="Departamento">
                    <Input
                      value={infoFormData.departamento}
                      onChange={(e) =>
                        handleInfoChange("departamento", e.target.value)
                      }
                      disabled={!isEditingInfo}
                      style={inputStyle(!isEditingInfo)}
                      placeholder="Antioquia, Cundinamarca..."
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 20px",
                  }}
                >
                  <Field label="Contraseña actual" full>
                    <Input
                      type="password"
                      value={passwordFormData.currentPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          currentPassword: e.target.value,
                        })
                      }
                      style={inputStyle(false)}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </Field>

                  <Field label="Nueva contraseña">
                    <Input
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          newPassword: e.target.value,
                        })
                      }
                      style={inputStyle(false)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </Field>

                  <Field label="Confirmar contraseña">
                    <Input
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          confirmPassword: e.target.value,
                        })
                      }
                      style={inputStyle(false)}
                      placeholder="Repite la nueva contraseña"
                    />
                  </Field>
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
                    onClick={() =>
                      setPasswordFormData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                    }
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
