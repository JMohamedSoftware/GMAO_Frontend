import React from 'react';
import { Tenant } from '@/shared/types/gmao';
import { Building2, AlertCircle, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SuperAdminDashboardProps {
  mrr: number;
  activeCount: number;
  registeredCount: number;
  pendingCount: number;
  revenueHistory: { month: string; revenue: number }[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  mrr,
  activeCount,
  registeredCount,
  pendingCount,
  revenueHistory
}) => {
  return (
    <>
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Recurring Revenue</span>
            <span className="text-xl font-black text-slate-850 dark:text-white block mt-1 font-mono">{mrr.toLocaleString()} TND</span>
            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> +15.4% ce mois</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><DollarSign className="w-5 h-5" /></div>
        </div>

        <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Entreprises Actives</span>
            <span className="text-xl font-black text-slate-850 dark:text-white block mt-1">{activeCount} / {registeredCount}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">100% hébergé en Cloud</span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Building2 className="w-5 h-5" /></div>
        </div>

        <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Demandes en attente</span>
            <span className="text-xl font-black text-rose-500 block mt-1">{pendingCount}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Approbation requise</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl"><AlertCircle className="w-5 h-5" /></div>
        </div>

        <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Disponibilité Plateforme</span>
            <span className="text-xl font-black text-emerald-500 block mt-1">99.98 %</span>
            <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">Opérationnel</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl"><Activity className="w-5 h-5" /></div>
        </div>
      </div>

      {/* SaaS Platform Revenue chart */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-primary" />
            Progression de l'Audience & MRR
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Revenu mensuel récurrent cumulé</p>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
              <YAxis stroke="#94A3B8" fontSize={9} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" name="MRR (TND)" stroke="#2563EB" fill="#2563EB" fillOpacity={0.06} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
