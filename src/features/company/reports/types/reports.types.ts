/**
 * ============================================================================
 * MODULE : Rapports & KPIs (Reports) - Types & DTOs
 * ============================================================================
 * Définit les modèles pour les indicateurs industriels de maintenance :
 * MTBF, MTTR, Taux de Disponibilité, Coûts et analyses comparatives.
 */

export interface MaintenanceKpis {
  mtbfHours: number | null;
  mttrHours: number | null;
  disponibilitePercent: number | null;
  totalLaborCost: number;
  totalPartsCost: number;
  totalMaintenanceCost: number;
  criticalPartsBelowMin: number;
}

export interface MonthlyTrendPoint {
  period: string;
  arret: number;
  nbOt: number;
  cout: number;
  dispo: number;
  rawMonth: number;
  rawYear: number;
}

export interface EquipmentFailureStat {
  name: string;
  pannes: number;
}
