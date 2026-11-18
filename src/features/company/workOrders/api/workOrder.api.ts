/**
 * ============================================================================
 * MODULE : Ordres de Travail (Work Orders) - API Client
 * ============================================================================
 * Ce fichier gère tous les appels HTTP directs vers le contrôleur backend
 * ASP.NET Core `/api/OrdresTravail` via l'instance `apiClient`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { WorkOrder } from '@/shared/types/gmao';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../types/workOrder.types';

export interface CreateWorkOrderPayload {
  title: string;
  description: string;
  equipmentId: string;
  type: WorkOrder['type'];
  priority: WorkOrder['priority'];
  technicianId?: string;
  incidentId?: string;
  responsableId?: number;
  campagneId?: number;
}

export const mapWorkOrderTypeToInt = (type: string): number => {
  switch (type) {
    case 'Préventif':   return 2;
    case 'Prédictif':   return 3;
    case 'Amélioratif': return 4;
    default:            return 1; // Correctif
  }
};

export const mapWorkOrderPriorityToInt = (priority: string): number => {
  switch (priority) {
    case 'Faible':   return 1;
    case 'Haute':    return 3;
    case 'Critique': return 4;
    default:         return 2; // Moyenne
  }
};

/**
 * Récupère tous les ordres de travail pour l'état Redux
 * GET /api/OrdresTravail
 */
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  const response = await apiClient.get('/api/OrdresTravail');
  return response.data.map((w: any) => {
    let mappedStatus: WorkOrder['status'] = 'Brouillon';
    if (w.statut === 1) mappedStatus = 'Brouillon';
    else if (w.statut === 2) {
      mappedStatus = w.technicienId ? 'Affecté' : 'En attente';
    }
    else if (w.statut === 7) mappedStatus = 'Affecté Chef';
    else if (w.statut === 3) mappedStatus = 'En cours';
    else if (w.statut === 4) mappedStatus = 'Suspendu';
    else if (w.statut === 5) mappedStatus = 'Terminé';
    else if (w.statut === 6) mappedStatus = 'Clôturé';

    return {
      id: w.id?.toString(),
      numeroOT: w.numeroOT || `OT-${w.id}`,
      incidentId: w.demandeId != null ? w.demandeId.toString() : undefined,
      equipmentId: w.equipementId?.toString() || '',
      title: w.description || w.numeroOT || `OT-${w.id}`,
      description: w.instructions || w.description || '',
      type: w.typeMaintenance === 2 ? 'Préventif' : w.typeMaintenance === 4 ? 'Amélioratif' : 'Correctif',
      priority: w.priorite === 1 ? 'Faible' : w.priorite === 2 ? 'Moyenne' : w.priorite === 3 ? 'Haute' : 'Critique',
      status: mappedStatus,
      createdDate: w.dateCreation || new Date().toISOString(),
      startDate: w.dateDebutReelle || w.dateDebutPrevue || undefined,
      endDate: w.dateFinReelle || w.dateFinPrevue || undefined,
      technicianId: w.technicienId?.toString() || undefined,
      assignedBy: w.statut !== 7 ? (w.responsableId?.toString() || '') : '',
      chefEquipeId: w.statut === 7 ? (w.responsableId?.toString() || undefined) : undefined,
      durationMinutes: w.durationMinutes || 120,
      diagnostic: w.diagnostic || undefined,
      solution: w.solution || undefined,
      partsUsed: [],
      externalCost: w.coutSousTraitance || 0,
      campaign: w.campagne?.nom || w.campagneNom || '',
      campagneId: w.campagneId || undefined
    };
  });
};

/**
 * Crée un nouvel ordre de travail
 * POST /api/OrdresTravail
 */
