import React from 'react';
import { Package } from 'lucide-react';

interface SuperAdminPlansProps {
  plansConfig: { Basic: number, Premium: number, Enterprise: number };
  setPlansConfig: React.Dispatch<React.SetStateAction<{ Basic: number, Premium: number, Enterprise: number }>>;
  handleSavePlans: (e: React.FormEvent) => void;
  showConfigSaved: boolean;
}

export const SuperAdminPlans: React.FC<SuperAdminPlansProps> = ({
  plansConfig,
  setPlansConfig,
  handleSavePlans,
  showConfigSaved
}) => {
  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm max-w-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Package className="w-4.5 h-4.5 text-primary" />
          Configuration des Tarifs SaaS
        </h3>
        {showConfigSaved && <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">Sauvegardé !</span>}
      </div>
      <form onSubmit={handleSavePlans} className="flex flex-col gap-4 text-xs font-semibold">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Basic</h4>
              <p className="text-[10px] text-slate-500">Jusqu'à 5 utilisateurs, 15 équipements</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" required value={plansConfig.Basic} onChange={(e) => setPlansConfig(prev => ({ ...prev, Basic: Number(e.target.value) }))} className="w-24 p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none font-semibold bg-transparent text-right" />
              <span className="text-slate-400">TND/mois</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAIRE</div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Premium</h4>
              <p className="text-[10px] text-slate-500">Jusqu'à 20 utilisateurs, 50 équipements</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" required value={plansConfig.Premium} onChange={(e) => setPlansConfig(prev => ({ ...prev, Premium: Number(e.target.value) }))} className="w-24 p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none font-semibold bg-transparent text-right" />
              <span className="text-slate-400">TND/mois</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Enterprise</h4>
              <p className="text-[10px] text-slate-500">Jusqu'à 100 utilisateurs, 500 équipements</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" required value={plansConfig.Enterprise} onChange={(e) => setPlansConfig(prev => ({ ...prev, Enterprise: Number(e.target.value) }))} className="w-24 p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none font-semibold bg-transparent text-right" />
              <span className="text-slate-400">TND/mois</span>
            </div>
          </div>
        </div>
        <button type="submit" className="py-2 px-4 bg-primary text-white hover:bg-primary/95 font-bold rounded-lg shadow self-end hover-lift mt-2 cursor-pointer">
          Enregistrer les Modifs
        </button>
      </form>
    </div>
  );
};
