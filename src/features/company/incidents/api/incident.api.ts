/**
 * ============================================================================
 * MODULE : Incidents & Demandes d'Intervention - API Client
 * ============================================================================
 * Ce fichier gère tous les appels HTTP vers `/api/Incidents`
 * pour le signalement, la validation et le suivi des pannes.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateIncidentDto, IncidentUrgency } from '../types/incident.types';

/**
 * Convertit le niveau d'urgence textuel vers l'entier enum backend :
 * 1: Basse, 2: Normale, 3: Haute, 4: Urgente (Critique)
 */
export const mapUrgencyToInt = (urgency: IncidentUrgency): number => {
  switch (urgency) {
    case 'Faible':   return 1;
    case 'Haute':    return 3;
    case 'Critique': return 4;
    default:         return 2; // Moyenne
  }
};

/**
 * Convertit le statut textuel vers l'entier enum backend StatutDemande :
 * 1: EnAttente, 2: Validee, 3: Rejetee, 4: TransformeeEnOT, 5: Cloturee
 */
export const mapIncidentStatusToInt = (status: string): number => {
  switch (status) {
    case 'Validé':           return 2;
    case 'Rejeté':           return 3;
    case 'Transformé en OT': return 4;
    case 'Clos':             return 5;
    default:                 return 1; // EnAttente / Nouveau
  }
};

/**
 * Récupère toutes les demandes d'intervention de la société
 * GET /api/Incidents
 */
export const fetchIncidentsApiCall = async () => {
  const response = await apiClient.get('/api/Incidents');
  return response.data;
};

/**
 * Récupère un incident par son ID
 * GET /api/Incidents/{id}
 */
export const fetchIncidentByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Incidents/${id}`);
  return response.data;
};

/**
 * Déclare une nouvelle panne machine sur le backend
 * POST /api/Incidents
 */
export const createIncidentApiCall = async (dto: CreateIncidentDto) => {
  const userStr = localStorage.getItem('gmao_current_user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;

  const payload = {
    equipementId: parseInt(dto.equipmentId, 10),
    demandeurId: currentUserId,
    datePanne: new Date().toISOString(),
    description: dto.description,
    priorite: mapUrgencyToInt(dto.urgency),
    statut: 1, // EnAttente
    photoUrl: dto.photoUrl || null,
    commentaireRejet: null
  };

  const response = await apiClient.post('/api/Incidents', payload);
  return response.data;
};

/**
 * Met à jour le statut d'un incident (ex: Validé, Rejeté, Clos)
 * PUT /api/Incidents/{id}
 */
export const updateIncidentStatusApiCall = async (
  id: number | string, 
  status: string, 
  commentaireRejet?: string
) => {
  const payload = {
    id: Number(id),
    statut: mapIncidentStatusToInt(status),
    commentaireRejet: commentaireRejet || null
  };
  const response = await apiClient.put(`/api/Incidents/${id}`, payload);
  return response.data;
};

/**
 * Supprime un incident
 * DELETE /api/Incidents/{id}
 */
export const deleteIncidentApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Incidents/${id}`);
};
