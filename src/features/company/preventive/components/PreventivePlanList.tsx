import React from 'react';
import { Calendar as CalendarIcon, RefreshCw, Plus, Clock, Zap, Layers } from 'lucide-react';
import type { PlanPreventif } from '../types/preventive.types';
import { PERMISSIONS } from '@/shared/permissions';

interface PreventivePlanListProps {
  plans: PlanPreventif[];
  equipments: any[];
  activePlanToDrag: PlanPreventif | null;
  onSelectPlan: (plan: PlanPreventif) => void;
  onGenererOT: (plan: PlanPreventif) => void;
  onNewPlan: () => void;
  can: (permission: any) => boolean;
}

const triggerLabel = (type: 1 | 2 | 3) => {
  if (type === 2) return 'Compteur';
  if (type === 3) return 'Saisonnier';
  return 'Périodique';
};

const triggerIcon = (type: 1 | 2 | 3) => {
  if (type === 2) return <Zap className="w-3 h-3 text-amber-500" />;
  if (type === 3) return <Layers className="w-3 h-3 text-purple-500" />;
  return <Clock className="w-3 h-3 text-sky-500" />;
};

const urgencyBadge = (dateStr?: string) => {
  if (!dateStr) return 'border-slate-200 bg-slate-50 text-slate-500';
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return 'border-rose-400 bg-rose-50   text-rose-700   dark:bg-rose-900/20   dark:text-rose-400';
  if (diff <= 3) return 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
  if (diff <= 7) return 'border-sky-400   bg-sky-50    text-sky-700   dark:bg-sky-900/20   dark:text-sky-400';
  return 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
};

const daysLabel = (dateStr?: string) => {
  if (!dateStr) return '—';
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return `${Math.abs(diff)}j de retard`;
  if (diff === 0) return 'Aujourd\'hui';
  if (diff === 1) return 'Demain';
  return `Dans ${diff}j`;
};

export const PreventivePlanList: React.FC<PreventivePlanListProps> = ({
  plans, equipments, activePlanToDrag, onSelectPlan, onGenererOT, onNewPlan, can
}) => {
  const sorted = [...plans].sort((a, b) => {
    if (!a.prochaineDate) return 1;
    if (!b.prochaineDate) return -1;
    return new Date(a.prochaineDate).getTime() - new Date(b.prochaineDate).getTime();
  });

  return (
    <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Plans Actifs
          </span>
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {plans.length}
          </span>
        </div>
        {can(PERMISSIONS.PREVENTIVE_CREATE) && (
          <button
            onClick={onNewPlan}
            className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Nouveau
          </button>
        )}
      </div>

      {/* Plan list */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
        {sorted.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Aucun plan préventif actif.</p>
            {can(PERMISSIONS.PREVENTIVE_CREATE) && (
              <button
                onClick={onNewPlan}
                className="mt-3 text-primary font-bold hover:underline"
              >
                + Créer le premier plan
              </button>
            )}
          </div>
        )}

        {sorted.map(plan => {
          const isActive = activePlanToDrag?.id === plan.id;
          const badgeClass = urgencyBadge(plan.prochaineDate);

          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className={`group p-3 rounded-xl border cursor-pointer transition-all select-none ${
                isActive
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                  : 'border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              {/* Title row */}
              <div className="flex items-start gap-2 mb-2">
                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${badgeClass}`}>
                  {daysLabel(plan.prochaineDate)}
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-tight mb-1.5 line-clamp-2">
                {plan.titre}
              </p>

              {/* Equipment */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                🔩 {plan.equipementNom || `Équipement #${plan.equipementId}`}
                {plan.equipementFamille && <span className="text-slate-400"> · {plan.equipementFamille}</span>}
              </p>

              {/* Frequency */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-2">
                {triggerIcon(plan.typeDeclenchement)}
                <span>
                  {triggerLabel(plan.typeDeclenchement)} —&nbsp;
                  <span className="text-primary font-semibold">
                    {plan.typeDeclenchement === 1
                      ? `Tous les ${plan.frequence} ${plan.uniteMesure || 'jours'}`
                      : plan.typeDeclenchement === 2
                        ? `Toutes les ${plan.frequence} ${plan.uniteMesure || 'heures'}`
                        : `Saisonnier`
                    }
                  </span>
                </span>
              </div>

              {/* Next date + OT button */}
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1 text-[10px] text-slate-450">
                  <CalendarIcon className="w-3 h-3 text-slate-400" />
                  <strong className="text-slate-600 dark:text-slate-300">
                    {plan.prochaineDate || '—'}
                  </strong>
                </div>

                {can(PERMISSIONS.PREVENTIVE_EXECUTE) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onGenererOT(plan); }}
                    className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Générer OT
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag hint */}
      {activePlanToDrag && (
        <div className="px-3 py-2 border-t border-primary/20 bg-primary/5 text-[10px] text-primary font-bold text-center">
          🎯 Cliquez sur un jour du calendrier pour replanifier
        </div>
      )}
    </div>
  );
};
