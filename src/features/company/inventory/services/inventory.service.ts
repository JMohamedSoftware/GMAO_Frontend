import { apiClient } from '@/shared/services/apiClient';

export interface SparePartDto {
  id?: number;
  reference: string;
  designation: string;
  famillePieceId?: number;
  stockActuel: number;
  stockMinimum: number;
  prixUnitaire: number;
  emplacement?: string;
  fournisseurId?: number;
}

export interface StockMovementDto {
  pieceId: number;
  typeMouvement: number; // 1 = Entree, 2 = Sortie, 3 = Retour, 4 = Casse, 5 = Inventaire
  quantite: number;
  date?: string;
  ordreTravailId?: number | null;
  utilisateurId?: number | null;
  commentaire?: string;
}

export const inventoryService = {
  getParts: async () => {
    const res = await apiClient.get('/api/Pieces');
    return res.data;
  },

  getPartById: async (id: number | string) => {
    const res = await apiClient.get(`/api/Pieces/${id}`);
    return res.data;
  },

  createPart: async (dto: SparePartDto) => {
    const res = await apiClient.post('/api/Pieces', dto);
    return res.data;
  },

  updatePart: async (id: number | string, dto: Partial<SparePartDto>) => {
    const res = await apiClient.put(`/api/Pieces/${id}`, { id, ...dto });
    return res.data;
  },

  deletePart: async (id: number | string) => {
    await apiClient.delete(`/api/Pieces/${id}`);
  },

  getMovements: async () => {
    const res = await apiClient.get('/api/MouvementsStock');
    return res.data;
  },

  createMovement: async (dto: StockMovementDto) => {
    const userStr = localStorage.getItem('gmao_current_user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;

    const payload = {
      ...dto,
      utilisateurId: dto.utilisateurId || currentUserId
    };

    const res = await apiClient.post('/api/MouvementsStock', payload);
    return res.data;
  }
};
