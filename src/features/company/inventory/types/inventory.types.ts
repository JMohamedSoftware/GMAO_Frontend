/**
 * ============================================================================
 * MODULE : Magasin & Pièces de Rechange (Inventory) - Types & DTOs
 * ============================================================================
 * Ce fichier définit les modèles et DTOs pour la gestion des pièces détachées,
 * des seuils de stock et des mouvements d'entrée/sortie.
 */

/**
 * Types de mouvements de stock autorisés :
 * 1: Entrée (Réception fournisseur ou achat)
 * 2: Sortie (Consommation sur ordre de travail)
 * 3: Retour (Restitution de pièce non utilisée)
 * 4: Casse (Perte, dommage ou rebut)
 * 5: Inventaire (Régularisation suite à comptage physique)
 */
export type StockMovementType = 'in' | 'out';

export interface SparePartModel {
  id: string;
  ref: string;
  name: string;
  category?: string;
  stockCurrent: number;
  stockMin: number;
  unitPrice: number;
  location?: string;
  supplierId?: string;
  supplierName?: string;
  lastOrderDate?: string;
}

export interface StockMovementModel {
  id: string;
  date: string;
  partRef: string;
  partName?: string;
  type: StockMovementType;
  qty: number;
  category?: string;
  reason?: string;
  workOrderId?: string;
  user?: string;
}

export interface CreateSparePartDto {
  reference: string;
  designation: string;
  famillePieceId?: number;
  stockActuel: number;
  stockMinimum: number;
  prixUnitaire: number;
  emplacement?: string;
  fournisseurId?: number;
}

export interface CreateStockMovementDto {
  pieceId: number;
  typeMouvement: number; // 1: Entree, 2: Sortie, 3: Retour, 4: Casse, 5: Inventaire
  quantite: number;
  date?: string;
  ordreTravailId?: number | null;
  utilisateurId?: number | null;
  commentaire?: string;
}
