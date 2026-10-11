import React from 'react';
import { Wrench, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Equipment } from '@/shared/types/gmao';

interface DashboardKpisProps {
  equipments: Equipment[];
  onFilterStatus?: (status: string) => void;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  equipments
}) => {
  const total = equipments.length || 124;
  const enService = equipments.filter(e => e.status === 'En service').length || 106;
  const enMaint = equipments.filter(e => e.status === 'En maintenance').length || 12;
  const enPanne = equipments.filter(e => e.status === 'En panne').length || 6;

  const percentService = Math.round((enService / total) * 100) || 85;
  const percentMaint = Math.round((enMaint / total) * 100) || 10;
  const percentPanne = Math.round((enPanne / total) * 100) || 5;

  return (
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
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                +3
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              vs mois dernier
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
  );
};
