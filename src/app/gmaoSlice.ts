import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Tenant, User, Equipment, Incident, WorkOrder, SparePart, Supplier, Notification, UserAccount } from '@/shared/types/gmao';
import { AppRole } from '@/shared/permissions';
import { fetchEquipments, fetchSuppliers, fetchParts, fetchIncidents, fetchWorkOrders, fetchCampaigns, fetchTechnicians, fetchUsers, fetchTenants, createTenantApi, updateTenantApi, createIncidentApi, patchIncidentStatusApi, CreateIncidentPayload, createWorkOrderApi, CreateWorkOrderPayload } from '@/shared/api/dataFetch.api';

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

const getInitialTenants = (): Tenant[] => {
  const saved = localStorage.getItem('gmao_tenants_v8');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [
    {
      id: 'tenant-midi',
      name: 'Conserverie du Midi S.A.',
      domain: 'midi.com',
      status: 'Active',
      subscriptionPlan: 'Enterprise',
      createdAt: '2026-01-10T12:00:00Z',
      adminEmail: 'admin@midi.com',
      capacityTonsPerDay: 450,
      equipments: [],
      workOrders: [],
      incidents: [],
      technicians: [],
      parts: [],
      suppliers: [],
      campaigns: [],
      users: []
    }
  ];
};

const initialState: GmaoState = {
  tenants: getInitialTenants(),
  currentTenantId: localStorage.getItem('gmao_current_tenant_id') || 'tenant-midi',
  impersonatedTenantId: localStorage.getItem('gmao_impersonated_tenant_id'),
  currentUser: localStorage.getItem('gmao_current_user') ? JSON.parse(localStorage.getItem('gmao_current_user') as string) : null,
  darkMode: localStorage.getItem('gmao_dark_mode') ? JSON.parse(localStorage.getItem('gmao_dark_mode') as string) : false,
  selectedCampaign: 'Campagne 2026',
  rolePermissions: {},
  notifications: []
};

export const fetchTenantsAsync = createAsyncThunk(
  'gmao/fetchTenants',
  async () => {
    return await fetchTenants();
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
      users: []
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
      status: updated.isActive ? 'Active' : 'Suspended',
      subscriptionPlan: updated.subscriptionPlan || 'Basic',
      createdAt: updated.createdAt,
      adminEmail: updated.emailContact || '',
      capacityTonsPerDay: updated.capacityTonsPerDay || 450,
    };
  }
);

export const fetchTenantDataAsync = createAsyncThunk(
  'gmao/fetchTenantData',
  async () => {
    const [equipments, suppliers, parts, incidents, workOrders, campaigns, technicians, users] = await Promise.all([
      fetchEquipments(),
      fetchSuppliers(),
      fetchParts(),
      fetchIncidents(),
      fetchWorkOrders(),
      fetchCampaigns(),
      fetchTechnicians(),
      fetchUsers(),
    ]);
    return { equipments, suppliers, parts, incidents, workOrders, campaigns, technicians, users };
  }
);

/** POST /api/Incidents — create a new incident on the backend, then sync to Redux */
export const createIncidentAsync = createAsyncThunk(
  'gmao/createIncident',
  async (payload: CreateIncidentPayload) => {
    const incident = await createIncidentApi(payload);
    return incident;
  }
);

/** PUT /api/Incidents/{id} — update status on backend, then sync to Redux */
export const updateIncidentStatusAsync = createAsyncThunk(
  'gmao/updateIncidentStatus',
  async (payload: { id: string; status: Incident['status']; fullIncident: Incident; workOrderId?: string; commentaireRejet?: string }) => {
    await patchIncidentStatusApi(payload.id, payload.status, payload.fullIncident, payload.commentaireRejet);
    return { id: payload.id, status: payload.status, workOrderId: payload.workOrderId };
  }
);

