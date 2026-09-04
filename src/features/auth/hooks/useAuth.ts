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
import { loginApi, logoutApi, refreshTokenApi } from '../api/auth.api';

// ---------- Initial State ----------

function getInitialState(): AuthState {
  const session = loadSession();
  if (!session) return { status: 'unauthenticated', session: null, error: null };
  if (isTokenExpired(session.accessToken)) {
    // Token expiré → on tente le refresh au montage
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

  // ── Refresh silencieux au démarrage ──────────────────
  // Le backend retourne un freshUser avec les permissions à jour.
  // Le JWT Access Token dure 15 min → refresh fréquent = permissions fraîches
  // sans besoin d'appel supplémentaire à /auth/me.
  useEffect(() => {
    if (state.status !== 'idle' || !state.session) return;

    const refresh = async () => {
      try {
        const { accessToken, refreshToken, user: freshUser } = await refreshTokenApi({
          refreshToken: state.session!.refreshToken,
        });
        // freshUser contient les permissions à jour depuis le backend
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

  // ── Login ────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setLoading();
    try {
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
    authState: state,
    currentUser,
    isAuthenticated,
    isLoading,
    error: state.error,
    login,
    logout,
  };
}
