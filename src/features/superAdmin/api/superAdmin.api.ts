// ============================================================================
// src/features/superAdmin/api/superAdmin.api.ts
// Service API complet pour la gestion SaaS SuperAdmin (10 Modules)
// ============================================================================

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5151/api';
const API_BASE = rawUrl.replace(/\/api\/?$/, '') + '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('gmao_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  kpis: {
    totalTenants: number;
    activeTenants: number;
    totalSites: number;
    activeSites: number;
    totalUsers: number;
    activeUsers: number;
    mrr: number;
    arr: number;
    totalRevenue: number;
    pendingInvoicesCount: number;
    trialTenantsCount: number;
    renewalCount: number;
    systemHealth: number;
    avgResponseTimeMs: number;
  };
  recentLogs: Array<{
    id: number;
    dateHeure: string;
    niveau: string;
    action: string;
    categorie: string;
    userNom: string;
    details: string;
    statut: string;
  }>;
  recentTenants: Array<{
    id: number;
    nom: string;
    codeTenant: string;
    category: string;
    managerNom: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionAmount: number;
    createdAt: string;
    sitesCount: number;
    usersCount: number;
  }>;
  renewingTenants: Array<{
    id: number;
    nom: string;
    subscriptionPlan: string;
    subscriptionEndDate: string;
    daysLeft: number;
  }>;
  planDistribution: Array<{
    plan: string;
    count: number;
  }>;
}

export interface TenantDto {
  id: number;
  nom: string;
  codeTenant: string;
  category: string;
  managerNom: string;
  telephone: string;
  ville: string;
  gouvernorat: string;
  adresse: string;
  emailContact: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionAmount: number;
  maxSites: number;
  maxUsers: number;
  maxEquipements: number;
  storageUsedGb: number;
  maxStorageGb: number;
  capacityTonsPerDay: number;
  isActive: boolean;
  createdAt: string;
  sitesCount?: number;
  usersCount?: number;
  equipementsCount?: number;
}

export interface SiteUsineDto {
  id: number;
  societeId: number;
  societeNom?: string;
  nom: string;
  codeSite: string;
  ville: string;
  gouvernorat: string;
  adresse: string;
  type: string;
  statut: string;
  capaciteProduction: string;
  nombreEquipements: number;
  nombreUtilisateurs: number;
  responsable: string;
  telephone: string;
  email: string;
  photoUrl?: string;
  createdAt: string;
}

export interface PlanOffreDto {
  id: number;
  code: string;
  nom: string;
  description: string;
  prixMensuel: number;
  prixAnnuel: number;
  maxSites: number;
  maxUsers: number;
  maxEquipements: number;
  maxStorageGb: number;
  supportLevel: string;
  fonctionnalitesJson: string;
  isPopular: boolean;
  isActive: boolean;
  subscribersCount?: number;
}

export interface InvoiceDto {
  id: number;
  numeroFacture: string;
  societeId: number;
  societeNom: string;
  montantHT: number;
  tauxTVA: number;
  montantTTC: number;
  statut: 'Payée' | 'En attente' | 'En retard' | 'Annulée';
  methodePaiement: string;
  dateEmission: string;
  dateEcheance: string;
  datePaiement?: string;
  periode: string;
  plan: string;
  notes?: string;
}

