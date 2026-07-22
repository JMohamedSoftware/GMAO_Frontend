// src/shared/permissions/scopes.ts
export type DataScope = 'SELF' | 'TEAM' | 'COMPANY';

export const SCOPES: Record<string, DataScope> = {
  SELF: 'SELF',
  TEAM: 'TEAM',
  COMPANY: 'COMPANY',
};
