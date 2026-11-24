export const EtatCampagne = {
  Planifiee: 1,
  EnCours: 2,
  Terminee: 3,
  Annulee: 4
} as const;

export type EtatCampagne = typeof EtatCampagne[keyof typeof EtatCampagne];

export interface Campagne {
  id: number;
  nom: string;
  description?: string;
  dateDebut: string;
  dateFin?: string | null;
  etat: EtatCampagne;
  societeId?: number;
}

export interface CreateCampagneDto {
  nom: string;
  description?: string;
  dateDebut: string;
  dateFin?: string | null;
  etat: EtatCampagne;
}

export interface UpdateCampagneDto {
  nom?: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string | null;
  etat?: EtatCampagne;
}
