/**
 * ============================================================================
 * MODULE : Ordres de Travail (Work Orders) - API Client
 * ============================================================================
 * Ce fichier gère tous les appels HTTP directs vers le contrôleur backend
 * ASP.NET Core `/api/OrdresTravail` via l'instance `apiClient`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../types/workOrder.types';

/**
 * Convertit le type de maintenance textuel vers l'entier enum du backend C# :
 * 1: Corrective, 2: Preventive, 3: Predictive, 4: Ameliorative, 5: SousTraitance
 */
export const mapWorkOrderTypeToInt = (type: string): number => {
  switch (type) {
    case 'Préventif':   return 2;
    case 'Prédictif':   return 3;
    case 'Amélioratif': return 4;
    default:            return 1; // Correctif
  }
};

/**
 * Convertit la priorité textuelle vers l'entier enum du backend C# :
 * 1: Basse, 2: Normale, 3: Haute, 4: Urgente (Critique)
 */
export const mapWorkOrderPriorityToInt = (priority: string): number => {
  switch (priority) {
    case 'Faible':   return 1;
    case 'Haute':    return 3;
    case 'Critique': return 4;
    default:         return 2; // Moyenne
  }
};

/**
 * Récupère tous les ordres de travail de l'entreprise connectée (scopé par tenant)
 * GET /api/OrdresTravail
 */
export const fetchWorkOrdersApi = async () => {
  const response = await apiClient.get('/api/OrdresTravail');
  return response.data;
};

/**
 * Récupère un ordre de travail spécifique par son identifiant
 * GET /api/OrdresTravail/{id}
 */
export const fetchWorkOrderByIdApi = async (id: number | string) => {
  const response = await apiClient.get(`/api/OrdresTravail/${id}`);
  return response.data;
};

/**
 * Crée un nouvel ordre de travail sur le backend.
 * Le backend génère automatiquement le numéro séquentiel `OT-YYYY-001`
 * et lie l'OT à la campagne industrielle active.
 * POST /api/OrdresTravail
 */
export const createWorkOrderApiCall = async (dto: CreateWorkOrderDto) => {
  const userStr = localStorage.getItem('gmao_current_user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;

  const payload = {
    numeroOT: '', // Laisser vide : le backend génère le numéro officiel séquentiel
    demandeId: dto.incidentId ? parseInt(dto.incidentId, 10) : null,
    equipementId: parseInt(dto.equipmentId, 10),
    responsableId: dto.responsableId || currentUserId || 1,
    technicienId: dto.technicianId ? parseInt(dto.technicianId, 10) : null,
    priorite: mapWorkOrderPriorityToInt(dto.priority),
    typeMaintenance: mapWorkOrderTypeToInt(dto.type),
    statut: 1, // 1 = Créé
    dateCreation: new Date().toISOString(),
    dateDebutPrevue: dto.dateDebutPrevue || null,
    dateFinPrevue: dto.dateFinPrevue || null,
    description: dto.title || dto.description,
    instructions: dto.description || null,
    campagneId: dto.campagneId || null
  };

  const response = await apiClient.post('/api/OrdresTravail', payload);
  return response.data;
};

/**
 * Met à jour un ordre de travail existant
 * PUT /api/OrdresTravail/{id}
 */
export const updateWorkOrderApiCall = async (id: number | string, dto: Partial<UpdateWorkOrderDto>) => {
  const response = await apiClient.put(`/api/OrdresTravail/${id}`, { id: Number(id), ...dto });
  return response.data;
};

/**
 * Supprime un ordre de travail
 * DELETE /api/OrdresTravail/{id}
 */
export const deleteWorkOrderApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/OrdresTravail/${id}`);
};
