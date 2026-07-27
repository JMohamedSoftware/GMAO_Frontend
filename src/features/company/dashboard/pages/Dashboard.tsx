import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { Equipment } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { localisationsApi } from '@/shared/api/localisations.api';
import { Localisation } from '@/shared/types/gmao';

import { DashboardNavigation } from '../components/DashboardNavigation';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardTree } from '../components/DashboardTree';
import { DashboardRecentActivities } from '../components/DashboardRecentActivities';
import { DashboardCharts } from '../components/DashboardCharts';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectEquipment }) => {
  const { workOrders, equipments, incidents, technicians, parts, addIncident } = useGmao();
  const { can } = usePermissions();

  // Quick-peek drawer state for arborescence clicks
  const [selectedDashboardEq, setSelectedDashboardEq] = useState<Equipment | null>(null);
  const [dynamicTree, setDynamicTree] = useState<any>(null);

  React.useEffect(() => {
    const fetchTree = async () => {
      try {
        const roots = await localisationsApi.getTree();
        
        const buildNode = (loc: Localisation): any => {
          const eqsInLoc = equipments.filter(e => e.localisationId === loc.id);
          const eqNodes = eqsInLoc.map(e => ({ name: `${e.id} - ${e.name}`, eqId: e.id }));
          const childNodes = (loc.sousLocalisations || []).map(buildNode);
          return {
            name: loc.nom,
            children: [...childNodes, ...eqNodes]
          };
        };

        const rootChildren = roots.map(buildNode);
        
        // If there are equipments with NO localisation, group them under "Non assignés"
        const eqsWithoutLoc = equipments.filter(e => !e.localisationId);
        if (eqsWithoutLoc.length > 0) {
          rootChildren.push({
            name: 'Équipements non assignés',
            children: eqsWithoutLoc.map(e => ({ name: `${e.id} - ${e.name}`, eqId: e.id }))
          });
        }
        
        setDynamicTree({
          name: 'Usine / Parc Global',
          children: rootChildren
        });

      } catch (err) {
        console.error('Failed to fetch localisations tree', err);
      }
    };
    
    // Refresh tree if equipments change or on mount
    fetchTree();
  }, [equipments]);

  // Stats Calculations
  const totalLaborCost = workOrders.reduce((acc, ot) => {
    if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
      const tech = technicians.find(t => t.id === ot.technicianId);
      const rate = tech ? tech.hourlyRate : 35;
      const durationHours = ot.durationMinutes / 60;
      return acc + (durationHours * rate);
    }
    return acc;
  }, 0);

  const totalPartsCost = workOrders.reduce((acc, ot) => {
    if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
      const orderParts = ot.partsUsed.reduce((partAcc, usage) => {
        const part = parts.find(p => p.ref === usage.partRef);
        const price = part ? part.unitPrice : 0;
        return partAcc + (price * usage.quantity);
      }, 0);
      return acc + orderParts;
    }
    return acc;
  }, 0);

  const totalMaintCost = Math.round(totalLaborCost + totalPartsCost);

  // 1. Dimo Maint "Mes infos DI"
  const diATraiter = incidents.filter(i => i.status === 'Nouveau').length;
  const diEnCours = incidents.filter(i => i.status === 'Validé').length;
  const diRealise = incidents.filter(i => i.status === 'Transformé en OT' || i.status === 'Rejeté').length;

  // 2. Dimo Maint "Les infos BT"
  const btAFaire = workOrders.filter(o => o.status === 'En attente' || o.status === 'Affecté').length;
  const btEnCours = workOrders.filter(o => o.status === 'En cours').length;
  const btFait = workOrders.filter(o => o.status === 'Terminé' || o.status === 'Clôturé').length;

  // Recharts composed dataset
  const monthlyTrendsData = [
    { name: 'Jan', pannes: 4, cost: 4200 },
    { name: 'Fév', pannes: 3, cost: 3800 },
    { name: 'Mar', pannes: 5, cost: 5100 },
    { name: 'Avr', pannes: 2, cost: 2400 },
    { name: 'Mai', pannes: 7, cost: 7200 },
    { name: 'Juin', pannes: 6, cost: 6800 },
    { name: 'Juil', pannes: btEnCours + diATraiter + 3, cost: totalMaintCost || 8900 }
  ];

  // Unassigned Work Orders
  const unassignedOts = workOrders.filter(ot => ot.status === 'En attente' && !ot.technicianId);

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Accueil Supervision
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Interface d'exploitation connectée • Dimo Maint layout
          </p>
        </div>
      </div>

      {/* Dimo Maint Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ROW 1 LEFT: Mes menus favoris grid (Col-span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <DashboardNavigation onNavigate={onNavigate} />
        </div>

        {/* ROW 1 RIGHT: DI/BT counters only (Col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <DashboardStats 
            diATraiter={diATraiter}
            diEnCours={diEnCours}
            diRealise={diRealise}
            btAFaire={btAFaire}
            btEnCours={btEnCours}
            btFait={btFait}
            onNavigate={onNavigate}
          />
        </div>

        {/* ROW 2: Arborescence (left 8 cols) + Quick-peek panel (right 4 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {can(PERMISSIONS.EQUIPMENT_VIEW) && (
            dynamicTree ? (
              <DashboardTree 
                factoryTree={dynamicTree}
                equipments={equipments}
                selectedDashboardEq={selectedDashboardEq}
                setSelectedDashboardEq={setSelectedDashboardEq}
                onNavigate={onNavigate}
                onSelectEquipmentToNavigate={onSelectEquipment}
              />
            ) : (
              <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-12 text-center shadow-sm">
                <span className="text-sm font-bold text-slate-500 animate-pulse">Chargement de l'arborescence...</span>
              </div>
            )
          )}
        </div>

        {/* ROW 2 RIGHT: Demande d'intervention Form & Unassigned OTs (Col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <DashboardRecentActivities 
            equipments={equipments}
            unassignedOts={unassignedOts}
            addIncident={addIncident}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* Bottom section: Collapsible Supervision Visualizer & Performance charts */}
      <DashboardCharts 
        monthlyTrendsData={monthlyTrendsData}
        btFait={btFait}
        btEnCours={btEnCours}
        btAFaire={btAFaire}
        onSelectEquipment={onSelectEquipment}
      />
    </div>
  );
};
