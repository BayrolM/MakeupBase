import api from '../lib/api';

export const saleService = {
  getAll: async () => {
    const { data } = await api.get('/ventas');
    return data;
  },
  
  create: async (payload: any) => {
    const { data } = await api.post('/ventas', payload);
    return data;
  },
  
  annul: async (id: number) => {
    const { data } = await api.put(`/ventas/anular/${id}`);
    return data;
  }
};
