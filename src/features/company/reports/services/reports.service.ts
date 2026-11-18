/**
 * ============================================================================
 * MODULE : Rapports & KPIs (Reports) - Service Métier
 * ============================================================================
 * Fournit les calculs d'indicateurs de maintenance (normes AFNOR)
 * et les exportations Excel / PDF.
 */

import { MaintenanceKpis, MonthlyTrendPoint } from '../types/reports.types';
import { WorkOrder, Incident, Equipment, SparePart } from '@/shared/types/gmao';

export const reportsService = {
  /**
   * Calcule les indicateurs fondamentaux selon les normes industrielles :
   * - MTBF = Heures totales de marche / Nombre total de pannes
   * - MTTR = Durée totale de réparation / Nombre d'interventions
   * - Disponibilité = (Temps de marche - Arrêt) / Temps de marche
   */
  calculateKpis: (
    equipments: Equipment[],
    workOrders: WorkOrder[],
    incidents: Incident[],
    parts: SparePart[]
  ): MaintenanceKpis => {
    const hasIndustrialData = equipments.length > 0 && (workOrders.length > 0 || incidents.length > 0);
    const corrOTs = workOrders.filter(w => w.type === 'Correctif');
    const completedOTs = workOrders.filter(w => w.status === 'Terminé' || w.status === 'Clôturé');

    const totalFailures = corrOTs.length;
    const totalDowntimeH = completedOTs.reduce((acc, ot) => acc + ((ot.durationMinutes || 0) / 60), 0);
    const totalOperatingH = 90 * 16; // 3 mois de campagne x 16h/jour

    const mtbfHours = !hasIndustrialData 
      ? null 
      : totalFailures > 0 
        ? Math.max(0, (totalOperatingH - totalDowntimeH) / totalFailures) 
        : totalOperatingH;

    const disponibilitePercent = !hasIndustrialData 
      ? null 
      : totalOperatingH > 0 
        ? Math.min(100, Math.max(0, ((totalOperatingH - totalDowntimeH) / totalOperatingH) * 100)) 
        : 100;

    const otsWithDuration = completedOTs.filter(w => (w.durationMinutes || 0) > 0);
    const mttrHours = otsWithDuration.length > 0
      ? otsWithDuration.reduce((acc, ot) => acc + (ot.durationMinutes || 0), 0) / (otsWithDuration.length * 60)
      : null;

    const totalLaborCost = completedOTs.reduce((acc, ot) => acc + ((ot.durationMinutes || 0) * 0.5), 0);
    const totalPartsCost = completedOTs.reduce((acc, ot) => acc + (ot.externalCost || 0), 0);
    const totalMaintenanceCost = totalLaborCost + totalPartsCost;

    const criticalPartsBelowMin = (parts || []).filter(p => (p.stockCurrent ?? 0) <= (p.stockMin ?? 0)).length;

    return {
      mtbfHours,
      mttrHours,
      disponibilitePercent,
      totalLaborCost,
      totalPartsCost,
      totalMaintenanceCost,
      criticalPartsBelowMin
    };
  }
};
