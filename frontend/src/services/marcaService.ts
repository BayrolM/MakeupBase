import api from "../lib/api";

export interface Marca {
  id_marca: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export const marcaService = {
  async getAll(params?: { q?: string; page?: number; limit?: number }): Promise<{ ok: boolean; data: Marca[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.get("/marcas", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener marcas",
      );
    }
  },

  getOne: async (id: number) => {
    try {
      const response = await api.get(`/marcas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener marca",
      );
    }
  },
  create: async (data: { nombre: string; descripcion: string }) => {
    try {
      const response = await api.post("/marcas", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al crear marca");
    }
  },
  update: async (id: number, data: any) => {
    try {
      const response = await api.put(`/marcas/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar marca",
      );
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/marcas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar marca",
      );
    }
  },
};
