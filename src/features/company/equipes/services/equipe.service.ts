import { apiClient } from '@/shared/services/apiClient';

export interface EquipeDto {
  id?: number;
  nom: string;
  chefId?: number | null;
  technicienIds?: number[];
  societeId?: number;
}

export const equipeService = {
  getAll: async () => {
    const res = await apiClient.get('/api/Equipes');
    return res.data;
  },

  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/Equipes/${id}`);
    return res.data;
  },

  create: async (dto: EquipeDto) => {
    const res = await apiClient.post('/api/Equipes', dto);
    return res.data;
  },

  update: async (id: number | string, dto: Partial<EquipeDto>) => {
    const res = await apiClient.put(`/api/Equipes/${id}`, { id, ...dto });
    return res.data;
  },

  delete: async (id: number | string) => {
    await apiClient.delete(`/api/Equipes/${id}`);
  }
};
