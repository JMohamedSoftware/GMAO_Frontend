// ================================================
// src/features/auth/components/DevQuickLogin.tsx
// ================================================

import React from 'react';
import { Bug } from 'lucide-react';
import type { AppRole } from '@/shared/permissions/permissions';

interface QuickLoginEntry {
  label: string;
  email: string;
  role: AppRole;
}

const QUICK_LOGINS: QuickLoginEntry[] = [
  { label: 'SuperAdmin',       email: 'admin@gmao-saas.com', role: 'SuperAdmin' },
  { label: 'CompanyAdmin',     email: 'admin@midi.com',      role: 'CompanyAdmin' },
  { label: 'Resp. Maintenance',email: 'resp@midi.com',       role: 'Responsable Maintenance' },
  { label: "Chef d'équipe",    email: 'chef@midi.com',       role: "Chef d'équipe" },
  { label: 'Technicien',       email: 'tech@midi.com',       role: 'Technicien' },
  { label: 'Production',       email: 'prod@midi.com',       role: 'Production' },
];

interface DevQuickLoginProps {
  onQuickLogin: (email: string) => void;
}

export const DevQuickLogin: React.FC<DevQuickLoginProps> = ({ onQuickLogin }) => {
  if (import.meta.env.PROD) return null;

  return (
    <div className="mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
      <span className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 flex items-center justify-center gap-1">
        <Bug className="w-3 h-3" /> Mode Développeur
      </span>
      {QUICK_LOGINS.map((entry) => (
        <button
          key={entry.email}
          onClick={() => onQuickLogin(entry.email)}
          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors"
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
};
