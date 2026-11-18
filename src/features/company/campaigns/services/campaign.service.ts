import { apiClient } from '@/shared/services/apiClient';
import { Campagne, CreateCampagneDto, UpdateCampagneDto, EtatCampagne } from '../types/campaign.types';

export const campaignService = {
  getAll: async (): Promise<Campagne[]> => {
    const res = await apiClient.get<Campagne[]>('/api/Campagnes');
    return res.data;
  },

  getById: async (id: number): Promise<Campagne> => {
    const res = await apiClient.get<Campagne>(`/api/Campagnes/${id}`);
    return res.data;
  },

  create: async (dto: CreateCampagneDto): Promise<Campagne> => {
    const res = await apiClient.post<Campagne>('/api/Campagnes', dto);
    return res.data;
  },

  update: async (id: number, dto: UpdateCampagneDto): Promise<void> => {
    await apiClient.put(`/api/Campagnes/${id}`, dto);
  },

  cloturer: async (id: number): Promise<void> => {
    await apiClient.put(`/api/Campagnes/${id}`, { etat: EtatCampagne.Terminee });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Campagnes/${id}`);
  }
};
