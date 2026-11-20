import React from 'react';
import { 
  FilePlus, 
  Calendar, 
  AlertTriangle, 
  Package, 
  BarChart3,
  Lock
} from 'lucide-react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';

interface DashboardActionCardsProps {
  onNavigate: (screen: string) => void;
  onOpenDeclareIncident: () => void;
  isCampaignClosed?: boolean;
}

export const DashboardActionCards: React.FC<DashboardActionCardsProps> = ({
  onNavigate,
  onOpenDeclareIncident,
  isCampaignClosed = false
}) => {
  const { can } = usePermissions();

  const actions = [
    {
      id: 'create-ot',
      title: 'Créer un OT',
      subtitle: isCampaignClosed ? 'Campagne clôturée' : 'Nouvelle intervention',
      icon: isCampaignClosed ? Lock : FilePlus,
      bg: isCampaignClosed ? 'bg-slate-400 dark:bg-slate-800 text-slate-200 cursor-not-allowed opacity-75' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
      border: 'border-blue-500/30',
      action: () => {
        if (!isCampaignClosed) onNavigate('workorders');
      },
      visible: can(PERMISSIONS.WORKORDER_CREATE)
    },
    {
      id: 'plan-mp',
      title: 'Planifier maintenance',
      subtitle: isCampaignClosed ? 'Campagne clôturée' : 'Préventive / Périodique',
      icon: isCampaignClosed ? Lock : Calendar,
      bg: isCampaignClosed ? 'bg-slate-400 dark:bg-slate-800 text-slate-200 cursor-not-allowed opacity-75' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer',
      border: 'border-emerald-500/30',
      action: () => {
        if (!isCampaignClosed) onNavigate('preventive');
      },
      visible: can(PERMISSIONS.PREVENTIVE_VIEW)
    },
    {
      id: 'report-failure',
      title: 'Déclarer une panne',
      subtitle: isCampaignClosed ? 'Campagne clôturée' : 'Machine en arrêt',
      icon: isCampaignClosed ? Lock : AlertTriangle,
      bg: isCampaignClosed ? 'bg-slate-400 dark:bg-slate-800 text-slate-200 cursor-not-allowed opacity-75' : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer',
      border: 'border-rose-500/30',
      action: () => {
        if (!isCampaignClosed) onOpenDeclareIncident();
      },
      visible: can(PERMISSIONS.INCIDENT_CREATE)
    },
    {
      id: 'manage-stock',
      title: 'Gérer le stock',
      subtitle: 'Pièces de rechange',
      icon: Package,
      bg: 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer',
      border: 'border-amber-500/30',
      action: () => onNavigate('inventory'),
      visible: can(PERMISSIONS.INVENTORY_VIEW)
    },
    {
      id: 'view-reports',
      title: 'Voir les rapports',
      subtitle: 'Production & Maintenance',
      icon: BarChart3,
      bg: 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer',
      border: 'border-purple-500/30',
      action: () => onNavigate('reports'),
      visible: can(PERMISSIONS.REPORT_VIEW)
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.filter(a => a.visible).map(act => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.action}
            disabled={isCampaignClosed && ['create-ot', 'plan-mp', 'report-failure'].includes(act.id)}
            className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${act.bg}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="font-extrabold text-xs text-white leading-tight truncate">
                {act.title}
              </h4>
              <p className="text-[10px] text-white/80 font-medium truncate mt-0.5">
                {act.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
