/**
 * ============================================================================
 * MODULE : Utilisateurs & Techniciens - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Users` pour la gestion des utilisateurs et techniciens.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Technician, UserAccount } from '@/shared/types/gmao';

export interface CreateUserPayload {
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    roleId: number;
    societeId?: number | null;
    isActive?: boolean;
    avatar?: string;
  };
  password?: string;
  competenceIds?: number[];
}

const TECHNICIAN_ROLE_ID = 4;

const mapTechRole = (_roleId: number): Technician['role'] => {
  return 'Électromécanicien';
};

const mapRoleIdToName = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'Administrateur';
    case 2: return 'Technicien';
    case 3: return 'Demandeur';
    default: return 'Utilisateur';
  }
};

/**
 * Récupère tous les techniciens disponibles
 * GET /api/Users
 */
export const fetchTechnicians = async (): Promise<Technician[]> => {
  const response = await apiClient.get('/api/Users');
  return response.data
    .filter((u: any) => u.roleId === TECHNICIAN_ROLE_ID && u.isActive !== false)
    .map((u: any): Technician => ({
      id: u.id?.toString(),
      name: `${u.prenom} ${u.nom}`.trim(),
      role: mapTechRole(u.roleId),
      qualification: 'Technicien de Maintenance',
      skills: [],
      status: 'Disponible',
      hourlyRate: 0,
      avatar: u.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.prenom}+${u.nom}`)}&background=e11d48&color=fff&size=150`,
    }));
};

/**
 * Récupère tous les comptes utilisateurs de l'entreprise
 * GET /api/Users
 */
export const fetchUsers = async (): Promise<UserAccount[]> => {
  const response = await apiClient.get('/api/Users');
  return response.data
    .filter((u: any) => u.role?.nom !== 'SuperAdmin' && u.roleId !== 7)
    .map((u: any) => ({
      id: u.id?.toString(),
      name: `${u.prenom} ${u.nom}`.trim(),
      email: u.email,
      role: u.role?.nom || mapRoleIdToName(u.roleId),
      status: u.isActive !== false ? 'Actif' : 'Inactif',
      avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.prenom}+${u.nom}`)}&background=e11d48&color=fff&size=150`,
      phone: u.telephone,
      createdAt: u.createdAt
    }));
};

export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },
  createUser: async (payload: CreateUserPayload) => {
    const response = await apiClient.post('/api/users', payload);
    return response.data;
  },
  updateUser: async (id: string | number, payload: {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    roleId?: number;
    isActive?: boolean;
    avatar?: string;
  }) => {
    const response = await apiClient.put(`/api/users/${id}`, payload);
    return response.data;
  },
  deleteUser: async (id: string | number) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  }
};
