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

export interface SignedUrlResponse {
  url: string;
  expiresInSeconds: number;
  isExternalSignedUrl: boolean;
  provider: string;
}

/**
 * Récupère une Signed URL temporaire (Supabase Storage privé) ou l'endpoint authentifié local.
 * GET /api/Document/{id}/signed-url
 */
export const getDocumentSignedUrlApi = async (
  documentId: number,
  expiresInSeconds = 120
): Promise<SignedUrlResponse> => {
  const response = await apiClient.get(`/api/Document/${documentId}/signed-url`, {
    params: { expiresIn: expiresInSeconds },
  });
  return response.data;
};

/**
 * Ouvre un document de manière authentifiée (Signed URL Supabase temporaire ou Blob JWT).
 * Remplace les anciens liens <a href={doc.url}> qui échouaient en 401 faute de Bearer token.
 */
export const openDocumentApi = async (doc: { id?: number; url?: string; name?: string }): Promise<void> => {
  if (doc.id) {
    try {
      const signed = await getDocumentSignedUrlApi(doc.id, 120);
      if (signed.isExternalSignedUrl && signed.url) {
        window.open(signed.url, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch {
      // Fallback vers téléchargement authentifié par endpoint backend /file
    }

    const res = await apiClient.get(`/api/Document/${doc.id}/file`, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(res.data);
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }

  if (doc.url) {
    window.open(doc.url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Télécharge un document via l'API authentifiée (avec Bearer token).
 */
export const downloadDocumentApi = async (doc: { id?: number; url?: string; name?: string }): Promise<void> => {
  if (!doc.id) {
    if (doc.url) window.open(doc.url, '_blank', 'noopener,noreferrer');
    return;
  }

  const res = await apiClient.get(`/api/Document/${doc.id}/file`, { responseType: 'blob' });
  const objectUrl = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = doc.name || `document-${doc.id}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 15_000);
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
