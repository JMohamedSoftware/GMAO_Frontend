export type WorkOrderType = 'Correctif' | 'Préventif' | 'Amélioratif' | 'Prédictif';
export type WorkOrderPriority = 'Critique' | 'Haute' | 'Moyenne' | 'Faible';
export type WorkOrderStatus = 'En attente' | 'Affecté' | 'En cours' | 'Suspendu' | 'Terminé' | 'Clôturé' | 'Annulé';

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
