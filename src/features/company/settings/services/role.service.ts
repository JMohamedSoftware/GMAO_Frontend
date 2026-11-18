import { apiClient } from '@/shared/services/apiClient';

export interface RoleDto {
  id: number;
  nom: string;
  description?: string;
  permissions: string[];
}

export const roleService = {
  getRoles: async (): Promise<RoleDto[]> => {
    const res = await apiClient.get<RoleDto[]>('/api/Settings/Roles');
    return res.data;
  },

  updateRolePermissions: async (roleId: number, permissions: string[]): Promise<void> => {
    await apiClient.post(`/api/Settings/Roles/${roleId}/Permissions`, { permissions });
  }
};
