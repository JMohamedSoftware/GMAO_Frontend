/**
 * ============================================================================
 * MODULE : Magasin & Pièces de Rechange (Inventory) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Pieces`, `/api/FamillePieces`, et `/api/MouvementsStock`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { type SparePart } from '@/shared/types/gmao';
import { type CreateSparePartDto, type CreateStockMovementDto } from '../types/inventory.types';

let cachedCategories: { id: number, nom: string }[] | null = null;

export const fetchPieceCategoriesApi = async () => {
  const response = await apiClient.get('/api/FamillePieces');
  return response.data;
};

export const createPieceCategoryApi = async (nom: string) => {
  const response = await apiClient.post('/api/FamillePieces', { nom });
  return response.data;
};

const getCategoryIdByName = async (catName: string): Promise<number> => {
  if (!catName) return 1;
  if (!cachedCategories) {
    cachedCategories = await fetchPieceCategoriesApi();
  }
  let cat = cachedCategories?.find(c => c.nom.toLowerCase() === catName.toLowerCase());
  if (!cat) {
    cat = await createPieceCategoryApi(catName);
    if (cachedCategories && cat) {
      cachedCategories.push(cat);
    }
  }
  return cat?.id || 1;
};

/**
 * Récupère toutes les pièces de rechange pour l'état global Redux
 * GET /api/Pieces
 */
export const fetchParts = async (): Promise<SparePart[]> => {
  if (!cachedCategories) {
    cachedCategories = await fetchPieceCategoriesApi();
  }
  const response = await apiClient.get('/api/Pieces');
  return response.data.map((p: any) => {
    const cat = cachedCategories?.find(c => c.id === p.famillePieceId);
    return {
      id: p.id?.toString(),
      ref: p.reference,
      name: p.designation,
      category: cat ? cat.nom : 'Autre',
      supplierId: p.fournisseurId?.toString() || '',
      stockCurrent: p.stockActuel || 0,
      stockMin: p.stockMinimum || 0,
      stockMax: p.stockMaximum || 100,
      unitPrice: p.prixUnitaire || 0,
      location: p.emplacement || '',
      photo: p.photoUrl
    };
  });
};

/**
 * Crée une nouvelle pièce de rechange
 * POST /api/Pieces
 */
export const createPartApi = async (part: SparePart): Promise<any> => {
  const catId = await getCategoryIdByName(part.category);
  const rawTenant = localStorage.getItem('gmao_impersonated_tenant_id') || localStorage.getItem('gmao_current_tenant_id');
  const parsed = Number(rawTenant);
  const tenantId = !isNaN(parsed) && parsed > 0 ? parsed : 1;

  const payload = {
    reference: part.ref,
    designation: part.name,
    famillePieceId: catId,
    fournisseurId: part.supplierId && !isNaN(parseInt(part.supplierId)) ? parseInt(part.supplierId) : null,
    stockActuel: Number(part.stockCurrent) || 0,
    stockMinimum: Number(part.stockMin) || 0,
    stockMaximum: Number(part.stockMax) || 100,
    prixUnitaire: Number(part.unitPrice) || 0,
    emplacement: part.location || '',
    photoUrl: part.photo || null,
    societeId: tenantId
  };
  const response = await apiClient.post('/api/Pieces', payload);
  return response.data;
};

/**
 * Met à jour une pièce de rechange
 * PUT /api/Pieces/{id}
 */
export const updatePartApi = async (id: string, part: SparePart): Promise<any> => {
  const catId = await getCategoryIdByName(part.category);
  const rawTenant = localStorage.getItem('gmao_impersonated_tenant_id') || localStorage.getItem('gmao_current_tenant_id');
  const parsed = Number(rawTenant);
  const tenantId = !isNaN(parsed) && parsed > 0 ? parsed : 1;

  const payload = {
    id: parseInt(id),
    reference: part.ref,
    designation: part.name,
    famillePieceId: catId,
    fournisseurId: part.supplierId && !isNaN(parseInt(part.supplierId)) ? parseInt(part.supplierId) : null,
    stockActuel: Number(part.stockCurrent) || 0,
    stockMinimum: Number(part.stockMin) || 0,
    stockMaximum: Number(part.stockMax) || 100,
    prixUnitaire: Number(part.unitPrice) || 0,
    emplacement: part.location || '',
    photoUrl: part.photo || null,
    societeId: tenantId
  };
  const response = await apiClient.put(`/api/Pieces/${id}`, payload);
  return response.data;
};

