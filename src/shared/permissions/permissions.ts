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
 * If resourceOwnerIds and currentUserId are provided, it strictly checks `_OWN` and `_TEAM` against the resource owners.
 * If not provided, it simply checks if the user has ANY level of this permission (useful for menu visibility).
 */
export const hasScopedPermission = (
  userPermissions: string[], 
  basePermission: string, 
  resourceOwnerIds?: (number | null | undefined)[], 
  currentUserId?: number,
  resourceEquipeIds?: (number | null | undefined)[],
  currentUserEquipeId?: number | null
): boolean => {
  // If user has full un-scoped access or ALL scope, they can access anything
  if (userPermissions.includes(basePermission) || userPermissions.includes(`${basePermission}_ALL`)) {
    return true;
  }

  // If specific resource checking is requested
  if (resourceOwnerIds && currentUserId) {
    const isOwner = resourceOwnerIds.includes(currentUserId);
    
    // Check OWN
    if (userPermissions.includes(`${basePermission}_OWN`) && isOwner) {
      return true;
    }
    
    // Check TEAM
    if (userPermissions.includes(`${basePermission}_TEAM`)) {
      if (isOwner) return true; // Owner is always in their own team implicitly
      
      // If we have team IDs for the resource and the current user
      if (currentUserEquipeId && resourceEquipeIds) {
        if (resourceEquipeIds.includes(currentUserEquipeId)) {
          return true;
        }
      }
    }
    
    // If resource is specified but user is not the owner (and doesn't have _ALL), deny.
    return false;
  }

  // If no resource is specified (generic check for UI element visibility like "My Tasks" menu)
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
