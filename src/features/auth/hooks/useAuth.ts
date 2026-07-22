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
  mockLogin,
} from '../services/auth.service';
import { loginApi, logoutApi, refreshTokenApi } from '../api/auth.api';

const IS_DEV = import.meta.env.DEV;

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

  // ── Refresh silencieux au démarrage ─────────────────
  useEffect(() => {
    if (state.status !== 'idle' || !state.session) return;

    const refresh = async () => {
      try {
        const { accessToken, refreshToken } = await refreshTokenApi({
          refreshToken: state.session!.refreshToken,
        });
        const updatedSession = buildSession(
          accessToken,
          refreshToken,
          state.session!.user
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
      let response;
      try {
        // Appel réel au backend
        response = await loginApi(credentials);
      } catch (apiError) {
        // ── Quick Login / Mock Fallback ──
        // Si le backend est indisponible (ex: Erreur 404), on tente le mock local
        const mockedUser = mockLogin(credentials.email);
        if (mockedUser) {
          console.warn("Backend API non disponible. Utilisation du compte mock:", mockedUser.email);
          response = {
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            user: mockedUser,
          };
        } else {
          throw apiError; // L'email n'est pas dans le mock, on renvoie l'erreur originale
        }
      }

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
