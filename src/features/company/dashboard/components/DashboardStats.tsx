import React from 'react';

interface DashboardStatsProps {
  diATraiter: number;
  diEnCours: number;
  diRealise: number;
  btAFaire: number;
  btEnCours: number;
  btFait: number;
  onNavigate: (screen: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  diATraiter, diEnCours, diRealise, btAFaire, btEnCours, btFait, onNavigate
}) => {
  return (
    <>
      {/* DI status grid (Mes infos DI) - clickable */}
      <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
          Mes infos DI (Demandes d'Intervention)
        </h3>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <button onClick={() => onNavigate('corrective')} className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-rose-500/20 transition-colors">
            <span className="text-xl font-black block">{diATraiter}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">À traiter</span>
          </button>
          <button onClick={() => onNavigate('corrective')} className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
            <span className="text-xl font-black block">{diEnCours}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">En cours</span>
          </button>
          <button onClick={() => onNavigate('corrective')} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-emerald-500/20 transition-colors">
            <span className="text-xl font-black block">{diRealise}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">Réalisé</span>
          </button>
        </div>
      </div>

      {/* BT status grid (Les infos BT) - clickable */}
      <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
          Les infos OT (Order de Travail)
        </h3>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <button onClick={() => onNavigate('workorders')} className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-rose-500/20 transition-colors">
            <span className="text-xl font-black block">{btAFaire}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">À faire</span>
          </button>
          <button onClick={() => onNavigate('workorders')} className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
            <span className="text-xl font-black block">{btEnCours}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">En cours</span>
          </button>
          <button onClick={() => onNavigate('workorders')} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-emerald-500/20 transition-colors">
            <span className="text-xl font-black block">{btFait}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">Fait</span>
          </button>
        </div>
      </div>
    </>
  );
};
