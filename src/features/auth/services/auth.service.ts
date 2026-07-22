// ================================================
// src/features/auth/services/auth.service.ts
// ================================================

import type { AuthSession, AuthUser, JwtPayload } from '../types/auth.types';

// ---------- Storage Keys ----------

const ACCESS_TOKEN_KEY = 'gmao_access_token';
const REFRESH_TOKEN_KEY = 'gmao_refresh_token';
const SESSION_KEY = 'gmao_session';

// ---------- JWT Helpers ----------

/**
 * Decode a JWT payload (without verification — verification is done server-side)
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/** Returns true if the JWT is expired (or close to expiry — 60s buffer) */
export function isTokenExpired(token: string, bufferMs = 60_000): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000 - bufferMs;
}

// ---------- Session Storage ----------

/** Persiste la session dans le localStorage */
export function saveSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Charge la session depuis le localStorage */
export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

/** Supprime la session du localStorage (logout) */
export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// ---------- Session Factory ----------

/** Construit une AuthSession à partir d'une LoginResponse */
export function buildSession(
  accessToken: string,
  refreshToken: string,
  user: AuthUser
): AuthSession {
  const payload = decodeJwt(accessToken);
  const expiresAt = payload ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000;

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt,
  };
}

// ── End of auth.service.ts ──
