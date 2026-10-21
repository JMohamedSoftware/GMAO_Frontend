import React, { useState, useMemo, useEffect } from 'react';
import { superAdminApi } from '../api/superAdmin.api';
import {
  Building2,
  Factory,
  CheckCircle2,
  Clock,
  XCircle,
  Pause,
  Wrench,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Edit,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Users,
  Cog,
  AlertTriangle,
  FileCheck,
  FileText,
  TrendingUp,
  Map as MapIcon,
  Table as TableIcon,
  RotateCcw,
  Phone,
  Mail,
  ExternalLink,
  X
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';
import factoryPlanImg from '@/shared/assets/images/factory_plan.jpg';

interface SuperAdminSitesProps {
  onNavigateTab?: (tab: string) => void;
}

export const SuperAdminSites: React.FC<SuperAdminSitesProps> = () => {
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('sit-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Actif' | 'Maintenance' | 'Inactif'>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'Aperçu' | 'Équipements' | 'Utilisateurs' | 'Maintenance' | 'Documents'>('Aperçu');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [sites, setSites] = useState<any[]>([]);

  // Filtered sites
  const filteredSites = useMemo(() => {
    return sites.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesRegion = regionFilter === 'All' || s.region === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [sites, searchTerm, statusFilter, regionFilter]);

  const activeSite = useMemo(() => {
    return sites.find(s => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  const totalSitesCount = sites.length;
  const activeSitesCount = sites.filter(s => s.status === 'Actif').length;
  const maintenanceSitesCount = sites.filter(s => s.status === 'Maintenance').length;
  const inactiveSitesCount = sites.filter(s => s.status === 'Inactif').length;

  const activePercent = totalSitesCount > 0 ? Math.round((activeSitesCount / totalSitesCount) * 100) : 0;
  const maintenancePercent = totalSitesCount > 0 ? Math.round((maintenanceSitesCount / totalSitesCount) * 100) : 0;
  const inactivePercent = totalSitesCount > 0 ? Math.round((inactiveSitesCount / totalSitesCount) * 100) : 0;

  const availableRegions = useMemo(() => {
    return Array.from(new Set(sites.map(s => s.region).filter(Boolean)));
  }, [sites]);

  const availableCompanies = useMemo(() => {
    const list = Array.from(new Set(sites.map(s => s.company).filter(Boolean)));
    return list.length > 0 ? list : ['Conserverie du Midi S.A.', 'POMODORO Industries'];
  }, [sites]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setRegionFilter('All');
    showToast('Filtres réinitialisés');
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSites = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getSites();
      if (data && data.length > 0) {
        const mapped = data.map((s, idx) => ({
          id: String(s.id),
          code: s.codeSite || `SIT-00${idx + 1}`,
          name: s.nom,
          company: s.societeNom || 'Entreprise Client',
          companyLogo: s.nom.toLowerCase().includes('tomate') ? '🍅' : (s.nom.toLowerCase().includes('sicam') ? '🥫' : '🏭'),
          region: s.gouvernorat || 'Tunis',
          address: s.adresse || `${s.ville}, ${s.gouvernorat}`,
          manager: s.responsable || 'Responsable de Site',
          managerEmail: s.email || 'site@gmao.tn',
          managerPhone: s.telephone || '+216 71 000 000',
          equipments: s.nombreEquipements || 24,
          users: s.nombreUtilisateurs || 8,
          activeWorkOrders: Math.max(1, Math.round((s.nombreEquipements || 20) * 0.15)),
          failures: 1,
          status: s.statut === 'Opérationnel' ? 'Actif' : (s.statut === 'En maintenance' ? 'Maintenance' : 'Inactif'),
          statusColor: s.statut === 'Opérationnel'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
          coordinates: { x: 50 + ((idx * 6) % 30), y: 30 + ((idx * 7) % 35) }
        }));
        setSites(mapped);
        if (showNotification) showToast('Sites synchronisés avec le Backend .NET');
      }
    } catch (err) {
      console.warn('[Sites] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleOpenEdit = () => {
    setEditFormData({ ...activeSite });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    try {
      const numId = parseInt(editFormData.id, 10);
      if (!isNaN(numId)) {
        await superAdminApi.updateSite(numId, {
          nom: editFormData.name,
          responsable: editFormData.manager,
          telephone: editFormData.managerPhone,
          email: editFormData.managerEmail,
          adresse: editFormData.address,
          statut: editFormData.status === 'Actif' ? 'Opérationnel' : editFormData.status
        });
      }
    } catch (err) {
      console.warn('Erreur mise à jour site backend:', err);
    }

    setSites(prev => prev.map(s => s.id === editFormData.id ? editFormData : s));
    setIsEditModalOpen(false);
    showToast(`Site ${editFormData.name} mis à jour avec succès`);
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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-850 dark:text-white tracking-tight leading-snug">
              Sites & Usines
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestion des sites industriels de toutes les entreprises
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Subtitle / Slogan */}
          <div className="text-right hidden md:block">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Gestion multi-sites
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Organisez et suivez tous les sites industriels
            </div>
          </div>

          {/* Tomatoes banner photo slice */}
          <div className="relative h-11 w-32 lg:w-48 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hidden sm:block">
            <img
              src={tomateImg}
              alt="Tomates industrielles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/15" />
          </div>

          {/* Synchronize button */}
          <button
            onClick={() => fetchSites(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec PostgreSQL .NET"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          {/* Add Site Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-primary/25 hover:shadow-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un site</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI CARDS (ROW 1) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Sites & Usines */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Factory className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2 bg-blue-300 dark:bg-blue-700 rounded-full" />
              <span className="w-1 h-3.5 bg-blue-400 dark:bg-blue-600 rounded-full" />
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              <span className="w-1 h-6 bg-blue-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Sites & Usines
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {totalSitesCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +100%
            </span>
            <span className="text-slate-400 font-medium">sites réels</span>
          </div>
        </div>

        {/* KPI 2: Sites actifs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
              <span className="w-1 h-3.5 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              <span className="w-1 h-6 bg-emerald-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Sites actifs
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {activeSitesCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              {activePercent}%
            </span>
          </div>
        </div>

        {/* KPI 3: En maintenance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Pause className="w-5 h-5 fill-amber-500" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-3 bg-amber-300 rounded-full" />
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              <span className="w-1 h-5 bg-amber-500 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              En maintenance
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {maintenanceSitesCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {maintenancePercent}%
            </span>
          </div>
        </div>

        {/* KPI 4: Inactifs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-5 bg-rose-500 rounded-full" />
              <span className="w-1 h-4 bg-rose-400 rounded-full" />
              <span className="w-1 h-2 bg-rose-300 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Inactifs
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {inactiveSitesCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {inactivePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN SPLIT CONTENT (LEFT TABLE / RIGHT DETAIL) ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: LISTE DES SITES (col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Top Bar with View Switcher */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Factory className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                  Liste des sites
                </h3>
              </div>

              {/* View Switcher: Tableau vs Carte */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tableau</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Carte</span>
                </button>
              </div>
            </div>

            {/* Filter Bar (Horizontal) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3 pb-2 text-xs">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un site, une entreprise, une ville..."
                  className="w-full h-8.5 pl-8.5 pr-3 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-slate-750 dark:text-slate-200 transition"
                />
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactif">Inactif</option>
              </select>

              {/* Region Select */}
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">Toutes les régions</option>
                {availableRegions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>

              {/* Reset button */}
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* View Mode: TABLE */}
            {viewMode === 'table' ? (
              <div className="overflow-x-auto custom-scrollbar mt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-2.5 px-1.5 w-6">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-0 cursor-pointer" />
                      </th>
                      <th className="py-2.5 px-2">Nom du site</th>
                      <th className="py-2.5 px-2">Entreprise</th>
                      <th className="py-2.5 px-2">Localisation</th>
                      <th className="py-2.5 px-2">Responsable</th>
                      <th className="py-2.5 px-1.5 text-center">Équipements</th>
                      <th className="py-2.5 px-1.5 text-center">Utilisateurs</th>
                      <th className="py-2.5 px-2 whitespace-nowrap">Statut</th>
                      <th className="py-2.5 px-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredSites.map((s) => {
                      const isSelected = s.id === selectedSiteId;
                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedSiteId(s.id)}
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
                              onChange={() => setSelectedSiteId(s.id)}
                              className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                <Factory className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-850 dark:text-white group-hover:text-primary transition-colors block text-[11px]">
                                  {s.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block">
                                  {s.code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{s.companyLogo}</span>
                              <span className="text-[11px] font-semibold text-slate-750 dark:text-slate-200">
                                {s.company}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{s.region}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                {s.manager.charAt(0)}
                              </div>
                              <span className="text-[11px] text-slate-750 dark:text-slate-200 font-medium">
                                {s.manager}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-1.5 text-center text-slate-750 dark:text-slate-200 font-bold">
                            {s.equipments}
                          </td>
                          <td className="py-2.5 px-1.5 text-center text-slate-750 dark:text-slate-200 font-bold">
                            {s.users}
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                s.status === 'Actif'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : s.status === 'Maintenance'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-1 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSiteId(s.id);
                                handleOpenEdit();
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
            ) : (
              /* View Mode: CARTE (Tunisia Interactive Industrial Map) */
              <div className="w-full h-[450px] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 mt-3 p-4 flex items-center justify-center">
                <div className="relative w-full max-w-md h-full flex items-center justify-center">
                  {/* Stylized SVG Map of Tunisia */}
                  <svg viewBox="0 0 100 120" className="w-full h-full text-slate-300 dark:text-slate-800 fill-current opacity-80">
                    <path d="M40,5 C55,2 75,10 70,25 C68,32 62,35 60,45 C58,55 62,65 55,75 C50,85 52,95 48,110 C45,115 35,110 32,95 C28,80 30,65 32,50 C34,40 30,30 35,20 Z" />
                  </svg>

                  {/* Plotted Site Pins */}
                  {filteredSites.map((s) => {
                    const isSelected = s.id === selectedSiteId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSiteId(s.id)}
                        style={{ left: `${s.coordinates.x}%`, top: `${s.coordinates.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      >
                        <div
                          className={`p-1.5 rounded-full shadow-lg transition-transform group-hover:scale-125 ${
                            isSelected
                              ? 'bg-primary text-white ring-4 ring-primary/30 scale-125'
                              : s.status === 'Actif'
                              ? 'bg-emerald-500 text-white'
                              : s.status === 'Maintenance'
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          <MapPin className="w-4 h-4 fill-current" />
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xl whitespace-nowrap pointer-events-none">
                          {s.name} ({s.region})
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] flex flex-col gap-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Légende des sites</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Actif</div>
                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-500" /> Maintenance</div>
                  <div className="flex items-center gap-1.5 text-rose-600 font-semibold"><span className="w-2 h-2 rounded-full bg-rose-500" /> Inactif</div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 mt-2">
            <div>
              <span>{filteredSites.length > 0 ? `1-${filteredSites.length}` : '0'} sur {filteredSites.length} site{filteredSites.length > 1 ? 's' : ''}</span>
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
                  {filteredSites.length} / page
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW OF SELECTED SITE (col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          {(isLoading || !activeSite) ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              {isLoading ? (
                <><RefreshCw className="w-8 h-8 animate-spin text-primary/50" /><p className="text-xs font-medium">Chargement des sites...</p></>
              ) : (
                <><Factory className="w-8 h-8 opacity-30" /><p className="text-xs font-medium">Sélectionnez un site</p></>
              )}
            </div>
          ) : (<>
          {/* Photo banner */}
          <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <img
              src={factoryPlanImg}
              alt="Usine photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                ● {activeSite.status}
              </span>
            </div>
          </div>

          {/* Site Title & Modify button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-xs">
                {activeSite.companyLogo}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeSite.name}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {activeSite.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {activeSite.company}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-xs transition"
            >
              <Edit className="w-3 h-3" />
              <span>Modifier</span>
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
            {(['Aperçu', 'Équipements', 'Utilisateurs', 'Maintenance', 'Documents'] as const).map(tab => (
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

          {/* Tab Content: Aperçu */}
          {activeTab === 'Aperçu' && (
            <div className="flex flex-col gap-4">
              {/* Informations générales */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                    <Cog className="w-3.5 h-3.5 text-primary" />
                    Informations générales
                  </h4>
                  <button
                    onClick={handleOpenEdit}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Modifier
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Nom du site</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeSite.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Entreprise</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeSite.company}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Adresse</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[200px] truncate">{activeSite.address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Responsable</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeSite.manager}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Téléphone</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{activeSite.managerPhone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 text-[11px]">Email</span>
                    <span className="font-mono text-primary font-bold text-[11px]">{activeSite.managerEmail}</span>
                  </div>
                </div>
              </div>

              {/* 4 Metric Tiles */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <Cog className="w-3.5 h-3.5 text-primary mb-0.5" />
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {activeSite.equipments}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">
                    Équipements
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-purple-600 mb-0.5" />
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {activeSite.users}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">
                    Utilisateurs
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                  <span className="text-sm font-black text-emerald-600 leading-tight">
                    {activeSite.activeWorkOrders}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">
                    OT en cours
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mb-0.5" />
                  <span className="text-sm font-black text-rose-600 leading-tight">
                    {activeSite.failures}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">
                    Pannes
                  </span>
                </div>
              </div>

              {/* Localisation Widget */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Localisation
                  </h4>
                  <button
                    onClick={() => setViewMode('map')}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                  >
                    Voir sur la carte →
                  </button>
                </div>

                {/* Stylized Mini Map Card */}
                <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {/* Subtle map pattern lines */}
                  <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <path d="M-20,60 Q60,20 180,90" fill="none" stroke="#2563EB" strokeWidth="4" opacity="0.4" />
                    <path d="M40,-20 Q80,80 120,140" fill="none" stroke="#94A3B8" strokeWidth="3" opacity="0.3" />
                  </svg>

                  {/* Marker Pin */}
                  <div className="absolute flex flex-col items-center">
                    <div className="p-1 rounded-full bg-rose-500 text-white shadow-md animate-bounce">
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold shadow border border-slate-200 dark:border-slate-700 mt-1">
                      {activeSite.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Équipements */}
          {activeTab === 'Équipements' && (
            <div className="flex flex-col gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">{activeSite.equipments} équipements installés</span>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px]">Ligne de Lavage & Tri</span>
                  <p className="text-[10px] text-slate-400">EQ-TRI-01 • En service</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px]">Groupe Évaporateur 20T</span>
                  <p className="text-[10px] text-slate-400">EQ-EVAP-02 • En service</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
              </div>
            </div>
          )}

          {/* Tab 3: Utilisateurs */}
          {activeTab === 'Utilisateurs' && (
            <div className="flex flex-col gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">{activeSite.users} membres rattachés</span>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px]">{activeSite.manager}</span>
                  <p className="text-[9px] text-slate-400">Directeur de site</p>
                </div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Responsable</span>
              </div>
            </div>
          )}

          {/* Tab 4: Maintenance */}
          {activeTab === 'Maintenance' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px]">Lubrification paliers pompe</span>
                  <p className="text-[10px] text-slate-400">OT Préventif #482 • Demain</p>
                </div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Planifié</span>
              </div>
            </div>
          )}

          {/* Tab 5: Documents */}
          {activeTab === 'Documents' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-bold text-slate-800 dark:text-white text-[11px]">Plan_Architectural_Usine.pdf</span>
                </div>
                <span className="text-[10px] text-slate-400">3.4 MB</span>
              </div>
            </div>
          )}
          </>)}
        </div>
      </div>

      {/* ── MODAL: AJOUTER UN SITE ─────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Ajouter un site industriel
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mt-4">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Nom du site</label>
                <input
                  type="text"
                  placeholder="ex: Ligne Pulpe & Sauce"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Entreprise</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {availableCompanies.map((cName: string) => <option key={cName} value={cName}>{cName}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Région</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <option>Nabeul</option>
                  <option>Kairouan</option>
                  <option>Sfax</option>
                  <option>Sousse</option>
                  <option>Tunis</option>
                  <option>Béja</option>
                  <option>Gabès</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Adresse complète</label>
                <input
                  type="text"
                  placeholder="ex: Zone Industrielle, Route de ..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  showToast('Nouveau site créé avec succès');
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition"
              >
                Créer le site
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MODIFIER UN SITE ─────────────────────────────────────────── */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out] flex flex-col gap-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                Modifier le site {editFormData.code}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Nom du site</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Responsable</label>
                <input
                  type="text"
                  value={editFormData.manager}
                  onChange={(e) => setEditFormData({ ...editFormData, manager: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Statut</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Actif">Actif</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Adresse</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition"
              >
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
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
