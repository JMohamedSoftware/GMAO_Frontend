/**
 * ============================================================================
 * MODULE : Incidents & Demandes d'Intervention - API Client
 * ============================================================================
 * Ce fichier gère tous les appels HTTP vers `/api/Incidents`
 * pour le signalement, la validation et le suivi des pannes.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Incident } from '@/shared/types/gmao';
import { CreateIncidentDto, IncidentUrgency } from '../types/incident.types';

export interface CreateIncidentPayload {
  equipmentId: string;
  description: string;
  urgency: string;
  demandeurId?: number;
  reportedBy?: string;
  photo?: string;
}

export const mapUrgencyToInt = (urgency: IncidentUrgency | string): number => {
  switch (urgency) {
    case 'Faible':   return 1;
    case 'Haute':    return 3;
    case 'Critique': return 4;
    default:         return 2; // Moyenne
  }
};

export const mapIncidentStatusToInt = (status: string): number => {
  switch (status) {
    case 'Validé':           return 2;
    case 'Rejeté':           return 3;
    case 'Transformé en OT': return 4;
    case 'Clos':             return 5;
    default:                 return 1; // EnAttente / Nouveau
  }
};

const intToUrgency = (n: number): Incident['urgency'] => {
  switch (n) {
    case 1:  return 'Faible';
    case 3:  return 'Haute';
    case 4:  return 'Critique';
    default: return 'Moyenne';
  }
};

const intToStatus = (n: number): Incident['status'] => {
  switch (n) {
    case 2:  return 'Validé';
    case 3:  return 'Rejeté';
    case 4:  return 'Transformé en OT';
    case 5:  return 'Clos';
    default: return 'Nouveau';
  }
};

/**
 * Récupère toutes les demandes d'intervention pour Redux
 * GET /api/Incidents
 */
export const fetchIncidents = async (): Promise<Incident[]> => {
  const response = await apiClient.get('/api/Incidents');
  return response.data.map((i: any) => ({
    id: i.id?.toString(),
    equipmentId: i.equipementId?.toString(),
    reportedBy: i.demandeurId?.toString(),
    reportedDate: i.datePanne,
    urgency: intToUrgency(i.priorite),
    status: intToStatus(i.statut),
    description: i.description,
    photo: i.photoUrl || undefined,
    commentaireRejet: i.commentaireRejet || undefined,
  }));
};

/**
 * Crée un nouvel incident
 * POST /api/Incidents
 */
export const createIncidentApi = async (payload: CreateIncidentPayload): Promise<Incident> => {
  const userStr = localStorage.getItem('gmao_current_user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj?.id && /^\d+$/.test(String(userObj.id)) ? parseInt(userObj.id, 10) : undefined;
  const resolvedDemandeurId = payload.demandeurId || currentUserId || 1;

  const body = {
    equipementId: parseInt(payload.equipmentId, 10),
    demandeurId: resolvedDemandeurId,
    datePanne: new Date().toISOString(),
    description: payload.description,
    priorite: mapUrgencyToInt(payload.urgency),
    statut: 1,
    photoUrl: payload.photo || null,
  };
  const response = await apiClient.post('/api/Incidents', body);
  const i = response.data;
  return {
    id: i.id?.toString(),
    equipmentId: i.equipementId?.toString(),
    reportedBy: i.demandeurId?.toString() || payload.reportedBy || (resolvedDemandeurId ? resolvedDemandeurId.toString() : '1'),
    reportedDate: i.datePanne || new Date().toISOString(),
    urgency: payload.urgency as Incident['urgency'],
    status: 'Nouveau',
    description: i.description,
    photo: i.photoUrl || undefined,
  };
};

/**
 * Réaffecte le demandeur / déclarant d'un incident
 * PUT /api/Incidents/{id}
 */
export const updateIncidentDemandeurApi = async (
  incidentId: string,
  demandeurId: number,
  fullIncident: Incident
): Promise<void> => {
  const body = {
    id: parseInt(incidentId, 10),
    equipementId: parseInt(fullIncident.equipmentId, 10),
    demandeurId,
    datePanne: fullIncident.reportedDate,
    description: fullIncident.description,
    priorite: mapUrgencyToInt(fullIncident.urgency),
    statut: mapIncidentStatusToInt(fullIncident.status),
    photoUrl: fullIncident.photo || null,
    commentaireRejet: fullIncident.commentaireRejet || null,
  };
  await apiClient.put(`/api/Incidents/${incidentId}`, body);
};

/**
 * Met à jour le statut d'un incident
 * PUT /api/Incidents/{id}
 */
export const patchIncidentStatusApi = async (
  id: string,
  status: Incident['status'],
  fullIncident: Incident,
  commentaireRejet?: string
): Promise<void> => {
  const body = {
    id: parseInt(id, 10),
    equipementId: parseInt(fullIncident.equipmentId, 10),
    demandeurId: parseInt(fullIncident.reportedBy, 10) || 1,
    datePanne: fullIncident.reportedDate,
    description: fullIncident.description,
    priorite: mapUrgencyToInt(fullIncident.urgency),
    statut: mapIncidentStatusToInt(status),
    photoUrl: fullIncident.photo || null,
    commentaireRejet: commentaireRejet || null,
  };
  await apiClient.put(`/api/Incidents/${id}`, body);
};

export const fetchIncidentsApiCall = async () => {
  const response = await apiClient.get('/api/Incidents');
  return response.data;
};

export const fetchIncidentByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Incidents/${id}`);
  return response.data;
};

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
    statut: 1,
    photoUrl: dto.photoUrl || null,
    commentaireRejet: null
  };

  const response = await apiClient.post('/api/Incidents', payload);
  return response.data;
};

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

export const deleteIncidentApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Incidents/${id}`);
};
