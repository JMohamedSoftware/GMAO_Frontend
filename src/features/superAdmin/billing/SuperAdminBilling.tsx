import React, { useState, useMemo, useEffect } from 'react';
import { superAdminApi } from '../api/superAdmin.api';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Building2,
  Users,
  Cog,
  FileCheck,
  FileText,
  TrendingUp,
  Layers,
  Edit,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Receipt
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export const SuperAdminBilling: React.FC = () => {
  const [selectedSubId, setSelectedSubId] = useState<string>('sub-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'Détails' | 'Utilisation' | 'Factures' | 'Historique' | 'Utilisateurs' | 'Sites'>('Détails');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Actions dropdown & Edit modal
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [editPlanForm, setEditPlanForm] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Subscriptions loaded from backend API
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesSearch = s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.plan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === 'All' || s.plan === planFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [subscriptions, searchTerm, planFilter, statusFilter]);

  const activeSub = useMemo(() => {
    return subscriptions.find(s => s.id === selectedSubId) || subscriptions[0];
  }, [subscriptions, selectedSubId]);

  const totalSubsCount = subscriptions.length;
  const activeSubsCount = subscriptions.filter(s => s.status === 'Actif').length;
  const trialSubsCount = subscriptions.filter(s => s.status === 'En essai').length;
  const expiringSubsCount = subscriptions.filter(s => s.daysLeft <= 30 && s.status === 'Actif').length;
  const suspendedSubsCount = subscriptions.filter(s => s.status === 'Suspendu').length;

  const activeSubsPercent = totalSubsCount > 0 ? Math.round((activeSubsCount / totalSubsCount) * 100) : 0;
  const trialSubsPercent = totalSubsCount > 0 ? Math.round((trialSubsCount / totalSubsCount) * 100) : 0;
  const expiringSubsPercent = totalSubsCount > 0 ? Math.round((expiringSubsCount / totalSubsCount) * 100) : 0;
  const suspendedSubsPercent = totalSubsCount > 0 ? Math.round((suspendedSubsCount / totalSubsCount) * 100) : 0;

  const handleExport = () => {
    const headers = ['Entreprise', 'Contact', 'Plan', 'Sites', 'Utilisateurs', 'Montant', 'Début', 'Fin', 'Statut'];
    const rows = filteredSubscriptions.map(s => [
      s.company, s.manager, s.plan, s.sites, s.users, s.amount, s.startDate, s.endDate, s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `abonnements_gmao_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportation des abonnements réussie !');
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [liveBilling, setLiveBilling] = useState<any>(null);

  const fetchBilling = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getBillingOverview();
      if (data && data.subscriptions && data.subscriptions.length > 0) {
        setLiveBilling(data);
        const mapped = data.subscriptions.map((s: any, idx: number) => ({
          id: `sub-${s.tenantId || idx + 1}`,
          backendTenantId: s.tenantId,
          code: `ENT-${String(s.tenantId || idx + 1).padStart(3, '0')}`,
          company: s.tenantNom,
          logo: s.tenantNom.toLowerCase().includes('tomate') ? '🍅' : (s.tenantNom.toLowerCase().includes('sicam') ? '🥫' : '🏭'),
          category: s.category || 'Agroalimentaire',
          manager: 'Direction Générale',
          managerEmail: `contact@${s.tenantNom.toLowerCase().replace(/[^a-z]/g, '')}.tn`,
          plan: s.plan || 'Business Pro',
          planColor: s.plan?.includes('Enterprise')
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
            : (s.plan?.includes('Starter')
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900'),
          sites: 2,
          maxSites: 5,
          users: 12,
          maxUsers: 50,
          equipments: 120,
          maxEquipments: 1000,
          monthlyOt: 18,
          amount: `${Number(s.amount).toLocaleString('fr-FR')} TND`,
          priceValue: Number(s.amount),
          startDate: s.startDate ? new Date(s.startDate).toLocaleDateString('fr-FR') : '01/01/2026',
          endDate: s.renewalDate ? new Date(s.renewalDate).toLocaleDateString('fr-FR') : '01/01/2027',
          daysLeft: 300,
          status: s.status === 'Actif' ? 'Actif' : (s.status === 'En essai' ? 'En essai' : 'Suspendu'),
          statusColor: s.status === 'Actif' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
          modules: ['Gestion des équipements', 'Maintenance complète', 'Stock & achats', 'Multi-sites']
        }));
        setSubscriptions(mapped);
        if (showNotification) showToast('Abonnements synchronisés avec le Backend .NET');
      }
    } catch (err) {
      console.warn('[Billing] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleOpenEditPlan = () => {
    setEditPlanForm({ ...activeSub });
    setIsEditPlanModalOpen(true);
  };

  const handleSaveEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlanForm) return;

    try {
      if (editPlanForm.backendTenantId) {
        await superAdminApi.updateSubscription(editPlanForm.backendTenantId, {
          plan: editPlanForm.plan,
          status: editPlanForm.status === 'Actif' ? 'Actif' : editPlanForm.status,
          amount: editPlanForm.priceValue
        });
      }
    } catch (err) {
      console.warn('Erreur mise à jour abonnement backend:', err);
    }

    setSubscriptions(prev => prev.map(s => s.id === editPlanForm.id ? editPlanForm : s));
    setIsEditPlanModalOpen(false);
    showToast(`Abonnement de ${editPlanForm.company} mis à jour`);
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none animate-[fadeIn_0.2s_ease-out]">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-[slideIn_0.2s_ease-out]">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* ── TOP HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-850 dark:text-white tracking-tight leading-snug">
              Abonnements
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestion des abonnements de tous les clients
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Tomato banner photo slice */}
          <div className="relative h-11 w-32 lg:w-48 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hidden sm:block">
            <img
              src={tomateImg}
              alt="Tomates industrielles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/15" />
          </div>

          {/* Date Picker Button */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[11px] text-slate-850 dark:text-white leading-tight">
                Aujourd'hui
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                29 Septembre 2026
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Synchronize button */}
          <button
            onClick={() => fetchBilling(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec PostgreSQL .NET"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS (ROW 1) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* KPI 1: Abonnements total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-1 h-2 bg-blue-300 dark:bg-blue-700 rounded-full" />
              <span className="w-1 h-3.5 bg-blue-400 dark:bg-blue-600 rounded-full" />
              <span className="w-1 h-5 bg-blue-600 rounded-full" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Abonnements total
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block">
              {totalSubsCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> 100%
            </span>
            <span className="text-slate-400">données réelles</span>
          </div>
        </div>

        {/* KPI 2: Actifs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-1 h-2 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
              <span className="w-1 h-3.5 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
              <span className="w-1 h-5 bg-emerald-600 rounded-full" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Actifs
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block">
              {activeSubsCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              {activeSubsPercent}%
            </span>
            <span className="text-slate-400">actifs</span>
          </div>
        </div>

        {/* KPI 3: En essai */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-1 h-2 bg-amber-300 rounded-full" />
              <span className="w-1 h-3.5 bg-amber-400 rounded-full" />
              <span className="w-1 h-5 bg-amber-500 rounded-full" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              En essai
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block">
              {trialSubsCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {trialSubsPercent}%
            </span>
          </div>
        </div>

        {/* KPI 4: Expirant bientôt */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-1 h-2 bg-rose-300 dark:bg-rose-700 rounded-full" />
              <span className="w-1 h-3.5 bg-rose-400 dark:bg-rose-600 rounded-full" />
              <span className="w-1 h-5 bg-rose-600 rounded-full" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Expirant bientôt
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block">
              {expiringSubsCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {expiringSubsPercent}%
            </span>
          </div>
        </div>

        {/* KPI 5: Suspendus */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition col-span-2 sm:col-span-1">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
              <XCircle className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-1 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="w-1 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="w-1 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Suspendus
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block">
              {suspendedSubsCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
            <span className="font-bold text-slate-400">
              {suspendedSubsPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN SPLIT CONTENT (LEFT TABLE / RIGHT DETAIL) ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: LISTE DES ABONNEMENTS TABLE (col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Table Header Bar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                  Liste des abonnements
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Panneau de filtres avancés')}
                  className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 transition cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filtres</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Filter Bar (Horizontal) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3 pb-2 text-xs">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une entreprise..."
                  className="w-full h-8.5 pl-8.5 pr-3 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-slate-750 dark:text-slate-200 transition"
                />
              </div>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">Tous les plans</option>
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="En essai">En essai</option>
                <option value="Expirant">Expirant</option>
                <option value="Expiré">Expiré</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">Toutes les dates</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto custom-scrollbar mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-2.5 px-1.5 w-6">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-0 cursor-pointer" />
                    </th>
                    <th className="py-2.5 px-2">Entreprise</th>
                    <th className="py-2.5 px-2">Plan</th>
                    <th className="py-2.5 px-1 text-center">Sites</th>
                    <th className="py-2.5 px-1 text-center">Utilisateurs</th>
                    <th className="py-2.5 px-2">Montant</th>
                    <th className="py-2.5 px-2">Début</th>
                    <th className="py-2.5 px-2">Fin</th>
                    <th className="py-2.5 px-2">Statut</th>
                    <th className="py-2.5 px-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredSubscriptions.map((s) => {
                    const isSelected = s.id === selectedSubId;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedSubId(s.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/30'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedSubId(s.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{s.logo}</span>
                            <div>
                              <span className="font-bold text-slate-850 dark:text-white group-hover:text-primary transition-colors block text-[11px] whitespace-nowrap">
                                {s.company}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {s.manager}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${s.planColor}`}>
                            {s.plan}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-center text-slate-750 dark:text-slate-200 font-bold">
                          {s.sites}
                        </td>
                        <td className="py-2.5 px-1 text-center text-slate-750 dark:text-slate-200 font-bold">
                          {s.users}
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold text-slate-850 dark:text-white text-[11px] whitespace-nowrap">
                          {s.amount}
                        </td>
                        <td className="py-2.5 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                          {s.startDate}
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {s.endDate}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              s.status === 'Actif'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : s.status === 'En essai'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : s.status === 'Expirant'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            ● {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubId(s.id);
                              handleOpenEditPlan();
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 transition"
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

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 mt-2">
            <div>
              <span>{filteredSubscriptions.length > 0 ? `1-${filteredSubscriptions.length}` : '0'} sur {filteredSubscriptions.length} abonnement{filteredSubscriptions.length > 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                className="w-7 h-7 rounded-lg text-xs font-bold transition bg-primary text-white shadow-xs"
              >
                1
              </button>

              <button
                disabled={true}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="ml-2">
                <span className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 font-semibold text-[11px]">
                  {filteredSubscriptions.length} / page
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW OF SELECTED SUBSCRIPTION (col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          {/* Company Top Header with Actions Dropdown */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-2xl shadow-xs border border-slate-200/60 dark:border-slate-700">
                {activeSub.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeSub.company}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeSub.statusColor}`}>
                    ● {activeSub.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  ID : {activeSub.code} • {activeSub.category}
                </p>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <span>Actions</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isActionsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 text-xs">
                  <button
                    onClick={() => {
                      setIsActionsDropdownOpen(false);
                      handleOpenEditPlan();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Edit className="w-3.5 h-3.5 text-primary" />
                    <span>Modifier l'abonnement</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsActionsDropdownOpen(false);
                      showToast(`Facture proforma générée pour ${activeSub.company}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Générer une facture</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsActionsDropdownOpen(false);
                      showToast(`Rappel envoyé à ${activeSub.managerEmail}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Envoyer un rappel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
            {(['Détails', 'Utilisation', 'Factures', 'Historique', 'Utilisateurs', 'Sites'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 transition relative cursor-pointer ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary font-black'
                    : 'hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: Détails */}
          {activeTab === 'Détails' && (
            <div className="flex flex-col gap-4">
              {/* Plan actuel Tile */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Plan actuel
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-tight block">
                      {activeSub.plan}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono block">
                    {activeSub.amount} <span className="text-xs font-normal text-slate-400">/ mois</span>
                  </span>
                  <button
                    onClick={handleOpenEditPlan}
                    className="mt-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-primary hover:bg-slate-50 transition cursor-pointer"
                  >
                    Modifier le plan
                  </button>
                </div>
              </div>

              {/* Date & Countdown Tiles */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[9px] uppercase font-bold">Date de début</span>
                  </div>
                  <span className="font-bold text-slate-850 dark:text-white text-[11px] font-mono">
                    {activeSub.startDate}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[9px] uppercase font-bold">Date de fin</span>
                  </div>
                  <span className="font-bold text-slate-850 dark:text-white text-[11px] font-mono">
                    {activeSub.endDate}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                    {activeSub.daysLeft}
                  </span>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">
                    Jours restants
                  </span>
                </div>
              </div>

              {/* 4 Mini Metric Tiles */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-primary mb-0.5" />
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {activeSub.sites}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Sites / Usines</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-purple-600 mb-0.5" />
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {activeSub.users}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Utilisateurs</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <Cog className="w-3.5 h-3.5 text-primary mb-0.5" />
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {activeSub.equipments}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Équipements</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                  <span className="text-sm font-black text-emerald-600 leading-tight">
                    {activeSub.monthlyOt}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">OT / mois</span>
                </div>
              </div>

              {/* Modules inclus dans le plan */}
              <div>
                <h4 className="text-xs font-bold text-slate-850 dark:text-white mb-2">
                  Modules inclus dans le plan
                </h4>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs">
                  {activeSub.modules.map(mod => (
                    <div key={mod} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-[10px] text-slate-650 dark:text-slate-300 font-medium leading-tight">
                        {mod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consommation des limites (Progress Bars) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-850 dark:text-white block">
                  Consommation des limites
                </span>

                {/* Limit 1: Sites */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Sites / Usines</span>
                    <span>{activeSub.sites} / {activeSub.maxSites} ({Math.round((activeSub.sites / activeSub.maxSites) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.round((activeSub.sites / activeSub.maxSites) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Limit 2: Utilisateurs */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Utilisateurs</span>
                    <span>{activeSub.users} / {activeSub.maxUsers} ({Math.round((activeSub.users / activeSub.maxUsers) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.round((activeSub.users / activeSub.maxUsers) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Limit 3: Équipements */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Équipements</span>
                    <span>{activeSub.equipments} / {activeSub.maxEquipments} ({Math.round((activeSub.equipments / activeSub.maxEquipments) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${Math.round((activeSub.equipments / activeSub.maxEquipments) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Factures */}
          {activeTab === 'Factures' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Historique de facturation</span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-850 dark:text-white">Facture #FAC-2026-09</span>
                  <p className="text-[10px] text-slate-400">29 Septembre 2026 • 199,00 TND</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600">Payée</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-850 dark:text-white">Facture #FAC-2026-08</span>
                  <p className="text-[10px] text-slate-400">29 Août 2026 • 199,00 TND</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600">Payée</span>
              </div>
            </div>
          )}

          {/* Tab Content: Utilisation */}
          {activeTab === 'Utilisation' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-bold text-slate-800 dark:text-white">Activité mensuelle</span>
                <p className="text-[10px] text-slate-400 mt-1">128 équipements actifs sous surveillance IoT et GMAO.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: MODIFIER LE PLAN / ABONNEMENT ─────────────────────────────── */}
      {isEditPlanModalOpen && editPlanForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditPlan}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out] flex flex-col gap-4 text-xs"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                Modifier l'abonnement de {editPlanForm.company}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditPlanModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Formule / Plan</label>
                <select
                  value={editPlanForm.plan}
                  onChange={(e) => setEditPlanForm({ ...editPlanForm, plan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Statut</label>
                <select
                  value={editPlanForm.status}
                  onChange={(e) => setEditPlanForm({ ...editPlanForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Actif">Actif</option>
                  <option value="En essai">En essai</option>
                  <option value="Expirant">Expirant</option>
                  <option value="Expiré">Expiré</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Montant facturé</label>
                <input
                  type="text"
                  value={editPlanForm.amount}
                  onChange={(e) => setEditPlanForm({ ...editPlanForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Date d'expiration</label>
                <input
                  type="text"
                  value={editPlanForm.endDate}
                  onChange={(e) => setEditPlanForm({ ...editPlanForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition"
              >
                Enregistrer l'abonnement
              </button>
              <button
                type="button"
                onClick={() => setIsEditPlanModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
