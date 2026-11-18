/**
 * ============================================================================
 * MODULE PARTAGÉ : Gestion des Documents & Pièces Jointes - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Document` pour l'upload, la consultation et la suppression.
 */

import { apiClient } from '@/shared/services/apiClient';
import { DocumentInfo } from '@/shared/types/gmao';

const rawUrl = import.meta.env.VITE_API_URL || 'https://gmao-backend-a6r2.onrender.com';
export const BASE_URL = rawUrl.replace(/\/api\/?$/, '');

/**
 * Téléverse un document vers le backend
 * POST /api/Document/upload
 */
export const uploadDocumentApi = async (formData: FormData): Promise<DocumentInfo> => {
  const response = await apiClient.post('/api/Document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const d = response.data;
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    size: d.size,
    url: d.url?.startsWith('http') ? d.url : `${BASE_URL}${d.url}`,
    uploadedAt: d.createdAt,
  };
};

/**
 * Supprime un document par son identifiant
 * DELETE /api/Document/{id}
 */
export const deleteDocumentApi = async (documentId: number): Promise<void> => {
  await apiClient.delete(`/api/Document/${documentId}`);
};

/**
 * Récupère la liste des documents rattachés à un équipement
 * GET /api/Document/equipement/{equipmentId}
 */
export const fetchEquipmentDocumentsApi = async (equipmentId: number): Promise<DocumentInfo[]> => {
  const response = await apiClient.get(`/api/Document/equipement/${equipmentId}`);
  return response.data.map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    size: d.size,
    url: d.url?.startsWith('http') ? d.url : `${BASE_URL}${d.url}`,
    uploadedAt: d.createdAt,
  }));
};
