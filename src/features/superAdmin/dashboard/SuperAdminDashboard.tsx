import React, { useState, useEffect } from 'react';
import { Tenant } from '@/shared/types/gmao';
import { superAdminApi, DashboardStatsResponse } from '../api/superAdmin.api';
import { REAL_DB_COMPANIES } from '../constants/realTenantsData';
import {
  Crown,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Users,
  Activity,
  Server,
  Database,
  HardDrive,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  ShieldCheck,
  Factory,
  Check,
  CreditCard,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Eye,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import tomateImg from '@/shared/assets/images/tomate.jpg';

interface SuperAdminDashboardProps {
  mrr?: number;
  activeCount?: number;
  registeredCount?: number;
  pendingCount?: number;
  revenueHistory?: { month: string; revenue: number }[];
  tenants?: Tenant[];
  onNavigateTab?: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  mrr = 248500,
  activeCount = 39,
  registeredCount = 48,
  pendingCount = 6,
  tenants = [],
  onNavigateTab
}) => {
  const [selectedYear, setSelectedYear] = useState('Cette année');
  const [revenueYear, setRevenueYear] = useState('Cette année');
  const [selectedDate, setSelectedDate] = useState("Aujourd'hui");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [revDropdownOpen, setRevDropdownOpen] = useState(false);

  // Selected item for action modal
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Live Backend Data
  const [liveStats, setLiveStats] = useState<DashboardStatsResponse | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState<boolean>(false);

  const loadDashboardStats = async (showToast = false) => {
    setIsRefreshingStats(true);
    try {
      const data = await superAdminApi.getDashboardStats();
      if (data && data.kpis) {
        setLiveStats(data);
        if (showToast) showNotification('Données synchronisées avec le Backend .NET');
      }
    } catch (err) {
      console.warn('[Dashboard] Utilisation des données locales:', err);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // Helper: plan color mapping
  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'professional': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'basic': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900';
      case 'enterprise': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'essai gratuit': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const PLAN_COLORS: Record<string, string> = {
    'Basic': '#3B82F6',
    'Professional': '#10B981',
    'Enterprise': '#F59E0B',
    'Essai gratuit': '#8B5CF6',
  };

  // 1. Croissance des entreprises (Data matching screenshot)
  const growthData = [
    { month: 'Jan', new: 4, active: 12 },
    { month: 'Fév', new: 7, active: 17 },
    { month: 'Mar', new: 7, active: 17 },
    { month: 'Avr', new: 5, active: 21 },
    { month: 'Mai', new: 12, active: 22 },
    { month: 'Juin', new: 9, active: 25 },
    { month: 'Juil', new: 12, active: 26 },
    { month: 'Août', new: 11, active: 33 },
    { month: 'Sept', new: 19, active: 39 }
  ];

  // 2. Répartition des abonnements (from backend or static fallback)
  const staticSubscriptionBreakdown = [
    { name: 'Basic', value: 15, percentage: 31, color: '#3B82F6' },
    { name: 'Professional', value: 20, percentage: 42, color: '#10B981' },
    { name: 'Enterprise', value: 8, percentage: 17, color: '#F59E0B' },
    { name: 'Essai gratuit', value: 5, percentage: 10, color: '#8B5CF6' }
  ];

  const subscriptionBreakdown = liveStats?.planDistribution && liveStats.planDistribution.length > 0
    ? (() => {
        const total = liveStats.planDistribution.reduce((s, p) => s + p.count, 0) || 1;
        return liveStats.planDistribution.map(p => ({
          name: p.plan,
          value: p.count,
          percentage: Math.round((p.count / total) * 100),
          color: PLAN_COLORS[p.plan] ?? '#64748B'
        }));
      })()
    : staticSubscriptionBreakdown;

  const totalTenantsForDonut = subscriptionBreakdown.reduce((s, p) => s + p.value, 0);

  // 3. Revenus (TND)
  const revenueChartData = [
    { month: 'Jan', revenue: 46000 },
    { month: 'Fév', revenue: 68000 },
    { month: 'Mar', revenue: 89000 },
    { month: 'Avr', revenue: 71000 },
    { month: 'Mai', revenue: 95000 },
    { month: 'Juin', revenue: 135000 },
    { month: 'Juil', revenue: 92000 },
    { month: 'Août', revenue: 116000 },
    { month: 'Sept', revenue: 148000 }
  ];

  // 4. Dernières entreprises (from backend or static fallback)
  const LOGOS = ['🏭', '🍅', '🌾', '🍲', '🥫', '🌱', '🌿', '🏗️'];
  const staticRecentCompanies = REAL_DB_COMPANIES.slice(0, 5).map(c => ({
    id: c.id,
    name: c.name,
    contact: c.contact,
    plan: c.plan,
    planColor: getPlanColor(c.plan),
    sites: c.sites,
    users: c.users,
    status: c.status === 'Active' ? 'Actif' : c.status,
    date: c.registrationDate,
    logo: c.logo
  }));

  const recentCompanies = liveStats?.recentTenants && liveStats.recentTenants.length > 0
    ? liveStats.recentTenants.map((t, i) => ({
        id: String(t.id),
        name: t.nom,
        contact: t.managerNom || '—',
        plan: t.subscriptionPlan,
        planColor: getPlanColor(t.subscriptionPlan),
        sites: t.sitesCount,
        users: t.usersCount,
        status: t.subscriptionStatus === 'Actif' ? 'Actif' : t.subscriptionStatus === 'Essai' ? 'En essai' : t.subscriptionStatus,
        date: new Date(t.createdAt).toLocaleDateString('fr-FR'),
        logo: LOGOS[i % LOGOS.length]
      }))
    : staticRecentCompanies;

  // 5. Abonnements à renouveler (from backend or static fallback)
  const staticRenewals = [
    { id: '1', name: 'Usine Tomates POMODORO', plan: 'Business Pro', expirationDate: '27/07/2027', daysLeft: 345, status: 'Attention', statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40', daysColor: 'text-emerald-600 dark:text-emerald-400 font-bold', logo: '🍅' },
    { id: '2', name: 'Agro-Industrie Du Sud (SICAM)', plan: 'Enterprise Elite', expirationDate: '12/08/2027', daysLeft: 360, status: 'Bientôt', statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40', daysColor: 'text-emerald-600 dark:text-emerald-400 font-bold', logo: '🥫' },
    { id: '3', name: 'Conserverie Carthage SARL', plan: 'Business Pro', expirationDate: '12/01/2027', daysLeft: 290, status: 'Attention', statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40', daysColor: 'text-amber-600 dark:text-amber-400 font-bold', logo: '🥫' },
    { id: '4', name: 'Société Tunisienne Des Boissons (SFBT)', plan: 'Enterprise Elite', expirationDate: '12/04/2027', daysLeft: 240, status: 'Attention', statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40', daysColor: 'text-amber-600 dark:text-amber-400 font-bold', logo: '🍾' },
    { id: '9', name: 'Fromagerie Des Domaines', plan: 'Starter Cloud', expirationDate: '02/11/2026', daysLeft: 16, status: 'Bientôt', statusColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40', daysColor: 'text-rose-600 dark:text-rose-400 font-extrabold', logo: '🧀' }
  ];

  const getRenewalStatus = (daysLeft: number) => {
    if (daysLeft <= 7) return { status: 'Bientôt', statusColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40', daysColor: 'text-rose-600 dark:text-rose-400 font-extrabold' };
    return { status: 'Attention', statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40', daysColor: 'text-amber-600 dark:text-amber-400 font-bold' };
  };

  const renewals = liveStats?.renewingTenants && liveStats.renewingTenants.length > 0
    ? liveStats.renewingTenants.map((r, i) => ({
        id: String(r.id),
        name: r.nom,
        plan: r.subscriptionPlan,
        expirationDate: new Date(r.subscriptionEndDate).toLocaleDateString('fr-FR'),
        daysLeft: r.daysLeft,
        logo: LOGOS[i % LOGOS.length],
        ...getRenewalStatus(r.daysLeft)
      }))
    : staticRenewals;

  // 6. Activités récentes (from backend recentLogs or static fallback)
  const LOG_ICON_MAP: Record<string, { icon: any; iconColor: string; text: string }> = {
    'Création Entreprise': { icon: Building2, iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', text: 'Nouvelle entreprise inscrite : ' },
    'Mise à jour Plan': { icon: RefreshCw, iconColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400', text: 'Plan mis à jour : ' },
    'Création Utilisateur': { icon: Users, iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400', text: 'Utilisateur ajouté : ' },
    'Paiement': { icon: CreditCard, iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', text: 'Paiement confirmé : ' },
    'Création Site': { icon: Factory, iconColor: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400', text: 'Site ajouté : ' },
  };

  const staticRecentActivities = [
    { id: 1, type: 'company', icon: Building2, iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', text: 'Nouvelle entreprise inscrite : ', highlight: 'Usine Tomates POMODORO', time: '10:24' },
    { id: 2, type: 'plan', icon: RefreshCw, iconColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400', text: 'Plan mis à jour : ', highlight: 'Agro-Industrie Du Sud (SICAM)', time: '09:15' },
    { id: 3, type: 'user', icon: Users, iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400', text: 'Utilisateur ajouté : ', highlight: 'admin@pomodoro.com', time: 'Hier 16:42' },
    { id: 4, type: 'payment', icon: CreditCard, iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', text: 'Paiement confirmé : ', highlight: 'Conserverie Carthage SARL', time: 'Hier 14:20' },
    { id: 5, type: 'site', icon: Factory, iconColor: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400', text: 'Site ajouté : ', highlight: 'Usine Sousse', time: '28/09 11:03' }
  ];

  const recentActivities = liveStats?.recentLogs && liveStats.recentLogs.length > 0
    ? liveStats.recentLogs.map((log) => {
        const mapping = LOG_ICON_MAP[log.action] ?? {
          icon: Activity,
          iconColor: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
          text: `${log.action} : `
        };
        const logDate = new Date(log.dateHeure);
        const now = new Date();
        const diffH = Math.round((now.getTime() - logDate.getTime()) / 3600000);
        const timeStr = diffH < 1 ? `À l'instant` : diffH < 24 ? `${logDate.getHours()}:${String(logDate.getMinutes()).padStart(2, '0')}` : `Hier ${logDate.getHours()}:${String(logDate.getMinutes()).padStart(2, '0')}`;
        return {
          id: log.id,
          type: log.categorie,
          icon: mapping.icon,
          iconColor: mapping.iconColor,
          text: mapping.text,
          highlight: log.details || log.userNom,
          time: timeStr
        };
      })
    : staticRecentActivities;

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none animate-[fadeIn_0.2s_ease-out]">
      {/* Toast notification */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-[slideIn_0.2s_ease-out]">
          <Check className="w-4 h-4" />
          {actionSuccessMessage}
        </div>
      )}

      {/* ── TOP HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Crown className="w-6 h-6 fill-amber-500/20" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-850 dark:text-white tracking-tight leading-snug">
              Tableau de bord - Super Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Vue d’ensemble de votre plateforme SaaS GMAO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Slogan */}
          <div className="text-right hidden md:block">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Plusieurs entreprises
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Une maintenance plus performante
            </div>
          </div>

          {/* Tomato banner photo slice */}
          <div className="relative h-11 w-32 lg:w-40 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hidden sm:block">
            <img
              src={tomateImg}
              alt="Tomates industrielles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
          </div>

          {/* Date Picker Button */}
          <div className="relative">
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-[11px] text-slate-850 dark:text-white leading-tight">
                  {selectedDate}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  29 Septembre 2026
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 text-xs">
                {["Aujourd'hui", '7 derniers jours', 'Ce mois', 'Cette année'].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDate(d);
                      setDateDropdownOpen(false);
                      showNotification(`Filtre date : ${d}`);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                      selectedDate === d ? 'font-bold text-primary' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton de Synchronisation Backend API */}
          <button
            onClick={() => loadDashboardStats(true)}
            disabled={isRefreshingStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec la base de données PostgreSQL .NET"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI CARDS (ROW 1) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Entreprises inscrites */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
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
              Entreprises inscrites
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {liveStats?.kpis?.totalTenants ?? registeredCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 2: Abonnements actifs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2.5 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
              <span className="w-1 h-3.5 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              <span className="w-1 h-6 bg-emerald-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Abonnements actifs
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {liveStats?.kpis?.activeTenants ?? activeCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 3: Période d'essai */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-5 bg-amber-400 rounded-full" />
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              <span className="w-1 h-3 bg-amber-300 dark:bg-amber-600 rounded-full" />
              <span className="w-1 h-2 bg-amber-200 dark:bg-amber-700 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Période d'essai
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {liveStats?.kpis?.trialTenantsCount ?? pendingCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-3 h-3" /> -25%
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 4: Abonnements à renouveler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2 bg-rose-300 dark:bg-rose-700 rounded-full" />
              <span className="w-1 h-3 bg-rose-400 rounded-full" />
              <span className="w-1 h-4.5 bg-rose-500 rounded-full" />
              <span className="w-1 h-6 bg-rose-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Abonnements à renouveler
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {liveStats?.kpis?.renewalCount ?? renewals.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400">
              ● +1
            </span>
            <span className="text-slate-400 font-medium">dans 30 jours</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 3 VISUALIZATIONS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Croissance des entreprises (col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                  Croissance des entreprises
                </h3>
              </div>
              <div className="relative">
                <button
                  onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>{selectedYear}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {yearDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 text-[11px]">
                    {['Cette année', '2025', '2024'].map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setSelectedYear(y);
                          setYearDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2.5 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Nouvelles entreprises</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Entreprises actives</span>
              </div>
            </div>
          </div>

          <div className="w-full h-48 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="new" name="Nouvelles" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} />
                <Area type="monotone" dataKey="active" name="Actives" stroke="#10B981" strokeWidth={2.5} fill="#10B981" fillOpacity={0.15} dot={{ r: 3, fill: '#10B981', strokeWidth: 1.5, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Répartition des abonnements (col-span-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-white">
              Répartition des abonnements
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 my-auto">
            {/* Donut with center counter */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={subscriptionBreakdown}
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subscriptionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                  {totalTenantsForDonut}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  entreprises
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-col gap-2 w-full sm:w-auto text-[11px] font-medium pr-1">
              {subscriptionBreakdown.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between sm:justify-start gap-2.5">
                  <div className="flex items-center gap-1.5 min-w-[85px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">{plan.name}</span>
                  </div>
                  <span className="font-bold text-slate-850 dark:text-white text-[11px] whitespace-nowrap">
                    {plan.value} <span className="text-slate-400 font-normal">({plan.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Revenus (TND) (col-span-3) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                  Revenus (TND)
                </h3>
              </div>
              <div className="relative">
                <button
                  onClick={() => setRevDropdownOpen(!revDropdownOpen)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>{revenueYear}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {revDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 text-[11px]">
                    {['Cette année', '2025'].map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setRevenueYear(y);
                          setRevDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Revenue & Trend */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {(liveStats?.kpis?.mrr ?? mrr).toLocaleString('fr-FR')} TND
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                +18%
              </span>
              <span className="text-[9px] text-slate-400">vs année dernière</span>
            </div>
          </div>

          <div className="w-full h-36 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={8} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={8}
                  tickLine={false}
                  domain={[0, 150000]}
                  ticks={[0, 50000, 100000, 150000]}
                  tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000}K`)}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} TND`, 'Revenu']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="revenue" fill="#93C5FD" radius={[3, 3, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 3: 2 TABLES ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Table 1: Dernières entreprises inscrites (col-span-7) */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                Dernières entreprises inscrites
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('tenants') : showNotification('Affichage de toutes les entreprises')}
              className="text-[11px] font-bold text-primary hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-2.5">Entreprise</th>
                  <th className="pb-2.5">Contact</th>
                  <th className="pb-2.5">Plan</th>
                  <th className="pb-2.5 text-center">Sites</th>
                  <th className="pb-2.5 text-center">Utilisateurs</th>
                  <th className="pb-2.5">Statut</th>
                  <th className="pb-2.5">Date d'inscription</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {recentCompanies.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCompany(c)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="text-sm">{c.logo}</span>
                      <span className="font-bold text-slate-850 dark:text-white group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      {c.contact}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${c.planColor}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-slate-700 dark:text-slate-300 font-bold">
                      {c.sites}
                    </td>
                    <td className="py-2.5 text-center text-slate-700 dark:text-slate-300 font-bold">
                      {c.users}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Actif'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {c.date}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompany(c);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Abonnements à renouveler (col-span-5) */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                Abonnements à renouveler
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('billing') : showNotification('Affichage des renouvellements')}
              className="text-[11px] font-bold text-primary hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-2.5">Entreprise</th>
                  <th className="pb-2.5">Plan</th>
                  <th className="pb-2.5">Date d'expiration</th>
                  <th className="pb-2.5 text-center">Jours restants</th>
                  <th className="pb-2.5">Statut</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {renewals.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRenewal(r)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="text-sm">{r.logo}</span>
                      <span className="font-bold text-slate-850 dark:text-white group-hover:text-primary transition-colors">
                        {r.name}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      {r.plan}
                    </td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      {r.expirationDate}
                    </td>
                    <td className={`py-2.5 text-center text-xs ${r.daysColor}`}>
                      {r.daysLeft}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.statusColor}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRenewal(r);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ROW 4: 3 BOTTOM CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Utilisateurs sur la plateforme */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                Utilisateurs sur la plateforme
              </h3>
            </div>

            <div className="flex items-center gap-3.5 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {liveStats?.kpis?.totalUsers ?? 286}
                  </span>
                  <span className="text-xs font-bold text-slate-500">utilisateurs</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +14% <span className="font-normal text-slate-400">vs mois dernier</span>
                </div>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mt-4.5 gap-0.5">
              <div style={{ width: '52%' }} className="bg-blue-500 h-full rounded-l-full" title="Techniciens 52%" />
              <div style={{ width: '28%' }} className="bg-emerald-500 h-full" title="Responsables 28%" />
              <div style={{ width: '15%' }} className="bg-amber-500 h-full" title="Administrateurs 15%" />
              <div style={{ width: '5%' }} className="bg-purple-500 h-full rounded-r-full" title="Autres 5%" />
            </div>

            {/* Legend below progress */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3 text-[10px] font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Techniciens 52%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Responsables 28%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Administrateurs 15%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Autres 5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Activité récente */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                Activité récente
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('logs') : showNotification('Affichage des logs')}
              className="text-[11px] font-bold text-primary hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${act.iconColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] leading-tight text-slate-600 dark:text-slate-300 truncate">
                      <span>{act.text}</span>
                      <span className="font-bold text-slate-850 dark:text-white">
                        {act.highlight}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: État de la plateforme */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-xs font-bold text-slate-850 dark:text-white">
                  État de la plateforme
                </h3>
              </div>
              <span className="text-[9px] text-slate-400">
                Dernière mise à jour : 29/09/2026 11:50
              </span>
            </div>

            {/* Banner: Tous les services opérationnels */}
            <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl py-2 px-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold mt-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Tous les services opérationnels</span>
            </div>

            {/* Grid 4 services */}
            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">API</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-850 dark:text-white font-mono">99.9%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Base de données</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-850 dark:text-white font-mono">99.9%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Stockage</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-850 dark:text-white font-mono">99.8%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Tâches planifiées</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-850 dark:text-white font-mono">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: DETAILS ENTREPRISE ────────────────────────────────────────── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {selectedCompany.logo}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCompany.name}
                  </h3>
                  <p className="text-xs text-slate-500">Contact : {selectedCompany.contact}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Abonnement</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedCompany.plan}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Statut</span>
                <span className="font-extrabold text-sm text-emerald-600">{selectedCompany.status}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Nombre de Sites</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedCompany.sites} usine(s)</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Utilisateurs Actifs</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedCompany.users} comptes</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => {
                  showNotification(`Impersonation de ${selectedCompany.name} démarrée`);
                  setSelectedCompany(null);
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                Gérer l'entreprise
              </button>
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RENOUVELLEMENT ─────────────────────────────────────────────── */}
      {selectedRenewal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {selectedRenewal.logo}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedRenewal.name}
                  </h3>
                  <p className="text-xs text-rose-500 font-bold">Expire dans {selectedRenewal.daysLeft} jours ({selectedRenewal.expirationDate})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRenewal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              L'abonnement {selectedRenewal.plan} arrive bientôt à terme. Vous pouvez envoyer un rappel automatique de facture ou prolonger la période.
            </p>

            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => {
                  showNotification(`Rappel de renouvellement envoyé à ${selectedRenewal.name}`);
                  setSelectedRenewal(null);
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Envoyer rappel de renouvellement
              </button>
              <button
                onClick={() => {
                  showNotification(`Abonnement prolongé pour ${selectedRenewal.name} (+30 jours)`);
                  setSelectedRenewal(null);
                }}
                className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                Prolonger de 30 jours
              </button>
              <button
                onClick={() => setSelectedRenewal(null)}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