export const mapBackendMovementTypeToUi = (type: number): 'in' | 'out' | 'inventaire' => {
  if (type === 1 || type === 3) return 'in';
  if (type === 5) return 'inventaire';
  return 'out';
};

export const mapBackendMovementTypeLabel = (type: number): string => {
  switch (type) {
    case 1: return 'Achat / Entrée';
    case 2: return 'Sortie / Maintenance';
    case 3: return 'Retour';
    case 4: return 'Casse / Rebut';
    case 5: return 'Inventaire physique';
    default: return 'Mouvement';
  }
};

export const mapBackendMovement = (m: any) => ({
  id: `MVT-${new Date(m.date || Date.now()).getFullYear()}-${(m.id || 0).toString().padStart(3, '0')}`,
  date: m.date,
  partRef: m.piece?.reference || m.pieceId?.toString(),
  qty: Number(m.quantite ?? 0),
  type: mapBackendMovementTypeToUi(Number(m.type)),
  typeCode: Number(m.type),
  reason: m.motif || mapBackendMovementTypeLabel(Number(m.type)),
  otId: (m.oTId || m.otId || m.otid || m.oTid)?.toString()
});

/**
 * Enregistre un mouvement de stock
 * POST /api/MouvementsStock
 */
export const createMovementApi = async (movement: {
  pieceId: string;
  qty: number;
  type: 'in' | 'out' | 'inventaire';
  typeCode?: 1 | 2 | 3 | 4 | 5;
  otId?: string;
  reason?: string;
  userId: string;
}): Promise<any> => {
  const pieceId = parseInt(movement.pieceId, 10);
  const userId = parseInt(movement.userId, 10);
  const rawOtId = movement.otId ? String(movement.otId).trim() : '';
  const otId = /^\d+$/.test(rawOtId) ? parseInt(rawOtId, 10) : null;

  if (isNaN(pieceId) || isNaN(userId)) {
    throw new Error(`Invalid IDs: pieceId=${movement.pieceId}, userId=${movement.userId}`);
  }

  const resolvedTypeCode = movement.typeCode
    ?? (movement.type === 'in' ? 1 : movement.type === 'inventaire' ? 5 : 2);

  const payload = {
    pieceId,
    oTId: otId,
    userId,
    type: resolvedTypeCode,
    quantite: movement.qty,
    prixUnitaire: 0,
    prixTotal: 0,
    motif: movement.reason || mapBackendMovementTypeLabel(resolvedTypeCode)
  };
  const response = await apiClient.post('/api/MouvementsStock', payload);
  return response.data;
};

/**
 * Récupère tous les mouvements de stock
 * GET /api/MouvementsStock
 */
export const fetchMovements = async (): Promise<any[]> => {
  const response = await apiClient.get('/api/MouvementsStock');
  return (response.data || []).map(mapBackendMovement);
};

export const fetchPartsApiCall = async () => {
  const response = await apiClient.get('/api/Pieces');
  return response.data;
};

export const fetchPartByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Pieces/${id}`);
  return response.data;
};

export const createPartApiCall = async (dto: CreateSparePartDto) => {
  const response = await apiClient.post('/api/Pieces', dto);
  return response.data;
};

export const updatePartApiCall = async (id: number | string, dto: Partial<CreateSparePartDto>) => {
  const response = await apiClient.put(`/api/Pieces/${id}`, { id: Number(id), ...dto });
  return response.data;
};

export const deletePartApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Pieces/${id}`);
};

export const fetchStockMovementsApiCall = async () => {
  const response = await apiClient.get('/api/MouvementsStock');
  return response.data;
};

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
