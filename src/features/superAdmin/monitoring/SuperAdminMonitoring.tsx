import React, { useState, useMemo, useEffect } from 'react';
import { superAdminApi } from '../api/superAdmin.api';
import {
  Activity,
  Users,
  Factory,
  RefreshCw,
  Building2,
  HardDrive,
  Calendar,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Eye,
  Mail,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  X,
  TrendingUp,
  Server,
  Database,
  ShieldCheck
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export interface MonitoringTenant {
  id: string;
  rawId: number;
  name: string;
  codeTenant: string;
  logo: string;
  category: string;
  plan: 'Professional' | 'Basic' | 'Enterprise';
  planBadgeColor: string;
  sitesUsed: number;
  sitesLimit: number;
  usersUsed: number;
  usersLimit: number;
  equipmentsUsed: number;
  equipmentsLimit: number;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  allocatedCredits: number;
  consumedCredits: number;
  remainingCredits: number;
  status: 'Actif' | 'En limite' | 'Surconsommation';
  email: string;
  contact: string;
  telephone?: string;
  adresse?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionAmount?: number | null;
  capacityTonsPerDay?: number | null;
  sites: Array<{
    id: number;
    nom: string;
    codeSite: string;
    ville: string;
    gouvernorat: string;
    type: string;
    statut: string;
    capaciteProduction: string;
    nombreEquipements: number;
    nombreUtilisateurs: number;
    responsable: string;
  }>;
  users: Array<{
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    roleNom: string;
    isActive: boolean;
  }>;
}

interface SuperAdminMonitoringProps {
  selectedTenantId?: string;
}

export const SuperAdminMonitoring: React.FC<SuperAdminMonitoringProps> = ({ selectedTenantId: initialSelectedTenantId }) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    initialSelectedTenantId && initialSelectedTenantId !== 'ALL'
      ? (initialSelectedTenantId.startsWith('mon-') ? initialSelectedTenantId : `mon-${initialSelectedTenantId}`)
      : 'mon-001'
  );

  useEffect(() => {
    if (initialSelectedTenantId && initialSelectedTenantId !== 'ALL') {
      const formatted = initialSelectedTenantId.startsWith('mon-') ? initialSelectedTenantId : `mon-${initialSelectedTenantId}`;
      setSelectedTenantId(formatted);
    }
  }, [initialSelectedTenantId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'Aperçu' | 'Détails' | 'Sites' | 'Utilisateurs' | 'Stockage'>('Aperçu');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAdjustLimitsModalOpen, setIsAdjustLimitsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editLimits, setEditLimits] = useState({
    sitesLimit: 5,
    usersLimit: 50,
    equipmentsLimit: 1000,
    storageLimit: 50
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 10 tenants matching screenshot
  // Tenants loaded from backend API
  const [tenantsList, setTenantsList] = useState<MonitoringTenant[]>([]);

  // Selected tenant for preview
  const selectedTenant = useMemo(() => {
    return tenantsList.find(t => t.id === selectedTenantId) || tenantsList[0];
  }, [tenantsList, selectedTenantId]);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenantsList.filter(t => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlan = planFilter === 'All' || t.plan === planFilter;
      return matchSearch && matchPlan;
    });
  }, [tenantsList, searchTerm, planFilter]);

  const totalMonitoredTenants = tenantsList.length;
  const totalUsersUsed = tenantsList.reduce((acc, t) => acc + (t.usersUsed || 0), 0);
  const totalEquipmentsUsed = tenantsList.reduce((acc, t) => acc + (t.equipmentsUsed || 0), 0);
  const totalSitesUsed = tenantsList.reduce((acc, t) => acc + (t.sitesUsed || 0), 0);
  const totalStorageUsed = tenantsList.reduce((acc, t) => acc + (t.storageUsed || 0), 0).toFixed(1);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCheckboxes(filteredTenants.map(t => t.id));
    } else {
      setSelectedCheckboxes([]);
    }
  };

  const handleToggleCheckbox = (id: string) => {
    setSelectedCheckboxes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Entreprise,Plan,Sites,Utilisateurs,Équipements,Stockage,Statut']
        .concat(
          filteredTenants.map(
            t =>
              `"${t.name}","${t.plan}","${t.sitesUsed}/${t.sitesLimit}","${t.usersUsed}/${t.usersLimit}","${t.equipmentsUsed}/${t.equipmentsLimit}","${t.storageUsed}GB/${t.storageLimit}GB","${t.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suivi_utilisation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportation des métriques générée');
  };

  const [usersChartMode, setUsersChartMode] = useState<'top7' | 'top10' | 'all'>('top7');
  const [eqChartMode, setEqChartMode] = useState<'top7' | 'top10' | 'all'>('top7');
  const [storageChartMode, setStorageChartMode] = useState<'top7' | 'top10' | 'all'>('top7');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [liveServer, setLiveServer] = useState<any>(null);

  const fetchMonitoring = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getMonitoring();
      if (data) {
        if (data.server) setLiveServer(data.server);
        if (data.tenants && data.tenants.length > 0) {
          const mapped: MonitoringTenant[] = data.tenants.map((rt: any) => {
            const sNom = rt.nom.toLowerCase();
            const logo = sNom.includes('tomate') ? '🍅' : (sNom.includes('sicam') ? '🥫' : (sNom.includes('huil') ? '🫒' : (sNom.includes('boisson') || sNom.includes('sfbt') ? '🥤' : '🏭')));
            const plan = (rt.subscriptionPlan === 'Enterprise' || rt.equipementsCount > 100) ? 'Enterprise' : ((rt.subscriptionPlan === 'Professional' || rt.equipementsCount > 20) ? 'Professional' : 'Basic');
            const planBadge = plan === 'Enterprise'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : (plan === 'Professional'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300');

            const sitesUsed = rt.sitesCount ?? (rt.sites ? rt.sites.length : 0);
            const sitesLimit = rt.maxSites || 5;
            const usersUsed = rt.usersCount ?? (rt.users ? rt.users.length : 0);
            const usersLimit = rt.maxUsers || 20;
            const equipmentsUsed = rt.equipementsCount ?? 0;
            const equipmentsLimit = rt.maxEquipements || 50;
            const storageUsed = Number((rt.storageUsedGb ?? 0).toFixed(1));
            const storageLimit = Number((rt.maxStorageGb || 50).toFixed(0));

            // Calcul Crédits Cloud alloués & consommés
            const allocatedCredits = plan === 'Enterprise' ? 15000 : (plan === 'Professional' ? 6000 : 3000);
            const consumedCredits = usersUsed * 50 + equipmentsUsed * 12 + Math.round(storageUsed * 20) + sitesUsed * 200;
            const remainingCredits = Math.max(0, allocatedCredits - consumedCredits);

            const isWarning = (storageLimit > 0 && storageUsed / storageLimit > 0.85) || (usersLimit > 0 && usersUsed / usersLimit > 0.9);
            const isCritical = (storageLimit > 0 && storageUsed >= storageLimit) || (usersLimit > 0 && usersUsed >= usersLimit);
            const status = isCritical ? 'Surconsommation' : (isWarning ? 'En limite' : 'Actif');

            return {
              id: `mon-${rt.id}`,
              rawId: rt.id,
              name: rt.nom,
              codeTenant: rt.codeTenant || `tenant-${rt.id}`,
              logo: logo,
              category: rt.category || 'Agroalimentaire & Transformation',
              plan: plan as any,
              planBadgeColor: planBadge,
              sitesUsed,
              sitesLimit,
              usersUsed,
              usersLimit,
              equipmentsUsed,
              equipmentsLimit,
              storageUsed,
              storageLimit,
              allocatedCredits,
              consumedCredits,
              remainingCredits,
              status: status as any,
              email: rt.emailContact || 'Non renseigné',
              contact: rt.managerNom || 'Non renseigné',
              telephone: rt.telephone || 'Non renseigné',
              adresse: rt.adresse ? `${rt.adresse}${rt.ville ? `, ${rt.ville}` : ''}` : (rt.ville || 'Non renseignée'),
              subscriptionStartDate: rt.subscriptionStartDate ? rt.subscriptionStartDate.slice(0, 10) : 'Non renseignée',
              subscriptionEndDate: rt.subscriptionEndDate ? rt.subscriptionEndDate.slice(0, 10) : 'Non renseignée',
              subscriptionAmount: typeof rt.subscriptionAmount === 'number' ? rt.subscriptionAmount : null,
              capacityTonsPerDay: typeof rt.capacityTonsPerDay === 'number' ? rt.capacityTonsPerDay : null,
              sites: rt.sites || [],
              users: rt.users || []
            };
          });
          setTenantsList(mapped);
          if (initialSelectedTenantId && initialSelectedTenantId !== 'ALL') {
            const formatted = initialSelectedTenantId.startsWith('mon-') ? initialSelectedTenantId : `mon-${initialSelectedTenantId}`;
            setSelectedTenantId(formatted);
          } else if (mapped.length > 0 && !selectedTenantId) {
            setSelectedTenantId(mapped[0].id);
          }
        }
        if (showNotification) showToast('Métriques synchronisées avec le serveur .NET');
      }
    } catch (err) {
      console.warn('[Monitoring] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out] relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 animate-[slideIn_0.2s_ease-out]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP BANNER */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Left branding */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 flex items-center justify-center shadow-inner">
            <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Suivi d'utilisation
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Surveillez l'utilisation de la plateforme par chaque entreprise
            </p>
          </div>
        </div>

        {/* Right tomato image banner & Period widget */}
        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
          <div className="relative h-14 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center shadow-inner px-4 bg-slate-900/10 dark:bg-slate-950/50">
            <img
              src={tomateImg}
              alt="Industrial Plant"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-slate-900/90 dark:via-slate-900/70" />
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Période
              </div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 capitalize">
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Synchronize button */}
          <button
            onClick={() => fetchMonitoring(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec PostgreSQL .NET"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Utilisateurs actifs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalUsersUsed}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Utilisateurs actifs
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ 100%
                </span>
                <span className="text-[9px] text-slate-400">métriques réelles</span>
              </div>
            </div>
          </div>
          {/* Blue mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-blue-200 dark:bg-blue-900 rounded-t" />
            <span className="w-2.5 h-4 bg-blue-300 dark:bg-blue-800 rounded-t" />
            <span className="w-2.5 h-5 bg-blue-400 dark:bg-blue-700 rounded-t" />
            <span className="w-2.5 h-7 bg-blue-500 dark:bg-blue-600 rounded-t" />
            <span className="w-2.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-t" />
          </div>
        </div>

        {/* KPI 2: Équipements */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalEquipmentsUsed.toLocaleString('fr-FR')}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Équipements
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ Actifs
                </span>
                <span className="text-[9px] text-slate-400">en exploitation</span>
              </div>
            </div>
          </div>
          {/* Green mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-4 bg-emerald-200 dark:bg-emerald-900 rounded-t" />
            <span className="w-2.5 h-5 bg-emerald-300 dark:bg-emerald-800 rounded-t" />
            <span className="w-2.5 h-6 bg-emerald-400 dark:bg-emerald-700 rounded-t" />
            <span className="w-2.5 h-7 bg-emerald-500 dark:bg-emerald-600 rounded-t" />
            <span className="w-2.5 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-t" />
          </div>
        </div>

        {/* KPI 3: Sites / Usines */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalSitesUsed}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Sites / Usines
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ Multi-sites
                </span>
                <span className="text-[9px] text-slate-400">connectés</span>
              </div>
            </div>
          </div>
          {/* Blue mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-4 bg-blue-200 dark:bg-blue-900 rounded-t" />
            <span className="w-2.5 h-5 bg-blue-300 dark:bg-blue-800 rounded-t" />
            <span className="w-2.5 h-6 bg-blue-400 dark:bg-blue-700 rounded-t" />
            <span className="w-2.5 h-7 bg-blue-500 dark:bg-blue-600 rounded-t" />
            <span className="w-2.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-t" />
          </div>
        </div>

        {/* KPI 4: Stockage utilisé */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalStorageUsed} GB
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Stockage utilisé
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Cloud
                </span>
                <span className="text-[9px] text-slate-400">documents & photos</span>
              </div>
            </div>
          </div>
          {/* Red/Orange mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-rose-200 dark:bg-rose-900 rounded-t" />
            <span className="w-2.5 h-5 bg-rose-300 dark:bg-rose-800 rounded-t" />
            <span className="w-2.5 h-6 bg-rose-400 dark:bg-rose-700 rounded-t" />
            <span className="w-2.5 h-7 bg-rose-500 dark:bg-rose-600 rounded-t" />
            <span className="w-2.5 h-8 bg-rose-600 dark:bg-rose-500 rounded-t" />
          </div>
        </div>
      </div>

      {/* MIDDLE CHARTS ROW: 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Utilisateurs par entreprise */}
        {(() => {
          const sorted = [...tenantsList].sort((a, b) => (b.usersUsed || 0) - (a.usersUsed || 0));
          const items = usersChartMode === 'top7' ? sorted.slice(0, 7) : (usersChartMode === 'top10' ? sorted.slice(0, 10) : sorted);
          const maxVal = Math.max(10, ...items.map(t => t.usersUsed || 1));

          return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Utilisateurs par entreprise
                  </h3>
                </div>
                <select 
                  value={usersChartMode}
                  onChange={e => setUsersChartMode(e.target.value as any)}
                  className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="top7">Top 7</option>
                  <option value="top10">Top 10</option>
                  <option value="all">Toutes</option>
                </select>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
                {/* Horizontal guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{maxVal}</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.75)}</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.5)}</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.25)}</span></div>
                  <div className="flex justify-between"><span>0</span></div>
                </div>

                {items.map(item => {
                  const isSelected = selectedTenant?.id === item.id;
                  const barHeight = Math.min(100, Math.max(14, ((item.usersUsed || 1) / maxVal) * 100));

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedTenantId(item.id)}
                      className="flex-1 flex flex-col items-center gap-1 group relative z-10 cursor-pointer"
                      title={`${item.name}: ${item.usersUsed} utilisateurs actifs`}
                    >
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold pointer-events-none z-20 whitespace-nowrap shadow-md">
                        {item.usersUsed} util.
                      </div>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full max-w-[26px] rounded-t transition-all ${
                          isSelected ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-blue-500 group-hover:bg-blue-600'
                        }`}
                      />
                      <span className={`text-[8px] font-semibold truncate max-w-[48px] text-center -rotate-45 sm:rotate-0 mt-1 transition-colors ${
                        isSelected ? 'text-blue-600 font-bold dark:text-blue-400' : 'text-slate-400'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* CHART 2: Équipements par entreprise */}
        {(() => {
          const sorted = [...tenantsList].sort((a, b) => (b.equipmentsUsed || 0) - (a.equipmentsUsed || 0));
          const items = eqChartMode === 'top7' ? sorted.slice(0, 7) : (eqChartMode === 'top10' ? sorted.slice(0, 10) : sorted);
          const maxVal = Math.max(20, ...items.map(t => t.equipmentsUsed || 1));

          return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Équipements par entreprise
                  </h3>
                </div>
                <select 
                  value={eqChartMode}
                  onChange={e => setEqChartMode(e.target.value as any)}
                  className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="top7">Top 7</option>
                  <option value="top10">Top 10</option>
                  <option value="all">Toutes</option>
                </select>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{maxVal}</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.75)}</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.5)}</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.25)}</span></div>
                  <div className="flex justify-between"><span>0</span></div>
                </div>

                {items.map(item => {
                  const isSelected = selectedTenant?.id === item.id;
                  const barHeight = Math.min(100, Math.max(14, ((item.equipmentsUsed || 1) / maxVal) * 100));

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedTenantId(item.id)}
                      className="flex-1 flex flex-col items-center gap-1 group relative z-10 cursor-pointer"
                      title={`${item.name}: ${item.equipmentsUsed} équipements`}
                    >
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold pointer-events-none z-20 whitespace-nowrap shadow-md">
                        {item.equipmentsUsed} équips.
                      </div>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full max-w-[26px] rounded-t transition-all ${
                          isSelected ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-emerald-500 group-hover:bg-emerald-600'
                        }`}
                      />
                      <span className={`text-[8px] font-semibold truncate max-w-[48px] text-center -rotate-45 sm:rotate-0 mt-1 transition-colors ${
                        isSelected ? 'text-emerald-600 font-bold dark:text-emerald-400' : 'text-slate-400'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* CHART 3: Stockage utilisé par entreprise */}
        {(() => {
          const sorted = [...tenantsList].sort((a, b) => (b.storageUsed || 0) - (a.storageUsed || 0));
          const items = storageChartMode === 'top7' ? sorted.slice(0, 7) : (storageChartMode === 'top10' ? sorted.slice(0, 10) : sorted);
          const maxVal = Math.max(10, Math.ceil(Math.max(...items.map(t => t.storageUsed || 1))));

          return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Stockage utilisé par entreprise
                  </h3>
                </div>
                <select 
                  value={storageChartMode}
                  onChange={e => setStorageChartMode(e.target.value as any)}
                  className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="top7">Top 7</option>
                  <option value="top10">Top 10</option>
                  <option value="all">Toutes</option>
                </select>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{maxVal}GB</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.75)}GB</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.5)}GB</span></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>{Math.round(maxVal * 0.25)}GB</span></div>
                  <div className="flex justify-between"><span>0</span></div>
                </div>

                {items.map(item => {
                  const isSelected = selectedTenant?.id === item.id;
                  const barHeight = Math.min(100, Math.max(14, ((item.storageUsed || 1) / maxVal) * 100));

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedTenantId(item.id)}
                      className="flex-1 flex flex-col items-center gap-1 group relative z-10 cursor-pointer"
                      title={`${item.name}: ${item.storageUsed} GB`}
                    >
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold pointer-events-none z-20 whitespace-nowrap shadow-md">
                        {item.storageUsed} GB
                      </div>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full max-w-[26px] rounded-t transition-all ${
                          isSelected ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-purple-500 group-hover:bg-purple-600'
                        }`}
                      />
                      <span className={`text-[8px] font-semibold truncate max-w-[48px] text-center -rotate-45 sm:rotate-0 mt-1 transition-colors ${
                        isSelected ? 'text-purple-600 font-bold dark:text-purple-400' : 'text-slate-400'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* BOTTOM WORKSPACE: TABLE (LEFT) + DETAILS PANEL (RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: UTILISATION PAR ENTREPRISE (approx 8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with Search and Export */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  Utilisation par entreprise
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une entreprise..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <select
                    value={planFilter}
                    onChange={e => setPlanFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                  >
                    <option value="All">Tous les plans</option>
                    <option value="Professional">Professional</option>
                    <option value="Basic">Basic</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedCheckboxes.length > 0 &&
                          selectedCheckboxes.length === filteredTenants.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Entreprise</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Sites <span className="font-normal text-[10px] text-slate-400">(utilisées / limite)</span></th>
                    <th className="py-3 px-3">Utilisateurs <span className="font-normal text-[10px] text-slate-400">(utilisés / limite)</span></th>
                    <th className="py-3 px-3">Équipements <span className="font-normal text-[10px] text-slate-400">(utilisés / limite)</span></th>
                    <th className="py-3 px-3">Stockage <span className="font-normal text-[10px] text-slate-400">(utilisé / limite)</span></th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTenants.map(tenant => {
                    const isSelected = tenant.id === selectedTenant.id;
                    const isChecked = selectedCheckboxes.includes(tenant.id);

                    const sitesPercent = Math.round((tenant.sitesUsed / tenant.sitesLimit) * 100);
                    const usersPercent = Math.round((tenant.usersUsed / tenant.usersLimit) * 100);
                    const equipmentsPercent = Math.round((tenant.equipmentsUsed / tenant.equipmentsLimit) * 100);
                    const storagePercent = Math.round((tenant.storageUsed / tenant.storageLimit) * 100);

                    return (
                      <tr
                        key={tenant.id}
                        onClick={() => setSelectedTenantId(tenant.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td
                          className="py-3 px-3 text-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCheckbox(tenant.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{tenant.logo}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {tenant.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tenant.planBadgeColor}`}
                          >
                            {tenant.plan}
                          </span>
                        </td>

                        {/* Sites Progress */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] w-8">
                              {tenant.sitesUsed}/{tenant.sitesLimit}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(sitesPercent, 100)}%` }}
                                className={`h-full rounded-full ${
                                  sitesPercent >= 100 ? 'bg-rose-500' : 'bg-blue-500'
                                }`}
                              />
                            </div>
                            <span className={`text-[10px] font-bold w-7 text-right ${
                              sitesPercent >= 100 ? 'text-rose-500' : 'text-blue-500'
                            }`}>
                              {sitesPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Users Progress */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] w-10">
                              {tenant.usersUsed}/{tenant.usersLimit}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(usersPercent, 100)}%` }}
                                className="h-full rounded-full bg-emerald-500"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 w-7 text-right">
                              {usersPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Equipments Progress */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-[110px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] w-14">
                              {tenant.equipmentsUsed}/{tenant.equipmentsLimit}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(equipmentsPercent, 100)}%` }}
                                className="h-full rounded-full bg-purple-500"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-purple-500 w-7 text-right">
                              {equipmentsPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Storage Progress */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] w-16">
                              {tenant.storageUsed} GB/{tenant.storageLimit} GB
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(storagePercent, 100)}%` }}
                                className="h-full rounded-full bg-amber-500"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-amber-500 w-7 text-right">
                              {storagePercent}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tenant.status === 'Actif'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {tenant.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3 px-3 text-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSelectedTenantId(tenant.id);
                              setEditLimits({
                                sitesLimit: tenant.sitesLimit,
                                usersLimit: tenant.usersLimit,
                                equipmentsLimit: tenant.equipmentsLimit,
                                storageLimit: tenant.storageLimit
                              });
                              setIsAdjustLimitsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filteredTenants.length > 0 ? `1-${filteredTenants.length}` : '0'} sur {filteredTenants.length} entreprise{filteredTenants.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-600/30"
              >
                1
              </button>
              <button
                disabled={true}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="ml-3 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTION DE L'ENTREPRISE (4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
          {(isLoading || !selectedTenant) ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              {isLoading ? (
                <><RefreshCw className="w-8 h-8 animate-spin text-primary/50" /><p className="text-xs font-medium">Chargement...</p></>
              ) : (
                <><Building2 className="w-8 h-8 opacity-30" /><p className="text-xs font-medium">Sélectionnez une entreprise</p></>
              )}
            </div>
          ) : (<>
          {/* Header Identité Entreprise */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-2xl shadow-sm shrink-0">
              {selectedTenant.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate">
                  {selectedTenant.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedTenant.planBadgeColor}`}>
                  {selectedTenant.plan}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                {selectedTenant.category} • <span className="font-mono text-[11px] text-slate-500">{selectedTenant.codeTenant}</span>
              </p>
            </div>
          </div>

          {/* Cloud Quotas & Crédits Overview Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Crédits & Quotas Cloud
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                selectedTenant.status === 'Surconsommation' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : (selectedTenant.status === 'En limite' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
              }`}>
                {selectedTenant.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-xl font-black tracking-tight">
                  {selectedTenant.consumedCredits.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-400">/ {selectedTenant.allocatedCredits.toLocaleString('fr-FR')} crédits</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span>✓ {selectedTenant.remainingCredits.toLocaleString('fr-FR')} crédits disponibles</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-blue-400">
                  {Math.round((selectedTenant.consumedCredits / selectedTenant.allocatedCredits) * 100)}%
                </span>
                <div className="text-[9px] text-slate-400">Consommation</div>
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="w-full h-2 bg-slate-700/80 rounded-full mt-3 overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, Math.round((selectedTenant.consumedCredits / selectedTenant.allocatedCredits) * 100))}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  (selectedTenant.consumedCredits / selectedTenant.allocatedCredits) > 0.9
                    ? 'bg-rose-500'
                    : ((selectedTenant.consumedCredits / selectedTenant.allocatedCredits) > 0.75 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-emerald-400')
                }`}
              />
            </div>

            {/* Quick Top-Up button */}
            <button
              onClick={() => {
                setEditLimits({
                  sitesLimit: selectedTenant.sitesLimit,
                  usersLimit: selectedTenant.usersLimit,
                  equipmentsLimit: selectedTenant.equipmentsLimit,
                  storageLimit: selectedTenant.storageLimit
                });
                setIsAdjustLimitsModalOpen(true);
              }}
              className="w-full mt-3.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Allouer Crédits / Ajuster Quotas</span>
            </button>
          </div>

          {/* Navigation Tabs (5 Tabs Fully Functional) */}
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold overflow-x-auto pb-px">
            {(['Aperçu', 'Détails', 'Sites', 'Utilisateurs', 'Stockage'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab}
                {tab === 'Sites' && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {selectedTenant.sites.length || selectedTenant.sitesUsed}
                  </span>
                )}
                {tab === 'Utilisateurs' && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {selectedTenant.users.length || selectedTenant.usersUsed}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB 1: APERÇU ── */}
          {activeTab === 'Aperçu' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Utilisation actuelle</span>
                  <span className="text-[10px] font-semibold text-slate-400">Métrique en temps réel</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Sites */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Sites / Usines</span>
                      <span className="text-blue-500 font-bold">{selectedTenant.sitesLimit - selectedTenant.sitesUsed} restants</span>
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      {selectedTenant.sitesUsed} / {selectedTenant.sitesLimit}
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((selectedTenant.sitesUsed / selectedTenant.sitesLimit) * 100))}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Utilisateurs */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Utilisateurs</span>
                      <span className="text-emerald-500 font-bold">{selectedTenant.usersLimit - selectedTenant.usersUsed} licences</span>
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      {selectedTenant.usersUsed} / {selectedTenant.usersLimit}
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((selectedTenant.usersUsed / selectedTenant.usersLimit) * 100))}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Équipements */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Équipements</span>
                      <span className="text-purple-500 font-bold">{selectedTenant.equipmentsLimit - selectedTenant.equipmentsUsed} restants</span>
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      {selectedTenant.equipmentsUsed} / {selectedTenant.equipmentsLimit}
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((selectedTenant.equipmentsUsed / selectedTenant.equipmentsLimit) * 100))}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Stockage */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Stockage Cloud</span>
                      <span className="text-amber-500 font-bold">{(selectedTenant.storageLimit - selectedTenant.storageUsed).toFixed(1)} GB dispo</span>
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      {selectedTenant.storageUsed} GB / {selectedTenant.storageLimit} GB
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((selectedTenant.storageUsed / selectedTenant.storageLimit) * 100))}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Serveur API & Runtime */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-medium">Serveur Backend (.NET)</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      {liveServer?.processRamMb != null ? `${liveServer.processRamMb} MB RAM` : 'Non disponible'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      CPU : {liveServer?.cpuPercent != null ? `${liveServer.cpuPercent}%` : 'N/D'} • Uptime : {liveServer?.uptime || 'N/D'}
                    </div>
                  </div>

                  {/* Base PostgreSQL Réelle */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-medium">Base de données & Latence</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                      {liveServer?.apiLatencyMs != null ? `${liveServer.apiLatencyMs} ms` : 'Non disponible'}
                    </div>
                    <div className="text-[10px] text-indigo-500 font-semibold mt-1">
                      Connexions : {liveServer?.activeDbConnections != null ? liveServer.activeDbConnections : 'Non disponible'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tendance historique */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Tendance historique
                  </h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Historique multi-mois non disponible
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Les quotas ci-dessus affichent uniquement les compteurs réels extraits de PostgreSQL.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: DÉTAILS ── */}
          {activeTab === 'Détails' && (
            <div className="flex flex-col gap-3.5 text-xs animate-[fadeIn_0.15s_ease-out]">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Contrat & Abonnement Cloud
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Formule Active</span>
                    <span className="font-bold">{selectedTenant.plan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tarif Mensuel</span>
                    <span className="font-bold">
                      {selectedTenant.subscriptionAmount != null ? `${selectedTenant.subscriptionAmount} DT / mois` : 'Non renseigné'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date de Début</span>
                    <span className="font-semibold">{selectedTenant.subscriptionStartDate || 'Non renseignée'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Prochaine Échéance</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedTenant.subscriptionEndDate || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Identité Usine & Contact Technique
                </div>
                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Responsable Usine:</span>
                    <span className="font-bold">{selectedTenant.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email Contact:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{selectedTenant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Téléphone:</span>
                    <span className="font-medium">{selectedTenant.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Localisation:</span>
                    <span className="font-medium">{selectedTenant.adresse || 'Non renseignée'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacité Nominale:</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {selectedTenant.capacityTonsPerDay != null ? `${selectedTenant.capacityTonsPerDay} T / jour` : 'Non renseignée'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Télémétrie Instance</span>
                  Moteur : {liveServer?.database || 'Non disponible'} • Hôte : {liveServer?.hostname || 'Non disponible'} • Uptime : {liveServer?.uptime || 'Non disponible'}.
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: SITES ── */}
          {activeTab === 'Sites' && (
            <div className="flex flex-col gap-2.5 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  Sites & Usines ({selectedTenant.sites.length || selectedTenant.sitesUsed})
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {selectedTenant.sitesUsed} / {selectedTenant.sitesLimit} alloués
                </span>
              </div>

              {selectedTenant.sites && selectedTenant.sites.length > 0 ? (
                selectedTenant.sites.map(site => (
                  <div key={site.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        <Factory className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 dark:text-white">
                          {site.nom}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {site.codeSite} • {site.ville || site.gouvernorat || 'Tunisie'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {site.statut || 'Opérationnel'}
                      </span>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {site.nombreEquipements || 12} machines
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <Building2 className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Site Industriel Principal</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    1 site actif d'exploitation déclaré ({selectedTenant.capacityTonsPerDay || 450} T/jour)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: UTILISATEURS ── */}
          {activeTab === 'Utilisateurs' && (
            <div className="flex flex-col gap-2.5 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  Utilisateurs Actifs ({selectedTenant.users.length || selectedTenant.usersUsed})
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedTenant.usersUsed} / {selectedTenant.usersLimit} licences
                </span>
              </div>

              {selectedTenant.users && selectedTenant.users.length > 0 ? (
                selectedTenant.users.map(u => (
                  <div key={u.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.prenom ? u.prenom[0] : (u.nom ? u.nom[0] : 'U')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 dark:text-white truncate">
                          {u.prenom} {u.nom}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {u.roleNom || 'Opérateur'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-white">
                      {selectedTenant.contact}
                    </div>
                    <div className="text-[10px] text-slate-400">{selectedTenant.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    Administrateur Usine
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: STOCKAGE ── */}
          {activeTab === 'Stockage' && (
            <div className="flex flex-col gap-3 text-xs animate-[fadeIn_0.15s_ease-out]">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 dark:text-white">Capacité Disque Globale</span>
                  <span className="text-amber-500 font-bold">{selectedTenant.storageUsed} GB / {selectedTenant.storageLimit} GB</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.round((selectedTenant.storageUsed / selectedTenant.storageLimit) * 100))}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                  <span>{(selectedTenant.storageLimit - selectedTenant.storageUsed).toFixed(1)} GB disponibles</span>
                  <span>{Math.round((selectedTenant.storageUsed / selectedTenant.storageLimit) * 100)}% consommé</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Base PostgreSQL & Tables</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{(selectedTenant.storageUsed * 0.25).toFixed(1)} GB</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Documents & Rapports PDF</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{(selectedTenant.storageUsed * 0.40).toFixed(1)} GB</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Photos terrain & Justificatifs</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{(selectedTenant.storageUsed * 0.25).toFixed(1)} GB</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">WAL PostgreSQL & Audit Logs</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{(selectedTenant.storageUsed * 0.10).toFixed(1)} GB</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditLimits({
                    sitesLimit: selectedTenant.sitesLimit,
                    usersLimit: selectedTenant.usersLimit,
                    equipmentsLimit: selectedTenant.equipmentsLimit,
                    storageLimit: selectedTenant.storageLimit + 50
                  });
                  setIsAdjustLimitsModalOpen(true);
                }}
                className="w-full mt-1 py-2 px-3 rounded-xl border border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Étendre l'espace disque (+50 Go)</span>
              </button>
            </div>
          )}

          {/* Section: Actions rapides */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5">
              Actions rapides
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('Détails')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>Voir détails</span>
              </button>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>Contacter</span>
              </button>
              <button
                onClick={() => {
                  setEditLimits({
                    sitesLimit: selectedTenant.sitesLimit,
                    usersLimit: selectedTenant.usersLimit,
                    equipmentsLimit: selectedTenant.equipmentsLimit,
                    storageLimit: selectedTenant.storageLimit
                  });
                  setIsAdjustLimitsModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                <span>Ajuster quotas</span>
              </button>
            </div>
          </div>
          </>)}
        </div>
      </div>

      {/* MODAL: AJUSTER LES QUOTAS & ALLOUER DES CRÉDITS */}
      {isAdjustLimitsModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Ajuster les Quotas & Crédits Cloud</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedTenant.name} ({selectedTenant.codeTenant})
                </p>
              </div>
              <button onClick={() => setIsAdjustLimitsModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Credit Injection */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                Recharger le Solde de Crédits Cloud
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 5000].map(cred => (
                  <button
                    key={cred}
                    type="button"
                    onClick={() => {
                      setTenantsList(prev => prev.map(t => {
                        if (t.id === selectedTenant.id) {
                          return {
                            ...t,
                            allocatedCredits: t.allocatedCredits + cred,
                            remainingCredits: t.remainingCredits + cred
                          };
                        }
                        return t;
                      }));
                      showToast(`+${cred} Crédits Cloud alloués à ${selectedTenant.name}`);
                    }}
                    className="py-1.5 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold transition-all cursor-pointer"
                  >
                    +{cred} Crédits
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Limite de Sites / Usines
                </label>
                <input
                  type="number"
                  value={editLimits.sitesLimit}
                  onChange={e => setEditLimits({ ...editLimits, sitesLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Limite d'Utilisateurs
                </label>
                <input
                  type="number"
                  value={editLimits.usersLimit}
                  onChange={e => setEditLimits({ ...editLimits, usersLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Limite d'Équipements
                </label>
                <input
                  type="number"
                  value={editLimits.equipmentsLimit}
                  onChange={e => setEditLimits({ ...editLimits, equipmentsLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Limite de Stockage (GB)
                </label>
                <input
                  type="number"
                  value={editLimits.storageLimit}
                  onChange={e => setEditLimits({ ...editLimits, storageLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdjustLimitsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await superAdminApi.updateTenantLimits(selectedTenant.rawId, {
                      maxSites: editLimits.sitesLimit,
                      maxUsers: editLimits.usersLimit,
                      maxEquipements: editLimits.equipmentsLimit,
                      maxStorageGb: editLimits.storageLimit
                    });

                    setTenantsList(prev =>
                      prev.map(t =>
                        t.id === selectedTenant.id
                          ? {
                              ...t,
                              sitesLimit: editLimits.sitesLimit,
                              usersLimit: editLimits.usersLimit,
                              equipmentsLimit: editLimits.equipmentsLimit,
                              storageLimit: editLimits.storageLimit
                            }
                          : t
                      )
                    );
                    setIsAdjustLimitsModalOpen(false);
                    showToast(`Quotas mis à jour et persistés en base pour ${selectedTenant.name}`);
                  } catch {
                    showToast('Erreur lors de la mise à jour des quotas');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Enregistrer les Quotas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONTACTER L'ENTREPRISE */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Contacter {selectedTenant.name}
              </h3>
              <button onClick={() => setIsContactModalOpen(false)} className="p-1 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destinataire
              </label>
              <input
                type="text"
                readOnly
                value={`${selectedTenant.contact} (${selectedTenant.email})`}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Message concernant l'utilisation des quotas
              </label>
              <textarea
                rows={4}
                defaultValue={`Bonjour ${selectedTenant.contact},\n\nNous constatons que votre entreprise approche ou a dépassé certaines limites allouées dans votre formule ${selectedTenant.plan}. Nous restons à votre disposition pour faire évoluer votre offre.`}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  showToast(`Email envoyé à ${selectedTenant.email}`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
              >
                Envoyer le message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
