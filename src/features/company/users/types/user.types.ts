/**
 * ============================================================================
 * MODULE : Utilisateurs & Comptes (Users) - Types & DTOs
 * ============================================================================
 * Définit la structure des comptes utilisateurs de l'entreprise (Admin,
 * Responsable, Chef d'équipe, Technicien, Production, Magasinier).
 */

export interface UserModel {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: number;
  phone?: string;
  societeId?: number;
  avatar?: string;
  status?: 'Actif' | 'Inactif' | 'Suspendu';
  lastLogin?: string;
}

export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  roleId: number;
  telephone?: string;
  societeId?: number;
}

export interface UpdateUserDto {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
  roleId?: number;
  telephone?: string;
}
