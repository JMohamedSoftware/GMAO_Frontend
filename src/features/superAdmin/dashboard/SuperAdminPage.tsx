import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { SuperAdminDashboard } from '@/features/superAdmin/dashboard/SuperAdminDashboard';
import { SuperAdminTenants } from '@/features/superAdmin/tenants/SuperAdminTenants';
import { SuperAdminSites } from '@/features/superAdmin/sites/SuperAdminSites';
import { SuperAdminPlans } from '@/features/superAdmin/plans/SuperAdminPlans';
import { SuperAdminBilling } from '@/features/superAdmin/billing/SuperAdminBilling';
import { SuperAdminInvoices } from '@/features/superAdmin/invoices/SuperAdminInvoices';
import { SuperAdminUsers } from '@/features/superAdmin/users/SuperAdminUsers';
import { SuperAdminMonitoring } from '@/features/superAdmin/monitoring/SuperAdminMonitoring';
import { SuperAdminLogs } from '@/features/superAdmin/logs/SuperAdminLogs';
import { SuperAdminSettings } from '@/features/superAdmin/settings/SuperAdminSettings';
import { SuperAdminCampaigns } from '@/features/superAdmin/campaigns/SuperAdminCampaigns';
import { SuperAdminRedoLogs } from '@/features/superAdmin/redologs/SuperAdminRedoLogs';
import { CreateTenantWizard } from '@/features/superAdmin/createtenantwizard/CreateTenantWizard';

interface SuperAdminProps {
  activeTab?: 'dashboard' | 'tenants' | 'sites' | 'plans' | 'billing' | 'users' | 'invoices' | 'monitoring' | 'logs' | 'settings' | 'campaigns' | 'redologs';
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ activeTab = 'dashboard' }) => {
  const { tenants, approveTenant, suspendTenant, impersonateTenant } = useGmao();

  const [plansConfig, setPlansConfig] = useState({
    Basic: 299,
    Premium: 599,
    Enterprise: 1299
  });

  const [showConfigSaved, setShowConfigSaved] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [tenantsRefreshKey, setTenantsRefreshKey] = useState(0);

  // Filter requests vs active tenants
  const safeTenants = tenants || [];
  const pendingRequests = safeTenants.filter(t => t.status === 'Pending');
  const registeredTenants = safeTenants.filter(t => t.status !== 'Pending');

  // Compute SaaS Analytics for the global platform
  const activeCount = safeTenants.filter(t => t.status === 'Active').length;
  const mrr = safeTenants.reduce((acc, t) => acc + (t.status === 'Active' ? (plansConfig[t.subscriptionPlan as keyof typeof plansConfig] || 599) : 0), 0);

  // Platform revenue history
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
  const revenueHistory = months.map((m, idx) => ({
    month: m,
    revenue: Math.round(mrr * (0.35 + 0.65 * ((idx + 1) / months.length)))
  }));

  const handleSavePlans = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfigSaved(true);
    setTimeout(() => setShowConfigSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Content Area - Chaque écran gère son affichage et ses filtres natifs */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {activeTab === 'dashboard' && (
          <SuperAdminDashboard 
            mrr={mrr}
            activeCount={activeCount}
            registeredCount={registeredTenants.length}
            pendingCount={pendingRequests.length}
            revenueHistory={revenueHistory}
            tenants={safeTenants}
          />
        )}

        {activeTab === 'tenants' && (
          <SuperAdminTenants 
            pendingRequests={pendingRequests}
            registeredTenants={registeredTenants}
            approveTenant={approveTenant}
            suspendTenant={suspendTenant}
            impersonateTenant={impersonateTenant}
            onShowCreateWizard={() => setShowCreateWizard(true)}
            refreshTrigger={tenantsRefreshKey}
          />
        )}

        {activeTab === 'campaigns' && <SuperAdminCampaigns />}
        {activeTab === 'monitoring' && <SuperAdminMonitoring />}
        {activeTab === 'redologs' && <SuperAdminRedoLogs />}

        {activeTab === 'users' && <SuperAdminUsers />}
        {activeTab === 'sites' && <SuperAdminSites />}

        {activeTab === 'plans' && (
          <SuperAdminPlans 
            plansConfig={plansConfig}
            setPlansConfig={setPlansConfig}
            handleSavePlans={handleSavePlans}
            showConfigSaved={showConfigSaved}
          />
        )}

        {activeTab === 'billing' && <SuperAdminBilling />}
        {activeTab === 'invoices' && <SuperAdminInvoices />}
        {activeTab === 'logs' && <SuperAdminLogs />}
        {activeTab === 'settings' && <SuperAdminSettings />}
      </div>

      <CreateTenantWizard 
        show={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onTenantCreated={() => setTenantsRefreshKey(k => k + 1)}
        plansConfig={plansConfig}
      />
    </div>
  );
};
