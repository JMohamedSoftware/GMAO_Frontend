import { type Equipment, type Incident, type SparePart, type Technician, type WorkOrder } from '@/shared/types/gmao';

export interface UnifiedMaintenanceKpis {
  totalEquipments: number;
  enService: number;
  enMaint: number;
  enPanne: number;
  percentService: number;
  percentMaint: number;
  percentPanne: number;
  disponibilitePercent: number | null;
  mtbfHours: number | null;
  mttrHours: number | null;
  mttrMinutes: number | null;
  completedOtsWithDurationCount: number;
  failureCount: number;
  totalOperatingHours: number;
  totalDowntimeHours: number;
  totalLaborCost: number;
  totalPartsCost: number;
  totalExternalCost: number;
  totalMaintenanceCost: number;
  criticalPartsBelowMin: number;
}

export interface KpiInput {
  equipments: Equipment[];
  workOrders: WorkOrder[];
  incidents: Incident[];
  parts?: SparePart[];
  technicians?: Technician[];
  isProduction?: boolean;
}

/**
 * Calcule la durée réelle d'intervention d'un OT en heures à partir des timestamps
 * réels (`startDate`/`endDate`) ou à défaut de `durationMinutes` mesuré (> 0).
 * Retourne null si aucune donnée temporelle réelle n'est enregistrée (jamais de défaut 120 min).
 */
export function getWorkOrderDurationHours(ot: WorkOrder): number | null {
  if (ot.startDate && ot.endDate) {
    const diffMs = new Date(ot.endDate).getTime() - new Date(ot.startDate).getTime();
    if (!Number.isNaN(diffMs) && diffMs > 0) {
      return diffMs / 3_600_000;
    }
  }
  if (ot.durationMinutes && ot.durationMinutes > 0) {
    return ot.durationMinutes / 60;
  }
  return null;
}

export function getWorkOrderPartsCost(ot: WorkOrder, parts: SparePart[] = []): number {
  return (ot.partsUsed || []).reduce((sum, usage) => {
    const part = parts.find(p => p.ref === usage.partRef);
    return sum + (part ? part.unitPrice : 0) * usage.quantity;
  }, 0);
}

export function getWorkOrderCost(
  ot: WorkOrder,
  parts: SparePart[] = [],
  technicians: Technician[] = []
): { labor: number; parts: number; external: number; total: number } {
  const durationH = getWorkOrderDurationHours(ot) ?? 0;
  const tech = technicians.find(t => String(t.id) === String(ot.technicianId));
  const hourlyRate = tech?.hourlyRate && tech.hourlyRate > 0 ? tech.hourlyRate : 0;

  const labor = durationH * hourlyRate;
  const partsCost = getWorkOrderPartsCost(ot, parts);
  const external = Number(ot.externalCost || 0);

  return {
    labor,
    parts: partsCost,
    external,
    total: labor + partsCost + external
  };
}

/**
 * Moteur unifié de calcul des KPI industriels (AFNOR EN 15341) partagé
 * entre Tableau de bord et Rapports & Analyses.
 */
export function calculateUnifiedMaintenanceKpis({
  equipments = [],
  workOrders = [],
  incidents = [],
  parts = [],
  technicians = [],
  isProduction = false
}: KpiInput): UnifiedMaintenanceKpis {
  const totalEquipments = equipments.length;
  const userPanneEqIds = new Set(incidents.map(i => i.equipmentId));
  const enPanne = isProduction
    ? (userPanneEqIds.size > 0
        ? equipments.filter(e => userPanneEqIds.has(e.id) && (e.status === 'En panne' || e.status === 'Hors service')).length
        : incidents.filter(i => i.status !== 'Clos' && i.status !== 'Rejeté').length)
    : equipments.filter(e => e.status === 'En panne' || e.status === 'Hors service').length;

  const enService = equipments.filter(e => e.status === 'En service').length;
  const enMaint = equipments.filter(e => e.status === 'En maintenance').length;

  const percentService = totalEquipments > 0 ? Math.round((enService / totalEquipments) * 100) : 0;
  const percentMaint = totalEquipments > 0 ? Math.round((enMaint / totalEquipments) * 100) : 0;
  const percentPanne = totalEquipments > 0 ? Math.round((enPanne / totalEquipments) * 100) : 0;

  const completedOts = workOrders.filter(w => w.status === 'Terminé' || w.status === 'Clôturé');

  const durationsHours = completedOts
    .map(getWorkOrderDurationHours)
    .filter((d): d is number => d !== null && d > 0);

  const totalDowntimeHours = durationsHours.reduce((sum, h) => sum + h, 0);
  const completedOtsWithDurationCount = durationsHours.length;
  const mttrHours = completedOtsWithDurationCount > 0 ? totalDowntimeHours / completedOtsWithDurationCount : null;
  const mttrMinutes = mttrHours !== null ? mttrHours * 60 : null;

  // Dédoublonnage pannes : incidents + OTs correctifs sans DI liée
  const corrOtsWithoutIncident = workOrders.filter(w => w.type === 'Correctif' && !w.incidentId);
  const failureCount = incidents.length + corrOtsWithoutIncident.length;

  const totalOperatingHours = equipments.reduce((sum, e) => sum + (e.hoursCount || 0), 0);
  const mtbfHours = totalOperatingHours > 0 && failureCount > 0
    ? Math.max(0, (totalOperatingHours - totalDowntimeHours) / failureCount)
    : null;

  let disponibilitePercent: number | null = null;
  if (totalEquipments > 0) {
    if (totalOperatingHours > 0) {
      disponibilitePercent = Math.round(
        Math.min(100, Math.max(0, ((totalOperatingHours - totalDowntimeHours) / totalOperatingHours) * 100)) * 10
      ) / 10;
    } else {
      disponibilitePercent = Math.round(((totalEquipments - enPanne) / totalEquipments) * 1000) / 10;
    }
  }

  let totalLaborCost = 0;
  let totalPartsCost = 0;
  let totalExternalCost = 0;

  for (const ot of completedOts) {
    const cost = getWorkOrderCost(ot, parts, technicians);
    totalLaborCost += cost.labor;
    totalPartsCost += cost.parts;
    totalExternalCost += cost.external;
  }

  const totalMaintenanceCost = Math.round(totalLaborCost + totalPartsCost + totalExternalCost);
  const criticalPartsBelowMin = parts.filter(p => (p.stockCurrent ?? 0) <= (p.stockMin ?? 0)).length;

  return {
    totalEquipments,
    enService,
    enMaint,
    enPanne,
    percentService,
    percentMaint,
    percentPanne,
    disponibilitePercent,
    mtbfHours,
    mttrHours,
    mttrMinutes,
    completedOtsWithDurationCount,
    failureCount,
    totalOperatingHours,
    totalDowntimeHours,
    totalLaborCost: Math.round(totalLaborCost),
    totalPartsCost: Math.round(totalPartsCost),
    totalExternalCost: Math.round(totalExternalCost),
    totalMaintenanceCost,
    criticalPartsBelowMin
  };
}
