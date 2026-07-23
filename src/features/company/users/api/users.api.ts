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
  createUser: async (payload: CreateUserPayload) => {
    const response = await apiClient.post('/api/users', payload);
    return response.data;
  }
};
