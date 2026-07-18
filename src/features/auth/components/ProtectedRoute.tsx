// ================================================
// src/features/auth/components/ProtectedRoute.tsx
// ================================================

import React from 'react';
import type { AppRole } from '@/shared/permissions/permissions';
import type { AuthUser } from '../types/auth.types';

interface ProtectedRouteProps {
  /** L'utilisateur actuellement connecté (null si non authentifié) */
  currentUser: AuthUser | null;
  /** Rôles autorisés. Si non fourni, tout utilisateur authentifié est autorisé. */
  allowedRoles?: AppRole[];
  /** Contenu rendu si l'accès est autorisé */
  children: React.ReactNode;
  /** Contenu alternatif si non autorisé (par défaut: null) */
  fallback?: React.ReactNode;
}

/**
 * Composant de garde : affiche `children` uniquement si l'utilisateur
 * est connecté et possède un des rôles autorisés.
 *
 * Usage :
 * ```tsx
 * <ProtectedRoute currentUser={user} allowedRoles={['SuperAdmin', 'CompanyAdmin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentUser,
  allowedRoles,
  children,
  fallback = null,
}) => {
  if (!currentUser) return <>{fallback}</>;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <>{fallback}</>;
  return <>{children}</>;
};
