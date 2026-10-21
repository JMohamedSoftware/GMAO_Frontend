import React, { useState, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { Equipment as EqType, Incident as IncType } from '@/shared/types/gmao';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { IncidentModalProvider } from '@/context/IncidentModalContext';
import { Login } from '@/features/auth/pages/Login';
import { Dashboard } from '@/features/company/dashboard/pages/Dashboard';
import { Equipment } from '@/features/company/equipments/pages/EquipmentPage';
import { Preventive } from '@/features/company/preventive/pages/Preventive';
import { Corrective } from '@/features/company/incidents/pages/Corrective';
import { WorkOrders } from '@/features/company/workOrders/pages/WorkOrdersPage';
import { Inventory } from '@/features/company/inventory/pages/Inventory';
import { Reports } from '@/features/company/reports/pages/Reports';
import { Suppliers } from '@/features/company/suppliers/pages/Suppliers';
import { Admin } from '@/features/company/settings/Admin';
import { SuperAdmin } from '@/features/superAdmin/dashboard/SuperAdminPage';
import { EquipesPage } from '@/features/company/equipes/pages/EquipesPage';
import { AccessGuard } from '@/shared/components/AccessGuard';
import { PERMISSIONS } from '@/shared/permissions';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

function AppContent() {
  const { currentUser, equipments, impersonatedTenantId } = useGmao();
  
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    let storedRole: string | undefined;
    try {
      const storedUser = localStorage.getItem('gmao_current_user');
      const storedSession = localStorage.getItem('gmao_session');
      if (storedUser) {
        storedRole = JSON.parse(storedUser)?.role;
      } else if (storedSession) {
        storedRole = JSON.parse(storedSession)?.user?.role;
      }
    } catch {}

    const isSuperAdmin = storedRole === 'SuperAdmin';
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen');

    // Security check: Only SuperAdmin can start on saas-* screens
    if (initialScreen) {
      if (initialScreen.startsWith('saas-')) {
        return isSuperAdmin ? initialScreen : 'dashboard';
      }
      return initialScreen;
    }

    if (isSuperAdmin) {
      const storedImpersonated = localStorage.getItem('gmao_impersonated_tenant_id');
      if (!storedImpersonated || storedImpersonated === 'null' || storedImpersonated === 'undefined') {
        return 'saas-dashboard';
      }
    }

    return 'dashboard';
  });

  useEffect(() => {
    const isSuperAdmin = currentUser?.role === 'SuperAdmin';
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');

    // Case 1: SuperAdmin (and NOT simulating a tenant)
    if (isSuperAdmin && !impersonatedTenantId) {
      if (!screenParam || screenParam === 'dashboard' || currentScreen === 'dashboard') {
        setCurrentScreen('saas-dashboard');
      }
    }
    // Case 2: Regular company users (Administrateur, Technicien, etc.) MUST NEVER be on saas-* screens
    else if (!isSuperAdmin) {
      if (currentScreen.startsWith('saas-')) {
        setCurrentScreen('dashboard');
      }
    }
  }, [currentUser, impersonatedTenantId, currentScreen]);

  // Sync currentScreen to URL so refresh works
  useEffect(() => {
    const isSuperAdmin = currentUser?.role === 'SuperAdmin';
    const params = new URLSearchParams(window.location.search);
    const safeScreen = (!isSuperAdmin && currentScreen.startsWith('saas-')) ? 'dashboard' : currentScreen;

    if (params.get('screen') !== safeScreen) {
      const newUrl = (safeScreen === 'dashboard' && !isSuperAdmin)
        ? window.location.pathname 
        : `${window.location.pathname}?screen=${safeScreen}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [currentScreen, currentUser]);

  // Inter-page state passes
  const [selectedEqFromDash, setSelectedEqFromDash] = useState<EqType | null>(null);
  const [selectedOtFromUrl, setSelectedOtFromUrl] = useState<string | null>(null);
  const [prefilledIncident, setPrefilledIncident] = useState<IncType | null>(null);
  const [newWorkOrderEqId, setNewWorkOrderEqId] = useState<string | null>(null);
  const [newPreventivePlanEqId, setNewPreventivePlanEqId] = useState<string | null>(null);

  // Custom Router navigation resolver
  const handleNavigate = (target: string) => {
    if (target.startsWith('saas-') && currentUser?.role !== 'SuperAdmin') {
      setCurrentScreen('dashboard');
      return;
    }
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
    } else if (target.startsWith('workorder-new:')) {
      const eqId = target.split(':')[1];
      setNewWorkOrderEqId(eqId);
      setCurrentScreen('workorders');
    } else if (target.startsWith('preventive-new:')) {
      const eqId = target.split(':')[1];
      setNewPreventivePlanEqId(eqId);
      setCurrentScreen('preventive');
    } else {
      setCurrentScreen(target);
    }
  };

  const handleLoginSuccess = () => {
    try {
      const storedUser = localStorage.getItem('gmao_current_user');
      const storedSession = localStorage.getItem('gmao_session');
      const u = storedUser ? JSON.parse(storedUser) : (storedSession ? JSON.parse(storedSession)?.user : null);
      if (u?.role === 'SuperAdmin') {
        setCurrentScreen('saas-dashboard');
        return;
      }
    } catch {}
    setCurrentScreen('dashboard');
  };

  // If not logged in, render the login page
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout currentScreen={currentScreen} onNavigate={handleNavigate}>
      {currentScreen === 'dashboard' && (
        <AccessGuard permission={PERMISSIONS.DASHBOARD_VIEW}>
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
        <AccessGuard permission={PERMISSIONS.EQUIPMENT_VIEW}>
          <Equipment 
            selectedEqFromDash={selectedEqFromDash}
            onClearSelectedEq={() => setSelectedEqFromDash(null)}
            onNavigate={handleNavigate}
          />
        </AccessGuard>
      )}

      {currentScreen === 'preventive' && (
        <AccessGuard permission={PERMISSIONS.PREVENTIVE_VIEW}>
          <Preventive 
            onNavigate={handleNavigate}
            newPlanEquipmentId={newPreventivePlanEqId}
            onClearNewPlanEquipmentId={() => setNewPreventivePlanEqId(null)}
          />
        </AccessGuard>
      )}

      {currentScreen === 'corrective' && (
        <AccessGuard permission={PERMISSIONS.INCIDENT_VIEW}>
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
        <AccessGuard permission={PERMISSIONS.WORKORDER_VIEW}>
          <WorkOrders 
            selectedOtFromUrl={selectedOtFromUrl}
            onClearSelectedOt={() => setSelectedOtFromUrl(null)}
            prefilledIncident={prefilledIncident}
            onClearPrefilledIncident={() => setPrefilledIncident(null)}
            newWorkOrderEqId={newWorkOrderEqId}
          />
        </AccessGuard>
      )}

      {currentScreen === 'inventory' && (
        <AccessGuard permission={PERMISSIONS.INVENTORY_VIEW}>
          <Inventory onNavigate={setCurrentScreen} />
        </AccessGuard>
      )}

      {currentScreen === 'suppliers' && (
        <AccessGuard permission={PERMISSIONS.SUPPLIER_VIEW}>
          <Suppliers />
        </AccessGuard>
      )}

      {currentScreen === 'reports' && (
        <AccessGuard permission={PERMISSIONS.REPORT_VIEW}>
          <Reports />
        </AccessGuard>
      )}

      {currentScreen === 'admin' && (
        <AccessGuard permission={PERMISSIONS.USER_VIEW}>
          <Admin />
        </AccessGuard>
      )}

      {currentScreen === 'equipes' && (
        <AccessGuard permission={PERMISSIONS.USER_VIEW}>
          <EquipesPage />
        </AccessGuard>
      )}

      {currentScreen.startsWith('saas-') && currentUser?.role === 'SuperAdmin' && (
        <ErrorBoundary fallbackTitle="Module Super Admin momentanément indisponible">
          <SuperAdmin activeTab={currentScreen.split('-')[1] as any} />
        </ErrorBoundary>
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <IncidentModalProvider>
        <AppContent />
      </IncidentModalProvider>
    </ErrorBoundary>
  );
}

export default App;
