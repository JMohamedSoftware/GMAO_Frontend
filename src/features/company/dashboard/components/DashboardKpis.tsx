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
import { Equipment, WorkOrder, Incident } from '@/shared/types/gmao';

interface DashboardKpisProps {
  equipments: Equipment[];
  workOrders?: WorkOrder[];
  incidents?: Incident[];
  totalLaborCost?: number;
  totalPartsCost?: number;
  totalMaintCost?: number;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  equipments,
  workOrders = [],
  incidents = [],
  totalMaintCost = 0
}) => {
  const total = equipments.length;
  const enService = equipments.filter(e => e.status === 'En service').length;
  const enMaint = equipments.filter(e => e.status === 'En maintenance').length;
  const enPanne = equipments.filter(e => e.status === 'En panne' || e.status === 'Hors service').length;

  const percentService = total > 0 ? Math.round((enService / total) * 100) : 0;
  const percentMaint = total > 0 ? Math.round((enMaint / total) * 100) : 0;
  const percentPanne = total > 0 ? Math.round((enPanne / total) * 100) : 0;

  // Dynamic Industrial Norms (Cahier des Charges)
  const dispoRate = total > 0 ? Math.round(((total - enPanne) / total) * 1000) / 10 : 100;

  // MTBF: Total operating hours / Total failures
  const totalOperatingHours = equipments.reduce((sum, e) => sum + (e.hoursCount || 0), 0) || (total * 160);
  const failureCount = incidents.length + workOrders.filter(w => w.type === 'Correctif').length;
  const mtbf = failureCount > 0 ? Math.round(totalOperatingHours / failureCount) : (totalOperatingHours > 0 ? totalOperatingHours : 160);

  // MTTR: Average repair duration in hours for completed work orders
  const completedOts = workOrders.filter(w => (w.status === 'Terminé' || w.status === 'Clôturé'));
  const totalRepairHours = completedOts.reduce((sum, w) => sum + (w.durationMinutes ? w.durationMinutes / 60 : 2), 0);
  const mttr = completedOts.length > 0 ? (totalRepairHours / completedOts.length).toFixed(1) : (enPanne > 0 ? '2.0' : '0.0');

  return (
    <div className="flex flex-col gap-4">
      {/* ROW 1: Equipment Status Counters (Image 2) */}
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

      {/* ROW 2: Cahier des Charges Section 12 & 14 - KPIs Industriels Normés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* KPI 1: Disponibilité */}
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
                {dispoRate}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                {enPanne === 0 ? 'Optimal' : `${total - enPanne}/${total}`}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              Temps fct / Temps total
            </span>
          </div>
        </div>

        {/* KPI 2: MTBF */}
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
                {mtbf} h
              </span>
              <span className={`text-[10px] font-bold ${mtbf >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {mtbf >= 100 ? 'Bon' : 'À suivre'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              Moyenne entre deux pannes
            </span>
          </div>
        </div>

        {/* KPI 3: MTTR */}
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
                {mttr} h
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                {completedOts.length > 0 ? `${completedOts.length} OTs` : 'Cible < 2h'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              Temps moyen de remise en route
            </span>
          </div>
        </div>

        {/* KPI 4: Coût Maintenance */}
        <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <Coins className="w-4.5 h-4.5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Coût Maintenance (Mois)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                {totalMaintCost.toLocaleString()} TND
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              Main d'œuvre + Pièces
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
