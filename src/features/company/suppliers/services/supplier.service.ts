import { apiClient } from '@/shared/services/apiClient';

export interface SupplierDto {
  id?: number;
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export const supplierService = {
  getAll: async () => {
    const res = await apiClient.get('/api/Fournisseurs');
    return res.data;
  },

  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/Fournisseurs/${id}`);
    return res.data;
  },

  create: async (dto: SupplierDto) => {
    const res = await apiClient.post('/api/Fournisseurs', dto);
    return res.data;
  },

  update: async (id: number | string, dto: Partial<SupplierDto>) => {
    const res = await apiClient.put(`/api/Fournisseurs/${id}`, { id, ...dto });
    return res.data;
  },

  delete: async (id: number | string) => {
    await apiClient.delete(`/api/Fournisseurs/${id}`);
  }
};
