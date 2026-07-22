import React from 'react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  Plus, 
  AlertTriangle, 
  FolderTree,
  Calendar,
  Truck,
  Activity,
  Package,
  Sliders
} from 'lucide-react';

interface DashboardNavigationProps {
  onNavigate: (screen: string) => void;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ onNavigate }) => {
  const { can } = usePermissions();

  return (
    <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
      <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4">
        Mes menus favoris
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white text-[11px] font-bold">
        {/* Red DI creation */}
        <button 
          onClick={() => {
            const formEl = document.getElementById('di-form');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="aspect-video bg-gradient-to-br from-rose-400 to-rose-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-rose-200 dark:hover:shadow-rose-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-rose-300/30"
        >
          <AlertTriangle className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Création de DI</span>
        </button>

        {/* Orange BT creation */}
        <button 
          onClick={() => onNavigate('workorders')}
          className="aspect-video bg-gradient-to-br from-amber-400 to-orange-500 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-amber-200 dark:hover:shadow-amber-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-amber-300/30"
        >
          <Plus className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Création de BT</span>
        </button>

        {/* Emerald Arborescence */}
        <button 
          onClick={() => onNavigate('equipment')}
          className="aspect-video bg-gradient-to-br from-emerald-400 to-teal-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-emerald-300/30"
        >
          <FolderTree className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Arborescence</span>
        </button>

        {/* Pink Preventive */}
        <button 
          onClick={() => onNavigate('preventive')}
          className="aspect-video bg-gradient-to-br from-pink-400 to-fuchsia-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-pink-200 dark:hover:shadow-pink-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-pink-300/30"
        >
          <Calendar className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Prév. Plannings</span>
        </button>

        {/* Indigo Gammes */}
        {can(PERMISSIONS.USER_VIEW) && (
        <button 
          onClick={() => onNavigate('admin')}
          className="aspect-video bg-gradient-to-br from-indigo-500 to-slate-700 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/30"
        >
          <Sliders className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Gammes / Roles</span>
        </button>
        )}

        {/* Cyan Pièces */}
        <button 
          onClick={() => onNavigate('inventory')}
          className="aspect-video bg-gradient-to-br from-sky-400 to-cyan-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-sky-200 dark:hover:shadow-sky-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-sky-300/30"
        >
          <Package className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Pièces Rechange</span>
        </button>

        {/* Violet Partenaires */}
        {can(PERMISSIONS.SUPPLIER_VIEW) && (
        <button 
          onClick={() => onNavigate('suppliers')}
          className="aspect-video bg-gradient-to-br from-violet-400 to-purple-700 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-violet-200 dark:hover:shadow-violet-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-violet-300/30"
        >
          <Truck className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Partenaires</span>
        </button>
        )}

        {/* Yellow Contrats */}
        {can(PERMISSIONS.REPORT_VIEW) && (
        <button 
          onClick={() => onNavigate('reports')}
          className="aspect-video bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-800 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-yellow-200 dark:hover:shadow-yellow-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-yellow-300/30"
        >
          <Activity className="w-5 h-5 drop-shadow" />
          <span className="drop-shadow">Rapports</span>
        </button>
        )}
      </div>
    </div>
  );
};
