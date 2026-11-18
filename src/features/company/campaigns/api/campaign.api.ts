/**
 * ============================================================================
 * MODULE : Campagnes & Saisons Industrielles - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Campagnes` pour la gestion des saisons de production.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Campaign } from '@/shared/types/gmao';
import { Campagne, CreateCampagneDto, UpdateCampagneDto, EtatCampagne } from '../types/campaign.types';

/**
 * Récupère toutes les campagnes pour l'état global Redux
 * GET /api/Campagnes
 */
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  const response = await apiClient.get('/api/Campagnes');
  return response.data.map((c: any) => ({
    id: c.id?.toString(),
    name: c.nom,
    startDate: c.dateDebut,
    endDate: c.dateFin,
    status: c.etat === 2 ? 'En cours' : c.etat === 3 ? 'Terminée' : 'Planifiée'
  }));
};

/**
 * Récupère toutes les campagnes typées
 * GET /api/Campagnes
 */
export const fetchCampaignsApiCall = async (): Promise<Campagne[]> => {
  const res = await apiClient.get<Campagne[]>('/api/Campagnes');
  return res.data;
};

/**
 * Récupère une campagne par son identifiant
 * GET /api/Campagnes/{id}
 */
export const fetchCampaignByIdApiCall = async (id: number): Promise<Campagne> => {
  const res = await apiClient.get<Campagne>(`/api/Campagnes/${id}`);
  return res.data;
};

/**
 * Crée une nouvelle campagne industrielle
 * POST /api/Campagnes
 */
export const createCampaignApiCall = async (dto: CreateCampagneDto): Promise<Campagne> => {
  const res = await apiClient.post<Campagne>('/api/Campagnes', dto);
  return res.data;
};

/**
 * Met à jour une campagne
 * PUT /api/Campagnes/{id}
 */
export const updateCampaignApiCall = async (id: number, dto: UpdateCampagneDto): Promise<void> => {
  await apiClient.put(`/api/Campagnes/${id}`, dto);
};

/**
 * Clôture et archive une campagne
 * POST /api/Campagnes/{id}/cloturer
 */
export const cloturerCampaignApiCall = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/api/Campagnes/${id}/cloturer`);
  } catch {
    await apiClient.put(`/api/Campagnes/${id}`, { id, etat: EtatCampagne.Terminee });
  }
};

/**
 * Supprime une campagne
 * DELETE /api/Campagnes/{id}
 */
export const deleteCampaignApiCall = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/Campagnes/${id}`);
};
