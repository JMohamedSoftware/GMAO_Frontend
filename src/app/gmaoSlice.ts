/**
 * ============================================================================
 * ÉTAT GLOBAL REDUX : GMAO Store Slice (Données Dynamiques Centralisées)
 * ============================================================================
 * Gère l'état global partagé de l'application :
 * - Session utilisateur et tenant connecté
 * - Synchronisation asynchrone avec le backend REST
 * - Cache réactif pour les données partagées (Équipements, OTs, Stock, Incidents)
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Tenant, User, Equipment, Incident, WorkOrder, SparePart, Supplier, Notification, UserAccount, Equipe, Technician } from '@/shared/types/gmao';
import { 
  fetchBootstrapDataApi,
  fetchEquipments, 
  fetchSuppliers, 
  fetchParts, 
  fetchIncidents, 
  fetchWorkOrders, 
  fetchCampaigns, 
  fetchTechnicians, 
  fetchUsers, 
  fetchTenants, 
  createTenantApi, 
  updateTenantApi, 
  createIncidentApi, 
  patchIncidentStatusApi, 
  CreateIncidentPayload, 
  createWorkOrderApi, 
  CreateWorkOrderPayload, 
  patchWorkOrderStatusApi, 
  updateEquipmentStatusApi, 
  createEquipmentApi, 
  updateEquipmentApi, 
  createPartApi, 
  updatePartApi, 
  createMovementApi, 
  fetchMovements, 
  fetchEquipes, 
  createEquipeApi, 
  updateEquipeApi, 
  deleteEquipeApi, 
  createSupplierApi, 
  updateSupplierApi, 
  deleteSupplierApi 
} from '@/shared/api/dataFetch.api';

interface GmaoState {
  tenants: Tenant[];
  currentTenantId: string | null;
  impersonatedTenantId: string | null;
  currentUser: User | null;
  darkMode: boolean;
  selectedCampaign: string;
  rolePermissions: Record<string, any>;
  notifications: Notification[];
}

const getInitialImpersonatedTenant = (): string | null => {
  try {
    const val = localStorage.getItem('gmao_impersonated_tenant_id');
    if (!val || val === 'null' || val === 'undefined') {
      localStorage.removeItem('gmao_impersonated_tenant_id');
      return null;
    }
    return val;
  } catch {
    return null;
  }
};

// État initial 100% dynamique (aucune donnée en dur)
const initialState: GmaoState = {
  tenants: [],
  currentTenantId: localStorage.getItem('gmao_current_tenant_id') || null,
  impersonatedTenantId: getInitialImpersonatedTenant(),
  currentUser: localStorage.getItem('gmao_current_user') ? JSON.parse(localStorage.getItem('gmao_current_user') as string) : null,
  darkMode: localStorage.getItem('gmao_dark_mode') ? JSON.parse(localStorage.getItem('gmao_dark_mode') as string) : false,
  selectedCampaign: '',
  rolePermissions: {},
  notifications: []
};

// ─── THUNKS ASYNCHRONES (Backend API Sync avec Déduplication & Singleton) ─────────────

let activeTenantsPromise: Promise<any> | null = null;
let lastTenantsFetchTime = 0;

let activeTenantDataPromise: Promise<any> | null = null;
let lastTenantDataFetchTime = 0;
const FETCH_COOLDOWN_MS = 6000; // 6 seconds debounce window

export const fetchTenantsAsync = createAsyncThunk<Tenant[], boolean | { force?: boolean } | void>(
  'gmao/fetchTenants',
  async (arg) => {
    if (activeTenantsPromise) {
      return await activeTenantsPromise;
    }
    activeTenantsPromise = (async () => {
      try {
        const res = await fetchTenants();
        lastTenantsFetchTime = Date.now();
        return res;
      } finally {
        activeTenantsPromise = null;
      }
    })();
    return await activeTenantsPromise;
  },
  {
    condition: (arg) => {
      const isForce = typeof arg === 'boolean' ? arg : !!(arg as any)?.force;
      if (isForce) return true;
      if (activeTenantsPromise) return false;
      if (Date.now() - lastTenantsFetchTime < FETCH_COOLDOWN_MS) return false;
      return true;
    }
  }
);

export const createTenantAsync = createAsyncThunk(
  'gmao/createTenant',
  async (tenantData: any) => {
    const created = await createTenantApi(tenantData);
    return {
      id: created.codeTenant,
      dbId: created.id,
      name: created.nom,
      domain: created.adresse || '',
      status: created.isActive ? 'Active' : 'Suspended',
      subscriptionPlan: created.subscriptionPlan || 'Basic',
      createdAt: created.createdAt,
      adminEmail: created.emailContact || '',
      capacityTonsPerDay: created.capacityTonsPerDay || 450,
      equipments: [],
      workOrders: [],
      incidents: [],
      technicians: [],
      parts: [],
      suppliers: [],
      campaigns: [],
      equipes: [],
      users: [],
      movementLogs: []
    } as Tenant;
  }
);

export const updateTenantAsync = createAsyncThunk(
  'gmao/updateTenant',
  async (payload: { dbId: number; tenantData: any }) => {
    const updated = await updateTenantApi(payload.dbId, payload.tenantData);
    return {
      id: updated.codeTenant,
      dbId: updated.id,
      name: updated.nom,
      domain: updated.adresse || '',
      status: (updated.isActive ? 'Active' : 'Suspended') as 'Active' | 'Suspended',
      subscriptionPlan: (updated.subscriptionPlan || 'Basic') as 'Basic' | 'Premium' | 'Enterprise',
      createdAt: updated.createdAt,
      adminEmail: updated.emailContact || '',
      capacityTonsPerDay: updated.capacityTonsPerDay || 450,
    };
  }
);

export const fetchTenantDataAsync = createAsyncThunk<
  {
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
  },
  boolean | { force?: boolean } | void
>(
  'gmao/fetchTenantData',
  async (arg) => {
    if (activeTenantDataPromise) {
      return await activeTenantDataPromise;
    }

    activeTenantDataPromise = (async () => {
      try {
        // 1. Tenter l'endpoint bootstrap agrégé ultra-rapide (1 seule requête réseau)
        const bootstrapResult = await fetchBootstrapDataApi();
        if (bootstrapResult) {
          lastTenantDataFetchTime = Date.now();
          return bootstrapResult;
        }

        // 2. Repli résilient par requêtes modulaires parallèles si bootstrap non disponible
        const [
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
        ] = await Promise.all([
          fetchEquipments().catch(e => { console.warn('[fetchEquipments failed]', e); return []; }),
          fetchSuppliers().catch(e => { console.warn('[fetchSuppliers failed]', e); return []; }),
          fetchParts().catch(e => { console.warn('[fetchParts failed]', e); return []; }),
          fetchIncidents().catch(e => { console.warn('[fetchIncidents failed]', e); return []; }),
          fetchWorkOrders().catch(e => { console.warn('[fetchWorkOrders failed]', e); return []; }),
          fetchCampaigns().catch(e => { console.warn('[fetchCampaigns failed]', e); return []; }),
          fetchTechnicians().catch(e => { console.warn('[fetchTechnicians failed]', e); return []; }),
          fetchUsers().catch(e => { console.warn('[fetchUsers failed]', e); return []; }),
          fetchMovements().catch(e => { console.warn('[fetchMovements failed]', e); return []; }),
          fetchEquipes().catch(e => { console.warn('[fetchEquipes failed]', e); return []; }),
        ]);

        lastTenantDataFetchTime = Date.now();
        return { equipments, suppliers, parts, incidents, workOrders, campaigns, technicians, users, movements, equipes };
      } finally {
        activeTenantDataPromise = null;
      }
    })();

    return await activeTenantDataPromise;
  },
  {
    condition: (arg) => {
      const isForce = typeof arg === 'boolean' ? arg : !!(arg as any)?.force;
      if (isForce) return true;
      if (activeTenantDataPromise) return false;
      if (Date.now() - lastTenantDataFetchTime < FETCH_COOLDOWN_MS) return false;
      return true;
    }
  }
);

export const createIncidentAsync = createAsyncThunk(
  'gmao/createIncident',
  async (payload: CreateIncidentPayload) => {
    const incident = await createIncidentApi(payload);
    if (incident.urgency === 'Critique' || incident.urgency === 'Haute') {
      await updateEquipmentStatusApi(incident.equipmentId, 'En panne');
    }
    return incident;
  }
);

export const updateIncidentStatusAsync = createAsyncThunk(
  'gmao/updateIncidentStatus',
  async (payload: { id: string; status: Incident['status']; fullIncident: Incident; workOrderId?: string; commentaireRejet?: string }) => {
    await patchIncidentStatusApi(payload.id, payload.status, payload.fullIncident, payload.commentaireRejet);
    return { id: payload.id, status: payload.status, workOrderId: payload.workOrderId };
  }
);

export const createEquipmentAsync = createAsyncThunk(
  'gmao/createEquipment',
  async (payload: Partial<Equipment>) => {
    return await createEquipmentApi(payload);
  }
);

export const updateEquipmentAsync = createAsyncThunk(
  'gmao/updateEquipment',
  async (payload: { id: string; updates: Partial<Equipment> }) => {
    await updateEquipmentApi(payload.id, payload.updates);
    return { id: payload.id, updates: payload.updates };
  }
);

export const createWorkOrderAsync = createAsyncThunk(
  'gmao/createWorkOrder',
  async (payload: CreateWorkOrderPayload & { incidentId?: string }) => {
    const workOrder = await createWorkOrderApi(payload);
    if (payload.type === 'Correctif' || payload.priority === 'Critique' || payload.priority === 'Haute') {
      await updateEquipmentStatusApi(payload.equipmentId, 'En panne');
    }
    return { workOrder, incidentId: payload.incidentId, equipmentId: payload.equipmentId, type: payload.type };
  }
);

export const updateWorkOrderStatusAsync = createAsyncThunk(
  'gmao/updateWorkOrderStatus',
  async (payload: { id: string; status: WorkOrder['status']; fullOt: WorkOrder; updates?: Partial<WorkOrder> }) => {
    try {
      await patchWorkOrderStatusApi(payload.id, payload.status, payload.fullOt, payload.updates);
    } catch (err: any) {
      const serverMsg = err?.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : (err.response.data.title || err.response.data.message || JSON.stringify(err.response.data)))
        : err?.message;
      const code = err?.response?.status ? `HTTP ${err.response.status} – ` : '';
      throw new Error(`${code}${serverMsg || 'Erreur réseau'}`);
    }
    
    try {
      if (payload.status === 'En cours') {
        await updateEquipmentStatusApi(payload.fullOt.equipmentId, 'En maintenance');
      } else if (payload.status === 'Terminé' || payload.status === 'Clôturé') {
        await updateEquipmentStatusApi(payload.fullOt.equipmentId, 'En service');
      }
    } catch (e) {
      console.warn('[OT] Mise à jour statut équipement ignorée:', e);
    }

    return { id: payload.id, status: payload.status, updates: payload.updates, equipmentId: payload.fullOt.equipmentId };
  }
);

export const createPartAsync = createAsyncThunk(
  'gmao/createPart',
  async (payload: SparePart) => {
    const created = await createPartApi(payload);
    return { ...payload, id: created.id?.toString() || created.Id?.toString() };
  }
);

export const updatePartAsync = createAsyncThunk(
  'gmao/updatePart',
  async (payload: SparePart) => {
    if (payload.id) {
       await updatePartApi(payload.id, payload);
    } else {
       const created = await createPartApi(payload);
       return { ...payload, id: created.id?.toString() || created.Id?.toString() };
    }
    return payload;
  }
);

export const createMovementAsync = createAsyncThunk(
  'gmao/createMovement',
  async (payload: { pieceId: string, qty: number, type: 'in' | 'out', otId?: string, reason?: string, userId: string }) => {
    return await createMovementApi(payload);
  }
);

export const createEquipeAsync = createAsyncThunk(
  'gmao/createEquipe',
  async (payload: Omit<Equipe, 'id'>) => {
    return await createEquipeApi(payload);
  }
);

export const updateEquipeAsync = createAsyncThunk(
  'gmao/updateEquipe',
  async (payload: Equipe) => {
    await updateEquipeApi(payload.id, payload);
    return payload;
  }
);

export const deleteEquipeAsync = createAsyncThunk(
  'gmao/deleteEquipe',
  async (id: string) => {
    await deleteEquipeApi(id);
    return id;
  }
);

export const createSupplierAsync = createAsyncThunk(
  'gmao/createSupplier',
  async (payload: Supplier) => {
    return await createSupplierApi(payload);
  }
);

export const updateSupplierAsync = createAsyncThunk(
  'gmao/updateSupplier',
  async (payload: { id: string; supplier: Partial<Supplier> }) => {
    return await updateSupplierApi(payload.id, payload.supplier);
  }
);

export const deleteSupplierAsync = createAsyncThunk(
  'gmao/deleteSupplier',
  async (id: string) => {
    await deleteSupplierApi(id);
    return id;
  }
);

// ─── SLICE REDUX ────────────────────────────────────────────────────────────

export const gmaoSlice = createSlice({
  name: 'gmao',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User, tenantId: string | null, tenantName?: string }>) => {
      state.currentUser = action.payload.user;
      state.currentTenantId = action.payload.tenantId;
      state.impersonatedTenantId = null;
      try {
        localStorage.removeItem('gmao_impersonated_tenant_id');
      } catch {}
      localStorage.setItem('gmao_current_user', JSON.stringify(action.payload.user));
      if (action.payload.tenantId) {
        localStorage.setItem('gmao_current_tenant_id', action.payload.tenantId);
        const resolvedName = action.payload.tenantName || action.payload.user.tenantName || action.payload.user.company || 'Société';
        let existingTenant = state.tenants.find(t => t.id === action.payload.tenantId);
        if (!existingTenant) {
          state.tenants.push({
            id: action.payload.tenantId,
            name: resolvedName,
            domain: '',
            status: 'Active',
            subscriptionPlan: 'Enterprise',
            createdAt: new Date().toISOString(),
            adminEmail: action.payload.user.email,
            capacityTonsPerDay: 450,
            equipments: [],
            workOrders: [],
            incidents: [],
            technicians: [],
            parts: [],
            suppliers: [],
            campaigns: [],
            equipes: [],
            users: [],
            movementLogs: []
          });
        } else if (resolvedName && resolvedName !== 'Société') {
          existingTenant.name = resolvedName;
        }
      } else {
        localStorage.removeItem('gmao_current_tenant_id');
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.currentTenantId = null;
      state.impersonatedTenantId = null;
      try {
        localStorage.removeItem('gmao_impersonated_tenant_id');
        localStorage.removeItem('gmao_current_user');
        localStorage.removeItem('gmao_session');
        localStorage.removeItem('gmao_access_token');
        localStorage.removeItem('gmao_refresh_token');
        localStorage.removeItem('gmao_current_tenant_id');
      } catch {}
    },
    impersonateTenant: (state, action: PayloadAction<string | null>) => {
      if (action.payload && action.payload !== 'null' && action.payload !== 'undefined') {
        state.impersonatedTenantId = action.payload;
        try {
          localStorage.setItem('gmao_impersonated_tenant_id', action.payload);
        } catch {}
      } else {
        state.impersonatedTenantId = null;
        try {
          localStorage.removeItem('gmao_impersonated_tenant_id');
        } catch {}
      }
    },
    setTenantStatus: (state, action: PayloadAction<{ id: string; status: 'Active' | 'Suspended' | 'Pending' }>) => {
      const tenant = state.tenants.find(t => t.id === action.payload.id);
      if (tenant) {
        tenant.status = action.payload.status;
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('gmao_dark_mode', JSON.stringify(state.darkMode));
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setSelectedCampaign: (state, action: PayloadAction<string>) => {
      state.selectedCampaign = action.payload;
    },
    updateRolePermission: (state, action: PayloadAction<{role: any, module: any, act: string, scope: any, isChecked: boolean}>) => {
      const { role, module, act, scope, isChecked } = action.payload;
      if (!state.rolePermissions[role]) state.rolePermissions[role] = {} as any;
      const roleDef = state.rolePermissions[role] as any;
      if (!roleDef[module]) roleDef[module] = { actions: [], scope: 'mes_donnees' };
      
      const mod = roleDef[module];
      mod.scope = scope;
      
      const hasAction = mod.actions.includes(act);
      if (isChecked && !hasAction) {
        mod.actions.push(act);
      } else if (!isChecked && hasAction) {
        mod.actions = mod.actions.filter((a: string) => a !== act);
      }
    },
    addEquipment: (state, action: PayloadAction<Omit<Equipment, 'healthIndex' | 'sensors' | 'hoursCount' | 'cycleCount'>>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.equipments.push({
          ...action.payload,
          healthIndex: 100, hoursCount: 0, cycleCount: 0,
          sensors: []
        });
      }
    },
    updateEquipment: (state, action: PayloadAction<{id: string, updates: Partial<Equipment>}>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const idx = tenant.equipments.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) {
          tenant.equipments[idx] = { ...tenant.equipments[idx], ...action.payload.updates };
        }
      }
    },
    updateEquipmentStatus: (state, action: PayloadAction<{id: string, status: Equipment['status'], healthIndex?: number}>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const eq = tenant.equipments.find(e => e.id === action.payload.id);
        if (eq) {
          eq.status = action.payload.status;
          if (action.payload.healthIndex !== undefined) eq.healthIndex = action.payload.healthIndex;
        }
      }
    },
    deleteEquipment: (state, action: PayloadAction<string>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const removeIds = new Set([action.payload]);
        let changed = true;
        while (changed) {
          changed = false;
          tenant.equipments.forEach(e => {
            if (e.parentId && removeIds.has(e.parentId) && !removeIds.has(e.id)) {
              removeIds.add(e.id);
              changed = true;
            }
          });
        }
        tenant.equipments = tenant.equipments.filter(e => !removeIds.has(e.id));
      }
    },
    addIncident: (state, action: PayloadAction<Omit<Incident, 'id' | 'reportedDate' | 'status'>>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const currentYear = new Date().getFullYear();
        const newId = `DI-${currentYear}-${String(tenant.incidents.length + 1).padStart(3, '0')}`;
        tenant.incidents.unshift({
          ...action.payload, id: newId, reportedDate: new Date().toISOString(), status: 'Nouveau'
        });
        if (action.payload.urgency === 'Critique' || action.payload.urgency === 'Haute') {
          const eq = tenant.equipments.find(e => e.id === action.payload.equipmentId);
          if (eq) { eq.status = 'En panne'; eq.healthIndex = 30; }
        }
      }
    },
    updateIncidentStatus: (state, action: PayloadAction<{id: string, status: Incident['status'], workOrderId?: string}>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const inc = tenant.incidents.find(i => i.id === action.payload.id);
        if (inc) {
          inc.status = action.payload.status;
          if (action.payload.workOrderId) inc.workOrderId = action.payload.workOrderId;
        }
      }
    },
    addWorkOrder: (state, action: PayloadAction<{ot: Omit<WorkOrder, 'id' | 'createdDate' | 'status' | 'partsUsed' | 'durationMinutes' | 'externalCost'>, incidentId?: string}>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const { ot, incidentId } = action.payload;
        const currentYear = new Date().getFullYear();
        const newId = `OT-${currentYear}-${String(tenant.workOrders.length + 1).padStart(3, '0')}`;
        tenant.workOrders.unshift({
          ...ot, id: newId, status: 'En attente', createdDate: new Date().toISOString(), partsUsed: [], durationMinutes: 0, externalCost: 0
        });
        if (ot.technicianId) {
          const tech = tenant.technicians.find(t => t.id === ot.technicianId);
          if (tech) tech.status = 'Occupé';
        }
        if (incidentId) {
          const inc = tenant.incidents.find(i => i.id === incidentId);
          if (inc) { inc.status = 'Transformé en OT'; inc.workOrderId = newId; }
        } else {
          const inc = tenant.incidents.find(i => i.equipmentId === ot.equipmentId && i.status !== 'Transformé en OT');
          if (inc) { inc.status = 'Transformé en OT'; inc.workOrderId = newId; }
        }
      }
    },
    updateWorkOrderStatus: (state, action: PayloadAction<{id: string, status: WorkOrder['status'], updates?: Partial<WorkOrder>}>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const ot = tenant.workOrders.find(o => o.id === action.payload.id);
        if (ot) {
          ot.status = action.payload.status;
          if (action.payload.updates) Object.assign(ot, action.payload.updates);
          
          if (ot.status === 'Affecté Chef' && ot.chefEquipeId) {
            state.notifications.unshift({
              id: `NOT-${Date.now()}`,
              type: 'workorder',
              severity: 'info',
              title: '📋 OT à planifier',
              message: `L'OT « ${ot.title} » vous a été confié par le Responsable`,
              date: new Date().toISOString(),
              read: false,
              targetUserId: ot.chefEquipeId,
            });
          }

          if (ot.status === 'Affecté' && ot.technicianId) {
            state.notifications.unshift({
              id: `NOT-${Date.now() + 1}`,
              type: 'workorder',
              severity: 'info',
              title: '🛠️ OT assigné',
              message: `L'OT « ${ot.title} » vous a été assigné par le Chef d'équipe`,
              date: new Date().toISOString(),
              read: false,
              targetUserId: ot.technicianId,
            });
          }

          if (ot.status === 'En cours') {
            if (!ot.startDate) ot.startDate = new Date().toISOString();
            const eq = tenant.equipments.find(e => e.id === ot.equipmentId);
            if (eq) eq.status = 'En maintenance';
          } else if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
            if (!ot.endDate) ot.endDate = new Date().toISOString();
            const eq = tenant.equipments.find(e => e.id === ot.equipmentId);
            if (eq) { eq.status = 'En service'; eq.healthIndex = 95; }
          }

          if ((ot.status === 'Terminé' || ot.status === 'Clôturé') && ot.technicianId) {
            const tech = tenant.technicians.find(t => t.id === ot.technicianId);
            if (tech) tech.status = 'Disponible';
          }
        }
      }
    },
    addPartMovement: (state, action: PayloadAction<{ref: string, qty: number, type: 'in' | 'out', otId?: string}>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const part = tenant.parts.find(p => p.ref === action.payload.ref);
        if (part) {
          if (action.payload.type === 'in') {
            part.stockCurrent += action.payload.qty;
          } else if (part.stockCurrent >= action.payload.qty) {
            part.stockCurrent -= action.payload.qty;
          }
          if (!tenant.movementLogs) tenant.movementLogs = [];
          tenant.movementLogs.unshift({
            id: `MOV-${String(Date.now()).slice(-4)}`,
            partRef: action.payload.ref,
            qty: action.payload.qty,
            type: action.payload.type,
            reason: action.payload.otId ? `Consommation OT: ${action.payload.otId}` : (action.payload.type === 'in' ? 'Approvisionnement manuel' : 'Sortie manuelle'),
            date: new Date().toISOString(),
            category: action.payload.otId ? 'Maintenance' : 'Manuel',
            otId: action.payload.otId
          });

          if (action.payload.otId) {
            const ot = tenant.workOrders.find(o => o.id === action.payload.otId);
            if (ot) {
              const current = ot.partsUsed || [];
              if (action.payload.type === 'out') {
                const existing = current.find(p => p.partRef === action.payload.ref);
                if (existing) {
                  existing.quantity += action.payload.qty;
                } else {
                  ot.partsUsed = [...current, { partRef: action.payload.ref, quantity: action.payload.qty }];
                }
              } else {
                ot.partsUsed = current.filter(p => p.partRef !== action.payload.ref);
              }
            }
          }
        }
      }
    },

    updatePart: (state, action: PayloadAction<SparePart>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const index = tenant.parts.findIndex(p => p.ref === action.payload.ref);
        if (index !== -1) {
          tenant.parts[index] = action.payload;
        } else {
          tenant.parts.unshift(action.payload);
        }
      }
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.suppliers.push(action.payload);
      }
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'date' | 'read'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: `NOT-${String(Date.now())}`,
        date: new Date().toISOString(),
        read: false
      });
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find(n => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    addUser: (state, action: PayloadAction<UserAccount>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        if (!tenant.users) tenant.users = [];
        tenant.users.push(action.payload);
      }
    },

    addEquipe: (state, action: PayloadAction<Omit<Equipe, 'id'>>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        if (!tenant.equipes) tenant.equipes = [];
        tenant.equipes.push({ ...action.payload, id: `EQ-${Date.now()}` });
      }
    },
    updateEquipe: (state, action: PayloadAction<Equipe>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && tenant.equipes) {
        const idx = tenant.equipes.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) tenant.equipes[idx] = action.payload;
      }
    },
    deleteEquipe: (state, action: PayloadAction<string>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && tenant.equipes) {
        tenant.equipes = tenant.equipes.filter(e => e.id !== action.payload);
      }
    },

    syncToLocalStorage: (state) => {
      if (state.tenants && state.tenants.length > 0) {
        localStorage.setItem('gmao_tenants_v8', JSON.stringify(state.tenants));
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTenantDataAsync.fulfilled, (state, action) => {
      let tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (!tenant && state.currentTenantId) {
        tenant = {
          id: state.currentTenantId,
          name: state.currentUser?.tenantName || state.currentUser?.company || 'Société',
          domain: '',
          status: 'Active',
          subscriptionPlan: 'Enterprise',
          createdAt: new Date().toISOString(),
          adminEmail: state.currentUser?.email || '',
          capacityTonsPerDay: 450,
          equipments: [],
          workOrders: [],
          incidents: [],
          technicians: [],
          parts: [],
          suppliers: [],
          campaigns: [],
          equipes: [],
          users: [],
          movementLogs: []
        };
        state.tenants.push(tenant);
      } else if (tenant && (state.currentUser?.tenantName || state.currentUser?.company)) {
        tenant.name = state.currentUser?.tenantName || state.currentUser?.company || tenant.name;
      }

      if (tenant) {
        tenant.equipments = action.payload.equipments || [];
        tenant.suppliers = action.payload.suppliers || [];
        tenant.parts = action.payload.parts || [];
        tenant.incidents = action.payload.incidents || [];
        tenant.workOrders = action.payload.workOrders || [];
        tenant.campaigns = action.payload.campaigns || [];
        tenant.technicians = action.payload.technicians || [];
        tenant.users = action.payload.users || [];
        tenant.equipes = action.payload.equipes || [];
        if (action.payload.movements) tenant.movementLogs = action.payload.movements;

        // Auto-link work orders with incidents so incidents know their real OT
        const woByIncidentId = new Map<string, WorkOrder>();
        (tenant.workOrders || []).forEach(wo => {
          if (wo.incidentId) {
            woByIncidentId.set(String(wo.incidentId), wo);
          }
        });
        (tenant.incidents || []).forEach(inc => {
          const wo = woByIncidentId.get(String(inc.id));
          if (wo) {
            inc.workOrderId = String(wo.id);
            (inc as any).workOrderNumero = wo.numeroOT;
            if (inc.status === 'Nouveau' || inc.status === 'Validé') {
              inc.status = 'Transformé en OT';
            }
          }
        });

        // Sélection dynamique de la campagne en cours si non définie ou si clôturée
        const currentSelectedCamp = tenant.campaigns.find(c => c.name === state.selectedCampaign);
        if ((!state.selectedCampaign || (currentSelectedCamp && (currentSelectedCamp.status === 'Terminée' || (currentSelectedCamp.status as string) === 'Clôturée'))) && tenant.campaigns.length > 0) {
          const activeCamp = tenant.campaigns.find(c => c.status === 'En cours') || tenant.campaigns[0];
          state.selectedCampaign = activeCamp.name;
        }

        // Recalcul des pièces consommées par OT
        tenant.workOrders.forEach(ot => {
          const consumedParts = tenant!.movementLogs
            .filter(m => m.otId === ot.id && m.type === 'out')
            .reduce<{ partRef: string, quantity: number }[]>((acc, m) => {
              const existing = acc.find((p: { partRef: string, quantity: number }) => p.partRef === m.partRef);
              if (existing) {
                existing.quantity += m.qty;
              } else {
                acc.push({ partRef: m.partRef, quantity: m.qty });
              }
              return acc;
            }, []);
          ot.partsUsed = consumedParts;
        });
      }
    });

    builder.addCase(fetchTenantsAsync.fulfilled, (state, action) => {
      action.payload.forEach(fetched => {
        const existing = state.tenants.find(t => t.id === fetched.id);
        if (existing) {
          existing.dbId = fetched.dbId;
          existing.name = fetched.name;
          existing.domain = fetched.domain;
          existing.status = fetched.status;
          existing.subscriptionPlan = fetched.subscriptionPlan;
          existing.adminEmail = fetched.adminEmail;
          existing.capacityTonsPerDay = fetched.capacityTonsPerDay;
        } else {
          state.tenants.push(fetched);
        }
      });
    });

    builder.addCase(createTenantAsync.fulfilled, (state, action) => {
      state.tenants.push(action.payload);
    });

    builder.addCase(updateTenantAsync.fulfilled, (state, action) => {
      const existing = state.tenants.find(t => t.id === action.payload.id);
      if (existing) {
        existing.dbId = action.payload.dbId;
        existing.name = action.payload.name;
        existing.domain = action.payload.domain;
        existing.status = action.payload.status;
        existing.subscriptionPlan = action.payload.subscriptionPlan;
        existing.adminEmail = action.payload.adminEmail;
        existing.capacityTonsPerDay = action.payload.capacityTonsPerDay;
      }
    });

    builder.addCase(createIncidentAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.incidents.unshift(action.payload);
        if (action.payload.urgency === 'Critique' || action.payload.urgency === 'Haute') {
          const eq = tenant.equipments.find(e => e.id === action.payload.equipmentId);
          if (eq) { eq.status = 'En panne'; eq.healthIndex = 30; }
        }
      }
    });

    builder.addCase(updateIncidentStatusAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const inc = tenant.incidents.find(i => i.id === action.payload.id);
        if (inc) {
          inc.status = action.payload.status;
          if (action.payload.workOrderId) inc.workOrderId = action.payload.workOrderId;
        }
      }
    });

    builder.addCase(createWorkOrderAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.workOrders.unshift(action.payload.workOrder);
        if (action.payload.incidentId) {
          const inc = tenant.incidents.find(i => i.id === action.payload.incidentId);
          if (inc) {
            inc.status = 'Transformé en OT';
            inc.workOrderId = action.payload.workOrder.id;
          }
        }
        if (action.payload.workOrder.technicianId) {
          state.notifications.unshift({
            id: `NOT-${Date.now()}`,
            type: 'workorder',
            severity: 'info',
            title: '📋 Nouvel OT assigné',
            message: `L'OT « ${action.payload.workOrder.title} » vous a été assigné`,
            date: new Date().toISOString(),
            read: false,
            targetUserId: action.payload.workOrder.technicianId,
          });
        }
        if (action.payload.type === 'Correctif' || action.payload.workOrder.type === 'Correctif') {
          const eqId = action.payload.equipmentId || action.payload.workOrder.equipmentId;
          const eq = tenant.equipments.find(e => e.id === eqId);
          if (eq) {
            eq.status = 'En panne';
            eq.healthIndex = 30;
          }
        }
      }
    });

    builder.addCase(updateWorkOrderStatusAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const ot = tenant.workOrders.find(o => o.id === action.payload.id);
        if (ot) {
          ot.status = action.payload.status;
          if (action.payload.updates) Object.assign(ot, action.payload.updates);
          
          if (ot.status === 'Affecté Chef' && ot.chefEquipeId) {
            state.notifications.unshift({
              id: `NOT-${Date.now()}`,
              type: 'workorder',
              severity: 'info',
              title: '📋 OT à planifier',
              message: `L'OT « ${ot.title} » vous a été confié. Affectez un technicien.`,
              date: new Date().toISOString(),
              read: false,
              targetUserId: ot.chefEquipeId,
            });
          }

          if (ot.status === 'Affecté' && ot.technicianId) {
            state.notifications.unshift({
              id: `NOT-${Date.now() + 1}`,
              type: 'workorder',
              severity: 'info',
              title: '🛠️ OT assigné',
              message: `L'OT « ${ot.title} » vous a été assigné. Vous pouvez le démarrer.`,
              date: new Date().toISOString(),
              read: false,
              targetUserId: ot.technicianId,
            });
          }

          if (ot.status === 'En cours') {
            if (!ot.startDate) ot.startDate = new Date().toISOString();
            const eq = tenant.equipments.find(e => e.id === ot.equipmentId);
            if (eq) eq.status = 'En maintenance';
          } else if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
            if (!ot.endDate) ot.endDate = new Date().toISOString();
            const eq = tenant.equipments.find(e => e.id === ot.equipmentId);
            if (eq) { eq.status = 'En service'; eq.healthIndex = 95; }
          }

          if ((ot.status === 'Terminé' || ot.status === 'Clôturé') && ot.technicianId) {
            const tech = tenant.technicians.find(t => t.id === ot.technicianId);
            if (tech) tech.status = 'Disponible';
          }
        }
      }
    });

    builder.addCase(createEquipmentAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.equipments.push(action.payload);
      }
    });

    builder.addCase(updateEquipmentAsync.fulfilled, (state, action) => {
      const activeTenantId = state.impersonatedTenantId || state.currentTenantId;
      const tenant = state.tenants.find(t => t.id === activeTenantId) || state.tenants[0];
      if (tenant) {
        const idx = tenant.equipments.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) {
          const updates = { ...action.payload.updates };
          if (updates.category && !updates.subFamily) {
            updates.subFamily = updates.category;
          }
          tenant.equipments[idx] = { ...tenant.equipments[idx], ...updates };
        }
      }
    });

    builder.addCase(createPartAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && action.payload) {
        const existingIdx = tenant.parts.findIndex(p => p.ref === action.payload.ref || (action.payload.id && p.id === action.payload.id));
        if (existingIdx !== -1) {
          tenant.parts[existingIdx] = action.payload;
        } else {
          tenant.parts.unshift(action.payload);
        }
      }
    });

    builder.addCase(updatePartAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const idx = tenant.parts.findIndex(p => p.ref === action.payload.ref);
        if (idx !== -1) {
          tenant.parts[idx] = action.payload;
        } else {
          tenant.parts.unshift(action.payload);
        }
      }
    });

    builder.addCase(createEquipeAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        if (!tenant.equipes) tenant.equipes = [];
        tenant.equipes.push(action.payload);
      }
    });

    builder.addCase(updateEquipeAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && tenant.equipes) {
        const idx = tenant.equipes.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) tenant.equipes[idx] = action.payload;
      }
    });

    builder.addCase(deleteEquipeAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && tenant.equipes) {
        tenant.equipes = tenant.equipes.filter(e => e.id !== action.payload);
      }
    });

    builder.addCase(createSupplierAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        if (!tenant.suppliers) tenant.suppliers = [];
        tenant.suppliers.unshift(action.payload);
      }
    });

    builder.addCase(updateSupplierAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && tenant.suppliers) {
        const idx = tenant.suppliers.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          tenant.suppliers[idx] = { ...tenant.suppliers[idx], ...action.payload };
        }
      }
    });

    builder.addCase(deleteSupplierAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant && tenant.suppliers) {
        tenant.suppliers = tenant.suppliers.filter(s => s.id !== action.payload);
      }
    });
  }
});

export const {
  login, logout, toggleDarkMode, setSelectedCampaign, updateRolePermission,
  addEquipment, updateEquipment, updateEquipmentStatus, deleteEquipment,
  addIncident, updateIncidentStatus, addWorkOrder, updateWorkOrderStatus,
  addPartMovement, updatePart, addSupplier, addNotification,
  markNotificationAsRead, markAllNotificationsAsRead, addUser,
  addEquipe, updateEquipe, deleteEquipe,
  syncToLocalStorage, impersonateTenant, setTenantStatus
} = gmaoSlice.actions;

export default gmaoSlice.reducer;
