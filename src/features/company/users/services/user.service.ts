import { apiClient } from '@/shared/services/apiClient';

export interface UserDto {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  roleId: number;
  telephone?: string;
  societeId?: number;
}

export const userService = {
  getAll: async () => {
    const res = await apiClient.get('/api/Users');
    return res.data;
  },

  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/Users/${id}`);
    return res.data;
  },

  create: async (dto: UserDto) => {
    const res = await apiClient.post('/api/Users', dto);
    return res.data;
  },

  update: async (id: number | string, dto: Partial<UserDto>) => {
    const res = await apiClient.put(`/api/Users/${id}`, { id, ...dto });
    return res.data;
  },

  delete: async (id: number | string) => {
    await apiClient.delete(`/api/Users/${id}`);
  }
};
