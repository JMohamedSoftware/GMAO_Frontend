import React from 'react';
import { 
  FilePlus, 
  Calendar, 
  AlertTriangle, 
  Package, 
  BarChart3 
} from 'lucide-react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';

interface DashboardActionCardsProps {
  onNavigate: (screen: string) => void;
  onOpenDeclareIncident: () => void;
}

export const DashboardActionCards: React.FC<DashboardActionCardsProps> = ({
  onNavigate,
  onOpenDeclareIncident
}) => {
  const { can } = usePermissions();

  const actions = [
    {
      id: 'create-ot',
      title: 'Créer un OT',
      subtitle: 'Nouvelle intervention',
      icon: FilePlus,
      bg: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'border-blue-500/30',
      action: () => onNavigate('workorders'),
      visible: can(PERMISSIONS.WORKORDER_CREATE)
    },
    {
      id: 'plan-mp',
      title: 'Planifier maintenance',
      subtitle: 'Préventive / Périodique',
      icon: Calendar,
      bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'border-emerald-500/30',
      action: () => onNavigate('preventive'),
      visible: can(PERMISSIONS.PREVENTIVE_VIEW)
    },
    {
      id: 'report-failure',
      title: 'Déclarer une panne',
      subtitle: 'Machine en arrêt',
      icon: AlertTriangle,
      bg: 'bg-rose-600 hover:bg-rose-700 text-white',
      border: 'border-rose-500/30',
      action: onOpenDeclareIncident,
      visible: can(PERMISSIONS.INCIDENT_CREATE)
    },
    {
      id: 'manage-stock',
      title: 'Gérer le stock',
      subtitle: 'Pièces de rechange',
      icon: Package,
      bg: 'bg-amber-600 hover:bg-amber-700 text-white',
      border: 'border-amber-500/30',
      action: () => onNavigate('inventory'),
      visible: can(PERMISSIONS.INVENTORY_VIEW)
    },
    {
      id: 'view-reports',
      title: 'Voir les rapports',
      subtitle: 'Production & Maintenance',
      icon: BarChart3,
      bg: 'bg-purple-600 hover:bg-purple-700 text-white',
      border: 'border-purple-500/30',
      action: () => onNavigate('reports'),
      visible: true
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
            className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm cursor-pointer ${act.bg}`}
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
