// ================================================
// src/features/auth/types/auth.types.ts
// ================================================

import { AppRole } from '@/shared/permissions/permissions';

// ---------- Request / Response DTOs ----------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ---------- Domain Models ----------

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  tenantId?: string;       // null si SuperAdmin
  tenantName?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;      // ISO date string
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;       // timestamp (ms) — quand le token expire
}

// ---------- State ----------

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  error: string | null;
}

// ---------- Helper Types ----------

/** Payload décodé du JWT */
export interface JwtPayload {
  sub: string;             // userId
  email: string;
  role: AppRole;
  tenantId?: string;
  iat: number;
  exp: number;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_DISABLED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}
