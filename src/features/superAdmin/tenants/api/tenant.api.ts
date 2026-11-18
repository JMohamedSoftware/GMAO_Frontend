/**
 * ============================================================================
 * MODULE : SuperAdmin / Gestion des Entreprises (Tenants) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Societes` pour la gestion multi-tenant.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Tenant } from '@/shared/types/gmao';

/**
 * Récupère la liste de toutes les entreprises enregistrées
 * GET /api/Societes
 */
export const fetchTenants = async (): Promise<Tenant[]> => {
  const response = await apiClient.get('/api/Societes');
  return response.data.map((s: any) => ({
    id: s.codeTenant,
    dbId: s.id,
    name: s.nom,
    domain: s.adresse || '',
    status: s.isActive ? 'Active' : 'Suspended',
    subscriptionPlan: s.subscriptionPlan || 'Basic',
    createdAt: s.createdAt,
    adminEmail: s.emailContact || '',
    capacityTonsPerDay: s.capacityTonsPerDay || 450,
    equipments: [],
    workOrders: [],
    incidents: [],
    technicians: [],
    parts: [],
    suppliers: [],
    campaigns: [],
    users: [],
  }));
};

/**
 * Crée une nouvelle entreprise (Tenant)
 * POST /api/Societes
 */
export const createTenantApi = async (tenantData: any): Promise<any> => {
  const body = {
    codeTenant: tenantData.id,
    nom: tenantData.name,
    adresse: tenantData.domain,
    emailContact: tenantData.adminEmail,
    subscriptionPlan: tenantData.subscriptionPlan,
    capacityTonsPerDay: tenantData.capacityTonsPerDay || 450,
    isActive: true,
  };
  const response = await apiClient.post('/api/Societes', body);
  return response.data;
};

/**
 * Met à jour les informations d'une entreprise
 * PUT /api/Societes/{dbId}
 */
export const updateTenantApi = async (dbId: number, tenantData: any): Promise<any> => {
  const body = {
    id: dbId,
    codeTenant: tenantData.id,
    nom: tenantData.name,
    adresse: tenantData.domain,
    emailContact: tenantData.adminEmail,
    subscriptionPlan: tenantData.subscriptionPlan,
    capacityTonsPerDay: tenantData.capacityTonsPerDay || 450,
    isActive: tenantData.status === 'Active',
  };
  const response = await apiClient.put(`/api/Societes/${dbId}`, body);
  return response.data;
};
