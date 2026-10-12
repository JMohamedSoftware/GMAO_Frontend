import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Plug,
  Sliders,
  Cpu,
  Database,
  Wrench,
  Cloud,
  Check,
  Upload,
  Trash2,
  Copy,
  Globe,
  Package,
  Layers,
  CheckCircle2,
  Lock,
  Mail,
  CreditCard,
  MessageSquare,
  BarChart,
  Activity,
  Calendar,
  X,
  Sparkles,
  RefreshCw,
  Server,
  Building2,
  FileText
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export const SuperAdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'Général'
    | 'Sécurité'
    | 'Notifications'
    | 'Intégrations'
    | 'Personnalisation'
    | 'Système'
    | 'Sauvegarde'
    | 'Maintenance'
  >('Général');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [platformInfo, setPlatformInfo] = useState({
    name: 'POMODORO',
    description: 'Plateforme SaaS de GMAO industrielle pour l’industrie agroalimentaire de la tomate.',
    url: 'https://app.pomodoro.tn',
    email: 'contact@pomodoro.tn'
  });

  const [regionalPrefs, setRegionalPrefs] = useState({
    language: 'Français',
    timezone: '(GMT+01:00) Tunis',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1 234,56',
    currency: 'TND - Dinar Tunisien (DT)'
  });

  const [defaultLimits, setDefaultLimits] = useState({
    sites: 1,
    users: 5,
    equipments: 50,
    storage: 10
  });

  const [subscriptionPolicy, setSubscriptionPolicy] = useState({
    trialDays: 14,
    reminderDays: 7,
    autoSuspend: 'Oui',
    deleteAfterDays: 30,
    autoSendInvoices: true
  });

  const [defaultModules, setDefaultModules] = useState({
    equipments: true,
    preventive: true,
    corrective: true,
    inventory: true,
    purchases: true,
    standardReports: true,
    advancedReports: true,
    multisite: true,
    quality: false,
    api: false
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoOptimization: true,
    detailedLogs: true,
    autoUpdate: false
  });

  // Modal for configuring an integration
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('URL copiée dans le presse-papiers');
  };

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
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shadow-inner">
            <Settings className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Paramètres
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Configurez et personnalisez votre plateforme SaaS POMODORO
            </p>
          </div>
        </div>

        {/* Right tomato image banner & Backup widget */}
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
            <Cloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Dernière sauvegarde
              </div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                29/09/2026 02:00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'Général', icon: Shield },
          { id: 'Sécurité', icon: Lock },
          { id: 'Notifications', icon: Bell },
          { id: 'Intégrations', icon: Plug },
          { id: 'Personnalisation', icon: Sliders },
          { id: 'Système', icon: Cpu },
          { id: 'Sauvegarde', icon: Database },
          { id: 'Maintenance', icon: Wrench }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold shadow-sm border border-blue-200/80 dark:border-blue-900/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.id}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GÉNÉRAL (MAIN SCREEN MATCHING THE SCREENSHOT EXACTLY) */}
      {activeTab === 'Général' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeIn_0.15s_ease-out]">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* CARD 1: Informations de la plateforme */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Informations de la plateforme
                  </h3>
                </div>
                <button
                  onClick={() => showToast('Informations de la plateforme enregistrées')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Inputs (2 cols) */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Nom de la plateforme
                    </label>
                    <input
                      type="text"
                      value={platformInfo.name}
                      onChange={e => setPlatformInfo({ ...platformInfo, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={platformInfo.description}
                      onChange={e => setPlatformInfo({ ...platformInfo, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      URL de la plateforme
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={platformInfo.url}
                        onChange={e => setPlatformInfo({ ...platformInfo, url: e.target.value })}
                        className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(platformInfo.url)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={platformInfo.email}
                      onChange={e => setPlatformInfo({ ...platformInfo, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Logo and Favicon (1 col) */}
                <div className="flex flex-col gap-4">
                  {/* Logo Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start">
                      Logo
                    </span>
                    <span className="text-4xl filter drop-shadow">🍅</span>
                    <div className="flex flex-col gap-1.5 w-full mt-1">
                      <button
                        onClick={() => showToast('Action de modification du logo ouverte')}
                        className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-[10px] font-bold text-blue-600 dark:text-blue-400"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Changer le logo</span>
                      </button>
                      <button
                        onClick={() => showToast('Logo réinitialisé par défaut')}
                        className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>

                  {/* Favicon Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start">
                      Favicon
                    </span>
                    <span className="text-2xl">🍅</span>
                    <div className="flex flex-col gap-1.5 w-full mt-1">
                      <button
                        onClick={() => showToast('Action de modification du favicon')}
                        className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-[10px] font-bold text-blue-600 dark:text-blue-400"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Changer le favicon</span>
                      </button>
                      <button
                        onClick={() => showToast('Favicon réinitialisé')}
                        className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Configuration des limites par défaut */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      Configuration des limites par défaut
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Valeurs par défaut lors de la création d'une nouvelle entreprise.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Limites par défaut enregistrées')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Sites / Usines
                  </label>
                  <input
                    type="number"
                    value={defaultLimits.sites}
                    onChange={e => setDefaultLimits({ ...defaultLimits, sites: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Utilisateurs
                  </label>
                  <input
                    type="number"
                    value={defaultLimits.users}
                    onChange={e => setDefaultLimits({ ...defaultLimits, users: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Équipements
                  </label>
                  <input
                    type="number"
                    value={defaultLimits.equipments}
                    onChange={e => setDefaultLimits({ ...defaultLimits, equipments: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Stockage (GB)
                  </label>
                  <input
                    type="number"
                    value={defaultLimits.storage}
                    onChange={e => setDefaultLimits({ ...defaultLimits, storage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Politique d'abonnement */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Politique d'abonnement
                  </h3>
                </div>
                <button
                  onClick={() => showToast('Politique d’abonnement enregistrée')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Période d'essai (jours)
                  </label>
                  <input
                    type="number"
                    value={subscriptionPolicy.trialDays}
                    onChange={e => setSubscriptionPolicy({ ...subscriptionPolicy, trialDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Rappel avant expiration (jours)
                  </label>
                  <input
                    type="number"
                    value={subscriptionPolicy.reminderDays}
                    onChange={e => setSubscriptionPolicy({ ...subscriptionPolicy, reminderDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Suspension automatique
                  </label>
                  <select
                    value={subscriptionPolicy.autoSuspend}
                    onChange={e => setSubscriptionPolicy({ ...subscriptionPolicy, autoSuspend: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Suppression après (jours)
                  </label>
                  <input
                    type="number"
                    value={subscriptionPolicy.deleteAfterDays}
                    onChange={e => setSubscriptionPolicy({ ...subscriptionPolicy, deleteAfterDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggle switch: Envoi automatique des factures */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubscriptionPolicy({ ...subscriptionPolicy, autoSendInvoices: !subscriptionPolicy.autoSendInvoices })}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    subscriptionPolicy.autoSendInvoices ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      subscriptionPolicy.autoSendInvoices ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Envoi automatique des factures
                </span>
              </div>
            </div>

            {/* CARD 4: Paramètres système */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Paramètres système
                  </h3>
                </div>
                <button
                  onClick={() => showToast('Paramètres système enregistrés')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Maintenance Mode */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer mt-0.5 ${
                      systemSettings.maintenanceMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        systemSettings.maintenanceMode ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      Mode maintenance
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Mettre la plateforme en mode maintenance
                    </div>
                  </div>
                </div>

                {/* Optimisation automatique */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSystemSettings({ ...systemSettings, autoOptimization: !systemSettings.autoOptimization })}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer mt-0.5 ${
                      systemSettings.autoOptimization ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        systemSettings.autoOptimization ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      Optimisation automatique
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Nettoyage automatique des données temporaires
                    </div>
                  </div>
                </div>

                {/* Logs détaillés */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSystemSettings({ ...systemSettings, detailedLogs: !systemSettings.detailedLogs })}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer mt-0.5 ${
                      systemSettings.detailedLogs ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        systemSettings.detailedLogs ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      Logs détaillés
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Activer les logs détaillés du système
                    </div>
                  </div>
                </div>

                {/* Mise à jour automatique */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSystemSettings({ ...systemSettings, autoUpdate: !systemSettings.autoUpdate })}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer mt-0.5 ${
                      systemSettings.autoUpdate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        systemSettings.autoUpdate ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      Mise à jour automatique
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Appliquer automatiquement les mises à jour mineures
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* CARD 5: Préférences régionales */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Préférences régionales
                  </h3>
                </div>
                <button
                  onClick={() => showToast('Préférences régionales enregistrées')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 sm:w-1/3">
                    Langue par défaut
                  </label>
                  <select
                    value={regionalPrefs.language}
                    onChange={e => setRegionalPrefs({ ...regionalPrefs, language: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Français">🇫🇷 Français</option>
                    <option value="Anglais">🇬🇧 Anglais</option>
                    <option value="Arabe">🇹🇳 Arabe</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 sm:w-1/3">
                    Fuseau horaire
                  </label>
                  <select
                    value={regionalPrefs.timezone}
                    onChange={e => setRegionalPrefs({ ...regionalPrefs, timezone: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="(GMT+01:00) Tunis">(GMT+01:00) Tunis</option>
                    <option value="(GMT+01:00) Paris">(GMT+01:00) Paris</option>
                    <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 sm:w-1/3">
                    Format de date
                  </label>
                  <select
                    value={regionalPrefs.dateFormat}
                    onChange={e => setRegionalPrefs({ ...regionalPrefs, dateFormat: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 sm:w-1/3">
                    Format numérique
                  </label>
                  <select
                    value={regionalPrefs.numberFormat}
                    onChange={e => setRegionalPrefs({ ...regionalPrefs, numberFormat: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="1 234,56">1 234,56</option>
                    <option value="1,234.56">1,234.56</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 sm:w-1/3">
                    Devise
                  </label>
                  <select
                    value={regionalPrefs.currency}
                    onChange={e => setRegionalPrefs({ ...regionalPrefs, currency: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="TND - Dinar Tunisien (DT)">TND - Dinar Tunisien (DT)</option>
                    <option value="EUR - Euro (€)">EUR - Euro (€)</option>
                    <option value="USD - Dollar US ($)">USD - Dollar US ($)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 6: Modules par défaut */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      Modules par défaut
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modules activés par défaut pour les nouvelles entreprises.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Modules par défaut enregistrés')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { key: 'equipments', label: 'Gestion des équipements', icon: '⚙️', color: 'text-amber-500' },
                  { key: 'preventive', label: 'Maintenance préventive', icon: '🛡️', color: 'text-emerald-500' },
                  { key: 'corrective', label: 'Maintenance corrective', icon: '🔧', color: 'text-purple-500' },
                  { key: 'inventory', label: 'Gestion du stock', icon: '📦', color: 'text-blue-500' },
                  { key: 'purchases', label: 'Achats & fournisseurs', icon: '🚚', color: 'text-cyan-500' },
                  { key: 'standardReports', label: 'Rapports standards', icon: '📊', color: 'text-rose-500' },
                  { key: 'advancedReports', label: 'Rapports avancés', icon: '📈', color: 'text-sky-500' },
                  { key: 'multisite', label: 'Multi-sites', icon: '🏢', color: 'text-emerald-500' },
                  { key: 'quality', label: 'Module qualité', icon: '⭐', color: 'text-slate-400' },
                  { key: 'api', label: 'API d’intégration', icon: '🔗', color: 'text-purple-500' }
                ].map(module => {
                  const isChecked = defaultModules[module.key as keyof typeof defaultModules];
                  return (
                    <div key={module.key} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{module.icon}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {module.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDefaultModules({
                            ...defaultModules,
                            [module.key]: !isChecked
                          })
                        }
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            isChecked ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 7: Intégrations globales */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Plug className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      Intégrations globales
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configurez les services externes utilisés par la plateforme.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Intégrations synchronisées')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'SMTP (Email)', sub: 'SendGrid', status: 'Connecté', icon: Mail, iconColor: 'text-blue-500' },
                  { name: 'Stockage de fichiers', sub: 'Cloudinary', status: 'Connecté', icon: Cloud, iconColor: 'text-blue-500' },
                  { name: 'Paiements', sub: 'Stripe', status: 'Connecté', icon: CreditCard, iconColor: 'text-purple-500' },
                  { name: 'Notifications SMS', sub: 'Twilio', status: 'Non configuré', icon: MessageSquare, iconColor: 'text-rose-500' },
                  { name: 'Analytics', sub: 'Google Analytics', status: 'Connecté', icon: BarChart, iconColor: 'text-blue-500' },
                  { name: 'Monitoring', sub: 'Sentry', status: 'Connecté', icon: Activity, iconColor: 'text-emerald-500' }
                ].map(service => {
                  const Icon = service.icon;
                  const isConnected = service.status === 'Connecté';

                  return (
                    <div
                      key={service.name}
                      className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 ${service.iconColor} shrink-0 mt-0.5`} />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                            {service.name}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span className={`text-[10px] font-bold ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {service.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {service.sub}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedIntegration(service.name)}
                        className="w-full py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Configurer
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS AS RICH EXPANDED PANELS */}
      {activeTab !== 'Général' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-6 animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Paramètres : {activeTab}
              </h3>
              <p className="text-xs text-slate-400">
                Configuration avancée du sous-module {activeTab.toLowerCase()} pour l'ensemble du cluster SaaS POMODORO.
              </p>
            </div>
            <button
              onClick={() => showToast(`Paramètres ${activeTab} sauvegardés`)}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
            >
              Enregistrer les modifications
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Options principales ({activeTab})
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Toutes les modifications appliquées ici sont propagées en temps réel sur les nœuds de production.
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">Synchronisation automatique</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Active</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Statut du service
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Latence moyenne :</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">18 ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Disponibilité (SLA) :</span>
                  <span className="font-bold text-emerald-600">99.98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURATION INTÉGRATION */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Configuration : {selectedIntegration}
              </h3>
              <button onClick={() => setSelectedIntegration(null)} className="p-1 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clé d'API (API Key)
                </label>
                <input
                  type="password"
                  defaultValue="sk_live_98234978129384792183"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Point de terminaison (Webhook / Endpoint)
                </label>
                <input
                  type="text"
                  defaultValue="https://api.pomodoro.tn/webhooks"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setSelectedIntegration(null);
                  showToast(`Intégration ${selectedIntegration} mise à jour avec succès`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
