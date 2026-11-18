/**
 * ============================================================================
 * MODULE : Campagnes & Saisons Industrielles - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Campagnes` pour la gestion des saisons de production.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Campagne, CreateCampagneDto, UpdateCampagneDto, EtatCampagne } from '../types/campaign.types';

/**
 * Récupère toutes les campagnes de l'entreprise
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
 * PUT /api/Campagnes/{id}
 */
export const cloturerCampaignApiCall = async (id: number): Promise<void> => {
  await apiClient.put(`/api/Campagnes/${id}`, { etat: EtatCampagne.Terminee });
};

/**
 * Supprime une campagne
 * DELETE /api/Campagnes/{id}
 */
export const deleteCampaignApiCall = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/Campagnes/${id}`);
};
