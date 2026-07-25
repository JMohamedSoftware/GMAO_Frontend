import { apiClient } from '../services/apiClient';
import { Localisation } from '../types/gmao';

export const localisationsApi = {
  getAll: async () => {
    const response = await apiClient.get<Localisation[]>('/api/Localisations');
    return response.data;
  },

  getTree: async () => {
    const response = await apiClient.get<Localisation[]>('/api/Localisations/tree');
    return response.data;
  },

  create: async (localisation: Partial<Localisation>) => {
    const response = await apiClient.post<Localisation>('/api/Localisations', localisation);
    return response.data;
  },

  update: async (id: number, localisation: Partial<Localisation>) => {
    const response = await apiClient.put<Localisation>(`/api/Localisations/${id}`, localisation);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/Localisations/${id}`);
    return response.data;
  }
};
