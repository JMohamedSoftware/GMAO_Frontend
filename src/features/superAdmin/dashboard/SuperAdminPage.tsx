import React, { useState, useEffect, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { superAdminApi, TenantDto } from '@/features/superAdmin/api/superAdmin.api';
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
import {
  Building2,
  ChevronDown,
  Sparkles,
  LogIn,
  ShieldCheck
} from 'lucide-react';

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

  // Live PostgreSQL Tenants
  const [apiTenants, setApiTenants] = useState<TenantDto[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');

  const loadTenants = async () => {
    try {
      const res = await superAdminApi.getTenants();
      if (res && res.length > 0) {
        setApiTenants(res);
      }
    } catch (err) {
      console.warn('[SuperAdmin] Erreur chargement entreprises:', err);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [tenantsRefreshKey]);

  // Combined list of companies
  const safeTenants = tenants || [];
  const displayTenantsList = apiTenants.length > 0 ? apiTenants : safeTenants.map(t => ({
    id: Number(t.id) || 1,
    nom: t.name,
    codeTenant: t.id,
    category: 'Agroalimentaire & Transformation',
    managerNom: 'Direction Générale',
    telephone: '+216 71 890 000',
    ville: 'Nabeul',
    gouvernorat: 'Tunisie',
    adresse: t.domain || 'Zone Industrielle',
    emailContact: t.adminEmail || '',
    subscriptionPlan: t.subscriptionPlan || 'Basic',
    subscriptionStatus: t.status === 'Active' ? 'Actif' : 'Suspendu',
    subscriptionAmount: plansConfig[t.subscriptionPlan as keyof typeof plansConfig] || 599,
    maxSites: 5,
    maxUsers: 20,
    maxEquipements: 100,
    storageUsedGb: 1.5,
    maxStorageGb: 50,
    capacityTonsPerDay: t.capacityTonsPerDay || 450,
    isActive: t.status === 'Active',
    createdAt: t.createdAt || new Date().toISOString(),
    sitesCount: 1,
    usersCount: Array.isArray(t.users) ? t.users.length : 3,
    equipementsCount: Array.isArray(t.equipments) ? t.equipments.length : 15
  } as TenantDto));

  // Selected company object
  const selectedCompany = useMemo(() => {
    if (selectedTenantId === 'ALL') return null;
    return displayTenantsList.find(t => String(t.id) === selectedTenantId || t.codeTenant === selectedTenantId) || null;
  }, [selectedTenantId, displayTenantsList]);

  // Filter requests vs active tenants
  const pendingRequests = safeTenants.filter(t => t.status === 'Pending');
  const registeredTenants = safeTenants.filter(t => t.status !== 'Pending');

  // Compute SaaS Analytics
  const activeCount = selectedCompany
    ? (selectedCompany.isActive ? 1 : 0)
    : displayTenantsList.filter(t => t.isActive).length;

  const mrr = selectedCompany
    ? selectedCompany.subscriptionAmount
    : displayTenantsList.reduce((acc, t) => acc + (t.isActive ? (t.subscriptionAmount || 599) : 0), 0);

  // Dynamic platform revenue history
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

  const getCompanyLogo = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tomate') || n.includes('pomodoro')) return '🍅';
    if (n.includes('sicam') || n.includes('conserve')) return '🥫';
    if (n.includes('fromag') || n.includes('lait')) return '🧀';
    if (n.includes('boisson') || n.includes('sfbt')) return '🍾';
    if (n.includes('huile')) return '🌱';
    return '🏭';
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* ── BARRE DE PARTITIONNEMENT & SÉLECTEUR D'ENTREPRISE (SUPER ADMIN CONTEXT SWITCHER) ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-850 dark:text-white">
                  Portail Super Admin • Cloisonnement Multi-Tenants
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {displayTenantsList.length} Entreprises enregistrées
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Sélectionnez une conserverie pour isoler ses caractéristiques, sa consommation, ses campagnes et ses équipements.
              </p>
            </div>
          </div>

          {/* SÉLECTEUR DROPDOWN RAPIDE */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Entreprise Active (Filtre Global) :
              </label>
              <div className="relative">
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
                >
                  <option value="ALL">🌐 Toutes les Entreprises (Vue Globale Cluster SaaS)</option>
                  {displayTenantsList.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {getCompanyLogo(t.nom)} {t.nom} ({t.codeTenant || `tenant-${t.id}`})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => setShowCreateWizard(true)}
              className="mt-4 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Nouvelle Usine</span>
            </button>
          </div>
        </div>

        {/* ── FICHE 360° & CARACTÉRISTIQUES DÉDIÉES DE L'ENTREPRISE SÉLECTIONNÉE ── */}
        {selectedCompany && (
          <div className="mt-2 p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-800/60 dark:via-slate-900/40 dark:to-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 shadow-sm flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
            {/* Top Info Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center text-2xl shrink-0">
                  {getCompanyLogo(selectedCompany.nom)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedCompany.nom}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                      🟢 {selectedCompany.subscriptionStatus === 'Actif' ? 'Opérationnel' : selectedCompany.subscriptionStatus}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Code : {selectedCompany.codeTenant}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedCompany.adresse || `${selectedCompany.ville}, ${selectedCompany.gouvernorat}`} • Responsable : <strong className="text-slate-700 dark:text-slate-200">{selectedCompany.managerNom || 'Direction'}</strong> ({selectedCompany.emailContact || '—'})
                  </p>
                </div>
              </div>

              {/* Bouton d'impersonation directe */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setSelectedTenantId('ALL')}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Vue Globale Cluster
                </button>
                <button
                  onClick={() => impersonateTenant(selectedCompany.codeTenant)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
                  title="Accéder directement à l'espace GMAO de cette entreprise"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ouvrir l'Espace GMAO de l'Usine</span>
                </button>
              </div>
            </div>

            {/* Grille des 5 Caractéristiques Métier */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacité Usine</div>
                <div className="text-sm font-black text-slate-850 dark:text-white mt-1">
                  {selectedCompany.capacityTonsPerDay || 450} T / Jour
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Transformation tomate</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sites & Usines</div>
                <div className="text-sm font-black text-slate-850 dark:text-white mt-1">
                  {selectedCompany.sitesCount || 1} / {selectedCompany.maxSites || 5}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Sites opérationnels</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parc Machines</div>
                <div className="text-sm font-black text-slate-850 dark:text-white mt-1">
                  {selectedCompany.equipementsCount || 0} / {selectedCompany.maxEquipements || 100}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Équipements compartimentés</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Utilisateurs & Techs</div>
                <div className="text-sm font-black text-slate-850 dark:text-white mt-1">
                  {selectedCompany.usersCount || 0} / {selectedCompany.maxUsers || 20}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Comptes d'accès actifs</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stockage Dédié</div>
                <div className="text-sm font-black text-slate-850 dark:text-white mt-1">
                  {selectedCompany.storageUsedGb || 1.2} GB / {selectedCompany.maxStorageGb || 50} GB
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Données & pièces jointes</div>
              </div>
            </div>

            {/* Feature Flags & Modules Activés */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">Modules activés :</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                  ✓ Capteurs IoT & Automates
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  ✓ GMAO Mobile Offline
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                  ✓ IA Prédictive Vibrations
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  ✓ Passerelle ERP SAP
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-500">
                Plan : <strong className="text-blue-600 dark:text-blue-400">{selectedCompany.subscriptionPlan}</strong> • {selectedCompany.subscriptionAmount} TND/mois
              </div>
            </div>

            {/* Notice de Cloisonnement */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-[11px] font-semibold border border-blue-200/50 dark:border-blue-900/50">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Données compartimentées : Tous les onglets ci-dessous (Campagnes, Consommation, Redo Logs, Utilisateurs) sont désormais filtrés exclusivement pour <strong>{selectedCompany.nom}</strong>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {activeTab === 'dashboard' && (
          <SuperAdminDashboard 
            mrr={mrr}
            activeCount={activeCount}
            registeredCount={selectedCompany ? 1 : registeredTenants.length}
            pendingCount={selectedCompany ? 0 : pendingRequests.length}
            revenueHistory={revenueHistory}
            tenants={selectedCompany ? [safeTenants.find(t => t.id === selectedCompany.codeTenant) || (selectedCompany as any)] : safeTenants}
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

        {activeTab === 'campaigns' && <SuperAdminCampaigns selectedTenantId={selectedTenantId} />}
        {activeTab === 'monitoring' && <SuperAdminMonitoring selectedTenantId={selectedTenantId} />}
        {activeTab === 'redologs' && <SuperAdminRedoLogs selectedTenantId={selectedTenantId} />}

        {activeTab === 'users' && <SuperAdminUsers selectedCompanyName={selectedCompany?.nom} />}
        {activeTab === 'sites' && <SuperAdminSites selectedCompanyName={selectedCompany?.nom} />}

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
