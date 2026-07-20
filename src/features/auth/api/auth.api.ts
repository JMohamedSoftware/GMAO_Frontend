// ================================================
// src/features/auth/api/auth.api.ts
// ================================================

import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthUser,
} from '../types/auth.types';

/** Base URL du Backend — à changer via variable d'environnement en prod */
const API_BASE = import.meta.env.VITE_API_URL || 'https://gmao-backend-a6r2.onrender.com/api';

// ---------- Helpers ----------

// ── Request helper with 60s timeout + 1 retry (for Render cold start) ────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 1
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000); // 60s timeout

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message: string =
        errorBody?.message ?? `HTTP Error ${response.status}`;
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    if (retries > 0 && isAbort) {
      // Backend was sleeping (cold start) — retry once after wakeup
      console.warn('Backend timeout — retrying after cold start...');
      return request<T>(endpoint, options, retries - 1);
    }
    if (isAbort) throw new Error('Le serveur met trop de temps à répondre. Réessayez dans quelques secondes.');
    throw err;
  }
}

function withAuth(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ---------- Endpoints ----------

/**
 * POST /auth/login
 * Envoie email + password, reçoit tokens + user
 */
export async function loginApi(body: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * POST /auth/refresh
 * Renouvelle l'accessToken avec le refreshToken
 */
export async function refreshTokenApi(
  body: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  return request<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * POST /auth/logout
 * Invalide le refreshToken côté serveur
 */
export async function logoutApi(accessToken: string): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
    headers: withAuth(accessToken),
  });
}

/**
 * GET /auth/me
 * Récupère le profil de l'utilisateur connecté
 */
export async function getMeApi(accessToken: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', {
    headers: withAuth(accessToken),
  });
}

/**
 * POST /auth/forgot-password
 * Envoie un email de réinitialisation de mot de passe
 */
export async function forgotPasswordApi(email: string): Promise<void> {
  return request<void>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /auth/reset-password
 * Réinitialise le mot de passe avec un token temporaire
 */
export async function resetPasswordApi(
  token: string,
  newPassword: string
): Promise<void> {
  return request<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
