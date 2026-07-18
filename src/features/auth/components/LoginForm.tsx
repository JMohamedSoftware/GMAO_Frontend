// ================================================
// src/features/auth/components/LoginForm.tsx
// ================================================

import React, { useState } from 'react';
import { UserCircle2, KeyRound, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import type { LoginRequest } from '../types/auth.types';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">

      {/* Error message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/50 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 animate-[shake_0.5s_ease-in-out]">
          <ShieldCheck className="w-6 h-6 flex-shrink-0" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="group relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-l-[2rem] border-y border-l border-slate-200 dark:border-slate-700 group-focus-within:bg-rose-50 dark:group-focus-within:bg-rose-500/10 group-focus-within:border-rose-500 transition-colors z-10">
          <UserCircle2 className="w-8 h-8 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
        </div>
        <input
          id="auth-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre identifiant"
          disabled={isLoading}
          className="w-full h-16 pl-20 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-lg text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all shadow-sm disabled:opacity-60"
        />
      </div>

      {/* Password Field */}
      <div className="group relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-l-[2rem] border-y border-l border-slate-200 dark:border-slate-700 group-focus-within:bg-rose-50 dark:group-focus-within:bg-rose-500/10 group-focus-within:border-rose-500 transition-colors z-10">
          <KeyRound className="w-8 h-8 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
        </div>
        <input
          id="auth-password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          disabled={isLoading}
          className="w-full h-16 pl-20 pr-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-lg text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all shadow-sm font-mono tracking-widest disabled:opacity-60"
        />
        {/* Show / Hide password toggle */}
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors z-10"
          tabIndex={-1}
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Submit Button */}
      <button
        id="auth-submit"
        type="submit"
        disabled={isLoading}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="mt-4 w-full h-16 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white rounded-[2rem] text-xl font-black flex items-center justify-between px-8 shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span>{isLoading ? 'Connexion…' : 'Accéder'}</span>
        <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 ${isHovering && !isLoading ? 'translate-x-2' : ''}`}>
          {isLoading
            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
            : <ArrowRight className="w-5 h-5 text-white" />
          }
        </div>
      </button>

    </form>
  );
};
