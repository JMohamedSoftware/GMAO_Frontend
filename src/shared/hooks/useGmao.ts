import { useAppSelector, useAppDispatch } from '@/app/hooks';
import * as actions from '@/app/gmaoSlice';
import { AppRole } from '@/shared/permissions';
import { Equipment, Incident, WorkOrder, SparePart, Supplier, Notification, UserAccount, User, Tenant } from '@/shared/types/gmao';
import { useEffect } from 'react';

export const useGmao = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(s => s.gmao);

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
    technicians: activeTenant ? activeTenant.technicians : [],
    parts: activeTenant ? activeTenant.parts : [],
    suppliers: activeTenant ? activeTenant.suppliers : [],
    campaigns: activeTenant ? activeTenant.campaigns : [],

    // Actions
    login: (email: string, password?: string, tenantId?: string | null, quickRole?: User['role'], forcedName?: string) => {
      let role = quickRole || 'CompanyAdmin';
      let name = forcedName || 'Utilisateur';
      let avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';

      dispatch(actions.login({
        user: { name, email, role: role as any, avatar, tenantId: tenantId || undefined },
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
    addIncident: (inc: Omit<Incident, 'id' | 'reportedDate' | 'status'>) => dispatch(actions.addIncident(inc)),
    updateIncidentStatus: (id: string, status: Incident['status'], workOrderId?: string) => dispatch(actions.updateIncidentStatus({id, status, workOrderId})),
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
