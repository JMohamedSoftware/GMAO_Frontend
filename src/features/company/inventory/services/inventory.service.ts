/**
 * ============================================================================
 * MODULE : Magasin & Pièces de Rechange (Inventory) - Service Métier
 * ============================================================================
 * Encapsule la gestion du stock :
 * - Gestion du catalogue des pièces et seuils d'alerte (Stock min)
 * - Mouvements d'entrée et de sortie sur ordre de travail
 * - Valorisation financière du stock
 */

import { 
  fetchPartsApiCall, 
  fetchPartByIdApiCall, 
  createPartApiCall, 
  updatePartApiCall, 
  deletePartApiCall,
  fetchStockMovementsApiCall,
  createStockMovementApiCall
} from '../api/inventory.api';
import { CreateSparePartDto, CreateStockMovementDto } from '../types/inventory.types';

export const inventoryService = {
  /**
   * Récupère la liste de toutes les pièces en stock
   */
  getParts: async () => {
    return await fetchPartsApiCall();
  },

  /**
   * Récupère une pièce par son ID
   */
  getPartById: async (id: number | string) => {
    return await fetchPartByIdApiCall(id);
  },

  /**
   * Crée une nouvelle pièce dans le magasin
   */
  createPart: async (dto: CreateSparePartDto) => {
    return await createPartApiCall(dto);
  },

  /**
   * Met à jour les paramètres d'une pièce
   */
  updatePart: async (id: number | string, dto: Partial<CreateSparePartDto>) => {
    return await updatePartApiCall(id, dto);
  },

  /**
   * Supprime une référence de pièce
   */
  deletePart: async (id: number | string) => {
    await deletePartApiCall(id);
  },

  /**
   * Récupère l'historique des mouvements de stock
   */
  getMovements: async () => {
    return await fetchStockMovementsApiCall();
  },

  /**
   * Enregistre un mouvement de stock
   */
  createMovement: async (dto: CreateStockMovementDto) => {
    return await createStockMovementApiCall(dto);
  }
};
