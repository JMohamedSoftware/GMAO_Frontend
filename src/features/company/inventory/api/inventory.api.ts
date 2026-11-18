/**
 * ============================================================================
 * MODULE : Magasin & Pièces de Rechange (Inventory) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Pieces` et `/api/MouvementsStock`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateSparePartDto, CreateStockMovementDto } from '../types/inventory.types';

/**
 * Récupère toutes les pièces de rechange de l'entreprise
 * GET /api/Pieces
 */
export const fetchPartsApiCall = async () => {
  const response = await apiClient.get('/api/Pieces');
  return response.data;
};

/**
 * Récupère une pièce par son identifiant
 * GET /api/Pieces/{id}
 */
export const fetchPartByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Pieces/${id}`);
  return response.data;
};

/**
 * Enregistre une nouvelle référence de pièce de rechange
 * POST /api/Pieces
 */
export const createPartApiCall = async (dto: CreateSparePartDto) => {
  const response = await apiClient.post('/api/Pieces', dto);
  return response.data;
};

/**
 * Met à jour les informations d'une pièce
 * PUT /api/Pieces/{id}
 */
export const updatePartApiCall = async (id: number | string, dto: Partial<CreateSparePartDto>) => {
  const response = await apiClient.put(`/api/Pieces/${id}`, { id: Number(id), ...dto });
  return response.data;
};

/**
 * Supprime une pièce du catalogue
 * DELETE /api/Pieces/{id}
 */
export const deletePartApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Pieces/${id}`);
};

/**
 * Récupère l'historique complet des mouvements d'entrée/sortie de stock
 * GET /api/MouvementsStock
 */
export const fetchStockMovementsApiCall = async () => {
  const response = await apiClient.get('/api/MouvementsStock');
  return response.data;
};

/**
 * Enregistre un mouvement de stock (Entrée, Sortie OT, Inventaire)
 * POST /api/MouvementsStock
 */
export const createStockMovementApiCall = async (dto: CreateStockMovementDto) => {
  const userStr = localStorage.getItem('gmao_current_user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;

  const payload = {
    ...dto,
    utilisateurId: dto.utilisateurId || currentUserId
  };

  const response = await apiClient.post('/api/MouvementsStock', payload);
  return response.data;
};
