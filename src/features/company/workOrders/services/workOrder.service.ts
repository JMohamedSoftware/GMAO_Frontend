/**
 * ============================================================================
 * MODULE : Ordres de Travail (Work Orders) - Service Métier
 * ============================================================================
 * Ce service encapsule la logique métier des interventions de maintenance :
 * - Création et validation des OTs
 * - Suivi du cycle de vie (statuts, affectations, durées)
 * - Liaison avec les équipements et campagnes
 */

import { 
  fetchWorkOrdersApi, 
  fetchWorkOrderByIdApi, 
  createWorkOrderApiCall, 
  updateWorkOrderApiCall, 
  deleteWorkOrderApiCall 
} from '../api/workOrder.api';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../types/workOrder.types';

export const workOrderService = {
  /**
   * Récupère la liste complète des ordres de travail de la société
   */
  getAll: async () => {
    return await fetchWorkOrdersApi();
  },

  /**
   * Récupère un ordre de travail spécifique par son ID
   */
  getById: async (id: number | string) => {
    return await fetchWorkOrderByIdApi(id);
  },

  /**
   * Crée un ordre de travail et le lie à la machine et à la campagne en cours
   */
  create: async (dto: CreateWorkOrderDto) => {
    return await createWorkOrderApiCall(dto);
  },

  /**
   * Met à jour les champs généraux d'un ordre de travail
   */
  update: async (id: number | string, dto: Partial<UpdateWorkOrderDto>) => {
    return await updateWorkOrderApiCall(id, dto);
  },

  /**
   * Met à jour uniquement le statut de l'ordre de travail (En cours, Terminé, etc.)
   */
  updateStatus: async (id: number | string, statut: number) => {
    return await updateWorkOrderApiCall(id, { statut });
  },

  /**
   * Supprime définitivement un ordre de travail
   */
  delete: async (id: number | string) => {
    await deleteWorkOrderApiCall(id);
  }
};
