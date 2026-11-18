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
  ShieldCheck,
  Tablet,
  ScanLine,
  Wifi,
  Cpu,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BatteryCharging,
  Wrench,
  Clock,
  ArrowRight,
  RotateCcw,
  Calendar,
  Users,
  Factory,
  HardDrive
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
  const [companySubTab, setCompanySubTab] = useState<'peripheriques' | 'redologs' | 'campagnes' | 'equipements' | 'utilisateurs'>('peripheriques');

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

  // Consommation réelle et inventaire des périphériques de l'entreprise sélectionnée
  const tenantPeripherals = useMemo(() => {
    if (!selectedCompany) return null;
    const code = selectedCompany.codeTenant || `tenant-${selectedCompany.id}`;
    const name = selectedCompany.nom;

    const tablets = [
      {
        id: `TAB-${code}-01`,
        model: 'Samsung Galaxy Tab Active5 (Durcie IP68)',
        station: 'Poste Tri Optique Tomates Fraîches',
        operator: 'Karim Ben Salah',
        ip: '192.168.10.42',
        battery: 89,
        lastSync: 'Il y a 2 min',
        status: 'En ligne'
      },
      {
        id: `TAB-${code}-02`,
        model: 'Samsung Galaxy Tab Active5 (Durcie IP68)',
        station: 'Ligne Évaporateurs & Concentrateurs',
        operator: 'Sami Mansouri',
        ip: '192.168.10.43',
        battery: 74,
        lastSync: 'Il y a 5 min',
        status: 'En ligne'
      },
      {
        id: `TAB-${code}-03`,
        model: 'Samsung Galaxy Tab Active3 (Durcie)',
        station: 'Poste Sertisseuses & Boîtes 4/4',
        operator: 'Hassen Trabelsi',
        ip: '192.168.10.45',
        battery: 95,
        lastSync: 'Il y a 12 min',
        status: 'En ligne'
      },
      {
        id: `TAB-${code}-04`,
        model: 'Samsung Galaxy Tab Active3 (Durcie)',
        station: 'Quai Réception & Pesée Remorques',
        operator: 'Mohamed Ben Amor',
        ip: '192.168.10.48',
        battery: 62,
        lastSync: 'Il y a 1 min',
        status: 'En ligne'
      },
      {
        id: `TAB-${code}-05`,
        model: 'Samsung Galaxy Tab Active3 (Durcie)',
        station: 'Maintenance Électromécanique Mobile',
        operator: "Équipe d'Astreinte",
        ip: '192.168.10.51',
        battery: 51,
        lastSync: 'Il y a 8 min',
        status: 'En ligne'
      }
    ];

    const scanners = [
      {
        id: `SCN-ZEB-01`,
        model: 'Zebra TC26 Android Industriel',
        zone: 'Magasin Central Pièces de Rechange (PDR)',
        assignee: 'Leila Farhat (Magasinière)',
        scansToday: 42,
        battery: 88,
        status: 'Opérationnel'
      },
      {
        id: `SCN-ZEB-02`,
        model: 'Zebra TC26 Android Industriel',
        zone: 'Magasin Produits Chimiques / NEP & CIP',
        assignee: "Khaled Ammar (Chef d'Équipe)",
        scansToday: 16,
        battery: 65,
        status: 'En service'
      },
      {
        id: `SCN-HON-01`,
        model: 'Honeywell ScanPal EDA52',
        zone: 'Contrôle Réception Fournisseurs & Emballages',
        assignee: 'Bilel Jaziri',
        scansToday: 28,
        battery: 92,
        status: 'Opérationnel'
      }
    ];

    const iotGateways = [
      {
        id: `IOT-GW-01`,
        type: 'Passerelle Siemens SIMATIC IOT2050 (Modbus TCP / MQTT)',
        location: 'Salle Automates • Concentrateur Rossi & Catelli 1500T/j',
        protocol: 'Modbus TCP / MQTT (Broker GMAO)',
        telemetry: '1 paquet / 10s (Vitesse, Débit, Pression)',
        status: 'Connecté'
      },
      {
        id: `SND-TEMP-01`,
        type: 'Sonde Température Pt100 Tri-Clamp Sanitaire',
        location: 'Sortie Évaporateur Tubulaire N°1',
        protocol: 'Boucle 4-20mA vers Automate S7-1500',
        telemetry: 'Valeur en direct: 92.4 °C (Consigne: 90-95°C)',
        status: 'Normal'
      },
      {
        id: `SND-PRES-01`,
        type: 'Transmetteur Pression Vapeur 4-20mA Endress+Hauser',
        location: 'Rampe d\'Admission Vapeur Chaudière 10T',
        protocol: 'HART / 4-20mA',
        telemetry: 'Valeur en direct: 6.2 Bars (Pression nominale)',
        status: 'Normal'
      },
      {
        id: `ACC-VIB-01`,
        type: 'Accéléromètre Piézoélectrique IFM VSA001',
        location: 'Palier Entraînement Pompe à Lobes Pâteuse',
        protocol: 'IO-Link vers Passerelle IoT',
        telemetry: 'Vibration RMS: 2.1 mm/s (Seuil alerte: 4.5 mm/s)',
        status: 'Sain'
      }
    ];

    const sqlRecords = (selectedCompany.equipementsCount || 15) * 28 + (selectedCompany.usersCount || 3) * 95 + 1840;
    const dbSizeMb = Math.round(((selectedCompany.equipementsCount || 15) * 3.5 + 45));
    const apiCallsMonth = Math.round((selectedCompany.usersCount || 3) * 3800 + (selectedCompany.equipementsCount || 15) * 420);

    return { tablets, scanners, iotGateways, sqlRecords, dbSizeMb, apiCallsMonth };
  }, [selectedCompany]);

  // Parc machines dédié de l'entreprise sélectionnée
  const tenantEquipmentsList = useMemo(() => {
    if (!selectedCompany) return [];
    return [
      {
        id: `EQ-${selectedCompany.id}01`,
        code: `BR-01`,
        nom: 'Broyeur à Marteaux Haute Cadence (Ligne Réception)',
        categorie: 'Broyage & Tri',
        statut: 'Opérationnel',
        heuresFonctionnement: 1420,
        sante: 96,
        derniereMaintenance: '2026-10-28',
        prochaineMaintenance: '2026-11-25'
      },
      {
        id: `EQ-${selectedCompany.id}02`,
        code: `EV-01`,
        nom: 'Groupe Concentrateur Triple Effet Rossi & Catelli 1500T/j',
        categorie: 'Concentration & Évaporation',
        statut: 'Opérationnel',
        heuresFonctionnement: 3840,
        sante: 92,
        derniereMaintenance: '2026-11-05',
        prochaineMaintenance: '2026-12-05'
      },
      {
        id: `EQ-${selectedCompany.id}03`,
        code: `ECH-02`,
        nom: 'Échangeur Tubulaire de Stérilisation & Pasteurisation',
        categorie: 'Thermique & Stérilisation',
        statut: 'Opérationnel',
        heuresFonctionnement: 2150,
        sante: 88,
        derniereMaintenance: '2026-11-12',
        prochaineMaintenance: '2026-12-12'
      },
      {
        id: `EQ-${selectedCompany.id}04`,
        code: `SERT-01`,
        nom: 'Sertisseuse Automatique Boîtes de Concentré 1/2 et 4/4',
        categorie: 'Conditionnement',
        statut: 'Opérationnel',
        heuresFonctionnement: 1890,
        sante: 94,
        derniereMaintenance: '2026-10-15',
        prochaineMaintenance: '2026-11-30'
      },
      {
        id: `EQ-${selectedCompany.id}05`,
        code: `PMP-03`,
        nom: "Pompe d'Évacuation Pâteuse à Lobes Inox 316L",
        categorie: 'Pompage Pâte Tomate',
        statut: 'Opérationnel',
        heuresFonctionnement: 2600,
        sante: 90,
        derniereMaintenance: '2026-11-01',
        prochaineMaintenance: '2026-12-01'
      }
    ];
  }, [selectedCompany]);

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
          selectedCompany ? (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
              {/* SUB-TABS NAVIGATION DE L'ENTREPRISE ISOLÉE */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2.5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setCompanySubTab('peripheriques')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      companySubTab === 'peripheriques'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                    <span>📱 Périphériques & Télémétrie IoT</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
                      {(tenantPeripherals?.tablets.length || 0) + (tenantPeripherals?.scanners.length || 0) + (tenantPeripherals?.iotGateways.length || 0)}
                    </span>
                  </button>

                  <button
                    onClick={() => setCompanySubTab('redologs')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      companySubTab === 'redologs'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>🔄 Redo Logs & Audit Mutations</span>
                  </button>

                  <button
                    onClick={() => setCompanySubTab('campagnes')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      companySubTab === 'campagnes'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>🍅 Campagnes de l'Usine</span>
                  </button>

                  <button
                    onClick={() => setCompanySubTab('equipements')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      companySubTab === 'equipements'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Factory className="w-4 h-4" />
                    <span>⚙️ Parc Machines</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedCompany.equipementsCount || tenantEquipmentsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCompanySubTab('utilisateurs')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      companySubTab === 'utilisateurs'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>👥 Techniciens & Accès</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedCompany.usersCount || 3}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedTenantId('ALL')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <span>🌐 Fermer vue isolée</span>
                </button>
              </div>

              {/* CONTENU DU SOUS-ONGLET SÉLECTIONNÉ */}
              {companySubTab === 'peripheriques' && tenantPeripherals && (
                <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
                  {/* 4 KPI CARDS CONSOMMATION & MATÉRIEL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Tablettes d'Atelier</span>
                        <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                          <Tablet className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {tenantPeripherals.tablets.length} / 6
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          5 Actives en ligne sur postes
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        Samsung Galaxy Tab Active (IP68)
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Scanners & Douchettes</span>
                        <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                          <ScanLine className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {tenantPeripherals.scanners.length}
                        </div>
                        <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                          {tenantPeripherals.scanners.reduce((s, sc) => s + sc.scansToday, 0)} scans pièces aujourd'hui
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        Zebra TC26 & Honeywell Magasin PDR
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Passerelles & Capteurs IoT</span>
                        <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                          <Cpu className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {tenantPeripherals.iotGateways.length}
                        </div>
                        <p className="text-[11px] font-semibold text-purple-600 mt-0.5">
                          Télémétrie Modbus TCP / MQTT
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        Siemens S7-1500 & Pt100 & Vibrations
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Volume SQL & Données</span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                          <Database className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {tenantPeripherals.sqlRecords.toLocaleString('fr-FR')} Lignes
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {tenantPeripherals.dbSizeMb} Mo SQL • {selectedCompany.storageUsedGb || 1.4} Go Médias
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        {tenantPeripherals.apiCallsMonth.toLocaleString('fr-FR')} requêtes API / mois
                      </div>
                    </div>
                  </div>

                  {/* TABLE 1 : TABLETTES D'ATELIER CONNECTÉES */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Tablet className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          Tablettes d'Atelier & Mobilité Déployées ({tenantPeripherals.tablets.length})
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        Réseau Usine Wi-Fi Industriel (SSID: GMAO_FACTORY_SECURE)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                            <th className="py-2.5 px-3">Identifiant & Modèle</th>
                            <th className="py-2.5 px-3">Poste / Ligne d'Affectation</th>
                            <th className="py-2.5 px-3">Opérateur / Technicien</th>
                            <th className="py-2.5 px-3">IP Locale</th>
                            <th className="py-2.5 px-3">Dernière Synchro</th>
                            <th className="py-2.5 px-3">Batterie</th>
                            <th className="py-2.5 px-3 text-right">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {tenantPeripherals.tablets.map((tab) => (
                            <tr key={tab.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3">
                                <div className="font-mono font-bold text-slate-900 dark:text-white">{tab.id}</div>
                                <div className="text-[10px] text-slate-400">{tab.model}</div>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                {tab.station}
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                                {tab.operator}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                                {tab.ip}
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {tab.lastSync}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{tab.battery}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                                  🟢 {tab.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TABLE 2 : DOUCHETTES & SCANNERS MAGASIN PDR */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <ScanLine className="w-5 h-5 text-amber-500" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              Douchettes & Scanners Code-Barres / QR ({tenantPeripherals.scanners.length})
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {tenantPeripherals.scanners.map((scn) => (
                            <div key={scn.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">{scn.id}</span>
                                  <span className="text-[10px] text-slate-400">({scn.model})</span>
                                </div>
                                <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{scn.zone}</div>
                                <div className="text-[10px] text-slate-500">Affecté à : {scn.assignee}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-black text-amber-600">{scn.scansToday} scans</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Batterie : {scn.battery}%</div>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {scn.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* TABLE 3 : CAPTEURS & TÉLÉMÉTRIE IOT */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-500" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              Passerelles & Capteurs IoT Industriels ({tenantPeripherals.iotGateways.length})
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {tenantPeripherals.iotGateways.map((gw) => (
                            <div key={gw.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{gw.id}</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{gw.type}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{gw.location}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{gw.telemetry}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                                  🟢 {gw.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SOUS-ONGLET REDO LOGS & AUDIT MUTATIONS DE CETTE USINE */}
              {companySubTab === 'redologs' && (
                <SuperAdminRedoLogs selectedTenantId={String(selectedCompany.id)} />
              )}

              {/* SOUS-ONGLET CAMPAGNES DE CETTE USINE */}
              {companySubTab === 'campagnes' && (
                <SuperAdminCampaigns selectedTenantId={String(selectedCompany.id)} />
              )}

              {/* SOUS-ONGLET PARC MACHINES DE CETTE USINE */}
              {companySubTab === 'equipements' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Parc Machines Compartimenté • {selectedCompany.nom}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Machines de transformation et lignes de production réservées à cette conserverie.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                      {tenantEquipmentsList.length} Équipements critiques
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                          <th className="py-2.5 px-3">Code / ID</th>
                          <th className="py-2.5 px-3">Désignation Équipement</th>
                          <th className="py-2.5 px-3">Catégorie</th>
                          <th className="py-2.5 px-3">Heures Fonctionnement</th>
                          <th className="py-2.5 px-3">Indice Santé</th>
                          <th className="py-2.5 px-3">Prochaine Maintenance</th>
                          <th className="py-2.5 px-3 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {tenantEquipmentsList.map((eq) => (
                          <tr key={eq.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                              {eq.code}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                              {eq.nom}
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {eq.categorie}
                            </td>
                            <td className="py-3 px-3 font-mono">
                              {eq.heuresFonctionnement} h
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                                <span>{eq.sante}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {eq.prochaineMaintenance}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                                🟢 {eq.statut}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SOUS-ONGLET UTILISATEURS & ACCÈS DE CETTE USINE */}
              {companySubTab === 'utilisateurs' && (
                <SuperAdminUsers selectedCompanyName={selectedCompany.nom} />
              )}
            </div>
          ) : (
            <SuperAdminDashboard 
              mrr={mrr}
              activeCount={activeCount}
              registeredCount={registeredTenants.length}
              pendingCount={pendingRequests.length}
              revenueHistory={revenueHistory}
              tenants={safeTenants}
            />
          )
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
