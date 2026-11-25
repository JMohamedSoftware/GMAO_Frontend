/**
 * ============================================================================
 * MODULE : Rapports & KPIs (Reports) - Service Métier
 * ============================================================================
 * Délègue les calculs d'indicateurs de maintenance au moteur unifié AFNOR
 * partagé avec le Tableau de bord (`calculateUnifiedMaintenanceKpis`).
 */

import { MaintenanceKpis } from '../types/reports.types';
import { WorkOrder, Incident, Equipment, SparePart, Technician } from '@/shared/types/gmao';
import { calculateUnifiedMaintenanceKpis } from '@/shared/services/kpiCalculator';

export const reportsService = {
  calculateKpis: (
    equipments: Equipment[],
    workOrders: WorkOrder[],
    incidents: Incident[],
    parts: SparePart[],
    technicians: Technician[] = []
  ): MaintenanceKpis => {
    const unified = calculateUnifiedMaintenanceKpis({
      equipments,
      workOrders,
      incidents,
      parts,
      technicians
    });

    return {
      mtbfHours: unified.mtbfHours,
      mttrHours: unified.mttrHours,
      disponibilitePercent: unified.disponibilitePercent,
      totalLaborCost: unified.totalLaborCost,
      totalPartsCost: unified.totalPartsCost + unified.totalExternalCost,
      totalMaintenanceCost: unified.totalMaintenanceCost,
      criticalPartsBelowMin: unified.criticalPartsBelowMin
    };
  }
};