export const createWorkOrderApi = async (payload: CreateWorkOrderPayload): Promise<WorkOrder> => {
  const now = new Date().toISOString();
  const userStr = localStorage.getItem('gmao_current_user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;
  const activeTenantId = localStorage.getItem('gmao_impersonated_tenant_id') || localStorage.getItem('gmao_current_tenant_id');
  const activeTenantNumeric = activeTenantId && /^\d+$/.test(activeTenantId) ? parseInt(activeTenantId, 10) : null;

  const body: Record<string, any> = {
    numeroOT: '',
    demandeId: payload.incidentId ? parseInt(payload.incidentId, 10) : null,
    equipementId: parseInt(payload.equipmentId, 10),
    responsableId: payload.responsableId || currentUserId || 1,
    technicienId: payload.technicianId ? parseInt(payload.technicianId, 10) : null,
    priorite: mapWorkOrderPriorityToInt(payload.priority),
    typeMaintenance: mapWorkOrderTypeToInt(payload.type),
    statut: 1,
    dateCreation: now,
    dateDebutPrevue: null,
    dateFinPrevue: null,
    description: payload.title || payload.description,
    instructions: payload.description || null,
    coutMainOeuvre: null,
    coutPieces: null,
    coutSousTraitance: null,
    campagneId: payload.campagneId ?? null,
  };
  if (activeTenantNumeric && activeTenantNumeric > 0) {
    body.societeId = activeTenantNumeric;
  }

  try {
    const response = await apiClient.post('/api/OrdresTravail', body);
    const w = response.data;
    return {
      id: w.id?.toString(),
      numeroOT: w.numeroOT || `OT-${w.id}`,
      equipmentId: w.equipementId?.toString() || payload.equipmentId,
      title: payload.title || w.description || w.numeroOT || 'Ordre de Travail',
      description: payload.description || w.instructions || w.description || '',
      type: payload.type,
      priority: payload.priority,
      status: 'Brouillon',
      createdDate: w.dateCreation || now,
      startDate: undefined,
      endDate: undefined,
      technicianId: w.technicienId?.toString() || undefined,
      assignedBy: w.responsableId?.toString() || '1',
      durationMinutes: 0,
      partsUsed: [],
      externalCost: 0,
      campaign: '',
    };
  } catch (err: any) {
    let serverMsg = '';
    const resData = err?.response?.data;
    if (resData) {
      if (typeof resData === 'string') {
        serverMsg = resData;
      } else if (resData.errors && typeof resData.errors === 'object') {
        const errList = Object.values(resData.errors).flat();
        serverMsg = errList.join(' — ');
      } else if (resData.error) {
        serverMsg = resData.error;
      } else if (resData.title && resData.title !== 'One or more validation errors occurred.') {
        serverMsg = resData.title;
      } else if (resData.message) {
        serverMsg = resData.message;
      }
    }
    throw new Error(serverMsg || err?.message || 'Erreur lors de la création de l’ordre de travail');
  }
};

/**
 * Met à jour le statut et les détails d'un ordre de travail
 * PUT /api/OrdresTravail/{id}
 */
export const patchWorkOrderStatusApi = async (
  id: string,
  status: WorkOrder['status'],
  fullOt: WorkOrder,
  updates?: Partial<WorkOrder>
): Promise<void> => {
  const merged = { ...fullOt, ...updates, status };
  
  let statutOt = 1;
  switch (merged.status) {
    case 'En attente':    statutOt = 2; break;
    case 'Affecté Chef':  statutOt = 7; break;
    case 'Affecté':       statutOt = 2; break;
    case 'En cours':      statutOt = 3; break;
    case 'Suspendu':      statutOt = 4; break;
    case 'Terminé':       statutOt = 5; break;
    case 'Clôturé':       statutOt = 6; break;
  }

  const responsableId = merged.status === 'Affecté Chef' && merged.chefEquipeId
    ? parseInt(merged.chefEquipeId, 10)
    : (merged.assignedBy ? parseInt(merged.assignedBy, 10) : 1);

  const numericId = /^\d+$/.test(String(id)) ? parseInt(id, 10) : NaN;
  if (isNaN(numericId)) {
    throw new Error(`OT ${id} n'est pas encore synchronisé avec le serveur (id non numérique).`);
  }

  const toInt = (v: any) => {
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  };

  const body = {
    id: numericId,
    numeroOT: merged.numeroOT || `OT-${numericId}`,
    demandeId: merged.incidentId ? toInt(merged.incidentId) : null,
    equipementId: toInt(merged.equipmentId) ?? 0,
    responsableId: toInt(responsableId) ?? 0,
    technicienId: merged.technicianId ? toInt(merged.technicianId) : null,
    priorite: mapWorkOrderPriorityToInt(merged.priority),
    typeMaintenance: mapWorkOrderTypeToInt(merged.type),
    statut: statutOt,
    dateCreation: merged.createdDate,
    dateDebutPrevue: null,
    dateFinPrevue: null,
    dateDebutReelle: merged.startDate || null,
    dateFinReelle: merged.endDate || null,
    description: merged.title || merged.description || null,
    instructions: merged.solution || merged.description || null,
    coutMainOeuvre: null,
    coutPieces: merged.externalCost || null,
    coutSousTraitance: null,
    campagneId: merged.campagneId ?? null,
  };
  
  await apiClient.put(`/api/OrdresTravail/${numericId}`, body);
};

export const fetchWorkOrdersApiCall = async () => {
  const response = await apiClient.get('/api/OrdresTravail');
  return response.data;
};

export const fetchWorkOrderByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/OrdresTravail/${id}`);
  return response.data;
};

export const createWorkOrderApiCall = async (dto: CreateWorkOrderDto) => {
  const response = await apiClient.post('/api/OrdresTravail', dto);
  return response.data;
};

export const updateWorkOrderApiCall = async (id: number | string, dto: Partial<UpdateWorkOrderDto>) => {
  const response = await apiClient.put(`/api/OrdresTravail/${id}`, { id: Number(id), ...dto });
  return response.data;
};

export const deleteWorkOrderApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/OrdresTravail/${id}`);
};

export const fetchWorkOrdersApi = fetchWorkOrdersApiCall;
export const fetchWorkOrderByIdApi = fetchWorkOrderByIdApiCall;
