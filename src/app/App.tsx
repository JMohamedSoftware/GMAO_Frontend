/**
 * ============================================================================
 * COMPOSANT PRINCIPAL : App.tsx
 * ============================================================================
 * Gère l'initialisation de l'application, l'état d'authentification,
 * la synchronisation de l'URL et délègue le rendu des écrans au routeur AppRoutes.
 */

import React, { useState, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { Equipment as EqType, Incident as IncType } from '@/shared/types/gmao';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { IncidentModalProvider } from '@/context/IncidentModalContext';
import { Login } from '@/features/auth/pages/Login';
import { AppRoutes } from '@/routes';

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

  // Protection des routes SuperAdmin vs Entreprise
  useEffect(() => {
    const isSuperAdmin = currentUser?.role === 'SuperAdmin';
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');

    if (isSuperAdmin && !impersonatedTenantId) {
      if (!screenParam || screenParam === 'dashboard' || currentScreen === 'dashboard') {
        setCurrentScreen('saas-dashboard');
      }
    } else if (!isSuperAdmin) {
      if (currentScreen.startsWith('saas-')) {
        setCurrentScreen('dashboard');
      }
    }
  }, [currentUser, impersonatedTenantId, currentScreen]);

  // Synchronisation avec l'URL navigateur (?screen=...)
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

  // États de transition entre modules (ex: du Dashboard vers un équipement)
  const [selectedEqFromDash, setSelectedEqFromDash] = useState<EqType | null>(null);
  const [selectedOtFromUrl, setSelectedOtFromUrl] = useState<string | null>(null);
  const [prefilledIncident, setPrefilledIncident] = useState<IncType | null>(null);
  const [newWorkOrderEqId, setNewWorkOrderEqId] = useState<string | null>(null);
  const [newPreventivePlanEqId, setNewPreventivePlanEqId] = useState<string | null>(null);

  // Résolveur de navigation inter-modules
  const handleNavigate = (target: string) => {
    if (target.startsWith('saas-') && currentUser?.role !== 'SuperAdmin') {
      setCurrentScreen('dashboard');
      return;
    }
    if (target.startsWith('equipment-detail:')) {
      const eqId = target.split(':')[1];
      const eq = equipments.find(e => String(e.id) === String(eqId) || (e.code && e.code === eqId));
      if (eq) {
        setSelectedEqFromDash(eq);
        setCurrentScreen('equipment');
      } else {
        setCurrentScreen('equipment');
      }
    } else if (target.startsWith('workorder-detail:')) {
      const otId = target.split(':')[1];
      setSelectedOtFromUrl(otId);
      setCurrentScreen('workorders');
    } else if (target.startsWith('incident-detail:')) {
      setCurrentScreen('corrective');
    } else if (target.startsWith('stock-detail:') || target.startsWith('inventory')) {
      setCurrentScreen('inventory');
    } else if (target.startsWith('supplier-detail:') || target.startsWith('suppliers')) {
      setCurrentScreen('suppliers');
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

  // Si non connecté, afficher la page de Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout currentScreen={currentScreen} onNavigate={handleNavigate}>
      <AppRoutes
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        selectedEqFromDash={selectedEqFromDash}
        onSelectEquipmentFromDash={(eq) => setSelectedEqFromDash(eq)}
        onClearSelectedEq={() => setSelectedEqFromDash(null)}
        selectedOtFromUrl={selectedOtFromUrl}
        onClearSelectedOt={() => setSelectedOtFromUrl(null)}
        prefilledIncident={prefilledIncident}
        onClearPrefilledIncident={() => setPrefilledIncident(null)}
        newWorkOrderEqId={newWorkOrderEqId}
        newPreventivePlanEqId={newPreventivePlanEqId}
        onClearNewPlanEquipmentId={() => setNewPreventivePlanEqId(null)}
      />
    </MainLayout>
  );
}

export function App() {
  return (
    <IncidentModalProvider>
      <AppContent />
    </IncidentModalProvider>
  );
}

export default App;
