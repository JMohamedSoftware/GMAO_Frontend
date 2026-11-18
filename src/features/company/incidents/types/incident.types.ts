export type IncidentUrgency = 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
export type IncidentStatus = 'Nouveau' | 'Validé' | 'Rejeté' | 'Transformé en OT' | 'Clos';

export interface CreateIncidentDto {
  equipmentId: string;
  description: string;
  urgency: IncidentUrgency;
  reportedBy?: string;
  photoUrl?: string;
}

export interface UpdateIncidentDto {
  id: number;
  statut: number; // 1: EnAttente, 2: Validee, 3: Rejetee, 4: TransformeeEnOT, 5: Cloturee
  commentaireRejet?: string;
}
