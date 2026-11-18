/**
 * ============================================================================
 * MODULE : Ordres de Travail (Work Orders) - Types & DTOs
 * ============================================================================
 * Ce fichier définit tous les types, interfaces et DTOs nécessaires pour la
 * gestion des Ordres de Travail (OT) dans le système GMAO.
 */

import { PartUsage } from '@/shared/types/gmao';

/**
 * Types de maintenance autorisés selon la norme AFNOR NF EN 13306 :
 * - Correctif : Intervention suite à une défaillance/panne machine
 * - Préventif : Intervention planifiée périodique ou systématique
 * - Amélioratif : Travaux neufs, fiabilisation ou modification machine
 * - Prédictif : Déclenchée selon l'état/vibration/analyse d'huile
 */
export type WorkOrderType = 'Correctif' | 'Préventif' | 'Amélioratif' | 'Prédictif';

/**
 * Niveaux de priorité d'un Ordre de Travail :
 * - Critique : Arrêt de ligne immédiat (priorité absolue)
 * - Haute : Risque d'arrêt imminent ou anomalie majeure
 * - Moyenne : Fonctionnement dégradé sans arrêt immédiat
 * - Faible : Travaux de confort, retouches ou améliorations
 */
export type WorkOrderPriority = 'Critique' | 'Haute' | 'Moyenne' | 'Faible';

/**
 * Cycle de vie d'un Ordre de Travail :
 * 1. En attente : Créé, en attente de planification ou d'affectation
 * 2. Affecté : Assigné à un technicien ou chef d'équipe
 * 3. En cours : Travaux actuellement en cours d'exécution
 * 4. Suspendu : Bloqué (attente pièce, sécurité, arrêt production)
 * 5. Terminé : Travaux achevés par le technicien, en attente de validation
 * 6. Clôturé : Validé définitivement par le responsable maintenance
 * 7. Annulé : Ordre de travail rejeté ou annulé
 */
export type WorkOrderStatus = 
  | 'En attente' 
  | 'Affecté' 
  | 'En cours' 
  | 'Suspendu' 
  | 'Terminé' 
  | 'Clôturé' 
  | 'Annulé';

/**
 * Interface complète d'un Ordre de Travail dans le système
 */
export interface WorkOrderModel {
  id: string;
  numeroOT: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName?: string;
  technicianId?: string;
  technicianName?: string;
  chefEquipeId?: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  type: WorkOrderType;
  createdDate: string;
  startDate?: string;
  endDate?: string;
  incidentId?: string;
  durationMinutes?: number;
  externalCost?: number;
  partsUsed?: PartUsage[];
  campaign?: string;
  campagneId?: number;
  instructions?: string;
}

/**
 * DTO pour la création d'un nouvel Ordre de Travail
 */
export interface CreateWorkOrderDto {
  title: string;
  description: string;
  equipmentId: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  technicianId?: string;
  incidentId?: string;
  responsableId?: number;
  campagneId?: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
}

/**
 * DTO pour la mise à jour d'un Ordre de Travail existant
 */
export interface UpdateWorkOrderDto {
  id: number;
  numeroOT?: string;
  title?: string;
  description?: string;
  instructions?: string;
  equipmentId?: number;
  technicianId?: number | null;
  responsableId?: number;
  priority?: number;
  typeMaintenance?: number;
  statut?: number;
  dateDebutPrevue?: string | null;
  dateFinPrevue?: string | null;
  dateDebutReelle?: string | null;
  dateFinReelle?: string | null;
  coutMainOeuvre?: number | null;
  coutPieces?: number | null;
  coutSousTraitance?: number | null;
  campagneId?: number | null;
}
