import React, { useState, useMemo, useEffect } from 'react';
import { superAdminApi } from '../api/superAdmin.api';
import {
  FileText,
  Users,
  Building2,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ExternalLink,
  Laptop,
  Globe,
  Clock,
  Sparkles,
  Download,
  RotateCcw
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export interface LogEntry {
  id: string;
  dateTime: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  companyName: string;
  companyLogo: string;
  action: string;
  actionType: 'plan' | 'user' | 'site' | 'trial' | 'login' | 'delete' | 'limits' | 'workorder' | 'alert' | 'suspension' | 'download' | 'export' | 'failed_login';
  actionColor: string;
  details: string;
  status: 'Succès' | 'Échec';
  statusColor: string;
  ipAddress: string;
  browser?: string;
  oldValue?: string;
  newValue?: string;
  descriptionDetail?: string;
}

export const SuperAdminLogs: React.FC = () => {
  const [selectedLogId, setSelectedLogId] = useState<string>('log-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(14);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 14 logs matching screenshot
  const [logsList, setLogsList] = useState<LogEntry[]>([
    {
      id: 'log-001',
      dateTime: '29/09/2026 14:32',
      userName: 'Ahmed Ben Ali',
      userRole: 'Super Administrateur',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      companyName: 'Usine Tomates POMODORO',
      companyLogo: '🥫',
      action: 'Modification plan',
      actionType: 'plan',
      actionColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      details: 'Plan Professional → Enterprise',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '197.203.10.45',
      browser: 'Chrome 117.0.5938.132 (Windows)',
      oldValue: 'Professional',
      newValue: 'Enterprise',
      descriptionDetail: 'Mise à jour de l’abonnement avec extension des limites'
    },
    {
      id: 'log-002',
      dateTime: '29/09/2026 13:18',
      userName: 'Sami Mansouri',
      userRole: 'Admin Entreprise',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      companyName: 'Usine Tomates POMODORO',
      companyLogo: '🥫',
      action: 'Ajout utilisateur',
      actionType: 'user',
      actionColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      details: 'Ajout de Leila Farhat (Technicien)',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '197.203.10.12',
      browser: 'Firefox 118.0 (Windows)',
      descriptionDetail: 'Création d’un compte technicien rattaché à l’Usine Principale'
    },
    {
      id: 'log-003',
      dateTime: '29/09/2026 11:45',
      userName: 'Khaled Ammar',
      userRole: 'Admin Entreprise',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      companyName: 'Agro-Industrie Du Sud (SICAM)',
      companyLogo: '🍅',
      action: 'Création site',
      actionType: 'site',
      actionColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      details: 'Nouveau site : Ligne 2',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '41.226.85.33',
      browser: 'Chrome 117.0.5938.132 (Windows)',
      descriptionDetail: 'Ajout d’une nouvelle unité de transformation Ligne 2'
    },
    {
      id: 'log-004',
      dateTime: '29/09/2026 10:21',
      userName: 'Système',
      userRole: 'Automatique',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      companyName: 'BioTomate',
      companyLogo: '🌱',
      action: 'Expiration essai',
      actionType: 'trial',
      actionColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      details: 'Fin de la période d’essai',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '-',
      browser: 'Server Daemon CRON',
      descriptionDetail: 'Bascule automatique en statut essai terminé'
    },
    {
      id: 'log-005',
      dateTime: '28/09/2026 16:20',
      userName: 'Mohamed Trabelsi',
      userRole: 'Technicien',
      userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      companyName: 'Conserverie Carthage SARL',
      companyLogo: '🏭',
      action: 'Connexion',
      actionType: 'login',
      actionColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      details: 'Connexion à la plateforme',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '105.15.78.90',
      browser: 'Mobile Safari 17.0 (iOS)',
      descriptionDetail: 'Authentification 2FA réussie'
    },
    {
      id: 'log-006',
      dateTime: '28/09/2026 15:12',
      userName: 'Hichem Ben Salah',
      userRole: 'Admin Entreprise',
      userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      companyName: 'Société Tunisienne Des Boissons (SFBT)',
      companyLogo: '🥫',
      action: 'Suppression utilisateur',
      actionType: 'delete',
      actionColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      details: 'Suppression de Yassine K.',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '197.203.11.28',
      browser: 'Chrome 116.0 (Macintosh)',
      descriptionDetail: 'Révocation des accès et anonymisation des logs personnels'
    },
    {
      id: 'log-007',
      dateTime: '28/09/2026 14:08',
      userName: 'Nour Jaziri',
      userRole: 'Super Admin',
      userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      companyName: 'Sicamex',
      companyLogo: '🥫',
      action: 'Modification limites',
      actionType: 'limits',
      actionColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      details: 'Équipements : 500 → 1000',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '197.203.10.45',
      browser: 'Edge 117.0 (Windows)',
      descriptionDetail: 'Extension de la capacité maximale des machines connectées'
    },
    {
      id: 'log-008',
      dateTime: '28/09/2026 12:30',
      userName: 'Fatma Hlali',
      userRole: 'Admin Entreprise',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      companyName: 'Cap Tomate',
      companyLogo: '🍅',
      action: 'Clôture OT',
      actionType: 'workorder',
      actionColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      details: 'OT #OT-2026-4372 clôturé',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '41.226.85.19',
      browser: 'Chrome 117.0 (Android)',
      descriptionDetail: 'Intervention préventive certifiée et signée numériquement'
    },
    {
      id: 'log-009',
      dateTime: '28/09/2026 11:05',
      userName: 'Système',
      userRole: 'Automatique',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      companyName: 'Sousse Conserves',
      companyLogo: '🍅',
      action: 'Alerte Limite',
      actionType: 'alert',
      actionColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      details: 'Stockage utilisé à 90%',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '-',
      browser: 'Storage Sentinel Daemon',
      descriptionDetail: 'Envoi d’une notification d’avertissement au gestionnaire'
    },
    {
      id: 'log-010',
      dateTime: '27/09/2026 17:55',
      userName: 'Ahmed Saidi',
      userRole: 'Super Admin',
      userAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      companyName: 'El Wafa Agro',
      companyLogo: '🌾',
      action: 'Suspension compte',
      actionType: 'suspension',
      actionColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      details: 'Compte suspendu (non paiement)',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '197.203.10.45',
      browser: 'Chrome 117.0 (Windows)',
      descriptionDetail: 'Gel temporaire de l’accès suite à facture impayée > 30 jours'
    },
    {
      id: 'log-011',
      dateTime: '27/09/2026 16:40',
      userName: 'Leila Farhat',
      userRole: 'Technicien',
      userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      companyName: 'Agro-Industrie Du Sud (SICAM)',
      companyLogo: '🍅',
      action: 'Téléchargement',
      actionType: 'download',
      actionColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      details: 'Document : Schéma électrique',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '41.226.84.77',
      browser: 'Firefox 118.0 (Windows)',
      descriptionDetail: 'Téléchargement du plan technique Ligne Broyage'
    },
    {
      id: 'log-012',
      dateTime: '27/09/2026 14:12',
      userName: 'Marwa Ben Ali',
      userRole: 'Admin Entreprise',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      companyName: 'Tunisie Agro Industrie',
      companyLogo: '🇹🇳',
      action: 'Modification site',
      actionType: 'site',
      actionColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      details: 'Nom du site : Usine Principale',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '197.203.10.65',
      browser: 'Chrome 117.0 (Windows)',
      descriptionDetail: 'Mise à jour de l’appellation géographique de l’usine'
    },
    {
      id: 'log-013',
      dateTime: '27/09/2026 10:03',
      userName: 'Système',
      userRole: 'Sécurité',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      companyName: '-',
      companyLogo: '🔒',
      action: 'Tentative de connexion',
      actionType: 'failed_login',
      actionColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      details: 'Échec de connexion (mot de passe)',
      status: 'Échec',
      statusColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
      ipAddress: '102.88.12.40',
      browser: 'Python-requests/2.31.0',
      descriptionDetail: 'Tentative d’intrusion bloquée par le WAF (3 tentatives erronées)'
    },
    {
      id: 'log-014',
      dateTime: '26/09/2026 18:22',
      userName: 'Rami Khelifi',
      userRole: 'Responsable',
      userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      companyName: 'Usine Tomates POMODORO',
      companyLogo: '🥫',
      action: 'Export rapport',
      actionType: 'export',
      actionColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      details: 'Rapport maintenance - PDF',
      status: 'Succès',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      ipAddress: '41.226.84.11',
      browser: 'Chrome 117.0 (Windows)',
      descriptionDetail: 'Export consolidé du MTBF et des arrêts de production'
    }
  ]);

  // Selected log entry for inspection
  const selectedLog = useMemo(() => {
    return logsList.find(l => l.id === selectedLogId) || logsList[0];
  }, [logsList, selectedLogId]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logsList.filter(log => {
      const matchSearch =
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCompany = companyFilter === 'All' || log.companyName === companyFilter;
      const matchStatus = statusFilter === 'All' || log.status === statusFilter;

      return matchSearch && matchCompany && matchStatus;
    });
  }, [logsList, searchTerm, companyFilter, statusFilter]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCheckboxes(filteredLogs.map(l => l.id));
    } else {
      setSelectedCheckboxes([]);
    }
  };

  const handleToggleCheckbox = (id: string) => {
    setSelectedCheckboxes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchLogs = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getLogs();
      if (data && data.length > 0) {
        const mapped: LogEntry[] = data.map((j, idx) => ({
          id: String(j.id),
          dateTime: new Date(j.dateHeure).toLocaleDateString('fr-FR') + ' ' + new Date(j.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          userName: j.userNom || 'Super Admin',
          userRole: j.userRole || 'SuperAdmin',
          userAvatar: `https://images.unsplash.com/photo-${1534528741775 + (idx % 10)}?w=150&auto=format&fit=crop&q=80`,
          companyName: j.societeNom || 'Plateforme Centrale',
          companyLogo: '🏢',
          action: j.action,
          actionType: j.action.toLowerCase().includes('plan')
            ? 'plan'
            : (j.action.toLowerCase().includes('user') || j.action.toLowerCase().includes('utilisat')
              ? 'user'
              : (j.action.toLowerCase().includes('site')
                ? 'site'
                : (j.action.toLowerCase().includes('connexion') ? 'login' : 'limits'))),
          actionColor: j.niveau === 'WARNING'
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
            : (j.niveau === 'SECURITY' || j.niveau === 'ERROR'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900'),
          details: j.details,
          status: j.statut === 'Échec' ? 'Échec' : 'Succès',
          statusColor: j.statut === 'Échec'
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
          ipAddress: j.adresseIp || '127.0.0.1',
          browser: j.navigateur || 'Chrome 122 (Windows)',
          descriptionDetail: j.details
        }));
        setLogsList(mapped);
        if (showNotification) showToast('Journaux d’audit synchronisés avec PostgreSQL .NET');
      }
    } catch (err) {
      console.warn('[Logs] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
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
            <ShieldCheck className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Journaux d'activité
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Suivez toutes les actions importantes sur la plateforme
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
                01/09/2026 - 30/09/2026
              </div>
            </div>
          </div>

          {/* Synchronize button */}
          <button
            onClick={() => fetchLogs(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec PostgreSQL .NET"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 5 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Actions totales */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                1 842
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Actions totales
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ +24%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-blue-200 dark:bg-blue-900 rounded-t" />
            <span className="w-2.5 h-4 bg-blue-300 dark:bg-blue-800 rounded-t" />
            <span className="w-2.5 h-5 bg-blue-400 dark:bg-blue-700 rounded-t" />
            <span className="w-2.5 h-7 bg-blue-500 dark:bg-blue-600 rounded-t" />
            <span className="w-2.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-t" />
          </div>
        </div>

        {/* KPI 2: Utilisateurs actifs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
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
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-4 bg-emerald-200 dark:bg-emerald-900 rounded-t" />
            <span className="w-2.5 h-5 bg-emerald-300 dark:bg-emerald-800 rounded-t" />
            <span className="w-2.5 h-6 bg-emerald-400 dark:bg-emerald-700 rounded-t" />
            <span className="w-2.5 h-7 bg-emerald-500 dark:bg-emerald-600 rounded-t" />
            <span className="w-2.5 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-t" />
          </div>
        </div>

        {/* KPI 3: Entreprises concernées */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                48
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Entreprises concernées
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ +8%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-amber-200 dark:bg-amber-900 rounded-t" />
            <span className="w-2.5 h-4 bg-amber-300 dark:bg-amber-800 rounded-t" />
            <span className="w-2.5 h-5 bg-amber-400 dark:bg-amber-700 rounded-t" />
            <span className="w-2.5 h-6 bg-amber-500 dark:bg-amber-600 rounded-t" />
            <span className="w-2.5 h-7 bg-amber-500 dark:bg-amber-600 rounded-t" />
          </div>
        </div>

        {/* KPI 4: Actions sensibles */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                12
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Actions sensibles
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                  ↓ +33%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-5 bg-rose-200 dark:bg-rose-900 rounded-t" />
            <span className="w-2.5 h-4 bg-rose-300 dark:bg-rose-800 rounded-t" />
            <span className="w-2.5 h-3 bg-rose-400 dark:bg-rose-700 rounded-t" />
            <span className="w-2.5 h-6 bg-rose-500 dark:bg-rose-600 rounded-t" />
            <span className="w-2.5 h-4 bg-rose-600 dark:bg-rose-500 rounded-t" />
          </div>
        </div>

        {/* KPI 5: Tentatives échouées */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                3
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Tentatives échouées
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400">
                  ↓ -25%
                </span>
                <span className="text-[9px] text-slate-400">vs mois dernier</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-2 bg-purple-200 dark:bg-purple-900 rounded-t" />
            <span className="w-2.5 h-4 bg-purple-300 dark:bg-purple-800 rounded-t" />
            <span className="w-2.5 h-5 bg-purple-400 dark:bg-purple-700 rounded-t" />
            <span className="w-2.5 h-6 bg-purple-500 dark:bg-purple-600 rounded-t" />
            <span className="w-2.5 h-7 bg-purple-600 dark:bg-purple-500 rounded-t" />
          </div>
        </div>
      </div>

      {/* DUAL-COLUMN WORKSPACE: TABLE (LEFT) + RIGHT WIDGETS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FILTRES + TABLEAU DES LOGS (approx 8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            {/* Filter Bar Header */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h2 className="text-sm font-black text-slate-800 dark:text-white">
                Filtres
              </h2>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une action, un utilisateur..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="relative">
                <select
                  value={companyFilter}
                  onChange={e => setCompanyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                >
                  <option value="All">Toutes les entreprises</option>
                  {REAL_DB_COMPANIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={actionTypeFilter}
                  onChange={e => setActionTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                >
                  <option value="All">Tous les types d'action</option>
                  <option value="plan">Modification plan</option>
                  <option value="user">Gestion utilisateurs</option>
                  <option value="site">Gestion sites</option>
                  <option value="login">Connexion</option>
                  <option value="suspension">Suspension</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                >
                  <option value="All">Tous les statuts</option>
                  <option value="Succès">Succès</option>
                  <option value="Échec">Échec</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <th className="py-2.5 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedCheckboxes.length > 0 &&
                          selectedCheckboxes.length === filteredLogs.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3">Date & Heure</th>
                    <th className="py-2.5 px-3">Utilisateur</th>
                    <th className="py-2.5 px-3">Entreprise</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Détails</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLogs.slice(0, itemsPerPage).map(log => {
                    const isSelected = log.id === selectedLog.id;
                    const isChecked = selectedCheckboxes.includes(log.id);

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td
                          className="py-2.5 px-3 text-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCheckbox(log.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium text-[11px]">
                          {log.dateTime}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={log.userAvatar}
                              alt={log.userName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-100 leading-tight text-[11px]">
                                {log.userName}
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {log.userRole}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {log.companyName !== '-' ? (
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                              <span>{log.companyLogo}</span>
                              <span>{log.companyName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${log.actionColor}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium text-[11px] max-w-[200px] truncate">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.statusColor}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {log.ipAddress}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              1-14 sur 1 842 journaux
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
                onClick={() => setCurrentPage(132)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                132
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
                <option value={14}>14 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 WIDGETS (approx 4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* WIDGET 1: Répartition des actions (Donut) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Répartition des actions
              </h3>
            </div>

            <div className="flex items-center justify-between gap-3 py-1">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" />
                  {/* Connexions: 28% */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="28 72" strokeDashoffset="0" />
                  {/* Gestion utilisateurs: 22% */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="22 78" strokeDashoffset="-28" />
                  {/* Modifications: 18% */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-50" />
                  {/* Gestion abonnements: 12% */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="12 88" strokeDashoffset="-68" />
                  {/* Actions système: 10% */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#64748B" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-80" />
                  {/* Autres: 10% */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#94A3B8" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-none">1 842</span>
                  <span className="text-[9px] text-slate-400 font-medium">Actions</span>
                </div>
              </div>

              {/* Legend list */}
              <div className="flex flex-col gap-1.5 flex-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-300">Connexions</span>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white">28% (520)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-300">Gestion utilisateurs</span>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white">22% (405)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-slate-600 dark:text-slate-300">Modifications</span>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white">18% (331)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-300">Gestion abonnements</span>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white">12% (221)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">Actions système</span>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white">10% (184)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">Autres</span>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white">10% (181)</span>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET 2: Actions récentes sensibles */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Actions récentes sensibles
              </h3>
            </div>

            <div className="space-y-2.5">
              {[
                { title: "Suspension d'un compte", user: "Ahmed Ben Ali", date: "27/09/2026 10:03" },
                { title: "Suppression utilisateur", user: "Hichem Ben Salah", date: "28/09/2026 15:12" },
                { title: "Modification plan", user: "Ahmed Ben Ali", date: "29/09/2026 14:32" },
                { title: "Modification des limites", user: "Nour Jaziri", date: "28/09/2026 14:08" },
                { title: "Tentative de connexion échouée", user: "Système", date: "27/09/2026 10:03" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.user}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 3: Détail de l'action */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">
                  Détail de l'action
                </h3>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {selectedLog.status}
              </span>
            </div>

            {/* Subcard with action name & date */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-purple-900 dark:text-purple-200">
                  {selectedLog.action}
                </div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  {selectedLog.dateTime}
                </div>
              </div>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Utilisateur</span>
                <div className="flex items-center gap-1.5">
                  <img
                    src={selectedLog.userAvatar}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <div className="text-right">
                    <span className="font-bold text-slate-800 dark:text-slate-100 block leading-tight text-[11px]">
                      {selectedLog.userName}
                    </span>
                    <span className="text-[9px] text-slate-400">{selectedLog.userRole}</span>
                  </div>
                </div>
              </div>

              {selectedLog.companyName !== '-' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Entreprise</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100">
                    <span>{selectedLog.companyLogo}</span>
                    <span>{selectedLog.companyName}</span>
                  </div>
                </div>
              )}

              {selectedLog.oldValue && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ancien plan</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {selectedLog.oldValue}
                  </span>
                </div>
              )}

              {selectedLog.newValue && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nouveau plan</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedLog.newValue}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Détails</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                  {selectedLog.descriptionDetail || selectedLog.details}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Adresse IP</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  {selectedLog.ipAddress}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Navigateur</span>
                <span className="font-medium text-slate-600 dark:text-slate-300 text-[10px] text-right truncate max-w-[180px]">
                  {selectedLog.browser || 'Navigateur standard'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
