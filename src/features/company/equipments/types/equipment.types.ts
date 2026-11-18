/**
 * ============================================================================
 * MODULE : Parc Équipements & Machines - Types & DTOs
 * ============================================================================
 * Définit la structure des équipements, criticité, états et arbres hiérarchiques.
 */

export type EquipmentStatus = 'En service' | 'En panne' | 'En maintenance' | 'Hors service';
export type EquipmentCriticality = 'Faible' | 'Moyenne' | 'Haute' | 'Critique';

export interface EquipmentModel {
  id: string;
  name: string;
  code?: string;
  category?: string;
  subFamily?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  supplierId?: string;
  purchaseDate?: string;
  commissionDate?: string;
  endOfWarranty?: string;
  status: EquipmentStatus;
  criticality: EquipmentCriticality;
  localisationId?: number;
  location?: string;
  healthIndex?: number;
  hoursCount?: number;
  cycleCount?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  photos?: string[];
  documents?: any[];
  sensors?: any[];
  spareParts?: any[];
}

export interface CreateEquipmentDto {
  code?: string;
  name: string;
  familleId?: number;
  localisationId?: number;
  marque?: string;
  modele?: string;
  numeroSerie?: string;
  criticite?: number; // 1: Faible, 2: Moyenne, 3: Haute, 4: Critique
  etat?: number;      // 1: EnService, 2: EnPanne, 3: EnMaintenance, 4: HorsService
  notes?: string;
  hoursCount?: number;
}
