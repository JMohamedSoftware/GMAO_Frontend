import React from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Coins 
} from 'lucide-react';
import { Equipment, WorkOrder, Incident, SparePart, Technician } from '@/shared/types/gmao';
import { calculateUnifiedMaintenanceKpis } from '@/shared/services/kpiCalculator';

interface DashboardKpisProps {
  equipments: Equipment[];
  workOrders?: WorkOrder[];
  incidents?: Incident[];
  parts?: SparePart[];
  technicians?: Technician[];
  totalLaborCost?: number;
  totalPartsCost?: number;
  totalMaintCost?: number;
  canViewEquipments?: boolean;
  canViewWorkOrders?: boolean;
  canViewIncidents?: boolean;
  canViewReports?: boolean;
  isProduction?: boolean;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  equipments,
  workOrders = [],
  incidents = [],
  parts = [],
  technicians = [],
  totalMaintCost,
  canViewEquipments = true,
  canViewWorkOrders = true,
  canViewIncidents = true,
  canViewReports = true,
  isProduction = false
}) => {
  const kpis = calculateUnifiedMaintenanceKpis({
    equipments,
    workOrders,
    incidents,
    parts,
    technicians,
    isProduction
  });

  const total = kpis.totalEquipments;
  const enPanne = kpis.enPanne;
  const enService = kpis.enService;
  const enMaint = kpis.enMaint;
  const percentService = kpis.percentService;
  const percentMaint = kpis.percentMaint;
  const percentPanne = kpis.percentPanne;
  const dispoRate = kpis.disponibilitePercent;
  const mtbf = kpis.mtbfHours !== null ? Math.round(kpis.mtbfHours) : null;
  const mttrVal = kpis.mttrHours;
  const otsWithDurationCount = kpis.completedOtsWithDurationCount;
  const resolvedMaintCost = totalMaintCost ?? kpis.totalMaintenanceCost;

  // Incident statistics (for users who don't have equipment permissions, like Responsable Production)
  const totalIncidents = incidents.length;
  const incNouveau = incidents.filter(i => i.status === 'Nouveau').length;
  const incEnCours = incidents.filter(i => i.status === 'Validé' || i.status === 'Transformé en OT').length;
  const incClos = incidents.filter(i => i.status === 'Clos').length;

  const showDispo = canViewEquipments;
  const showMtbf = canViewWorkOrders;
  const showMttr = canViewWorkOrders;
  const showCost = canViewWorkOrders && canViewReports;
  const hasAnyNormKpi = showDispo || showMtbf || showMttr || showCost;

  return (
    <div className="flex flex-col gap-4">
      {/* ROW 1: Equipment Status Counters OR Incident Counters depending on permissions */}
      {canViewEquipments ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Équipements */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Équipements
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                    {total}
                  </h3>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                    Total
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  au parc d'usine
                </span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-blue-500 stroke-current fill-none">
                <path d="M 0,22 Q 15,10 30,16 T 60,6" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,22 Q 15,10 30,16 T 60,6 L 60,30 L 0,30 Z" className="fill-blue-500/10 stroke-none" />
              </svg>
            </div>
          </div>

          {/* 2. En service */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  En service
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                    {enService}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {percentService}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Taux opérationnel
                </span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-emerald-500 stroke-current fill-none">
                <path d="M 0,25 Q 20,20 40,10 T 60,5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,25 Q 20,20 40,10 T 60,5 L 60,30 L 0,30 Z" className="fill-emerald-500/10 stroke-none" />
              </svg>
            </div>
          </div>

          {/* 3. En maintenance */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  En maintenance
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                    {enMaint}
                  </h3>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {percentMaint}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Interventions actives
                </span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-amber-500 stroke-current fill-none">
                <path d="M 0,10 Q 15,22 35,15 T 60,20" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,10 Q 15,22 35,15 T 60,20 L 60,30 L 0,30 Z" className="fill-amber-500/10 stroke-none" />
              </svg>
            </div>
          </div>

          {/* 4. En panne */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  En panne
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 leading-none">
                    {enPanne}
                  </h3>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {percentPanne}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Arrêts machines
                </span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-rose-500 stroke-current fill-none">
                <path d="M 0,22 Q 25,25 40,8 T 60,18" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,22 Q 25,25 40,8 T 60,18 L 60,30 L 0,30 Z" className="fill-rose-500/10 stroke-none" />
              </svg>
            </div>
          </div>
        </div>
      ) : canViewIncidents ? (
        /* Alternate ROW 1 for Production / Operators: Incident Supervision Counters */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Pannes déclarées */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Pannes & Incidents
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                    {totalIncidents}
                  </h3>
                  <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                    Total
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Demandes d'intervention
                </span>
              </div>
            </div>
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-rose-500 stroke-current fill-none">
                <path d="M 0,15 Q 20,25 40,10 T 60,5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,15 Q 20,25 40,10 T 60,5 L 60,30 L 0,30 Z" className="fill-rose-500/10 stroke-none" />
              </svg>
            </div>
          </div>

          {/* 2. En attente / À traiter */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  En attente
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
                    {incNouveau}
                  </h3>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                    À traiter
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Non encore prises en charge
                </span>
              </div>
            </div>
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-amber-500 stroke-current fill-none">
                <path d="M 0,20 Q 20,5 40,18 T 60,8" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,20 Q 20,5 40,18 T 60,8 L 60,30 L 0,30 Z" className="fill-amber-500/10 stroke-none" />
              </svg>
            </div>
          </div>

          {/* 3. En cours de traitement */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  En cours
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                    {incEnCours}
                  </h3>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                    Validées / OT
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Prises en main maintenance
                </span>
              </div>
            </div>
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-blue-500 stroke-current fill-none">
                <path d="M 0,10 Q 15,22 35,15 T 60,20" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,10 Q 15,22 35,15 T 60,20 L 60,30 L 0,30 Z" className="fill-blue-500/10 stroke-none" />
              </svg>
            </div>
          </div>

          {/* 4. Clôturées / Résolues */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Résolues
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                    {incClos}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {totalIncidents > 0 ? Math.round((incClos / totalIncidents) * 100) : 100}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Pannes clôturées
                </span>
              </div>
            </div>
            <div className="w-16 h-8 opacity-80">
              <svg viewBox="0 0 60 30" className="w-full h-full text-emerald-500 stroke-current fill-none">
                <path d="M 0,25 Q 20,20 40,10 T 60,5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 0,25 Q 20,20 40,10 T 60,5 L 60,30 L 0,30 Z" className="fill-emerald-500/10 stroke-none" />
              </svg>
            </div>
          </div>
        </div>
      ) : null}

      {/* ROW 2: Cahier des Charges Section 12 & 14 - KPIs Industriels Normés (Strictly gated by permissions) */}
      {hasAnyNormKpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {/* KPI 1: Disponibilité */}
          {showDispo && (
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/40">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Disponibilité (Taux)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                    {dispoRate !== null ? `${dispoRate}%` : '—'}
                  </span>
                  {dispoRate !== null ? (
                    <span className={`text-[10px] font-bold ${
                      dispoRate === 100 ? 'text-emerald-600' :
                      dispoRate >= 80 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {enPanne === 0 ? 'Optimal' : `${total - enPanne}/${total}`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Données insuffisantes</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 block truncate">
                  Équip. opérationnels / Total
                </span>
              </div>
            </div>
          )}

          {/* KPI 2: MTBF */}
          {showMtbf && (
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  MTBF (Entre pannes)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                    {mtbf !== null ? `${mtbf} h` : '—'}
                  </span>
                  {mtbf !== null ? (
                    <span className={`text-[10px] font-bold ${mtbf >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {mtbf >= 100 ? 'Bon' : 'À suivre'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Données insuffisantes</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 block truncate">
                  Moyenne entre deux pannes
                </span>
              </div>
            </div>
          )}

          {/* KPI 3: MTTR */}
          {showMttr && (
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-900/40">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  MTTR (Réparation)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                    {mttrVal !== null ? `${mttrVal.toFixed(1)} h` : '—'}
                  </span>
                  {mttrVal !== null ? (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {otsWithDurationCount} OT{otsWithDurationCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Données insuffisantes</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 block truncate">
                  Temps moyen de remise en route
                </span>
              </div>
            </div>
          )}

          {/* KPI 4: Coût Maintenance */}
          {showCost && (
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Coût Maintenance
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                    {resolvedMaintCost.toLocaleString()} TND
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">
                  Main d'œuvre + Pièces + Sous-traitance
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
