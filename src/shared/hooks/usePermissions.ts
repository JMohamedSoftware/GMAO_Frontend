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
   * @param permission The base permission to check
   * @param resourceOwnerIds Optional array of user IDs that own the resource (e.g. technicienId, responsableId)
   * @param resourceEquipeIds Optional array of team IDs that own the resource
   */
  const can = (permission: Permission | string, resourceOwnerIds?: (number | null | undefined)[], resourceEquipeIds?: (number | null | undefined)[]): boolean => {
    // If dynamic permissions are loaded from backend, use them!
    const userPermissions = authUser?.permissions || currentUser?.permissions;
    
    if (userPermissions && userPermissions.length > 0) {
      if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMINISTRATEUR || (role as string) === 'Admin' || (role as string) === 'CompanyAdmin') return true; 
      return hasScopedPermission(
        userPermissions, 
        permission, 
        resourceOwnerIds, 
        authUser?.id || currentUser?.id ? Number(authUser?.id || currentUser?.id) : undefined,
        resourceEquipeIds,
        undefined // equipeId removed from User type
      );
    }
    
    // Fallback to static mapping if dynamic permissions are missing
    return canGuard(role, permission as Permission);
  };

  /**
   * Role checkers — convenience shortcuts
   */
  const isAdmin = role === ROLES.ADMINISTRATEUR || role === ROLES.SUPER_ADMIN || (role as string) === 'Admin' || (role as string) === 'CompanyAdmin';
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
