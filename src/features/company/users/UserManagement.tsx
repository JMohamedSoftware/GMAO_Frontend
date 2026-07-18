import React from 'react';
import { Users, UserPlus, Phone, Briefcase, Calendar, Clock, Edit2 } from 'lucide-react';
import { UserAccount } from '@/shared/types/gmao';

interface UserManagementProps {
  users: UserAccount[];
  canDo: (module: any, action: string) => boolean;
  setIsAddUserOpen: (open: boolean) => void;
  setEditingUser: (user: UserAccount | null) => void;
  setIsEditUserOpen: (open: boolean) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  canDo,
  setIsAddUserOpen,
  setEditingUser,
  setIsEditUserOpen
}) => {
  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-primary" />
          Répertoire des Utilisateurs
        </h3>
        {canDo('admin', 'gerer_utilisateurs') && (
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="text-[10px] flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Ajouter
        </button>
        )}
      </div>
      
      <div className="flex flex-col gap-3">
        {users.map((u, idx) => (
          <div 
            key={idx}
            className="p-3 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-custom-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold hover:border-primary/20"
          >
            <div className="flex items-center gap-3 w-1/3">
              <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{u.name}</h4>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{u.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-1/3 text-[10px] text-slate-500">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {u.phone || '-'}</div>
                <div className="flex items-center gap-1.5"><Briefcase className="w-3 h-3"/> {u.department || '-'}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Créé: {u.createdAt || '-'}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> Connexion: {u.lastConnection || '-'}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 w-1/3">
              <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                {u.role}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.status === 'Actif' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                {u.status}
              </span>
              <button 
                onClick={() => { setEditingUser(u); setIsEditUserOpen(true); }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
