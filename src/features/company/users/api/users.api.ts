import { apiClient } from '@/shared/services/apiClient';

export interface CreateUserPayload {
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    roleId: number;
    societeId?: number | null;
    isActive?: boolean;
    avatar?: string;
  };
  password?: string;
  competenceIds?: number[];
}

export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },
  createUser: async (payload: CreateUserPayload) => {
    const response = await apiClient.post('/api/users', payload);
    return response.data;
  },
  updateUser: async (id: string | number, payload: {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    roleId?: number;
    isActive?: boolean;
    avatar?: string;
  }) => {
    const response = await apiClient.put(`/api/users/${id}`, payload);
    return response.data;
  },
  deleteUser: async (id: string | number) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  }
};
