// src/shared/permissions/guards.ts
import { AppRole, ROLES } from './roles';
import { Permission } from './permissions';
import { ROLE_PERMISSIONS } from './ability';

export const can = (role: string | undefined | null, permission: Permission): boolean => {
  if (!role) return false;
  
  // SuperAdmin and CompanyAdmin have access to everything
  if (role === ROLES.SUPER_ADMIN || role === ROLES.COMPANY_ADMIN) {
    return true;
  }

  const permissionsForRole = ROLE_PERMISSIONS[role as AppRole];
  
  if (!permissionsForRole) {
    return false;
  }

  return permissionsForRole.includes(permission);
};
