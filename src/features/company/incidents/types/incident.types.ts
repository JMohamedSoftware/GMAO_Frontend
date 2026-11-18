/**
 * ============================================================================
 * MODULE : Incidents & Demandes d'Intervention (DI) - Types & DTOs
 * ============================================================================
 * Ce fichier définit les interfaces, DTOs et statuts liés aux signalements
 * de pannes et demandes d'intervention sur les équipements industriels.
 */

/**
 * Niveaux d'urgence d'une panne déclarée :
 * - Critique : Danger immédiat pour la sécurité ou arrêt total de la ligne
 * - Haute : Défaillance importante sans danger immédiat
 * - Moyenne : Dégradation modérée des performances machine
 * - Faible : Défaut mineur, bruit, petite fuite
 */
export type IncidentUrgency = 'Faible' | 'Moyenne' | 'Haute' | 'Critique';

/**
 * Statuts d'une Demande d'Intervention (DI) :
 * - Nouveau : Vient d'être signalée par la production/opérateur
 * - Validé : Validée par le responsable, prête pour planification d'OT
 * - Rejeté : Demande non justifiée ou doublon (avec commentaire de rejet)
 * - Transformé en OT : Prise en charge avec un bon d'OT émis
 * - Clos : Résolu et clôturé suite à l'achèvement de l'OT
 */
export type IncidentStatus = 'Nouveau' | 'Validé' | 'Rejeté' | 'Transformé en OT' | 'Clos';

/**
 * Modèle complet d'une Demande d'Intervention dans l'application
 */
export interface IncidentModel {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  reportedDate: string;
  reportedBy: string;
  description: string;
  urgency: IncidentUrgency;
  status: IncidentStatus;
  workOrderId?: string;
  workOrderNumero?: string;
  technicianId?: string;
  photo?: string;
  photoUrl?: string;
  commentaireRejet?: string;
  campaign?: string;
}

/**
 * DTO pour la création d'un nouvel incident / signalement de panne
 */
export interface CreateIncidentDto {
  equipmentId: string;
  description: string;
  urgency: IncidentUrgency;
  reportedBy?: string;
  photoUrl?: string;
}

/**
 * DTO pour la mise à jour du statut d'une DI
 */
export interface UpdateIncidentDto {
  id: number;
  statut: number; // 1: EnAttente, 2: Validee, 3: Rejetee, 4: TransformeeEnOT, 5: Cloturee
  commentaireRejet?: string;
}
