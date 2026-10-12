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
  Database
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export interface MonitoringTenant {
  id: string;
  name: string;
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
  status: 'Actif' | 'En limite';
  email: string;
  contact: string;
  trend: {
    months: string[];
    users: number[];
    equipments: number[];
    storage: number[];
  };
}

export const SuperAdminMonitoring: React.FC = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('mon-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'Aperçu' | 'Détails' | 'Sites' | 'Utilisateurs' | 'Stockage'>('Aperçu');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const [tenantsList, setTenantsList] = useState<MonitoringTenant[]>([
    {
      id: 'mon-001',
      name: 'Conserve Plus',
      logo: '🥫',
      category: 'Entreprise industrielle de conserve de tomates',
      plan: 'Professional',
      planBadgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sitesUsed: 2,
      sitesLimit: 5,
      usersUsed: 12,
      usersLimit: 50,
      equipmentsUsed: 128,
      equipmentsLimit: 1000,
      storageUsed: 8.4,
      storageLimit: 50,
      status: 'Actif',
      email: 's.mansouri@conserveplus.tn',
      contact: 'S. Mansouri',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [25, 45, 60, 75, 85, 95],
        equipments: [40, 65, 80, 100, 115, 128],
        storage: [15, 18, 20, 22, 25, 28]
      }
    },
    {
      id: 'mon-002',
      name: 'Tomate Industrie',
      logo: '🍅',
      category: 'Transformation agroalimentaire & concentré',
      plan: 'Basic',
      planBadgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sitesUsed: 1,
      sitesLimit: 1,
      usersUsed: 5,
      usersLimit: 10,
      equipmentsUsed: 86,
      equipmentsLimit: 200,
      storageUsed: 4.1,
      storageLimit: 10,
      status: 'En limite',
      email: 'k.ammar@tomateindustrie.tn',
      contact: 'K. Ammar',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [10, 20, 35, 45, 55, 64],
        equipments: [30, 45, 60, 70, 80, 86],
        storage: [8, 11, 14, 16, 18, 20]
      }
    },
    {
      id: 'mon-003',
      name: 'AgroFood SARL',
      logo: '🏭',
      category: 'Groupe Agro-industriel moderne',
      plan: 'Enterprise',
      planBadgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      sitesUsed: 3,
      sitesLimit: 10,
      usersUsed: 25,
      usersLimit: 100,
      equipmentsUsed: 320,
      equipmentsLimit: 2000,
      storageUsed: 18.7,
      storageLimit: 100,
      status: 'Actif',
      email: 'm.trabelsi@agrofood.tn',
      contact: 'M. Trabelsi',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [20, 30, 38, 44, 48, 52],
        equipments: [80, 140, 200, 250, 290, 320],
        storage: [10, 12, 14, 15, 16, 18.7]
      }
    },
    {
      id: 'mon-004',
      name: 'Méditerranée Food',
      logo: '🥫',
      category: 'Conditionnement & conserves premium',
      plan: 'Professional',
      planBadgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sitesUsed: 3,
      sitesLimit: 5,
      usersUsed: 18,
      usersLimit: 50,
      equipmentsUsed: 245,
      equipmentsLimit: 1000,
      storageUsed: 12.3,
      storageLimit: 50,
      status: 'Actif',
      email: 'h.bensalah@medfood.tn',
      contact: 'H. Ben Salah',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [15, 22, 28, 32, 36, 40],
        equipments: [50, 90, 140, 180, 210, 245],
        storage: [6, 8, 9, 10, 11, 12.3]
      }
    },
    {
      id: 'mon-005',
      name: 'Sousse Conserves',
      logo: '🍅',
      category: 'Production de sauce et double concentré',
      plan: 'Basic',
      planBadgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sitesUsed: 1,
      sitesLimit: 1,
      usersUsed: 4,
      usersLimit: 10,
      equipmentsUsed: 67,
      equipmentsLimit: 200,
      storageUsed: 6.2,
      storageLimit: 10,
      status: 'En limite',
      email: 'a.gharbi@sousseconserves.tn',
      contact: 'A. Gharbi',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [8, 12, 18, 22, 26, 30],
        equipments: [20, 30, 42, 50, 60, 67],
        storage: [3, 4, 4.5, 5, 5.8, 6.2]
      }
    },
    {
      id: 'mon-006',
      name: 'Cap Tomate',
      logo: '🍅',
      category: 'Transformation maraîchère régionale',
      plan: 'Professional',
      planBadgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sitesUsed: 2,
      sitesLimit: 5,
      usersUsed: 10,
      usersLimit: 50,
      equipmentsUsed: 140,
      equipmentsLimit: 1000,
      storageUsed: 9.8,
      storageLimit: 50,
      status: 'Actif',
      email: 'r.khelifi@captomate.tn',
      contact: 'R. Khelifi',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [5, 8, 12, 14, 17, 20],
        equipments: [40, 65, 85, 110, 125, 140],
        storage: [4, 5.5, 7, 8, 8.8, 9.8]
      }
    },
    {
      id: 'mon-007',
      name: 'El Wafa Agro',
      logo: '🌾',
      category: 'Agro-industrie et logistique froide',
      plan: 'Basic',
      planBadgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sitesUsed: 1,
      sitesLimit: 2,
      usersUsed: 3,
      usersLimit: 10,
      equipmentsUsed: 56,
      equipmentsLimit: 200,
      storageUsed: 3.1,
      storageLimit: 10,
      status: 'Actif',
      email: 'l.farhat@elwafaagro.tn',
      contact: 'L. Farhat',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [4, 6, 8, 10, 12, 14],
        equipments: [15, 24, 32, 40, 48, 56],
        storage: [1.5, 1.8, 2.2, 2.5, 2.8, 3.1]
      }
    },
    {
      id: 'mon-008',
      name: 'Tunisie Agro Industrie',
      logo: '🇹🇳',
      category: 'Complexe industriel de transformation',
      plan: 'Enterprise',
      planBadgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      sitesUsed: 4,
      sitesLimit: 10,
      usersUsed: 32,
      usersLimit: 100,
      equipmentsUsed: 418,
      equipmentsLimit: 2000,
      storageUsed: 28.5,
      storageLimit: 100,
      status: 'Actif',
      email: 'n.jaziri@tai.tn',
      contact: 'N. Jaziri',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [12, 18, 24, 28, 30, 32],
        equipments: [120, 190, 260, 320, 370, 418],
        storage: [12, 16, 20, 23, 26, 28.5]
      }
    },
    {
      id: 'mon-009',
      name: 'Sicamex',
      logo: '🥫',
      category: 'Conserverie & extraction industrielle',
      plan: 'Professional',
      planBadgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sitesUsed: 2,
      sitesLimit: 5,
      usersUsed: 11,
      usersLimit: 50,
      equipmentsUsed: 198,
      equipmentsLimit: 1000,
      storageUsed: 11.0,
      storageLimit: 50,
      status: 'Actif',
      email: 'y.chaabane@sicamex.tn',
      contact: 'Y. Chaabane',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [8, 10, 11, 11, 11, 11],
        equipments: [60, 95, 130, 160, 180, 198],
        storage: [4, 6, 7.5, 9, 10, 11]
      }
    },
    {
      id: 'mon-010',
      name: 'BioTomate',
      logo: '🌱',
      category: 'Filière biologique certifiée',
      plan: 'Basic',
      planBadgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sitesUsed: 1,
      sitesLimit: 1,
      usersUsed: 2,
      usersLimit: 10,
      equipmentsUsed: 44,
      equipmentsLimit: 200,
      storageUsed: 5.6,
      storageLimit: 10,
      status: 'En limite',
      email: 'f.hlali@biotomate.tn',
      contact: 'F. Hlali',
      trend: {
        months: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'],
        users: [2, 2, 2, 2, 2, 2],
        equipments: [10, 18, 25, 32, 38, 44],
        storage: [2, 2.8, 3.6, 4.2, 5.0, 5.6]
      }
    }
  ]);

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

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [liveServer, setLiveServer] = useState<any>(null);

  const fetchMonitoring = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getMonitoring();
      if (data) {
        if (data.server) setLiveServer(data.server);
        if (data.tenants && data.tenants.length > 0) {
          setTenantsList(prev => prev.map(t => {
            const remote = data.tenants.find(rt => rt.id === Number(t.id.replace('mon-', '')) || rt.nom === t.name);
            if (remote) {
              return {
                ...t,
                usersUsed: remote.usersCount,
                usersLimit: remote.maxUsers,
                equipmentsUsed: remote.equipementsCount,
                equipmentsLimit: remote.maxEquipements,
                storageUsed: remote.storageUsedGb,
                storageLimit: remote.maxStorageGb,
                status: (remote.storageUsedGb / remote.maxStorageGb) > 0.85 ? 'En limite' : 'Actif'
              };
            }
            return t;
          }));
        }
        if (showNotification) showToast('Métriques synchronisées avec le serveur .NET');
      }
    } catch (err) {
      console.warn('[Monitoring] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
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
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                Septembre 2026
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
                286
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Utilisateurs actifs
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ +12%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
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
                1 248
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Équipements
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ +18%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
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
                86
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Sites / Usines
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ +7%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
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
                62.5 GB
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Stockage utilisé
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  ↓ +24%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Utilisateurs par entreprise
              </h3>
            </div>
            <select className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <option value="top7">Top 7</option>
              <option value="top10">Top 10</option>
            </select>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
            {/* Horizontal guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>80</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>60</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>40</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>20</span></div>
              <div className="flex justify-between"><span>0</span></div>
            </div>

            {[
              { name: 'Conserve Plus', val: 72 },
              { name: 'Tomate Industrie', val: 64 },
              { name: 'AgroFood SARL', val: 52 },
              { name: 'Méditerranée Food', val: 40 },
              { name: 'Sousse Conserves', val: 30 },
              { name: 'Cap Tomate', val: 20 },
              { name: 'Autres', val: 16 }
            ].map(item => (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-1 group relative z-10">
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold pointer-events-none z-20 whitespace-nowrap">
                  {item.val} util.
                </div>
                <div
                  style={{ height: `${(item.val / 80) * 100}%` }}
                  className="w-full max-w-[24px] bg-blue-500 group-hover:bg-blue-600 rounded-t transition-all"
                />
                <span className="text-[8px] font-semibold text-slate-400 truncate max-w-[45px] text-center -rotate-45 sm:rotate-0 mt-1">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Équipements par entreprise */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Équipements par entreprise
              </h3>
            </div>
            <select className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <option value="top7">Top 7</option>
              <option value="top10">Top 10</option>
            </select>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>400</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>300</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>200</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>100</span></div>
              <div className="flex justify-between"><span>0</span></div>
            </div>

            {[
              { name: 'Conserve Plus', val: 370 },
              { name: 'Tomate Industrie', val: 330 },
              { name: 'AgroFood SARL', val: 280 },
              { name: 'Méditerranée Food', val: 140 },
              { name: 'Sousse Conserves', val: 70 },
              { name: 'Cap Tomate', val: 50 },
              { name: 'Autres', val: 35 }
            ].map(item => (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-1 group relative z-10">
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold pointer-events-none z-20 whitespace-nowrap">
                  {item.val} équips.
                </div>
                <div
                  style={{ height: `${(item.val / 400) * 100}%` }}
                  className="w-full max-w-[24px] bg-emerald-500 group-hover:bg-emerald-600 rounded-t transition-all"
                />
                <span className="text-[8px] font-semibold text-slate-400 truncate max-w-[45px] text-center -rotate-45 sm:rotate-0 mt-1">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 3: Stockage utilisé par entreprise */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Stockage utilisé par entreprise
              </h3>
            </div>
            <select className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <option value="top7">Top 7</option>
              <option value="top10">Top 10</option>
            </select>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>30GB</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>20GB</span></div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between"><span>10GB</span></div>
              <div className="flex justify-between"><span>0</span></div>
            </div>

            {[
              { name: 'Conserve Plus', val: 27 },
              { name: 'Tomate Industrie', val: 20 },
              { name: 'AgroFood SARL', val: 16 },
              { name: 'Méditerranée Food', val: 12 },
              { name: 'Cap Tomate', val: 9 },
              { name: 'Autres', val: 7 }
            ].map(item => (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-1 group relative z-10">
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold pointer-events-none z-20 whitespace-nowrap">
                  {item.val} GB
                </div>
                <div
                  style={{ height: `${(item.val / 30) * 100}%` }}
                  className="w-full max-w-[24px] bg-purple-500 group-hover:bg-purple-600 rounded-t transition-all"
                />
                <span className="text-[8px] font-semibold text-slate-400 truncate max-w-[45px] text-center -rotate-45 sm:rotate-0 mt-1">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
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
              1-10 sur 48 entreprises
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-600/30"
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                3
              </button>
              <button
                onClick={() => setCurrentPage(4)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                4
              </button>
              <button
                onClick={() => setCurrentPage(5)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                5
              </button>
              <span className="text-slate-400 px-1 text-xs font-bold">...</span>
              <button
                onClick={() => setCurrentPage(10)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                10
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors"
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
          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-2xl shadow-sm shrink-0">
              {selectedTenant.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                  {selectedTenant.name}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {selectedTenant.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {selectedTenant.category}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 text-xs font-bold overflow-x-auto pb-px">
            {(['Aperçu', 'Détails', 'Sites', 'Utilisateurs', 'Stockage'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Section: Utilisation actuelle */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
              Utilisation actuelle
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Sites */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Sites / Usines</div>
                <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  {selectedTenant.sitesUsed} / {selectedTenant.sitesLimit}
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.round((selectedTenant.sitesUsed / selectedTenant.sitesLimit) * 100)}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-blue-500 mt-1">
                  {Math.round((selectedTenant.sitesUsed / selectedTenant.sitesLimit) * 100)}%
                </div>
              </div>

              {/* Utilisateurs */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Utilisateurs</div>
                <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  {selectedTenant.usersUsed} / {selectedTenant.usersLimit}
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.round((selectedTenant.usersUsed / selectedTenant.usersLimit) * 100)}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-emerald-500 mt-1">
                  {Math.round((selectedTenant.usersUsed / selectedTenant.usersLimit) * 100)}%
                </div>
              </div>

              {/* Équipements */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Équipements</div>
                <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  {selectedTenant.equipmentsUsed} / {selectedTenant.equipmentsLimit}
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.round((selectedTenant.equipmentsUsed / selectedTenant.equipmentsLimit) * 100)}%` }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-purple-500 mt-1">
                  {Math.round((selectedTenant.equipmentsUsed / selectedTenant.equipmentsLimit) * 100)}%
                </div>
              </div>

              {/* Stockage */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Stockage</div>
                <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  {selectedTenant.storageUsed} GB / {selectedTenant.storageLimit} GB
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.round((selectedTenant.storageUsed / selectedTenant.storageLimit) * 100)}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-amber-500 mt-1">
                  {Math.round((selectedTenant.storageUsed / selectedTenant.storageLimit) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Section: Tendance (6 derniers mois) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                Tendance (6 derniers mois)
              </h4>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] font-bold mb-3">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Utilisateurs</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Équipements</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Stockage (GB)</span>
              </div>
            </div>

            {/* Multi-line Trend SVG */}
            <div className="h-32 w-full relative pt-2">
              <svg viewBox="0 0 250 100" className="w-full h-full overflow-visible">
                {/* Horizontal gridlines */}
                <line x1="0" y1="20" x2="250" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="250" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="250" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />

                {/* Y-axis labels */}
                <text x="-5" y="22" fill="#94A3B8" fontSize="8" textAnchor="end">150</text>
                <text x="-5" y="52" fill="#94A3B8" fontSize="8" textAnchor="end">100</text>
                <text x="-5" y="82" fill="#94A3B8" fontSize="8" textAnchor="end">50</text>
                <text x="-5" y="98" fill="#94A3B8" fontSize="8" textAnchor="end">0</text>

                {/* Line 1: Équipements (Purple) */}
                <polyline
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2.5"
                  points="10,75 55,60 100,50 145,40 190,32 235,25"
                />
                {/* Dots */}
                {[
                  { cx: 10, cy: 75 },
                  { cx: 55, cy: 60 },
                  { cx: 100, cy: 50 },
                  { cx: 145, cy: 40 },
                  { cx: 190, cy: 32 },
                  { cx: 235, cy: 25 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#8B5CF6" className="cursor-pointer hover:r-4" />
                ))}

                {/* Line 2: Utilisateurs (Green) */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  points="10,85 55,75 100,68 145,60 190,52 235,46"
                />
                {[
                  { cx: 10, cy: 85 },
                  { cx: 55, cy: 75 },
                  { cx: 100, cy: 68 },
                  { cx: 145, cy: 60 },
                  { cx: 190, cy: 52 },
                  { cx: 235, cy: 46 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#10B981" className="cursor-pointer hover:r-4" />
                ))}

                {/* Line 3: Stockage (Orange) */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  points="10,92 55,90 100,88 145,86 190,83 235,80"
                />
                {[
                  { cx: 10, cy: 92 },
                  { cx: 55, cy: 90 },
                  { cx: 100, cy: 88 },
                  { cx: 145, cy: 86 },
                  { cx: 190, cy: 83 },
                  { cx: 235, cy: 80 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#F59E0B" className="cursor-pointer hover:r-4" />
                ))}

                {/* X-axis months */}
                <text x="10" y="108" fill="#94A3B8" fontSize="8" textAnchor="middle">Avr</text>
                <text x="55" y="108" fill="#94A3B8" fontSize="8" textAnchor="middle">Mai</text>
                <text x="100" y="108" fill="#94A3B8" fontSize="8" textAnchor="middle">Juin</text>
                <text x="145" y="108" fill="#94A3B8" fontSize="8" textAnchor="middle">Juil</text>
                <text x="190" y="108" fill="#94A3B8" fontSize="8" textAnchor="middle">Août</text>
                <text x="235" y="108" fill="#94A3B8" fontSize="8" textAnchor="middle">Sep</text>
              </svg>
            </div>
          </div>

          {/* Section: Actions rapides */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5">
              Actions rapides
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => showToast(`Détails complets de ${selectedTenant.name}`)}
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
                <span>Ajuster les limites</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: AJUSTER LES LIMITES */}
      {isAdjustLimitsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Ajuster les quotas ({selectedTenant.name})
              </h3>
              <button onClick={() => setIsAdjustLimitsModalOpen(false)} className="p-1 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
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
                  Limite d'utilisateurs
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
                  Limite d'équipements
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
                  Limite de stockage (GB)
                </label>
                <input
                  type="number"
                  value={editLimits.storageLimit}
                  onChange={e => setEditLimits({ ...editLimits, storageLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAdjustLimitsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
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
                  showToast(`Quotas mis à jour pour ${selectedTenant.name}`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
              >
                Appliquer
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
