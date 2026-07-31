import React from 'react';
import { Calendar as CalendarIcon, X, CheckCircle, Circle, Edit3, RefreshCw, Clock, Zap, Layers } from 'lucide-react';
import type { PlanPreventif } from '../types/preventive.types';
import { PERMISSIONS } from '@/shared/permissions';

interface PreventiveDrawerProps {
  plan: PlanPreventif | null;
  onClose: () => void;
  onEdit: (plan: PlanPreventif) => void;
  onGenererOT: (plan: PlanPreventif) => void;
  can: (permission: any) => boolean;
}

const triggerInfo = (type: 1 | 2 | 3) => {
  if (type === 2) return { label: 'Compteur', icon: <Zap className="w-4 h-4 text-amber-500" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
  if (type === 3) return { label: 'Saisonnier', icon: <Layers className="w-4 h-4 text-purple-500" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' };
  return { label: 'Périodique', icon: <Clock className="w-4 h-4 text-sky-500" />, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' };
};

const daysDiff = (dateStr?: string) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export const PreventiveDrawer: React.FC<PreventiveDrawerProps> = ({
  plan, onClose, onEdit, onGenererOT, can
}) => {
  if (!plan) return null;

  const trigger = triggerInfo(plan.typeDeclenchement);
  const diff = daysDiff(plan.prochaineDate);
  const isOverdue = diff !== null && diff < 0;
  const isUrgent  = diff !== null && diff >= 0 && diff <= 3;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col transform transition-transform duration-300 animate-[slideInRight_0.2s_ease-out]">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Plan PRV-{plan.id.toString().padStart(3, '0')}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 text-sm custom-scrollbar">

        {/* Title + status */}
        <div>
          {(isOverdue || isUrgent) && (
            <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 mb-2 ${
              isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {isOverdue ? `⚠️ En retard de ${Math.abs(diff!)}j` : `⏰ Dans ${diff}j — Urgent`}
            </div>
          )}
          <h3 className="font-extrabold text-slate-800 dark:text-white mb-1 leading-snug">{plan.titre}</h3>
          {plan.description && (
            <p className="text-[11px] text-slate-500">{plan.description}</p>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Équipement</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {plan.equipementNom || `#${plan.equipementId}`}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Famille</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {plan.equipementFamille || '—'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Déclenchement</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${trigger.color}`}>
              {trigger.icon} {trigger.label}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Fréquence</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {plan.frequence} {plan.uniteMesure || 'jours'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Dernière inter.</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {plan.derniereDate || '—'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Prochaine</span>
            <span className={`font-bold ${isOverdue ? 'text-rose-500' : isUrgent ? 'text-amber-500' : 'text-primary'}`}>
              {plan.prochaineDate || '—'}
            </span>
          </div>
        </div>

        {/* Checklist */}
        {plan.taches && plan.taches.length > 0 && (
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">
              Tâches ({plan.taches.length})
            </span>
            <ul className="flex flex-col gap-2">
              {plan.taches.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {t.estObligatoire
                    ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Circle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  }
                  <span>
                    {t.description}
                    {t.dureeEstimeeMinutes && (
                      <span className="text-slate-400 ml-1">({t.dureeEstimeeMinutes} min)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
        {can(PERMISSIONS.PREVENTIVE_UPDATE) && (
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Modifier
          </button>
        )}
        {can(PERMISSIONS.PREVENTIVE_EXECUTE) && (
          <button
            onClick={() => onGenererOT(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Générer OT
          </button>
        )}
      </div>
    </div>
  );
};
