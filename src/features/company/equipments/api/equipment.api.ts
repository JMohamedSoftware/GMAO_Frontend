/**
 * ============================================================================
 * MODULE : Parc Équipements & Machines - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Equipement` pour la gestion des machines industrielles.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateEquipmentDto } from '../types/equipment.types';

/**
 * Récupère tous les équipements de l'entreprise
 * GET /api/equipement
 */
export const fetchEquipmentsApiCall = async () => {
  const response = await apiClient.get('/api/equipement');
  return response.data;
};

/**
 * Récupère un équipement par son ID
 * GET /api/equipement/{id}
 */
export const fetchEquipmentByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/equipement/${id}`);
  return response.data;
};

/**
 * Crée un nouvel équipement
 * POST /api/equipement
 */
export const createEquipmentApiCall = async (dto: CreateEquipmentDto) => {
  const payload = {
    code: dto.code || `EQ-${Date.now()}`,
    designation: dto.name,
    familleId: dto.familleId || 1,
    localisationId: dto.localisationId || 1,
    marque: dto.marque || '',
    modele: dto.modele || '',
    numeroSerie: dto.numeroSerie || '',
    criticite: dto.criticite || 1,
    etat: dto.etat || 1,
    notes: dto.notes || '',
    hoursCount: dto.hoursCount || 0
  };
  const response = await apiClient.post('/api/equipement', payload);
  return response.data;
};

/**
 * Met à jour un équipement
 * PUT /api/equipement/{id}
 */
export const updateEquipmentApiCall = async (id: number | string, data: any) => {
  const response = await apiClient.put(`/api/equipement/${id}`, data);
  return response.data;
};

/**
 * Supprime un équipement
 * DELETE /api/equipement/{id}
 */
export const deleteEquipmentApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/equipement/${id}`);
};