/** POST /api/OrdresTravail — create a new Work Order on the backend, then sync to Redux */
export const createWorkOrderAsync = createAsyncThunk(
  'gmao/createWorkOrder',
  async (payload: CreateWorkOrderPayload & { incidentId?: string }) => {
    const workOrder = await createWorkOrderApi(payload);
    return { workOrder, incidentId: payload.incidentId };
  }
);
export const gmaoSlice = createSlice({
  name: 'gmao',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User, tenantId: string | null }>) => {
      state.currentUser = action.payload.user;
      state.currentTenantId = action.payload.tenantId;
      state.impersonatedTenantId = null;
      localStorage.setItem('gmao_current_user', JSON.stringify(action.payload.user));
      if (action.payload.tenantId) {
        localStorage.setItem('gmao_current_tenant_id', action.payload.tenantId);
      } else {
        localStorage.removeItem('gmao_current_tenant_id');
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.currentTenantId = 'tenant-midi';
      state.impersonatedTenantId = null;
      localStorage.removeItem('gmao_current_user');
      localStorage.setItem('gmao_current_tenant_id', 'tenant-midi');
    },
    impersonateTenant: (state, action: PayloadAction<string | null>) => {
      state.impersonatedTenantId = action.payload;
      if (action.payload) {
        localStorage.setItem('gmao_impersonated_tenant_id', action.payload);
      } else {
        localStorage.removeItem('gmao_impersonated_tenant_id');
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
          sensors: [
            { name: 'Température', value: 20.0, unit: '°C', status: 'normal', history: [20.0] },
            { name: 'Vibration', value: 0.5, unit: 'mm/s', status: 'normal', history: [0.5] }
          ]
        });
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
        const newId = `DI-2026-${String(tenant.incidents.length + 1).padStart(3, '0')}`;
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
        const newId = `OT-2026-${String(tenant.workOrders.length + 1).padStart(3, '0')}`;
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
          
          if (ot.status === 'En cours' && !ot.startDate) {
            ot.startDate = new Date().toISOString();
            const eq = tenant.equipments.find(e => e.id === ot.equipmentId);
            if (eq) eq.status = 'En maintenance';
          } else if (ot.status === 'Terminé' && !ot.endDate) {
            ot.endDate = new Date().toISOString();
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
        }
      }
    },
    updatePart: (state, action: PayloadAction<SparePart>) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        const index = tenant.parts.findIndex(p => p.ref === action.payload.ref);
        if (index !== -1) tenant.parts[index] = action.payload;
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
    syncToLocalStorage: (state) => {
      localStorage.setItem('gmao_tenants_v8', JSON.stringify(state.tenants));
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTenantDataAsync.fulfilled, (state, action) => {
      let tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (!tenant && state.currentTenantId) {
        tenant = {
          id: state.currentTenantId,
          name: 'Société',
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
          users: []
        };
        state.tenants.push(tenant);
      }
      if (tenant) {
        tenant.equipments = action.payload.equipments;
        tenant.suppliers = action.payload.suppliers;
        tenant.parts = action.payload.parts;
        tenant.incidents = action.payload.incidents;
        tenant.workOrders = action.payload.workOrders;
        tenant.campaigns = action.payload.campaigns;
        tenant.technicians = action.payload.technicians;
        tenant.users = action.payload.users;
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

    // When a new incident is created on the backend, prepend it to local state
    builder.addCase(createIncidentAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.incidents.unshift(action.payload);
        // Mark equipment as En panne for critical/high urgency
        if (action.payload.urgency === 'Critique' || action.payload.urgency === 'Haute') {
          const eq = tenant.equipments.find(e => e.id === action.payload.equipmentId);
          if (eq) { eq.status = 'En panne'; eq.healthIndex = 30; }
        }
      }
    });

    // When an incident status is updated on the backend, mirror it in local state
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

    // When a new OT is created on the backend, prepend it and update linked incident
    builder.addCase(createWorkOrderAsync.fulfilled, (state, action) => {
      const tenant = state.tenants.find(t => t.id === state.currentTenantId);
      if (tenant) {
        tenant.workOrders.unshift(action.payload.workOrder);
        // Transition the linked incident to "Transformé en OT"
        if (action.payload.incidentId) {
          const inc = tenant.incidents.find(i => i.id === action.payload.incidentId);
          if (inc) {
            inc.status = 'Transformé en OT';
            inc.workOrderId = action.payload.workOrder.id;
          }
        }
      }
    });
  }
});

export const {
  login, logout, toggleDarkMode, setSelectedCampaign, updateRolePermission,
  addEquipment, updateEquipmentStatus, deleteEquipment,
  addIncident, updateIncidentStatus, addWorkOrder, updateWorkOrderStatus,
  addPartMovement, updatePart, addSupplier, addNotification,
  markNotificationAsRead, markAllNotificationsAsRead, addUser,
  syncToLocalStorage, impersonateTenant, setTenantStatus
} = gmaoSlice.actions;

export default gmaoSlice.reducer;
