// ================================================
// src/features/auth/pages/Login.tsx  (Refactored)
// ================================================

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGmao } from '@/shared/hooks/useGmao';
import { LoginForm } from '../components/LoginForm';
import logoIcon from '@/shared/assets/icons/images.jpeg';
import bgImage from '@/shared/assets/images/tomate.jpg';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const { login: reduxLogin } = useGmao();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) onLoginSuccess();
  }, [isAuthenticated, onLoginSuccess]);

  // ── Form submit ──────────────────────────────────────
  const handleSubmit = async (credentials: { email: string; password: string }) => {
    const ok = await login(credentials);
    if (ok) {
      // Read the newly saved session from localStorage to get the real tenantId
      const sessionStr = localStorage.getItem('gmao_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          reduxLogin(credentials.email, credentials.password, session.user?.tenantId || 'tenant-midi', session.user?.role as any, session.user?.name);
        } catch {
          reduxLogin(credentials.email, credentials.password, 'tenant-midi');
        }
      } else {
        reduxLogin(credentials.email, credentials.password, 'tenant-midi');
      }
      onLoginSuccess();
    }
    return ok;
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-slate-900 font-sans">

      {/* Background Image — Left Side */}
      <div
        className="absolute inset-0 w-[60%] lg:w-[65%] h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Right Panel (Organic Blob Split) */}
      <div
        className="absolute top-0 bottom-0 right-0 w-full lg:w-[50%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center p-8 lg:p-16 transition-all duration-1000"
        style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%, 8% 50%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 left-0 w-80 h-80 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 flex flex-col gap-8 ml-[10%]">

          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-700 p-1 shadow-lg shadow-rose-500/30">
                <img
                  src={logoIcon}
                  alt="Logo POMODORO"
                  className="w-full h-full object-cover rounded-full border-2 border-white/50"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                  POMODORO
                </h1>
                <p className="text-rose-600 dark:text-rose-400 font-bold tracking-widest uppercase text-xs">
                  Portail Industriel
                </p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-4 leading-tight">
              Bienvenue sur <br />
              <span className="text-rose-500">votre espace</span>
            </h2>
          </div>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />

        </div>
      </div>
    </div>
  );
};
