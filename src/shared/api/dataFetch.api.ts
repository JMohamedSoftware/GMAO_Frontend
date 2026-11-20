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
      let mappedStatus: WorkOrder['status'] = 'Brouillon';
      if (w.statut === 1) mappedStatus = 'Brouillon';
      else if (w.statut === 2) mappedStatus = w.technicienId ? 'Affecté' : 'En attente';
      else if (w.statut === 7) mappedStatus = 'Affecté Chef';
      else if (w.statut === 3) mappedStatus = 'En cours';
      else if (w.statut === 4) mappedStatus = 'Suspendu';
      else if (w.statut === 5) mappedStatus = 'Terminé';
      else if (w.statut === 6) mappedStatus = 'Clôturé';

      let mappedType: WorkOrder['type'] = 'Correctif';
      if (w.typeMaintenance === 2 || w.type === 2) mappedType = 'Préventif';
      else if (w.typeMaintenance === 3 || w.type === 3) mappedType = 'Prédictif';
      else if (w.typeMaintenance === 4 || w.type === 4) mappedType = 'Amélioratif';

      let mappedPriority: WorkOrder['priority'] = 'Moyenne';
      if (w.priorite === 1) mappedPriority = 'Faible';
      else if (w.priorite === 3) mappedPriority = 'Haute';
      else if (w.priorite === 4) mappedPriority = 'Critique';

      const chefEquipeIdResolved = (w.statut === 7 && w.responsableId)
        ? w.responsableId.toString()
        : (w.chefEquipeId ? w.chefEquipeId.toString() : (w.responsableId ? w.responsableId.toString() : undefined));

      return {
        id: w.id ? w.id.toString() : (w.numeroOT || `OT-${w.id}`),
        numeroOT: w.numeroOT || `OT-${w.id}`,
        dbId: w.id,
        incidentId: w.demandeId != null ? w.demandeId.toString() : undefined,
        equipmentId: w.equipementId?.toString() || '',
        type: mappedType,
        title: w.titre || w.description || w.numeroOT || `OT-${w.id}`,
        description: w.instructions || w.description || '',
        priority: mappedPriority,
        status: mappedStatus,
        technicianId: w.technicienId ? w.technicienId.toString() : undefined,
        assignedTechnicianId: w.technicienId ? w.technicienId.toString() : undefined,
        responsableId: w.responsableId,
        assignedBy: w.statut !== 7 ? (w.responsableId ? w.responsableId.toString() : '') : '',
        chefEquipeId: chefEquipeIdResolved,
        createdDate: w.dateCreation || new Date().toISOString(),
        startDate: w.dateDebutReelle || w.dateDebutPrevue || undefined,
        endDate: w.dateFinReelle || w.dateFinPrevue || undefined,
        durationMinutes: w.durationMinutes || (w.tempsEstimeHeures ? w.tempsEstimeHeures * 60 : 120),
        diagnostic: w.diagnostic || undefined,
        solution: w.solution || undefined,
        partsUsed: [],
        externalCost: w.coutSousTraitance || 0,
        campaign: w.campagne?.nom || w.campagneNom || '',
        campagneId: w.campagneId || undefined
      };
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
        createdAt: u.createdAt
      }));

    const movements = (data.movements || []).map((m: any) => ({
      id: `MVT-${new Date(m.date || Date.now()).getFullYear()}-${(m.id || 0).toString().padStart(3, '0')}`,
      date: m.date,
      partRef: m.piece?.reference || m.pieceId?.toString(),
      qty: m.quantite,
      type: m.type === 1 ? 'in' : 'out',
      reason: m.motif || (m.type === 1 ? 'Achat/Retour' : 'Maintenance/Sortie')
    }));

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
