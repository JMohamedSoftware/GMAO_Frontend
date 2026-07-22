// ================================================
// src/features/auth/index.ts  — Public API
// ================================================

// Pages
export { Login } from './pages/Login';

// Components
export { LoginForm }      from './components/LoginForm';
export { ProtectedRoute } from './components/ProtectedRoute';

// Hooks
export { useAuth } from './hooks/useAuth';

// Services
export {
  saveSession,
  loadSession,
  clearSession,
  getAccessToken,
  getRefreshToken,
  buildSession,
  decodeJwt,
  isTokenExpired,
} from './services/auth.service';

// API
export {
  loginApi,
  logoutApi,
  refreshTokenApi,
  getMeApi,
  forgotPasswordApi,
  resetPasswordApi,
} from './api/auth.api';

// Types
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthUser,
  AuthSession,
  AuthState,
  AuthStatus,
  JwtPayload,
  AuthError,
  AuthErrorCode,
} from './types/auth.types';
