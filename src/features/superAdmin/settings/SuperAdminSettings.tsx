import React from 'react';
import { Lock } from 'lucide-react';

export const SuperAdminSettings: React.FC = () => {
  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm max-w-2xl">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
        <Lock className="w-4.5 h-4.5 text-primary" /> Sécurité globale & Infrastucture
      </h3>
      
      <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">Authentification Double Facteur (2FA)</h4>
            <p className="text-[10px] text-slate-400 font-medium">Imposer le 2FA à tous les comptes administrateurs de l'application.</p>
          </div>
          <button className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner cursor-pointer">
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow"></div>
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">Certificat SSL (Wildcard)</h4>
            <p className="text-[10px] text-slate-400 font-medium">*.platform.com (Géré par AWS ACM)</p>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold">
            Valide (Expire dans 243 jours)
          </span>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">Isolation des bases de données</h4>
            <p className="text-[10px] text-slate-400 font-medium">Séparation physique par Tenant (Row-Level Security active)</p>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">
            Strict Mode
          </span>
        </div>
      </div>
    </div>
  );
};
