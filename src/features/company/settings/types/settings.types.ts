/**
 * ============================================================================
 * MODULE : Administration & Paramètres (Settings) - Types & DTOs
 * ============================================================================
 */

export interface RolePermissionModel {
  roleId: number;
  roleNom: string;
  permissions: string[];
}

export interface PermissionMatrixItem {
  module: string;
  perms: string[];
}
