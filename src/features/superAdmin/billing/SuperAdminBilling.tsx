import React from 'react';
import { CreditCard, CheckCircle2, Hourglass } from 'lucide-react';

export const SuperAdminBilling: React.FC = () => {
  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <CreditCard className="w-4.5 h-4.5 text-primary" /> Historique de Facturation & Paiements
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] uppercase text-slate-400">
              <th className="p-3 font-bold">Date</th>
              <th className="p-3 font-bold">Client</th>
              <th className="p-3 font-bold">Plan</th>
              <th className="p-3 font-bold">Montant</th>
              <th className="p-3 font-bold">Statut</th>
              <th className="p-3 font-bold">Facture</th>
            </tr>
          </thead>
          <tbody className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-3">01 Juil 2026</td>
              <td className="p-3 font-bold text-slate-800 dark:text-white">Conserves du Nord S.A.</td>
              <td className="p-3"><span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Premium</span></td>
              <td className="p-3 font-mono">599,00 TND</td>
              <td className="p-3"><span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Payé</span></td>
              <td className="p-3"><button className="text-primary hover:underline font-bold text-[10px]">PDF</button></td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-3">01 Juil 2026</td>
              <td className="p-3 font-bold text-slate-800 dark:text-white">Tomates du Sud</td>
              <td className="p-3"><span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold">Basic</span></td>
              <td className="p-3 font-mono">299,00 TND</td>
              <td className="p-3"><span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Payé</span></td>
              <td className="p-3"><button className="text-primary hover:underline font-bold text-[10px]">PDF</button></td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-3">28 Juin 2026</td>
              <td className="p-3 font-bold text-slate-800 dark:text-white">AgroTech Centre</td>
              <td className="p-3"><span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold">Enterprise</span></td>
              <td className="p-3 font-mono">1 299,00 TND</td>
              <td className="p-3"><span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-max"><Hourglass className="w-3 h-3"/> En attente</span></td>
              <td className="p-3"><button className="text-primary hover:underline font-bold text-[10px]">PDF</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
