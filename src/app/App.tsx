import React, { useState, useEffect } from 'react';
import { useGmao } from '../hooks/useGmao';
import { Equipment as EqType, Incident as IncType } from '../types/gmao';
import { MainLayout } from '../layouts/MainLayout';
import { IncidentModalProvider } from '../context/IncidentModalContext';
import { Login } from '../features/auth/pages/Login';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { Equipment } from '../features/equipments/pages/EquipmentPage';
import { Preventive } from '../features/preventive/pages/Preventive';
import { Corrective } from '../features/corrective/pages/Corrective';
import { WorkOrders } from '../features/workOrders/pages/WorkOrdersPage';
import { Inventory } from '../features/inventory/pages/Inventory';
import { Reports } from '../features/reports/pages/Reports';
import { Suppliers } from '../features/suppliers/pages/Suppliers';
import { Admin } from '../features/admin/pages/Admin';
import { SuperAdmin } from '../features/admin/pages/SuperAdminPage';
import { AccessGuard } from '../components/AccessGuard';

function AppContent() {
  const { currentUser, equipments, impersonatedTenantId } = useGmao();
  
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen');
    return initialScreen || 'dashboard';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen');
    if (initialScreen) {
      setCurrentScreen(initialScreen);
      return;
    }
    if (currentUser?.role === 'SuperAdmin') {
      if (impersonatedTenantId) {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('saas-dashboard');
      }
    }
  }, [currentUser, impersonatedTenantId]);

  // Inter-page state passes
  const [selectedEqFromDash, setSelectedEqFromDash] = useState<EqType | null>(null);
  const [selectedOtFromUrl, setSelectedOtFromUrl] = useState<string | null>(null);
  const [prefilledIncident, setPrefilledIncident] = useState<IncType | null>(null);

  // Custom Router navigation resolver
  const handleNavigate = (target: string) => {
    if (target.startsWith('equipment-detail:')) {
      const eqId = target.split(':')[1];
      const eq = equipments.find(e => e.id === eqId);
      if (eq) {
        setSelectedEqFromDash(eq);
        setCurrentScreen('equipment');
      }
    } else if (target.startsWith('workorder-detail:')) {
      const otId = target.split(':')[1];
      setSelectedOtFromUrl(otId);
      setCurrentScreen('workorders');
    } else {
      setCurrentScreen(target);
    }
  };

  // If not logged in, render the login page
  if (!currentUser) {
    return <Login onLoginSuccess={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <MainLayout currentScreen={currentScreen} onNavigate={handleNavigate}>
      {currentScreen === 'dashboard' && (
        <AccessGuard page="dashboard">
          <Dashboard 
            onNavigate={handleNavigate}
            onSelectEquipment={(eq) => {
              setSelectedEqFromDash(eq);
              setCurrentScreen('equipment');
            }}
          />
        </AccessGuard>
      )}

      {currentScreen === 'equipment' && (
        <AccessGuard page="equipment">
          <Equipment 
            selectedEqFromDash={selectedEqFromDash}
            onClearSelectedEq={() => setSelectedEqFromDash(null)}
            onNavigate={handleNavigate}
          />
        </AccessGuard>
      )}

      {currentScreen === 'preventive' && (
        <AccessGuard page="preventive">
          <Preventive onNavigate={handleNavigate} />
        </AccessGuard>
      )}

      {currentScreen === 'corrective' && (
        <AccessGuard page="corrective">
          <Corrective 
            onNavigate={handleNavigate}
            onOpenCreateOtWithIncident={(inc) => {
              setPrefilledIncident(inc);
              setCurrentScreen('workorders');
            }}
          />
        </AccessGuard>
      )}

      {currentScreen === 'workorders' && (
        <AccessGuard page="workorders">
          <WorkOrders 
            selectedOtFromUrl={selectedOtFromUrl}
            onClearSelectedOt={() => setSelectedOtFromUrl(null)}
            prefilledIncident={prefilledIncident}
            onClearPrefilledIncident={() => setPrefilledIncident(null)}
          />
        </AccessGuard>
      )}

      {currentScreen === 'inventory' && (
        <AccessGuard page="inventory">
          <Inventory onNavigate={setCurrentScreen} />
        </AccessGuard>
      )}

      {currentScreen === 'suppliers' && (
        <AccessGuard page="suppliers">
          <Suppliers />
        </AccessGuard>
      )}

      {currentScreen === 'reports' && (
        <AccessGuard page="reports">
          <Reports />
        </AccessGuard>
      )}

      {currentScreen === 'admin' && (
        <AccessGuard page="admin">
          <Admin />
        </AccessGuard>
      )}

      {currentScreen.startsWith('saas-') && (
        <SuperAdmin activeTab={currentScreen.split('-')[1] as any} />
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <IncidentModalProvider>
      <AppContent />
    </IncidentModalProvider>
  );
}

export default App;
