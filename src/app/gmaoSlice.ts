import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tenant, User, Equipment, Incident, WorkOrder, SparePart, Supplier, Notification, UserAccount } from '@/shared/types/gmao';
import { AppRole, AppModule, DataScope, RoleDefinition, DEFAULT_ROLE_PERMISSIONS } from '@/shared/permissions/permissions';
import { initialSuppliers, initialParts, initialTechnicians, initialUsers, initialEquipments, initialIncidents, initialWorkOrders, initialCampaigns } from '@/data/mockData';

interface GmaoState {
  tenants: Tenant[];
  currentTenantId: string | null;
  impersonatedTenantId: string | null;
  currentUser: User | null;
  darkMode: boolean;
  selectedCampaign: string;
  rolePermissions: Partial<Record<AppRole, RoleDefinition>>;
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
      equipments: initialEquipments,
      workOrders: initialWorkOrders,
      incidents: initialIncidents,
      technicians: initialTechnicians,
      parts: initialParts,
      suppliers: initialSuppliers,
      campaigns: initialCampaigns,
      users: initialUsers
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
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,
  notifications: []
};

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
    updateRolePermission: (state, action: PayloadAction<{role: AppRole, module: AppModule, act: string, scope: DataScope, isChecked: boolean}>) => {
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
  }
});

export const {
  login, logout, toggleDarkMode, setSelectedCampaign, updateRolePermission,
  addEquipment, updateEquipmentStatus, deleteEquipment,
  addIncident, updateIncidentStatus, addWorkOrder, updateWorkOrderStatus,
  addPartMovement, updatePart, addSupplier, addNotification,
  markNotificationAsRead, markAllNotificationsAsRead, addUser,
  syncToLocalStorage
} = gmaoSlice.actions;

export default gmaoSlice.reducer;
