// src/shared/permissions/permissions.ts
export const PERMISSIONS = {
  // WORKORDERS
  WORKORDER_VIEW: 'WORKORDER_VIEW',
  WORKORDER_CREATE: 'WORKORDER_CREATE',
  WORKORDER_UPDATE: 'WORKORDER_UPDATE',
  WORKORDER_DELETE: 'WORKORDER_DELETE',
  WORKORDER_ASSIGN: 'WORKORDER_ASSIGN',
  WORKORDER_CLOSE: 'WORKORDER_CLOSE',
  WORKORDER_START: 'WORKORDER_START',
  WORKORDER_SUSPEND: 'WORKORDER_SUSPEND',
  WORKORDER_FINISH: 'WORKORDER_FINISH',
  WORKORDER_EXECUTE: 'WORKORDER_EXECUTE',
  WORKORDER_EXPORT: 'WORKORDER_EXPORT',

  // EQUIPMENTS
  EQUIPMENT_VIEW: 'EQUIPMENT_VIEW',
  EQUIPMENT_CREATE: 'EQUIPMENT_CREATE',
  EQUIPMENT_UPDATE: 'EQUIPMENT_UPDATE',
  EQUIPMENT_DELETE: 'EQUIPMENT_DELETE',
  EQUIPMENT_IMPORT: 'EQUIPMENT_IMPORT',
  EQUIPMENT_EXPORT: 'EQUIPMENT_EXPORT',

  // USERS
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',

  // PREVENTIVE
  PREVENTIVE_VIEW: 'PREVENTIVE_VIEW',
  PREVENTIVE_CREATE: 'PREVENTIVE_CREATE',
  PREVENTIVE_UPDATE: 'PREVENTIVE_UPDATE',
  PREVENTIVE_DELETE: 'PREVENTIVE_DELETE',
  PREVENTIVE_EXECUTE: 'PREVENTIVE_EXECUTE',
  
  // INCIDENTS (Corrective)
  INCIDENT_VIEW: 'INCIDENT_VIEW',
  INCIDENT_CREATE: 'INCIDENT_CREATE',
  INCIDENT_UPDATE: 'INCIDENT_UPDATE',
  INCIDENT_DELETE: 'INCIDENT_DELETE',
  INCIDENT_VALIDATE: 'INCIDENT_VALIDATE',
  
  // SUPPLIERS
  SUPPLIER_VIEW: 'SUPPLIER_VIEW',
  SUPPLIER_CREATE: 'SUPPLIER_CREATE',
  SUPPLIER_UPDATE: 'SUPPLIER_UPDATE',
  SUPPLIER_DELETE: 'SUPPLIER_DELETE',

  // INVENTORY
  INVENTORY_VIEW: 'INVENTORY_VIEW',
  INVENTORY_CREATE: 'INVENTORY_CREATE',
  INVENTORY_UPDATE: 'INVENTORY_UPDATE',
  INVENTORY_DELETE: 'INVENTORY_DELETE',
  INVENTORY_MOVE: 'INVENTORY_MOVE', // Entrée/Sortie
  
  // DASHBOARD
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  // REPORTS
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_CREATE: 'REPORT_CREATE',
  REPORT_EXPORT_PDF: 'REPORT_EXPORT_PDF',
  REPORT_EXPORT_EXCEL: 'REPORT_EXPORT_EXCEL',
  REPORT_EXPORT: 'REPORT_EXPORT',
} as const;

export type Permission = keyof typeof PERMISSIONS | `${keyof typeof PERMISSIONS}_ALL` | `${keyof typeof PERMISSIONS}_TEAM` | `${keyof typeof PERMISSIONS}_OWN`;

/**
 * Checks if the user has a specific permission, considering scopes.
 * If checking for 'WORKORDER_VIEW', it returns true if the user has
 * 'WORKORDER_VIEW', 'WORKORDER_VIEW_ALL', 'WORKORDER_VIEW_TEAM', or 'WORKORDER_VIEW_OWN'.
 */
export const hasScopedPermission = (userPermissions: string[], basePermission: string): boolean => {
  return userPermissions.some(p => 
    p === basePermission || 
    p === `${basePermission}_ALL` || 
    p === `${basePermission}_TEAM` || 
    p === `${basePermission}_OWN`
  );
};

/**
 * Gets the specific scope for a base permission, if it exists.
 * Returns 'ALL', 'TEAM', 'OWN', or 'NONE'.
 */
export const getPermissionScope = (userPermissions: string[], basePermission: string): 'ALL' | 'TEAM' | 'OWN' | 'NONE' => {
  if (userPermissions.includes(`${basePermission}_ALL`)) return 'ALL';
  if (userPermissions.includes(`${basePermission}_TEAM`)) return 'TEAM';
  if (userPermissions.includes(`${basePermission}_OWN`)) return 'OWN';
  if (userPermissions.includes(basePermission)) return 'ALL'; // Fallback for boolean permissions
  return 'NONE';
};
