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

// ── 12. Fast Aggregated Bootstrap Endpoint ──────────────────────────────────
import { apiClient } from '@/shared/services/apiClient';
import { Equipment, Incident, WorkOrder, SparePart, Supplier, Technician, UserAccount } from '@/shared/types/gmao';
import { normalizeEquipmentStatus, normalizeEquipmentCriticality } from '@/features/company/equipments/api/equipment.api';
import { mapBackendWorkOrder } from '@/features/company/workOrders/api/workOrder.api';
import { mapBackendMovement } from '@/features/company/inventory/api/inventory.api';

export const fetchBootstrapDataApi = async (): Promise<{
  equipments: Equipment[];
  suppliers: Supplier[];
  parts: SparePart[];
  incidents: Incident[];
  workOrders: WorkOrder[];
  campaigns: any[];
  technicians: Technician[];
  users: UserAccount[];
  movements: any[];
  equipes: any[];
} | null> => {
  try {
    const res = await apiClient.get('/api/Maintenance/bootstrap');
    const data = res.data;
    if (!data) return null;

    const catList = data.pieceCategories || [];

    const equipments: Equipment[] = (data.equipments || []).map((e: any) => ({
      id: e.id?.toString(),
      code: e.code || '',
      name: e.designation,
      location: e.localisationNom || '',
      category: e.familleNom || e.category || 'Autre',
      subFamily: e.familleNom || e.category || 'Autre',
      brand: e.marque || '',
      model: e.modele || '',
      serialNumber: e.numeroSerie || '',
      supplierId: e.fournisseurId?.toString(),
      purchaseDate: e.dateAchat,
      endOfWarranty: e.dateFinGarantie,
      commissionDate: e.dateMiseEnService || new Date().toISOString(),
      localisationId: e.localisationId,
      localisation: e.localisationNom ? { id: e.localisationId, nom: e.localisationNom } : undefined,
      criticality: normalizeEquipmentCriticality(e.criticite),
      status: normalizeEquipmentStatus(e.etat),
      healthIndex: 100,
      lastMaintenance: e.updatedAt || new Date().toISOString(),
      nextMaintenance: new Date().toISOString(),
      hoursCount: e.hoursCount || 0,
      cycleCount: 0,
      documents: e.documents || []
    }));

    const suppliers: Supplier[] = (data.suppliers || []).map((s: any) => ({
      id: s.id?.toString(),
      name: s.nom,
      contact: s.contact || '',
      email: s.email || '',
      phone: s.telephone || '',
      address: s.adresse || '',
      rating: 5,
      contracts: []
    }));

    const parts: SparePart[] = (data.parts || []).map((p: any) => {
      const cat = catList.find((c: any) => c.id === p.famillePieceId);
      return {
        id: p.id?.toString(),
        ref: p.reference,
        name: p.designation,
        category: cat ? cat.nom : 'Autre',
        supplierId: p.fournisseurId?.toString() || '',
        stockCurrent: p.stockActuel || 0,
        stockMin: p.stockMinimum || 0,
        stockMax: p.stockMaximum || 100,
        unitPrice: p.prixUnitaire || 0,
        location: p.emplacement || '',
        unit: p.unite || 'Unité',
        usedIn: [],
        criticality: 'Moyenne' as const,
        autoReorder: (p.stockActuel || 0) <= (p.stockMinimum || 0)
      };
    });

    const intToUrgency = (n: number): Incident['urgency'] => {
      switch (n) {
        case 1:  return 'Faible';
        case 3:  return 'Haute';
        case 4:  return 'Critique';
        default: return 'Moyenne';
      }
    };

    const intToStatus = (n: number): Incident['status'] => {
      switch (n) {
        case 2:  return 'Validé';
        case 3:  return 'Rejeté';
        case 4:  return 'Transformé en OT';
        case 5:  return 'Clos';
        default: return 'Nouveau';
      }
    };

    const incidents: Incident[] = (data.incidents || []).map((i: any) => ({
      id: i.id?.toString(),
      equipmentId: i.equipementId?.toString(),
      reportedBy: i.demandeurId?.toString(),
      reportedDate: i.datePanne,
      urgency: intToUrgency(i.priorite),
      status: intToStatus(i.statut),
      description: i.description,
      photo: i.photoUrl || undefined,
      commentaireRejet: i.commentaireRejet || undefined,
    }));

    const workOrders: WorkOrder[] = (data.workOrders || []).map((w: any) => {
      const mapped = mapBackendWorkOrder(w);
      return {
        ...mapped,
        dbId: w.id,
        assignedTechnicianId: w.technicienId ? w.technicienId.toString() : undefined
      } as WorkOrder;
    });

    const campaigns = (data.campaigns || []).map((c: any) => ({
      id: c.id?.toString(),
      name: c.nom,
      startDate: c.dateDebut,
      endDate: c.dateFin,
      status: c.etat === 2 ? 'En cours' : c.etat === 3 ? 'Terminée' : 'Planifiée'
    }));

    const equipes = (data.equipes || []).map((e: any) => ({
      id: e.id?.toString(),
      nom: e.nom,
      description: e.description || '',
      couleur: 'bg-slate-500',
      chefId: e.chefEquipeId?.toString(),
      technicienIds: e.membres?.map((m: any) => m.id.toString()) || []
    }));

    const rawUsers = data.users || [];
    const technicians: Technician[] = rawUsers
      .filter((u: any) => u.roleId === 4 && u.isActive !== false)
      .map((u: any) => ({
        id: u.id?.toString(),
        name: `${u.prenom} ${u.nom}`.trim(),
        role: 'Électromécanicien',
        qualification: 'Technicien de Maintenance',
        skills: [],
        status: 'Disponible',
        hourlyRate: 0,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.prenom}+${u.nom}`)}&background=e11d48&color=fff&size=150`
      }));

    const users: UserAccount[] = rawUsers
      .filter((u: any) => u.role?.nom !== 'SuperAdmin' && u.roleId !== 7)
      .map((u: any) => ({
        id: u.id?.toString(),
        name: `${u.prenom} ${u.nom}`.trim(),
        email: u.email,
        role: u.role?.nom || 'Utilisateur',
        status: u.isActive !== false ? 'Actif' : 'Inactif',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.prenom}+${u.nom}`)}&background=e11d48&color=fff&size=150`,
        phone: u.telephone,
        equipeId: u.equipeId ?? null,
        createdAt: u.createdAt
      }));

    const movements = (data.movements || []).map(mapBackendMovement);

    return {
      equipments,
      suppliers,
      parts,
      incidents,
      workOrders,
      campaigns,
      technicians,
      users,
      movements,
      equipes
    };
  } catch (err) {
    console.warn('[Bootstrap API] Falling back to modular API fetches:', err);
    return null;
  }
};
