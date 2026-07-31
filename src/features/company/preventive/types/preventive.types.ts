// ================================================
// src/features/company/preventive/types/preventive.types.ts
// ================================================

// ── Domain models ────────────────────────────────────────────────────────────

export interface TachePreventive {
  id?: number;
  description: string;
  ordre: number;
  dureeEstimeeMinutes?: number;
  estObligatoire: boolean;
}

export interface PlanPreventif {
  id: number;
  titre: string;
  description?: string;
  /** 1 = Périodique, 2 = Compteur, 3 = Saisonnier */
  typeDeclenchement: 1 | 2 | 3;
  frequence: number;
  /** 'jours' | 'semaines' | 'mois' | 'heures' */
  uniteMesure?: string;
  derniereDate?: string;   // 'YYYY-MM-DD'
  prochaineDate?: string;  // 'YYYY-MM-DD'
  actif: boolean;
  equipementId: number;
  equipementNom?: string;
  equipementFamille?: string;
  taches: TachePreventive[];
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export type CreatePlanDto = Omit<PlanPreventif, 'id'>;

export interface GenererOTResponse {
  otId: number;
  numeroOT: string;
  prochaineDate: string;
}

// ── State ─────────────────────────────────────────────────────────────────────

export type PreventiveStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PreventiveState {
  plans: PlanPreventif[];
  status: PreventiveStatus;
  error: string | null;
}
