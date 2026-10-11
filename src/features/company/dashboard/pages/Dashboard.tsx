import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { Equipment } from '@/shared/types/gmao';

import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardActionCards } from '../components/DashboardActionCards';
import { DashboardKpis } from '../components/DashboardKpis';
import { DashboardParkSection } from '../components/DashboardParkSection';
import { DashboardFactoryMap } from '../components/DashboardFactoryMap';
import { DashboardAnalytics } from '../components/DashboardAnalytics';
import { DeclareIncidentModal } from '../components/DeclareIncidentModal';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectEquipment }) => {
  const { workOrders, equipments, incidents, addIncident } = useGmao();
  
  // View toggle: 'supervision' (Image 2 style) or 'map' (Image 3/4 style)
  const [activeView, setActiveView] = useState<'supervision' | 'map'>('supervision');
  
  // Selected equipment in the park / tree section
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  
  // Modal for declaring an incident / panne
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header with Title & Date */}
      <DashboardHeader
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* 2. Top Quick Actions (Image 4 top cards) */}
      <DashboardActionCards
        onNavigate={onNavigate}
        onOpenDeclareIncident={() => setIsDeclareModalOpen(true)}
      />

      {/* 3. 4 Core KPI Cards with mini sparklines (Image 2) */}
      <DashboardKpis
        equipments={equipments}
      />

      {/* 4. Main Body: Supervision (Image 2) or Factory Map (Image 3 & 4) */}
      {activeView === 'supervision' ? (
        <>
          {/* 3-Column Core: Arborescence (Left), Machine Card (Center), DIs (Right) */}
          <DashboardParkSection
            equipments={equipments}
            incidents={incidents}
            selectedEq={selectedEq}
            setSelectedEq={setSelectedEq}
            onNavigate={onNavigate}
            onSelectEquipment={onSelectEquipment}
            onOpenDeclareIncident={() => setIsDeclareModalOpen(true)}
          />

          {/* Bottom Analytics: Donut Status, OT Bar Chart, Top 5 Sollicités */}
          <DashboardAnalytics
            equipments={equipments}
            workOrders={workOrders}
            onNavigate={onNavigate}
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
