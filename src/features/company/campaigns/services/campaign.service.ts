/**
 * ============================================================================
 * MODULE : Campagnes & Saisons Industrielles - Service Métier
 * ============================================================================
 * Encapsule la gestion des campagnes saisonnières de l'usine :
 * - Planification et ouverture d'une saison
 * - Activation de la campagne en cours
 * - Clôture et archivage des données d'interventions
 */

import { 
  fetchCampaignsApiCall, 
  fetchCampaignByIdApiCall, 
  createCampaignApiCall, 
  updateCampaignApiCall, 
  cloturerCampaignApiCall, 
  deleteCampaignApiCall 
} from '../api/campaign.api';
import { CreateCampagneDto, UpdateCampagneDto } from '../types/campaign.types';

export const campaignService = {
  /**
   * Récupère la liste de toutes les campagnes
   */
  getAll: async () => {
    return await fetchCampaignsApiCall();
  },

  /**
   * Récupère une campagne par son identifiant
   */
  getById: async (id: number) => {
    return await fetchCampaignByIdApiCall(id);
  },

  /**
   * Crée une nouvelle campagne
   */
  create: async (dto: CreateCampagneDto) => {
    return await createCampaignApiCall(dto);
  },

  /**
   * Met à jour une campagne
   */
  update: async (id: number, dto: UpdateCampagneDto) => {
    return await updateCampaignApiCall(id, dto);
  },

  /**
   * Clôture la campagne active et fige ses données
   */
  cloturer: async (id: number) => {
    return await cloturerCampaignApiCall(id);
  },

  /**
   * Supprime une campagne
   */
  delete: async (id: number) => {
    return await deleteCampaignApiCall(id);
  }
};
