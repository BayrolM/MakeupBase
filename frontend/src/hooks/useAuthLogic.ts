import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useStore, UserRole } from "../lib/store";
import { authService } from "../services/authService";
import { useDataLoaders } from "./useDataLoaders";

export function useAuthLogic() {
  const { setCurrentUser, clearCarrito } = useStore();
  const { loadPublicData, loadPrivateData } = useDataLoaders();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [authTransitionMessage, setAuthTransitionMessage] = useState("");
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  // Use a callback for checking auth to use it in useEffect in App
  const checkAuth = useCallback(async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getProfile();
        const user = {
          id: profile.id_usuario.toString(),
          nombres: profile.nombres,
          apellidos: profile.apellidos,
          email: profile.email,
          telefono: profile.telefono,
          direccion: profile.direccion || "",
          ciudad: profile.ciudad || "",
          departamento: profile.departamento || "",
          id_rol: Number(profile.id_rol),
          foto_perfil: profile.foto_perfil,
          rol:
            Number(profile.id_rol) === 1
              ? ("admin" as const)
              : Number(profile.id_rol) === 2
              ? ("cliente" as const)
              : ("vendedor" as const),
          permisos: profile.permisos || [],
          estado: "activo" as const,
          tipoDocumento: "CC" as const,
          numeroDocumento: "",
          passwordHash: "",
          fechaCreacion: new Date().toISOString(),
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        await loadPublicData();
        await loadPrivateData(user.rol);
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        authService.logout();
        await loadPublicData();
      }
    } else {
      await loadPublicData();
    }
    setIsLoading(false);
  }, [setCurrentUser, loadPublicData, loadPrivateData]);

  const handleLogin = async (
    email: string,
    password: string,
    onSuccess: (role: string) => void
  ) => {
    try {
      await authService.login({ email, password });
      setAuthTransitionMessage("Iniciando sesión...");
      setIsAuthTransitioning(true);

      const profile = await authService.getProfile();
      await new Promise((resolve) => setTimeout(resolve, 800));

      const user = {
        id: profile.id_usuario.toString(),
        nombres: profile.nombres,
        apellidos: profile.apellidos,
        email: profile.email,
        telefono: profile.telefono,
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        departamento: profile.departamento || "",
        id_rol: Number(profile.id_rol),
        foto_perfil: profile.foto_perfil,
        rol:
          Number(profile.id_rol) === 1
            ? ("admin" as const)
            : Number(profile.id_rol) === 2
            ? ("cliente" as const)
            : ("vendedor" as const),
        permisos: profile.permisos || [],
        estado: "activo" as const,
        tipoDocumento: "CC" as const,
        numeroDocumento: "",
        passwordHash: "",
        fechaCreacion: new Date().toISOString(),
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadPublicData();
      await loadPrivateData(user.rol);

      onSuccess(user.rol);

      setIsAuthTransitioning(false);
      toast.success("¡Bienvenido!", {
        description: `Has iniciado sesión como ${user.nombres}`,
      });

      return true;
    } catch (error: any) {
      setIsAuthTransitioning(false);
      if (
        error.response?.status === 403 &&
        error.response?.data?.code === "USER_INACTIVE"
      ) {
        setShowInactiveModal(true);
        return false;
      }
      toast.error("Error al iniciar sesión", {
        description: error.response?.data?.message || "Credenciales incorrectas",
      });
      return false;
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await authService.register({
        nombres: data.nombre,
        apellidos: data.apellido,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        id_rol: data.rol === "admin" ? 1 : 2,
        tipo_documento: data.tipoDocumento,
        documento: data.documento,
        direccion: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
      });

      toast.success("¡Casi listo!", {
        description: "Revisa tu correo para ingresar el código de verificación",
      });
    } catch (error: any) {
      toast.error("Error al registrar", {
        description: error.message,
      });
      throw error;
    }
  };

  const handleVerifyEmail = async (
    email: string,
    code: string,
    onSuccess: (role: string) => void
  ) => {
    try {
      setAuthTransitionMessage("Verificando cuenta...");
      setIsAuthTransitioning(true);

      await authService.verifyEmail(email, code);
      const profile = await authService.getProfile();

      const user = {
        id: profile.id_usuario.toString(),
        nombres: profile.nombres,
        apellidos: profile.apellidos,
        email: profile.email,
        telefono: profile.telefono,
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        departamento: profile.departamento || "",
        id_rol: Number(profile.id_rol),
        foto_perfil: profile.foto_perfil,
        rol:
          Number(profile.id_rol) === 1
            ? ("admin" as const)
            : Number(profile.id_rol) === 2
            ? ("cliente" as const)
            : ("vendedor" as const),
        permisos: profile.permisos || [],
        estado: "activo" as const,
        tipoDocumento: "CC" as const,
        numeroDocumento: "",
        passwordHash: "",
        fechaCreacion: new Date().toISOString(),
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadPublicData();
      await loadPrivateData(user.rol);

      onSuccess(user.rol);

      setIsAuthTransitioning(false);
      toast.success("¡Cuenta activada!", {
        description: `Bienvenido, ${user.nombres}`,
      });

      return true;
    } catch (error: any) {
      setIsAuthTransitioning(false);
      toast.error("Error en verificación", {
        description: error.message || "Código inválido",
      });
      return false;
    }
  };

  const handleLogout = async (onSuccess: () => void) => {
    setAuthTransitionMessage("Cerrando sesión...");
    setIsAuthTransitioning(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    clearCarrito();

    onSuccess();

    setIsAuthTransitioning(false);
    toast.info("Sesión cerrada", {
      description: "Has cerrado sesión correctamente",
    });
  };

  return {
    isAuthenticated,
    isLoading,
    isAuthTransitioning,
    authTransitionMessage,
    showInactiveModal,
    setShowInactiveModal,
    checkAuth,
    handleLogin,
    handleRegister,
    handleVerifyEmail,
    handleLogout,
  };
}
