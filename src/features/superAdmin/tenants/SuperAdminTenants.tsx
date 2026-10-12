import React, { useState, useMemo } from 'react';
import { Tenant } from '@/shared/types/gmao';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Edit,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Bookmark,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Cog,
  Wrench,
  Package,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  X
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

interface SuperAdminTenantsProps {
  pendingRequests: Tenant[];
  registeredTenants: Tenant[];
  approveTenant: (id: string) => void;
  suspendTenant: (id: string) => void;
  impersonateTenant: (id: string) => void;
  onShowCreateWizard: () => void;
}

export const SuperAdminTenants: React.FC<SuperAdminTenantsProps> = ({
  pendingRequests = [],
  registeredTenants = [],
  approveTenant,
  suspendTenant,
  impersonateTenant,
  onShowCreateWizard
}) => {
  // Demo dataset matching the screenshot exactly
  const initialCompanies = [
    {
      id: 'cp',
      index: 1,
      name: 'Conserve Plus',
      logo: '🥫',
      category: 'Industrie de conserve de tomates',
      contact: 'S. Mansouri',
      email: 's.mansouri@conserveplus.tn',
      phone: '+216 22 345 678',
      address: 'Zone Industrielle, Nabeul, Tunisie',
      plan: 'Professional',
      planColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sites: 2,
      users: 12,
      maxUsers: 20,
      equipments: 128,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      registrationDate: '29/09/2026',
      subscriptionEnd: '29/09/2027',
      daysLeft: 365,
      activeModules: ['Équipements', 'Maintenance', 'Stock', 'Achats', 'Rapports avancés', 'Multi-sites']
    },
    {
      id: 'ti',
      index: 2,
      name: 'Tomate Industrie',
      logo: '🍅',
      category: 'Transformation agroalimentaire',
      contact: 'K. Ammar',
      email: 'k.ammar@tomateindustrie.tn',
      phone: '+216 71 890 123',
      address: 'Route de Bizerte, Manouba, Tunisie',
      plan: 'Basic',
      planColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sites: 1,
      users: 5,
      maxUsers: 10,
      equipments: 42,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      registrationDate: '27/09/2026',
      subscriptionEnd: '27/09/2027',
      daysLeft: 363,
      activeModules: ['Équipements', 'Maintenance', 'Stock']
    },
    {
      id: 'af',
      index: 3,
      name: 'AgroFood SARL',
      logo: '🌾',
      category: 'Conditionnement & conserves',
      contact: 'M. Trabelsi',
      email: 'm.trabelsi@agrofood.tn',
      phone: '+216 73 456 789',
      address: 'Zone Industrielle Sidi Bouzid, Tunisie',
      plan: 'Essai gratuit',
      planColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      sites: 1,
      users: 3,
      maxUsers: 5,
      equipments: 18,
      status: 'En essai',
      statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      registrationDate: '25/09/2026',
      subscriptionEnd: '25/11/2026',
      daysLeft: 44,
      activeModules: ['Équipements', 'Maintenance']
    },
    {
      id: 'mf',
      index: 4,
      name: 'Méditerranée Food',
      logo: '🍲',
      category: 'Production industrielle de sauce & concentré',
      contact: 'H. Ben Salah',
      email: 'h.bensalah@medfood.tn',
      phone: '+216 72 321 654',
      address: 'Route de Menzel Temime, Korba, Tunisie',
      plan: 'Enterprise',
      planColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      sites: 3,
      users: 25,
      maxUsers: 50,
      equipments: 210,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      registrationDate: '22/09/2026',
      subscriptionEnd: '22/09/2027',
      daysLeft: 358,
      activeModules: ['Équipements', 'Maintenance', 'Stock', 'Achats', 'Rapports avancés', 'Multi-sites', 'API Dédiée']
    },
    {
      id: 'sc',
      index: 5,
      name: 'Sousse Conserves',
      logo: '🥫',
      category: 'Usine d’emballage et stérilisation',
      contact: 'A. Gharbi',
      email: 'a.gharbi@sousseconserves.tn',
      phone: '+216 73 222 111',
      address: 'Zone Industrielle Akouda, Sousse, Tunisie',
      plan: 'Basic',
      planColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sites: 1,
      users: 4,
      maxUsers: 10,
      equipments: 36,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      registrationDate: '20/09/2026',
      subscriptionEnd: '20/09/2027',
      daysLeft: 356,
      activeModules: ['Équipements', 'Maintenance', 'Stock']
    },
    {
      id: 'ct',
      index: 6,
      name: 'Cap Tomate',
      logo: '🍅',
      category: 'Transformation de tomates fraîches',
      contact: 'R. Khelifi',
      email: 'r.khelifi@captomate.tn',
      phone: '+216 72 555 444',
      address: 'Route de Kélibia, Haouaria, Tunisie',
      plan: 'Professional',
      planColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sites: 2,
      users: 8,
      maxUsers: 20,
      equipments: 65,
      status: 'En essai',
      statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      registrationDate: '18/09/2026',
      subscriptionEnd: '18/11/2026',
      daysLeft: 37,
      activeModules: ['Équipements', 'Maintenance', 'Stock', 'Multi-sites']
    },
    {
      id: 'ew',
      index: 7,
      name: 'El Wafa Agro',
      logo: '🌾',
      category: 'Agro-industrie & séchage',
      contact: 'L. Farhat',
      email: 'l.farhat@elwafaagro.tn',
      phone: '+216 74 987 654',
      address: 'Zone Industrielle Thyna, Sfax, Tunisie',
      plan: 'Basic',
      planColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
      sites: 1,
      users: 3,
      maxUsers: 10,
      equipments: 24,
      status: 'Suspendue',
      statusColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
      registrationDate: '15/09/2026',
      subscriptionEnd: '15/09/2026',
      daysLeft: 0,
      activeModules: ['Équipements']
    },
    {
      id: 'tai',
      index: 8,
      name: 'Tunisie Agro Industrie',
      logo: '🍅',
      category: 'Grand complexe industriel agroalimentaire',
      contact: 'N. Jaziri',
      email: 'n.jaziri@tai.tn',
      phone: '+216 71 112 233',
      address: 'Parc d’Activités Économiques de Zarzis, Tunisie',
      plan: 'Enterprise',
      planColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      sites: 4,
      users: 32,
      maxUsers: 50,
      equipments: 340,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      registrationDate: '10/09/2026',
      subscriptionEnd: '10/09/2027',
      daysLeft: 346,
      activeModules: ['Équipements', 'Maintenance', 'Stock', 'Achats', 'Rapports avancés', 'Multi-sites', 'API Dédiée']
    },
    {
      id: 'sicamex',
      index: 9,
      name: 'Sicamex',
      logo: '🥫',
      category: 'Export de conserves et pulpe de tomates',
      contact: 'Y. Chaabane',
      email: 'y.chaabane@sicamex.tn',
      phone: '+216 78 456 123',
      address: 'Route de Béja, Medjez El Bab, Tunisie',
      plan: 'Professional',
      planColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      sites: 2,
      users: 11,
      maxUsers: 20,
      equipments: 95,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      registrationDate: '05/09/2026',
      subscriptionEnd: '05/09/2027',
      daysLeft: 341,
      activeModules: ['Équipements', 'Maintenance', 'Stock', 'Multi-sites']
    },
    {
      id: 'bt',
      index: 10,
      name: 'BioTomate',
      logo: '🍅',
      category: 'Conserverie biologique certifiée',
      contact: 'F. Hlali',
      email: 'f.hlali@biotomate.tn',
      phone: '+216 72 654 987',
      address: 'Soliman, Nabeul, Tunisie',
      plan: 'Essai gratuit',
      planColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      sites: 1,
      users: 2,
      maxUsers: 5,
      equipments: 15,
      status: 'En essai',
      statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      registrationDate: '01/09/2026',
      subscriptionEnd: '01/11/2026',
      daysLeft: 20,
      activeModules: ['Équipements', 'Maintenance']
    }
  ];

  // State management
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('cp');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'En essai' | 'Suspendue'>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Aperçu' | 'Sites' | 'Utilisateurs' | 'Abonnement' | 'Activité'>('Aperçu');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  // Selected company object
  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Nom', 'Contact', 'Email', 'Plan', 'Sites', 'Utilisateurs', 'Statut', 'Date Inscription'];
    const rows = filteredCompanies.map(c => [
      c.name, c.contact, c.email, c.plan, c.sites, c.users, c.status, c.registrationDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `entreprises_gmao_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportation CSV réussie !');
  };

  const handleOpenEdit = () => {
    setEditFormData({ ...activeCompany });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanies(prev => prev.map(c => c.id === editFormData.id ? editFormData : c));
    setIsEditing(false);
    showToast(`Entreprise ${editFormData.name} mise à jour avec succès`);
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none animate-[fadeIn_0.2s_ease-out]">
      {/* Toast notification */}
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
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-850 dark:text-white tracking-tight leading-snug">
              Entreprises
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestion des entreprises clientes de la plateforme SaaS
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

          {/* Add company button */}
          <button
            onClick={onShowCreateWizard}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-primary/25 hover:shadow-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une entreprise</span>
          </button>
        </div>
      </div>

      {/* ── PENDING ONBOARDING REQUESTS (If any) ──────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Demandes d'inscription en attente de validation ({pendingRequests.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map(r => (
              <div key={r.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-white">{r.name}</h4>
                  <span className="text-[10px] text-slate-400">{r.adminEmail} • Plan : {r.subscriptionPlan}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveTenant(r.id)} className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:bg-emerald-700">Approuver</button>
                  <button onClick={() => suspendTenant(r.id)} className="px-2 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-lg">Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4 KPI CARDS (ROW 1) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Entreprises total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            {/* Sparkline curve */}
            <div className="w-14 h-6 text-emerald-500 flex items-center justify-end">
              <svg viewBox="0 0 50 20" className="w-full h-full stroke-emerald-500 fill-none stroke-2">
                <path d="M0,16 Q15,18 25,10 T50,4" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Entreprises total
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              48
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 2: Entreprises actives */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
              <span className="w-1 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              <span className="w-1 h-6 bg-emerald-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Entreprises actives
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              39
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
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2 bg-amber-300 rounded-full" />
              <span className="w-1 h-3.5 bg-amber-400 rounded-full" />
              <span className="w-1 h-5 bg-amber-500 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Période d'essai
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              6
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
              ● +2
            </span>
            <span className="text-slate-400 font-medium">ce mois-ci</span>
          </div>
        </div>

        {/* KPI 4: Suspendues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-6 bg-rose-500 rounded-full" />
              <span className="w-1 h-4 bg-rose-400 rounded-full" />
              <span className="w-1 h-2 bg-rose-300 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Suspendues
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              3
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400">
              ● -1
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: SPLIT VIEW (TABLE & DETAIL CARD) ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: LISTE DES ENTREPRISES TABLE (col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Table Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                  Liste des entreprises
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une entreprise..."
                    className="w-48 sm:w-56 h-8.5 pl-8.5 pr-3 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-slate-750 dark:text-slate-200 transition"
                  />
                </div>

                {/* Filtres dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 transition cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Filtres</span>
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 text-xs">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Filtrer par statut</div>
                      {(['All', 'Active', 'En essai', 'Suspendue'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                            statusFilter === status ? 'font-bold text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {status === 'All' ? 'Tous les statuts' : status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exporter */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto custom-scrollbar mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-2.5 px-1.5 w-6">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-0 cursor-pointer" />
                    </th>
                    <th className="py-2.5 px-1.5">Logo</th>
                    <th className="py-2.5 px-2">Nom de l'entreprise</th>
                    <th className="py-2.5 px-2">Contact principal</th>
                    <th className="py-2.5 px-2">Plan</th>
                    <th className="py-2.5 px-1.5 text-center">Sites</th>
                    <th className="py-2.5 px-1.5 text-center">Utilisateurs</th>
                    <th className="py-2.5 px-2">Statut</th>
                    <th className="py-2.5 px-2">Date d'inscription</th>
                    <th className="py-2.5 px-2">Fin d'abonnement</th>
                    <th className="py-2.5 px-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredCompanies.map((c) => {
                    const isSelected = c.id === selectedCompanyId;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCompanyId(c.id)}
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
                            onChange={() => setSelectedCompanyId(c.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-1.5 text-base">
                          {c.logo}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-slate-850 dark:text-white group-hover:text-primary transition-colors whitespace-nowrap">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{c.contact}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{c.email}</div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${c.planColor}`}>
                            {c.plan}
                          </span>
                        </td>
                        <td className="py-2.5 px-1.5 text-center text-slate-700 dark:text-slate-300 font-bold">
                          {c.sites}
                        </td>
                        <td className="py-2.5 px-1.5 text-center text-slate-700 dark:text-slate-300 font-bold">
                          {c.users}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : c.status === 'En essai'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                          {c.registrationDate}
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {c.subscriptionEnd}
                        </td>
                        <td className="py-2.5 px-1 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompanyId(c.id);
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
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div>
              <span>1-10 sur 48 entreprises</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {[1, 2, 3, 4, 5].map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-primary text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === 5}
                onClick={() => setCurrentPage(prev => Math.min(5, prev + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="ml-2">
                <span className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 font-semibold text-[11px]">
                  10 / page ▾
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW OF SELECTED COMPANY (col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          {/* Card Top Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-xs border border-slate-200/60 dark:border-slate-700">
                {activeCompany.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeCompany.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeCompany.statusColor}`}>
                    ● {activeCompany.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {activeCompany.category}
                </p>
              </div>
            </div>

            <button
              onClick={() => showToast(`Entreprise ${activeCompany.name} épinglée`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Épingler"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Sub-navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
            {(['Aperçu', 'Sites', 'Utilisateurs', 'Abonnement', 'Activité'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`pb-2 transition relative cursor-pointer ${
                  selectedTab === tab
                    ? 'text-primary border-b-2 border-primary font-black'
                    : 'hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1 Content: Aperçu */}
          {selectedTab === 'Aperçu' && (
            <div className="flex flex-col gap-4">
              {/* Informations générales */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white">
                    Informations générales
                  </h4>
                  <button
                    onClick={handleOpenEdit}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-blue-700 transition"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Modifier</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Nom de l'entreprise</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeCompany.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Contact principal</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeCompany.contact}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Email</span>
                    <span className="font-bold text-primary font-mono text-[11px]">{activeCompany.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Téléphone</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{activeCompany.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-400 text-[11px]">Adresse</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[200px] truncate">{activeCompany.address}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 text-[11px]">Date d'inscription</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{activeCompany.registrationDate}</span>
                  </div>
                </div>
              </div>

              {/* 3 Metric Tiles */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary mb-1" />
                  <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeCompany.sites}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                    Sites / Usines
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <Users className="w-4 h-4 text-primary mb-1" />
                  <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeCompany.users}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                    Utilisateurs
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <Cog className="w-4 h-4 text-primary mb-1" />
                  <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeCompany.equipments}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                    Équipements
                  </span>
                </div>
              </div>

              {/* Plan Actuel & Quota Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-850 dark:text-white">
                    Plan actuel
                  </span>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 cursor-pointer hover:underline">
                    Voir détails <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${activeCompany.planColor}`}>
                    {activeCompany.plan}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Fin d'abonnement : <strong className="text-slate-700 dark:text-slate-200">{activeCompany.subscriptionEnd}</strong></span>
                    <span className="text-[9px] text-slate-400">{activeCompany.daysLeft} jours restants</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((activeCompany.users / activeCompany.maxUsers) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>{activeCompany.users} / {activeCompany.maxUsers} utilisateurs</span>
                    <span>{Math.round((activeCompany.users / activeCompany.maxUsers) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Modules activés */}
              <div>
                <h4 className="text-xs font-bold text-slate-850 dark:text-white mb-2">
                  Modules activés
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeCompany.activeModules.map((mod) => (
                    <span
                      key={mod}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{mod}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Impersonation & Suspend Quick Action */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    impersonateTenant(activeCompany.id);
                    showToast(`Connexion à l'espace ${activeCompany.name}...`);
                  }}
                  className="flex-1 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Accéder à l'espace</span>
                </button>
                <button
                  onClick={() => {
                    suspendTenant(activeCompany.id);
                    setCompanies(prev => prev.map(c => c.id === activeCompany.id ? { ...c, status: c.status === 'Active' ? 'Suspendue' : 'Active' } : c));
                    showToast(`Statut de ${activeCompany.name} mis à jour`);
                  }}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold transition ${
                    activeCompany.status === 'Active'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={activeCompany.status === 'Active' ? 'Suspendre' : 'Activer'}
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Sites */}
          {selectedTab === 'Sites' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="text-slate-400 text-[11px]">Usines et sites rattachés ({activeCompany.sites})</span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white">Site Principal Nabeul</h5>
                  <p className="text-[10px] text-slate-400">Ligne de calibrage & pelage</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Opérationnel</span>
              </div>
              {activeCompany.sites > 1 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white">Unité de Stockage & Emballage</h5>
                    <p className="text-[10px] text-slate-400">Zone industrielle 2</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Opérationnel</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Utilisateurs */}
          {selectedTab === 'Utilisateurs' && (
            <div className="flex flex-col gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">{activeCompany.users} utilisateurs enregistrés</span>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">SM</div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-[11px]">{activeCompany.contact}</div>
                    <div className="text-[9px] text-slate-400">{activeCompany.email}</div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Admin</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">AT</div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-[11px]">Ali Touati</div>
                    <div className="text-[9px] text-slate-400">a.touati@conserveplus.tn</div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Chef Équipe</span>
              </div>
            </div>
          )}

          {/* Tab 4: Abonnement */}
          {selectedTab === 'Abonnement' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Formule active</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">{activeCompany.plan} Plan</span>
                <span className="text-[11px] text-slate-500">Renouvellement annuel automatique le {activeCompany.subscriptionEnd}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-slate-500">Montant de facturation</span>
                <span className="font-mono font-bold text-slate-850 dark:text-white">599 TND / mois</span>
              </div>
            </div>
          )}

          {/* Tab 5: Activité */}
          {selectedTab === 'Activité' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-start gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">Connexion récente</span>
                  <p className="text-[10px] text-slate-400">Aujourd'hui à 11:24 par {activeCompany.contact}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">Sauvegarde automatique</span>
                  <p className="text-[10px] text-slate-400">Hier à 23:00 • Base isolée</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: MODIFIER L'ENTREPRISE ────────────────────────────────────── */}
      {isEditing && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out] flex flex-col gap-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                Modifier l'entreprise
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Contact principal</label>
                <input
                  type="text"
                  value={editFormData.contact}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Téléphone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Statut</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Active">Active</option>
                  <option value="En essai">En essai</option>
                  <option value="Suspendue">Suspendue</option>
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
                onClick={() => setIsEditing(false)}
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
