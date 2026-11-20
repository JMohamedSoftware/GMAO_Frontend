/**
 * ============================================================================
 * GESTIONNAIRE DE ROUTES CENTRALISÉ : AppRoutes
 * ============================================================================
 * Ce composant gère la navigation, le Code Splitting (Lazy Loading) et la
 * protection des écrans par permissions (AccessGuard) pour alléger App.tsx.
 */

import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { AccessGuard } from '@/shared/components/AccessGuard';
import { PERMISSIONS } from '@/shared/permissions';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Equipment as EqType, Incident as IncType, User } from '@/shared/types/gmao';

// ── Lazy Loading des modules (Code Splitting pour performance maximale) ─────
const Dashboard = lazy(() => import('@/features/company/dashboard/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Equipment = lazy(() => import('@/features/company/equipments/pages/EquipmentPage').then(m => ({ default: m.Equipment })));
const Preventive = lazy(() => import('@/features/company/preventive/pages/Preventive').then(m => ({ default: m.Preventive })));
const Corrective = lazy(() => import('@/features/company/incidents/pages/Corrective').then(m => ({ default: m.Corrective })));
const WorkOrders = lazy(() => import('@/features/company/workOrders/pages/WorkOrdersPage').then(m => ({ default: m.WorkOrders })));
const Inventory = lazy(() => import('@/features/company/inventory/pages/Inventory').then(m => ({ default: m.Inventory })));
const Reports = lazy(() => import('@/features/company/reports/pages/Reports').then(m => ({ default: m.Reports })));
const Suppliers = lazy(() => import('@/features/company/suppliers/pages/Suppliers').then(m => ({ default: m.Suppliers })));
const Admin = lazy(() => import('@/features/company/settings/Admin').then(m => ({ default: m.Admin })));
const SuperAdmin = lazy(() => import('@/features/superAdmin/dashboard/SuperAdminPage').then(m => ({ default: m.SuperAdmin })));
const EquipesPage = lazy(() => import('@/features/company/equipes/pages/EquipesPage').then(m => ({ default: m.EquipesPage })));

export const PageLoader: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
      Chargement du module...
    </span>
  </div>
);

export interface AppRoutesProps {
  currentScreen: string;
  onNavigate: (target: string) => void;
  currentUser: User | null;
  selectedEqFromDash: EqType | null;
  onSelectEquipmentFromDash: (eq: EqType) => void;
  onClearSelectedEq: () => void;
  selectedOtFromUrl: string | null;
  onClearSelectedOt: () => void;
  prefilledIncident: IncType | null;
  onClearPrefilledIncident: () => void;
  onSelectIncidentForOt?: (inc: IncType) => void;
  newWorkOrderEqId: string | null;
  newPreventivePlanEqId: string | null;
  onClearNewPlanEquipmentId: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  selectedEqFromDash,
  onSelectEquipmentFromDash,
  onClearSelectedEq,
  selectedOtFromUrl,
  onClearSelectedOt,
  prefilledIncident,
  onClearPrefilledIncident,
  onSelectIncidentForOt,
  newWorkOrderEqId,
  newPreventivePlanEqId,
  onClearNewPlanEquipmentId,
}) => {
  return (
    <Suspense fallback={<PageLoader />}>
      {/* 1. Tableau de bord principal */}
      {currentScreen === 'dashboard' && (
        <AccessGuard permission={PERMISSIONS.DASHBOARD_VIEW}>
          <Dashboard 
            onNavigate={onNavigate}
            onSelectEquipment={(eq) => {
              onSelectEquipmentFromDash(eq);
              onNavigate('equipment');
            }}
          />
        </AccessGuard>
      )}

      {/* 2. Parc Équipements & Machines */}
      {currentScreen === 'equipment' && (
        <AccessGuard permission={PERMISSIONS.EQUIPMENT_VIEW}>
          <Equipment 
            selectedEqFromDash={selectedEqFromDash}
            onClearSelectedEq={onClearSelectedEq}
            onNavigate={onNavigate}
          />
        </AccessGuard>
      )}

      {/* 3. Maintenance Préventive */}
      {currentScreen === 'preventive' && (
        <AccessGuard permission={PERMISSIONS.PREVENTIVE_VIEW}>
          <Preventive 
            onNavigate={onNavigate}
            newPlanEquipmentId={newPreventivePlanEqId}
            onClearNewPlanEquipmentId={onClearNewPlanEquipmentId}
          />
        </AccessGuard>
      )}

      {/* 4. Maintenance Corrective & Incidents */}
      {currentScreen === 'corrective' && (
        <AccessGuard permission={PERMISSIONS.INCIDENT_VIEW}>
          <Corrective 
            onNavigate={onNavigate}
            onOpenCreateOtWithIncident={(inc) => {
              if (onSelectIncidentForOt) {
                onSelectIncidentForOt(inc);
              } else {
                onNavigate(`workorder-with-incident:${inc.id}`);
              }
            }}
          />
        </AccessGuard>
      )}

      {/* 5. Ordres de Travail (Work Orders) */}
      {currentScreen === 'workorders' && (
        <AccessGuard permission={PERMISSIONS.WORKORDER_VIEW}>
          <WorkOrders 
            selectedOtFromUrl={selectedOtFromUrl}
            onClearSelectedOt={onClearSelectedOt}
            prefilledIncident={prefilledIncident}
            onClearPrefilledIncident={onClearPrefilledIncident}
            newWorkOrderEqId={newWorkOrderEqId}
          />
        </AccessGuard>
      )}

      {/* 6. Magasin & Pièces de Rechange (Inventory) */}
      {currentScreen === 'inventory' && (
        <AccessGuard permission={PERMISSIONS.INVENTORY_VIEW}>
          <Inventory onNavigate={onNavigate} />
        </AccessGuard>
      )}

      {/* 7. Fournisseurs & Prestataires */}
      {currentScreen === 'suppliers' && (
        <AccessGuard permission={PERMISSIONS.SUPPLIER_VIEW}>
          <Suppliers />
        </AccessGuard>
      )}

      {/* 8. Rapports & Analyses */}
      {currentScreen === 'reports' && (
        <AccessGuard permission={PERMISSIONS.REPORT_VIEW}>
          <Reports />
        </AccessGuard>
      )}

      {/* 9. Paramètres & Rôles Entreprise */}
      {currentScreen === 'admin' && (
        <AccessGuard permission={PERMISSIONS.USER_VIEW}>
          <Admin />
        </AccessGuard>
      )}

      {/* 10. Équipes de Maintenance */}
      {currentScreen === 'equipes' && (
        <AccessGuard permission={PERMISSIONS.USER_VIEW}>
          <EquipesPage />
        </AccessGuard>
      )}

      {/* 11. Plateforme SuperAdmin (Multi-Tenant SaaS) */}
      {currentScreen.startsWith('saas-') && currentUser?.role === 'SuperAdmin' && (
        <ErrorBoundary fallbackTitle="Module Super Admin momentanément indisponible">
          <SuperAdmin activeTab={currentScreen.split('-')[1] as any} />
        </ErrorBoundary>
      )}

      {/* 12. Écran 404 de secours si l'identifiant d'écran est inconnu */}
      {![
        'dashboard', 'equipment', 'preventive', 'corrective', 'workorders',
        'inventory', 'suppliers', 'reports', 'admin', 'equipes'
      ].includes(currentScreen) && !currentScreen.startsWith('saas-') && (
        <NotFoundPage onNavigateHome={() => onNavigate('dashboard')} />
      )}
    </Suspense>
  );
};
