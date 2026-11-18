/**
 * ============================================================================
 * MODULE : Incidents & Demandes d'Intervention - Service Métier
 * ============================================================================
 * Ce service gère le cycle de vie complet des pannes :
 * - Déclaration par les opérateurs ou techniciens
 * - Validation par les responsables
 * - Rejet avec motif justifié
 * - Transition vers OT de réparation
 */

import { 
  fetchIncidentsApiCall, 
  fetchIncidentByIdApiCall, 
  createIncidentApiCall, 
  updateIncidentStatusApiCall, 
  deleteIncidentApiCall 
} from '../api/incident.api';
import { CreateIncidentDto } from '../types/incident.types';

export const incidentService = {
  /**
   * Récupère la liste complète des incidents de l'entreprise
   */
  getAll: async () => {
    return await fetchIncidentsApiCall();
  },

  /**
   * Récupère un incident par son identifiant
   */
  getById: async (id: number | string) => {
    return await fetchIncidentByIdApiCall(id);
  },

  /**
   * Déclare une nouvelle panne machine
   */
  create: async (dto: CreateIncidentDto) => {
    return await createIncidentApiCall(dto);
  },

  /**
   * Valide, rejette ou clôture un incident
   */
  updateStatus: async (id: number | string, status: string, commentaireRejet?: string) => {
    return await updateIncidentStatusApiCall(id, status, commentaireRejet);
  },

  /**
   * Supprime un incident
   */
  delete: async (id: number | string) => {
    await deleteIncidentApiCall(id);
  }
};
