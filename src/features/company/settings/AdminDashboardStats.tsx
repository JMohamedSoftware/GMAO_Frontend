import React from 'react';
import { Users, UserCheck, UserMinus, ShieldCheck } from 'lucide-react';

interface AdminDashboardStatsProps {
  users: any[];
}

export const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ users }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Utilisateurs</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.length}</p>
        </div>
      </div>
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Actifs</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.filter(u => u.status === 'Actif').length}</p>
        </div>
      </div>
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
          <UserMinus className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Inactifs</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.filter(u => u.status === 'Inactif').length}</p>
        </div>
      </div>
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Administrateurs</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.filter(u => u.role === 'Administrateur').length || 1}</p>
        </div>
      </div>
    </div>
  );
};
