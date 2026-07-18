import React from 'react';
import { Info, Settings2, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';

interface PreventivePlanListProps {
  rules: any[];
  equipments: any[];
  activePlanToDrag: any | null;
  handleSelectPlanToDrag: (rule: any) => void;
  handleTriggerPlan: (rule: any) => void;
}

export const PreventivePlanList: React.FC<PreventivePlanListProps> = ({
  rules,
  equipments,
  activePlanToDrag,
  handleSelectPlanToDrag,
  handleTriggerPlan
}) => {
  return (
    <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-center group relative cursor-help">
        <h3 className="text-[11px] font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          Planification (Drag/Click) <Info className="w-3.5 h-3.5 text-slate-400" />
        </h3>
        <div className="absolute hidden group-hover:block top-6 left-0 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg z-10 w-48">
          Glissez un plan vers une date du calendrier pour le planifier manuellement.
        </div>
        <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
          GMAO Engine
        </span>
      </div>
      
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
        {activePlanToDrag 
          ? "Cliquez sur une date pour déposer le plan." 
          : "Sélectionnez un plan préventif pour le déplacer ou voir ses détails."
        }
      </p>

      <div className="flex flex-col gap-3 mt-1">
        {rules.map(rule => {
          const isSelected = activePlanToDrag?.id === rule.id;
          const isOverdue = new Date(rule.nextTrigger) < new Date('2026-07-07');
          
          return (
            <div 
              key={rule.id}
              onClick={() => handleSelectPlanToDrag(rule)}
              className={`p-3 rounded-custom-md border cursor-pointer hover-lift flex flex-col gap-2 relative transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-[0_4px_12px_rgba(37,99,235,0.1)] scale-[1.02]' 
                  : 'border-white/50 dark:border-slate-850/40 bg-white/60 dark:bg-slate-900/20 neumorphic-card hover:bg-white/80'
              }`}
            >
              {isOverdue && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}

              <div className="flex justify-between items-start pr-3">
                <span className="text-[9px] font-bold text-slate-400 font-mono leading-none bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{rule.id}</span>
                <div className="flex gap-1">
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${rule.triggerType === 'Temps' ? 'bg-sky-500/10 text-sky-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {rule.triggerType}
                  </span>
                  {rule.priority === 'Critique' && (
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-rose-500/10 text-rose-600">
                      Critique
                    </span>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-xs text-slate-750 dark:text-slate-200 leading-tight">
                {rule.title}
              </h4>
              
              <div className="text-[9px] text-slate-500 font-semibold mb-1 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded">
                <Settings2 className="w-3 h-3 text-slate-400" />
                {rule.triggerType === 'Temps' ? (
                  <span>Fréquence : <span className="text-primary">{rule.frequency}</span></span>
                ) : (
                  <span>Seuil : <span className="text-primary">{rule.thresholdValue}</span></span>
                )}
              </div>

              <div className="text-[10px] text-slate-450 flex items-center justify-between mt-1 pt-2 border-t border-slate-150 dark:border-slate-800/80">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-slate-400" />
                  <strong>{rule.nextTrigger}</strong>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerPlan(rule);
                  }}
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-custom-sm shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  OT
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
