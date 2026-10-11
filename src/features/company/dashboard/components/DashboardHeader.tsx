import React from 'react';
import { Home, Calendar, MapPin, LayoutDashboard, Factory } from 'lucide-react';

interface DashboardHeaderProps {
  activeView: 'supervision' | 'map';
  setActiveView: (view: 'supervision' | 'map') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeView,
  setActiveView,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-sm">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Tableau de bord
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40">
              Usine Tomate
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vue globale de votre usine et de la maintenance en temps réel
          </p>
        </div>
      </div>

      {/* View switchers and Date Pill */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Toggle View */}
        <div className="p-1 bg-slate-150 dark:bg-slate-800/80 rounded-xl flex items-center gap-1 border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveView('supervision')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'supervision'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Vue Supervision
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'map'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            Plan de l'usine
          </button>
        </div>

        {/* Date Button */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Aujourd'hui, {todayFormatted}</span>
        </div>
      </div>
    </div>
  );
};