export interface SuperAdminUserDto {
  id: number;
  nom: string;
  prenom: string;
  fullName: string;
  email: string;
  telephone?: string;
  roleId: number;
  roleNom: string;
  societeId?: number;
  societeNom: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface AuditLogDto {
  id: number;
  dateHeure: string;
  niveau: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY';
  action: string;
  categorie: string;
  userId?: number;
  userNom: string;
  userRole: string;
  societeNom: string;
  adresseIp: string;
  navigateur: string;
  details: string;
  statut: string;
}

export interface PlatformSettingsDto {
  id: number;
  nomPlateforme: string;
  versionPlateforme: string;
  urlPlateforme: string;
  supportEmail: string;
  supportTelephone: string;
  devise: string;
  tauxTvaParDefaut: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  defaultTrialDays: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSsl: boolean;
  storageProvider: string;
  backupAuto: boolean;
  backupFrequence: string;
  retentionJours: number;
  updatedAt: string;
}

export interface MonitoringDto {
  server: {
    hostname: string;
    os: string;
    dotnetVersion: string;
    database: string;
    uptime: string;
    cpuPercent: number;
    ramPercent: number;
    ramUsedGb: number;
    ramTotalGb: number;
    diskPercent: number;
    diskUsedGb: number;
    diskTotalGb: number;
    activeDbConnections: number;
    apiLatencyMs: number;
    requestsPerMin: number;
    errorRate: number;
  };
  tenants: Array<{
    id: number;
    nom: string;
    codeTenant: string;
    storageUsedGb: number;
    maxStorageGb: number;
    equipementsCount: number;
    usersCount: number;
    maxUsers: number;
    maxEquipements: number;
    activityPercent: number;
  }>;
}

// ── Generic Safe Fetch Helper ───────────────────────────────────────────────

async function safeApiCall<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers
      }
    });

    if (!res.ok) {
      console.warn(`[SuperAdmin API] Request to ${url} returned ${res.status}`);
      if (fallback !== undefined) return fallback;
      throw new Error(`Erreur API (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[SuperAdmin API] Call to ${url} failed, using local/cached state:`, err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

// ── SuperAdmin API Service ──────────────────────────────────────────────────

export const superAdminApi = {
  // 1. Dashboard
  getDashboardStats: (fallback?: DashboardStatsResponse) =>
    safeApiCall<DashboardStatsResponse>('/superadmin/dashboard-stats', undefined, fallback),

  // 2. Tenants (Entreprises)
  getTenants: (fallback?: TenantDto[]) =>
    safeApiCall<TenantDto[]>('/superadmin/tenants', undefined, fallback),

  createTenant: (tenant: Partial<TenantDto>) =>
    safeApiCall<TenantDto>('/superadmin/tenants', {
      method: 'POST',
      body: JSON.stringify(tenant)
    }),

  updateTenant: (id: number, tenant: Partial<TenantDto>) =>
    safeApiCall<TenantDto>(`/superadmin/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenant)
    }),

  deleteTenant: (id: number) =>
    safeApiCall<void>(`/superadmin/tenants/${id}`, {
      method: 'DELETE'
    }),

  // 3. Sites & Usines
  getSites: (fallback?: SiteUsineDto[]) =>
    safeApiCall<SiteUsineDto[]>('/superadmin/sites', undefined, fallback),

  createSite: (site: Partial<SiteUsineDto>) =>
    safeApiCall<SiteUsineDto>('/superadmin/sites', {
      method: 'POST',
      body: JSON.stringify(site)
    }),

  updateSite: (id: number, site: Partial<SiteUsineDto>) =>
    safeApiCall<SiteUsineDto>(`/superadmin/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(site)
    }),

  deleteSite: (id: number) =>
    safeApiCall<void>(`/superadmin/sites/${id}`, {
      method: 'DELETE'
    }),

  // 4. Plans & Offres
  getPlans: (fallback?: PlanOffreDto[]) =>
    safeApiCall<PlanOffreDto[]>('/superadmin/plans', undefined, fallback),

  createPlan: (plan: Partial<PlanOffreDto>) =>
    safeApiCall<PlanOffreDto>('/superadmin/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    }),

  updatePlan: (id: number, plan: Partial<PlanOffreDto>) =>
    safeApiCall<PlanOffreDto>(`/superadmin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan)
    }),

  deletePlan: (id: number) =>
    safeApiCall<void>(`/superadmin/plans/${id}`, {
      method: 'DELETE'
    }),

  // 5. Billing & Subscriptions
  getBillingOverview: (fallback?: any) =>
    safeApiCall<any>('/superadmin/billing', undefined, fallback),

  updateSubscription: (tenantId: number, data: { plan?: string; status?: string; amount?: number; renewalDate?: string }) =>
    safeApiCall<any>(`/superadmin/billing/subscriptions/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 6. Users
  getUsers: (fallback?: SuperAdminUserDto[]) =>
    safeApiCall<SuperAdminUserDto[]>('/superadmin/users', undefined, fallback),

  createUser: (user: Partial<SuperAdminUserDto>) =>
    safeApiCall<SuperAdminUserDto>('/superadmin/users', {
      method: 'POST',
      body: JSON.stringify(user)
    }),

  updateUser: (id: number, user: Partial<SuperAdminUserDto>) =>
    safeApiCall<SuperAdminUserDto>(`/superadmin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    }),

  deleteUser: (id: number) =>
    safeApiCall<void>(`/superadmin/users/${id}`, {
      method: 'DELETE'
    }),

  // 7. Invoices (Facturation)
  getInvoices: (fallback?: InvoiceDto[]) =>
    safeApiCall<InvoiceDto[]>('/superadmin/invoices', undefined, fallback),

  createInvoice: (invoice: Partial<InvoiceDto>) =>
    safeApiCall<InvoiceDto>('/superadmin/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    }),

  updateInvoice: (id: number, invoice: Partial<InvoiceDto>) =>
    safeApiCall<InvoiceDto>(`/superadmin/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    }),

  deleteInvoice: (id: number) =>
    safeApiCall<void>(`/superadmin/invoices/${id}`, {
      method: 'DELETE'
    }),

  // 8. Monitoring
  getMonitoring: (fallback?: MonitoringDto) =>
    safeApiCall<MonitoringDto>('/superadmin/monitoring', undefined, fallback),

  // 9. Logs
  getLogs: (params?: { niveau?: string; categorie?: string; search?: string }, fallback?: AuditLogDto[]) => {
    const searchParams = new URLSearchParams();
    if (params?.niveau) searchParams.set('niveau', params.niveau);
    if (params?.categorie) searchParams.set('categorie', params.categorie);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return safeApiCall<AuditLogDto[]>(`/superadmin/logs${query}`, undefined, fallback);
  },

  createLog: (log: Partial<AuditLogDto>) =>
    safeApiCall<AuditLogDto>('/superadmin/logs', {
      method: 'POST',
      body: JSON.stringify(log)
    }),

  // 10. Settings
  getSettings: (fallback?: PlatformSettingsDto) =>
    safeApiCall<PlatformSettingsDto>('/superadmin/settings', undefined, fallback),

  updateSettings: (settings: Partial<PlatformSettingsDto>) =>
    safeApiCall<PlatformSettingsDto>('/superadmin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Seeding
  seedData: () =>
    safeApiCall<{ message: string }>('/superadmin/seed', { method: 'POST' })
};
