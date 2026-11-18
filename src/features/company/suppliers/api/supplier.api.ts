/**
 * ============================================================================
 * MODULE : Fournisseurs & Prestataires (Suppliers) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Fournisseurs`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateSupplierDto, UpdateSupplierDto } from '../types/supplier.types';

/**
 * Récupère tous les fournisseurs
 * GET /api/Fournisseurs
 */
export const fetchSuppliersApiCall = async () => {
  const response = await apiClient.get('/api/Fournisseurs');
  return response.data;
};

/**
 * Récupère un fournisseur par son identifiant
 * GET /api/Fournisseurs/{id}
 */
export const fetchSupplierByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Fournisseurs/${id}`);
  return response.data;
};

/**
 * Enregistre un nouveau fournisseur
 * POST /api/Fournisseurs
 */
export const createSupplierApiCall = async (dto: CreateSupplierDto) => {
  const response = await apiClient.post('/api/Fournisseurs', dto);
  return response.data;
};

/**
 * Met à jour les coordonnées d'un fournisseur
 * PUT /api/Fournisseurs/{id}
 */
export const updateSupplierApiCall = async (id: number | string, dto: Partial<UpdateSupplierDto>) => {
  const response = await apiClient.put(`/api/Fournisseurs/${id}`, { id: Number(id), ...dto });
  return response.data;
};

/**
 * Supprime un fournisseur
 * DELETE /api/Fournisseurs/{id}
 */
export const deleteSupplierApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Fournisseurs/${id}`);
};
