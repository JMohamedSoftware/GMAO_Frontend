// src/shared/permissions/roles.ts
export type AppRole =
  | 'SuperAdmin'
  | 'CompanyAdmin'
  | 'Responsable Maintenance'
  | "Chef d'équipe"
  | 'Technicien'
  | 'Production'
  | 'Magasinier';

export const ROLES: Record<string, AppRole> = {
  SUPER_ADMIN: 'SuperAdmin',
  COMPANY_ADMIN: 'CompanyAdmin',
  RESPONSABLE: 'Responsable Maintenance',
  CHEF_EQUIPE: "Chef d'équipe",
  TECHNICIEN: 'Technicien',
  PRODUCTION: 'Production',
  MAGASINIER: 'Magasinier',
};
