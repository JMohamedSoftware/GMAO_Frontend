import React from 'react';
import { Calendar as CalendarIcon, X, CheckCircle } from 'lucide-react';
import { PERMISSIONS } from '@/shared/permissions';

interface PreventiveDrawerProps {
  selectedPlanDetails: any | null;
  setSelectedPlanDetails: (v: any | null) => void;
  setActivePlanToDrag: (v: any | null) => void;
  equipments: any[];
  can: (permission: any) => boolean;
  handleTriggerPlan: (rule: any) => void;
}

export const PreventiveDrawer: React.FC<PreventiveDrawerProps> = ({
  selectedPlanDetails,
  setSelectedPlanDetails,
  setActivePlanToDrag,
  equipments,
  can,
  handleTriggerPlan
}) => {
  if (!selectedPlanDetails) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col transform transition-transform duration-300 animate-[slideInRight_0.2s_ease-out]">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          {selectedPlanDetails.id}
        </h2>
        <button 
          onClick={() => { setSelectedPlanDetails(null); setActivePlanToDrag(null); }} 
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-6 text-sm custom-scrollbar">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white mb-2">{selectedPlanDetails.title}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Contrôle planifié automatiquement pour assurer la conformité et la sécurité.</p>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Équipement</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {equipments.find(e => e.id === selectedPlanDetails.equipmentId)?.name || selectedPlanDetails.equipmentId}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Famille</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {equipments.find(e => e.id === selectedPlanDetails.equipmentId)?.category || '-'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Déclenchement</span>
            <span className={`inline-block px-2 py-0.5 rounded font-bold ${selectedPlanDetails.triggerType === 'Temps' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {selectedPlanDetails.triggerType}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Fréquence</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlanDetails.frequency}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Intervalle</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlanDetails.thresholdValue}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Priorité</span>
            <span className={`font-semibold ${
              selectedPlanDetails.priority === 'Critique' ? 'text-rose-600' :
              selectedPlanDetails.priority === 'Haute' ? 'text-amber-600' : 'text-primary'
            }`}>{selectedPlanDetails.priority}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Dernière inter.</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlanDetails.lastTriggered}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Prochaine</span>
            <span className="font-semibold text-rose-500">{selectedPlanDetails.nextTrigger}</span>
          </div>
        </div>

        {/* Checklist mock */}
        <div>
          <span className="block text-[10px] uppercase text-slate-400 font-bold mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Tâches (Checklist)</span>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Vérifier les paramètres de pression et températures
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Nettoyer le filtre principal et vérifier colmatage
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Graisser les roulements (Graisse SKF LGFP2)
            </li>
          </ul>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
         {can(PERMISSIONS.PREVENTIVE_UPDATE) && (
           <button className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
             Modifier
           </button>
         )}
         {can(PERMISSIONS.PREVENTIVE_EXECUTE) && (
           <button 
              onClick={() => {
                handleTriggerPlan(selectedPlanDetails);
                setSelectedPlanDetails(null);
                setActivePlanToDrag(null);
              }}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
             Générer OT
           </button>
         )}
      </div>
    </div>
  );
};
