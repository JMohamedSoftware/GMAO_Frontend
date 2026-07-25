// src/shared/permissions/roles.ts
export type AppRole =
  | 'SuperAdmin'
  | 'Administrateur'
  | 'Responsable Maintenance'
  | "Chef d'équipe"
  | 'Technicien'
  | 'Responsable Production';

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMINISTRATEUR: 'Administrateur',
  RESPONSABLE: 'Responsable Maintenance',
  CHEF_EQUIPE: "Chef d'équipe",
  TECHNICIEN: 'Technicien',
  PRODUCTION: 'Responsable Production',
} as const;
