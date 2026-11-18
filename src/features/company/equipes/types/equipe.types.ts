/**
 * ============================================================================
 * MODULE : Équipes de Maintenance (Equipes) - Types & DTOs
 * ============================================================================
 * Définit la structure des équipes techniques (Mécanique, Électrique, etc.).
 */

export interface EquipeModel {
  id: string;
  nom: string;
  chefId?: number | null;
  chefName?: string;
  technicienIds: number[];
  technicienCount?: number;
  societeId?: number;
}

export interface CreateEquipeDto {
  nom: string;
  chefId?: number | null;
  technicienIds?: number[];
  societeId?: number;
}

export interface UpdateEquipeDto {
  id: number;
  nom?: string;
  chefId?: number | null;
  technicienIds?: number[];
}
