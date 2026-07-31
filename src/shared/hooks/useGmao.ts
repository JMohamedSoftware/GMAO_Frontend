import { useAppSelector, useAppDispatch } from '@/app/hooks';
import * as actions from '@/app/gmaoSlice';
import { createIncidentAsync, updateIncidentStatusAsync } from '@/app/gmaoSlice';
import { AppRole } from '@/shared/permissions';
import { Equipment, Incident, WorkOrder, SparePart, Supplier, Notification, UserAccount, User, Tenant } from '@/shared/types/gmao';
import { useEffect } from 'react';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useGmao = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(s => s.gmao);

  useEffect(() => {
    if (state.currentUser) {
      dispatch(fetchTenantDataAsync());
    }
  }, [state.currentUser, dispatch]);

  // Sync to local storage manually or via middleware. We'll do a simple effect for tenants:
  useEffect(() => {
    dispatch(actions.syncToLocalStorage());
  }, [state.tenants, dispatch]);

  const activeTenant = state.tenants.find(t => t.id === state.currentTenantId);

  return {
    tenants: state.tenants,
    currentTenantId: state.currentTenantId,
    impersonatedTenantId: state.impersonatedTenantId,
    currentUser: state.currentUser,
    darkMode: state.darkMode,
    selectedCampaign: state.selectedCampaign,
    rolePermissions: state.rolePermissions,
    notifications: state.notifications,
    
    // Dynamic getters
    equipments: activeTenant ? activeTenant.equipments : [],
    workOrders: activeTenant ? activeTenant.workOrders : [],
    incidents: activeTenant ? activeTenant.incidents : [],
    users: activeTenant ? activeTenant.users : [],
    technicians: activeTenant ? activeTenant.technicians : [],
    parts: activeTenant ? activeTenant.parts : [],
    suppliers: activeTenant ? activeTenant.suppliers : [],
    campaigns: activeTenant ? activeTenant.campaigns : [],

    // Actions
    login: (email: string, password?: string, tenantId?: string | null, quickRole?: User['role'], forcedName?: string, userId?: string) => {
      let role = quickRole || 'Administrateur';
      let name = forcedName || 'Utilisateur';
      let avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';

      dispatch(actions.login({
        user: { id: userId || 'temp-user-id', name, email, role: role as any, avatar, tenantId: tenantId || undefined },
        tenantId: tenantId || null
      }));
      return true;
    },
    logout: () => dispatch(actions.logout()),
    toggleDarkMode: () => dispatch(actions.toggleDarkMode()),
    setSelectedCampaign: (camp: string) => dispatch(actions.setSelectedCampaign(camp)),
    updateRolePermission: (role: any, module: any, actionName: string, scope: any, isChecked: boolean) => 
      dispatch(actions.updateRolePermission({role, module, act: actionName, scope, isChecked})),
    
    // CRUD
    addEquipment: (eq: Omit<Equipment, 'healthIndex' | 'sensors' | 'hoursCount' | 'cycleCount'>) => dispatch(actions.addEquipment(eq)),
    updateEquipmentStatus: (id: string, status: Equipment['status'], healthIndex?: number) => dispatch(actions.updateEquipmentStatus({id, status, healthIndex})),
    deleteEquipment: (id: string) => dispatch(actions.deleteEquipment(id)),
    addIncident: async (inc: Omit<Incident, 'id' | 'reportedDate' | 'status'>) => {
      const result = await dispatch(createIncidentAsync({
        equipmentId: inc.equipmentId,
        description: inc.description,
        urgency: inc.urgency,
        photo: inc.photo
      }));
      return result;
    },
    updateIncidentStatus: async (id: string, status: Incident['status'], workOrderId?: string) => {
      const activeTenantLocal = state.tenants.find(t => t.id === state.currentTenantId);
      const fullIncident = activeTenantLocal?.incidents.find(i => i.id === id);
      if (!fullIncident) {
        // Fallback: update locally only if we can't find the full incident
        dispatch(actions.updateIncidentStatus({ id, status, workOrderId }));
        return;
      }
      const result = await dispatch(updateIncidentStatusAsync({ id, status, fullIncident, workOrderId }));
      return result;
    },
    addWorkOrder: (ot: Omit<WorkOrder, 'id' | 'createdDate' | 'status' | 'partsUsed' | 'durationMinutes' | 'externalCost'>, incidentId?: string) => dispatch(actions.addWorkOrder({ot, incidentId})),
    updateWorkOrderStatus: (id: string, status: WorkOrder['status'], updates?: Partial<WorkOrder>) => dispatch(actions.updateWorkOrderStatus({id, status, updates})),
    addPartMovement: (ref: string, qty: number, type: 'in' | 'out', otId?: string) => dispatch(actions.addPartMovement({ref, qty, type, otId})),
    updatePart: (updated: SparePart) => dispatch(actions.updatePart(updated)),
    addSupplier: (sup: Supplier) => dispatch(actions.addSupplier(sup)),
    addNotification: (notif: Omit<Notification, 'id' | 'date' | 'read'>) => dispatch(actions.addNotification(notif)),
    markNotificationAsRead: (id: string) => dispatch(actions.markNotificationAsRead(id)),
    markAllNotificationsAsRead: () => dispatch(actions.markAllNotificationsAsRead()),
    addUser: (user: UserAccount) => dispatch(actions.addUser(user)),

    // Missing actions from context but keeping API stable for migration:
    deleteEquipmentsByLocation: (...args: any[]) => {},
    deleteEquipmentsByCategory: (...args: any[]) => {},
    registerTenant: (...args: any[]) => {},
    approveTenant: (...args: any[]) => {},
    suspendTenant: (...args: any[]) => {},
    changeTenantPlan: (...args: any[]) => {},
    impersonateTenant: (...args: any[]) => {}
  };
};

