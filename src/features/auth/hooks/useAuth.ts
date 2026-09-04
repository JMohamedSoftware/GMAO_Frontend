// ================================================
// src/features/auth/hooks/useAuth.ts
// ================================================

import { useState, useCallback, useEffect } from 'react';
import type { AuthState, AuthUser, LoginRequest } from '../types/auth.types';
import {
  buildSession,
  clearSession,
  loadSession,
  saveSession,
  isTokenExpired,
} from '../services/auth.service';
import { loginApi, logoutApi, refreshTokenApi, getMeApi } from '../api/auth.api';

// ---------- Initial State ----------

function getInitialState(): AuthState {
  const session = loadSession();
  if (!session) return { status: 'unauthenticated', session: null, error: null };
  if (isTokenExpired(session.accessToken)) {
    // La session existe mais le token a expiré → on tente de refresh au montage
    return { status: 'idle', session, error: null };
  }
  return { status: 'authenticated', session, error: null };
}

// ---------- Hook ----------

export function useAuth() {
  const [state, setState] = useState<AuthState>(getInitialState);

  // ── Helpers ──────────────────────────────────────────
  const setLoading = () =>
    setState((s) => ({ ...s, status: 'loading', error: null }));

  const setError = (message: string) =>
    setState((s) => ({ ...s, status: 'error', error: message }));

  // ── Refresh silencieux au démarrage (token expiré) ───
  useEffect(() => {
    if (state.status !== 'idle' || !state.session) return;

    const refresh = async () => {
      try {
        // ✅ The backend returns a fresh user with up-to-date permissions
        const { accessToken, refreshToken, user: freshUser } = await refreshTokenApi({
          refreshToken: state.session!.refreshToken,
        });
        // Use freshUser from response (has updated permissions) — NOT the cached session user
        const updatedSession = buildSession(
          accessToken,
          refreshToken,
          freshUser ?? state.session!.user
        );
        saveSession(updatedSession);
        setState({ status: 'authenticated', session: updatedSession, error: null });
      } catch {
        clearSession();
        setState({ status: 'unauthenticated', session: null, error: null });
      }
    };

    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync permissions depuis le backend au démarrage ──
  // Si le token est encore valide, on appelle /auth/me pour récupérer
  // les permissions fraîches (au cas où l'admin les aurait modifiées)
  useEffect(() => {
    if (state.status !== 'authenticated' || !state.session?.accessToken) return;

    const syncPermissions = async () => {
      try {
        const freshUser = await getMeApi(state.session!.accessToken);
        // Only update if permissions or role actually changed (avoid unnecessary re-renders)
        const currentPerms = JSON.stringify(state.session!.user.permissions ?? []);
        const freshPerms = JSON.stringify(freshUser.permissions ?? []);
        if (currentPerms !== freshPerms || state.session!.user.role !== freshUser.role) {
          const updatedSession = buildSession(
            state.session!.accessToken,
            state.session!.refreshToken,
            freshUser
          );
          saveSession(updatedSession);
          setState((s) => ({ ...s, session: updatedSession }));
        }
      } catch {
        // Silently ignore — permissions will be stale but app remains functional
      }
    };

    syncPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setLoading();
    try {
      // Appel réel au backend
      const response = await loginApi(credentials);
      const session = buildSession(
        response.accessToken,
        response.refreshToken,
        response.user
      );
      saveSession(session);
      setState({ status: 'authenticated', session, error: null });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue.';
      setState({ status: 'unauthenticated', session: null, error: message });
      return false;
    }
  }, []);

  // ── Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    if (state.session?.accessToken) {
      try {
        await logoutApi(state.session.accessToken);
      } catch {
        // On ignore les erreurs réseau au logout
      }
    }
    clearSession();
    setState({ status: 'unauthenticated', session: null, error: null });
  }, [state.session]);

  // ── Getters de commodité ─────────────────────────────
  const currentUser: AuthUser | null = state.session?.user ?? null;
  const isAuthenticated = state.status === 'authenticated';
  const isLoading = state.status === 'loading';

  return {
    // State
    authState: state,
    currentUser,
    isAuthenticated,
    isLoading,
    error: state.error,
    // Actions
    login,
    logout,
  };
}
