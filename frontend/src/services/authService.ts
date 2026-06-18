import api from "../lib/api";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  tipo_documento?: string;
  documento?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  id_rol?: number;
}

export interface UserProfile {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  id_rol: number;  
  foto_perfil?: string;
  permisos?: string[];
}

export const authService = {
    /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        return token;
      }

      throw new Error("No se recibió token del servidor");
    } catch (error: any) {
      // Re-lanzar el error original para que el caller pueda inspeccionar el código
      if (error.response?.status === 403) {
        throw error;
      }
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(message);
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await api.post("/auth/register", {
        ...userData,
        id_rol: userData.id_rol || 2, // 2 = cliente por defecto
      });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al registrar usuario";
      throw new Error(message);
    }
  },

  /**
   * Verificar correo electrónico con código
   */
  async verifyEmail(email: string, code: string): Promise<any> {
    try {
      const response = await api.post("/auth/verify-email", { email, code });
      const { token } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al verificar el correo";
      throw new Error(message);
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al obtener perfil";
      throw new Error(message);
    }
  },

  /**
   * Actualizar perfil
   */
  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    try {
      await api.put("/users/profile", data);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al actualizar perfil";
      throw new Error(message);
    }
  },

  /**
   * Solicitar código para cambiar contraseña
   */
  async requestPasswordChangeCode(): Promise<void> {
    try {
      await api.post("/users/profile/password/code");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al solicitar el código";
      throw new Error(message);
    }
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(newPassword: string, verificationCode: string): Promise<void> {
    try {
      await api.put("/users/profile/password", { newPassword, verificationCode });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al cambiar la contraseña";
      throw new Error(message);
    }
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem("authToken");
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al solicitar recuperación";
      throw new Error(message);
    }
  },

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(token: string, new_password: string): Promise<void> {
    try {
      await api.post("/auth/reset-password", { token, new_password });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al restablecer contraseña";
      throw new Error(message);
    }
  },

  /**
   * Verificar si un correo está registrado
   */
  async checkEmail(email: string): Promise<boolean> {
    try {
      const response = await api.post("/auth/check-email", { email });
      return !!response.data.registered;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verificar código de recuperación de contraseña
   */
  async verifyResetCode(email: string, code: string): Promise<boolean> {
    try {
      const response = await api.post("/auth/verify-reset-code", { email, code });
      return !!response.data.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verificar si un documento está registrado
   */
  async checkDocument(documento: string, tipoDocumento?: string): Promise<boolean> {
    try {
      const response = await api.post("/auth/check-document", { documento, tipoDocumento });
      return !!response.data.registered;
    } catch (error) {
      return false;
    }
  },
};
