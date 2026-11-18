/**
 * ============================================================================
 * MODULE PARTAGÉ : Passerelle API & Orchestration des Données Communes
 * ============================================================================
 * Ce fichier sert de passerelle centralisée (Facade) pour les données partagées
 * entre les différents composants (Redux gmaoSlice, Initialisation des Tenants).
 * 
 * Les implémentations spécifiques sont désormais réparties dans leurs modules respectifs :
 * - Équipements  -> src/features/company/equipments/api/equipment.api.ts
 * - Fournisseurs -> src/features/company/suppliers/api/supplier.api.ts
 * - Magasin/Stock-> src/features/company/inventory/api/inventory.api.ts
 * - Incidents    -> src/features/company/incidents/api/incident.api.ts
 * - Ordres Trav. -> src/features/company/workOrders/api/workOrder.api.ts
 * - Campagnes    -> src/features/company/campaigns/api/campaign.api.ts
 * - Équipes      -> src/features/company/equipes/api/equipe.api.ts
 * - Utilisateurs -> src/features/company/users/api/users.api.ts
 * - SuperAdmin   -> src/features/superAdmin/tenants/api/tenant.api.ts
 * - Documents    -> src/shared/api/document.api.ts
 */

// ── 1. Équipements & Machines ───────────────────────────────────────────────
export {
  fetchEquipments,
  createEquipmentApi,
  updateEquipmentApi,
  updateEquipmentStatusApi,
  linkPieceToEquipmentApi,
  unlinkPieceFromEquipmentApi,
  normalizeEquipmentStatus,
  normalizeEquipmentCriticality,
  mapCriticiteToInt,
  mapEtatToInt,
  BASE_URL
} from '@/features/company/equipments/api/equipment.api';

// ── 2. Fournisseurs ────────────────────────────────────────────────────────
export {
  fetchSuppliers,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi
} from '@/features/company/suppliers/api/supplier.api';

// ── 3. Pièces de Rechange & Mouvements de Stock ────────────────────────────
export {
  fetchParts,
  createPartApi,
  updatePartApi,
  createMovementApi,
  fetchMovements,
  fetchPieceCategoriesApi,
  createPieceCategoryApi
} from '@/features/company/inventory/api/inventory.api';

// ── 4. Incidents & Demandes d'Intervention ──────────────────────────────────
export {
  fetchIncidents,
  createIncidentApi,
  patchIncidentStatusApi
} from '@/features/company/incidents/api/incident.api';
export type { CreateIncidentPayload } from '@/features/company/incidents/api/incident.api';

// ── 5. Ordres de Travail (Work Orders) ─────────────────────────────────────
export {
  fetchWorkOrders,
  createWorkOrderApi,
  patchWorkOrderStatusApi,
  mapWorkOrderTypeToInt,
  mapWorkOrderPriorityToInt
} from '@/features/company/workOrders/api/workOrder.api';
export type { CreateWorkOrderPayload } from '@/features/company/workOrders/api/workOrder.api';

// ── 6. Campagnes Industrielles ─────────────────────────────────────────────
export {
  fetchCampaigns
} from '@/features/company/campaigns/api/campaign.api';

// ── 7. Utilisateurs & Techniciens ──────────────────────────────────────────
export {
  fetchTechnicians,
  fetchUsers
} from '@/features/company/users/api/users.api';

// ── 8. Équipes de Maintenance ──────────────────────────────────────────────
export {
  fetchEquipes,
  createEquipeApi,
  updateEquipeApi,
  deleteEquipeApi
} from '@/features/company/equipes/api/equipe.api';

// ── 9. Entreprises Multi-Tenant (SuperAdmin) ────────────────────────────────
export {
  fetchTenants,
  createTenantApi,
  updateTenantApi
} from '@/features/superAdmin/tenants/api/tenant.api';

// ── 10. Documents & Fichiers Joints ────────────────────────────────────────
export {
  uploadDocumentApi,
  deleteDocumentApi,
  fetchEquipmentDocumentsApi
} from '@/shared/api/document.api';

// ── 11. Plans Préventifs ───────────────────────────────────────────────────
export {
  getPlansPreventifs as fetchPlansPreventifs,
  getPlansPreventifs,
  getPlanPreventifById,
  createPlan as createPlanPreventif,
  createPlan,
  updatePlan as updatePlanPreventif,
  updatePlan,
  deletePlan,
  genererOT as genererOTPreventif,
  genererOT,
  replanifier as replanifierPlanPreventif,
  replanifier
} from '@/features/company/preventive/api/preventive.api';
