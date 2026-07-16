import React, { useState } from 'react';
import { useGmao } from '../../../hooks/useGmao';
import { SuperAdminDashboard } from '../components/SuperAdmin/SuperAdminDashboard';
import { SuperAdminTenants } from '../components/SuperAdmin/SuperAdminTenants';
import { SuperAdminPlans } from '../components/SuperAdmin/SuperAdminPlans';
import { SuperAdminBilling } from '../components/SuperAdmin/SuperAdminBilling';
import { SuperAdminMonitoring } from '../components/SuperAdmin/SuperAdminMonitoring';
import { SuperAdminLogs } from '../components/SuperAdmin/SuperAdminLogs';
import { SuperAdminSettings } from '../components/SuperAdmin/SuperAdminSettings';
import { CreateTenantWizard } from '../components/SuperAdmin/CreateTenantWizard';

interface SuperAdminProps {
  activeTab?: 'dashboard' | 'tenants' | 'plans' | 'billing' | 'monitoring' | 'logs' | 'settings';
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

  // Filter requests vs active tenants
  const pendingRequests = tenants.filter(t => t.status === 'Pending');
  const registeredTenants = tenants.filter(t => t.status !== 'Pending');

  // Compute SaaS Analytics
  const activeCount = registeredTenants.filter(t => t.status === 'Active').length;
  
  const mrr = registeredTenants.reduce((acc, t) => {
    if (t.status === 'Active') {
      const planPrice = plansConfig[t.subscriptionPlan as keyof typeof plansConfig] || 0;
      return acc + planPrice;
    }
    return acc;
  }, 0);

  // Platform simulation chart data
  const revenueHistory = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Fév', revenue: 2400 },
    { month: 'Mar', revenue: 3800 },
    { month: 'Avr', revenue: 4100 },
    { month: 'Mai', revenue: 5400 },
    { month: 'Juin', revenue: 6800 },
    { month: 'Juil', revenue: mrr } // Current MRR
  ];

  const handleSavePlans = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfigSaved(true);
    setTimeout(() => setShowConfigSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            SaaS Management Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Superviseur Global • Gestion des espaces de travail de transformation de tomates
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {activeTab === 'dashboard' && (
          <SuperAdminDashboard 
            mrr={mrr}
            activeCount={activeCount}
            registeredCount={registeredTenants.length}
            pendingCount={pendingRequests.length}
            revenueHistory={revenueHistory}
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
          />
        )}

        {activeTab === 'plans' && (
          <SuperAdminPlans 
            plansConfig={plansConfig}
            setPlansConfig={setPlansConfig}
            handleSavePlans={handleSavePlans}
            showConfigSaved={showConfigSaved}
          />
        )}

        {activeTab === 'billing' && <SuperAdminBilling />}
        {activeTab === 'monitoring' && <SuperAdminMonitoring />}
        {activeTab === 'logs' && <SuperAdminLogs />}
        {activeTab === 'settings' && <SuperAdminSettings />}
      </div>

      <CreateTenantWizard 
        show={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        plansConfig={plansConfig}
      />
    </div>
  );
};
