import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { Equipment } from '@/shared/types/gmao';

import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardActionCards } from '../components/DashboardActionCards';
import { DashboardKpis } from '../components/DashboardKpis';
import { DashboardParkSection } from '../components/DashboardParkSection';
import { DashboardFactoryMap } from '../components/DashboardFactoryMap';
import { DashboardAnalytics } from '../components/DashboardAnalytics';
import { DeclareIncidentModal } from '../components/DeclareIncidentModal';
import { calculateUnifiedMaintenanceKpis } from '@/shared/services/kpiCalculator';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectEquipment }) => {
  const { 
    workOrders, 
    equipments, 
    incidents, 
    technicians, 
    parts, 
    currentUser,
    addIncident,
    isCampaignClosed,
    campaignWorkOrders,
    campaignIncidents
  } = useGmao();

  const { can, isProduction } = usePermissions();

  const canViewEquipments = can(PERMISSIONS.EQUIPMENT_VIEW);
  const canViewWorkOrders = can(PERMISSIONS.WORKORDER_VIEW);
  const canViewIncidents = can(PERMISSIONS.INCIDENT_VIEW);
  const canCreateIncidents = can(PERMISSIONS.INCIDENT_CREATE);
  const canViewReports = can(PERMISSIONS.REPORT_VIEW);
  
  // View toggle: 'supervision' (Image 2 style) or 'map' (Image 3/4 style)
  const [activeView, setActiveView] = useState<'supervision' | 'map'>('supervision');

  // If user has no permission to view equipments, force supervision view
  const effectiveActiveView = !canViewEquipments ? 'supervision' : activeView;
  
  // Selected equipment in the park / tree section
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  
  // Modal for declaring an incident / panne
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);

  // Scoped lists strictly according to the selected campaign (2026 vs 2025 archive)
  const currentOrders = campaignWorkOrders;
  const currentIncidents = isProduction
    ? campaignIncidents.filter(inc => {
        const myId = currentUser?.id ? String(currentUser.id) : '';
        const myName = currentUser?.name ? currentUser.name.toLowerCase() : '';
        return (myId && inc.reportedBy === myId) || 
               (myName && inc.reportedBy.toLowerCase().includes(myName));
      })
    : campaignIncidents;

  const {
    totalLaborCost,
    totalPartsCost,
    totalMaintenanceCost: totalMaintCost
  } = calculateUnifiedMaintenanceKpis({
    equipments,
    workOrders: currentOrders,
    incidents: currentIncidents,
    parts,
    technicians,
    isProduction
  });

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header with Title & Date & Campagne */}
      <DashboardHeader
        activeView={effectiveActiveView}
        setActiveView={setActiveView}
        canViewEquipments={canViewEquipments}
      />

      {/* 2. Actions rapides supérieures */}
      <DashboardActionCards
        onNavigate={onNavigate}
        onOpenDeclareIncident={() => setIsDeclareModalOpen(true)}
        isCampaignClosed={isCampaignClosed}
      />

      {/* 3. Cartes KPI principales : compteurs de statuts + normes industrielles (MTBF, MTTR, Disponibilité, Coût) */}
      <DashboardKpis
        equipments={equipments}
        workOrders={currentOrders}
        incidents={currentIncidents}
        parts={parts}
        technicians={technicians}
        totalLaborCost={totalLaborCost}
        totalPartsCost={totalPartsCost}
        totalMaintCost={totalMaintCost}
        canViewEquipments={canViewEquipments}
        canViewWorkOrders={canViewWorkOrders}
        canViewIncidents={canViewIncidents}
        canViewReports={canViewReports}
        isProduction={isProduction}
      />

      {/* 4. Main Body: Supervision (Image 2) or Factory Map (Image 3 & 4) */}
      {effectiveActiveView === 'supervision' ? (
        <>
          {/* 3-Column Core: Arborescence (Left), Machine Card (Center), DIs & OTs (Right) */}
          <DashboardParkSection
            equipments={equipments}
            incidents={currentIncidents}
            workOrders={currentOrders}
            selectedEq={selectedEq}
            setSelectedEq={setSelectedEq}
            onNavigate={onNavigate}
            onSelectEquipment={onSelectEquipment}
            onOpenDeclareIncident={() => setIsDeclareModalOpen(true)}
            canViewEquipments={canViewEquipments}
            canViewWorkOrders={canViewWorkOrders}
            canViewIncidents={canViewIncidents}
            canCreateIncidents={canCreateIncidents}
          />

          {/* Bottom Analytics: Donut Status, OT Bar Chart, Top 5 Sollicités */}
          <DashboardAnalytics
            equipments={equipments}
            workOrders={currentOrders}
            onNavigate={onNavigate}
            canViewEquipments={canViewEquipments}
            canViewWorkOrders={canViewWorkOrders}
          />
        </>
      ) : (
        /* Aerial Tomato Factory Map with Hotspots & Telemetry Cards */
        <DashboardFactoryMap
          equipments={equipments}
          onSelectEquipment={onSelectEquipment}
          onNavigate={onNavigate}
        />
      )}

      {/* Modal for Declaring Panne / DI */}
      <DeclareIncidentModal
        isOpen={isDeclareModalOpen}
        onClose={() => setIsDeclareModalOpen(false)}
        equipments={equipments}
        addIncident={addIncident}
      />
    </div>
  );
};
