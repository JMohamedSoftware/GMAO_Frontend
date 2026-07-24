import { useGmao } from '@/shared/hooks/useGmao';
import { Permission, can as canGuard, ROLES, hasScopedPermission } from '@/shared/permissions';
import { useAuth } from '@/features/auth';

export function usePermissions() {
  const { currentUser } = useGmao();
  
  const auth = useAuth();
  const authUser = auth.currentUser;
  
  // Provide a safe fallback if currentUser or role is undefined
  const role = authUser?.role ?? currentUser?.role ?? ROLES.TECHNICIEN;
  
  /**
   * Can the current user perform a specific action?
   * Usage: can(PERMISSIONS.WORKORDER_CREATE)
   */
  const can = (permission: Permission | string): boolean => {
    // If dynamic permissions are loaded from backend, use them!
    const userPermissions = authUser?.permissions || currentUser?.permissions;
    
    if (userPermissions && userPermissions.length > 0) {
      if (role === ROLES.SUPER_ADMIN || role === ROLES.COMPANY_ADMIN) return true; 
      return hasScopedPermission(userPermissions, permission);
    }
    
    // Fallback to static mapping if dynamic permissions are missing
    return canGuard(role, permission as Permission);
  };

  /**
   * Role checkers — convenience shortcuts
   */
  const isAdmin = role === ROLES.COMPANY_ADMIN || role === ROLES.SUPER_ADMIN;
  const isResponsable = role === ROLES.RESPONSABLE;
  const isChefEquipe = role === ROLES.CHEF_EQUIPE;
  const isTechnicien = role === ROLES.TECHNICIEN;
  const isProduction = role === ROLES.PRODUCTION;
  
  /** Admins + Responsable only */
  const isManagerLevel = isAdmin || isResponsable;
  
  /** Can supervise: Admin, Responsable, Chef d'équipe */
  const canSupervise = isAdmin || isResponsable || isChefEquipe;

  return {
    role,
    can,
    isAdmin,
    isResponsable,
    isChefEquipe,
    isTechnicien,
    isProduction,
    isManagerLevel,
    canSupervise,
  };
}
