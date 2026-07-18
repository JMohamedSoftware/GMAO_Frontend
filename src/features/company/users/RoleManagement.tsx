import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppRole, AppModule, DataScope } from '@/shared/permissions/permissions';

interface RoleManagementProps {
  rolePermissions: Record<AppRole, Record<AppModule, { actions: string[], scope: DataScope }>>;
  updateRolePermission: (role: AppRole, module: AppModule, action: string, scope: DataScope, isGranted: boolean) => void;
  selectedRole: AppRole;
  setSelectedRole: (role: AppRole) => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  rolePermissions,
  updateRolePermission,
  selectedRole,
  setSelectedRole
}) => {
  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-secondary" />
          Matrice de Droits & Habilitations
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Left Column: Roles List */}
        <div className="w-full md:w-1/4 flex flex-col gap-2">
          <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-wider">Sélectionner un rôle</p>
          {(Object.keys(rolePermissions) as AppRole[]).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all border cursor-pointer ${selectedRole === role ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40'}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Right Column: Details for selectedRole */}
        <div className="w-full md:w-3/4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Privilèges pour: <span className="text-primary text-xs ml-1">{selectedRole}</span>
            </p>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800">Module</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800">Actions Permises</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Périmètre (Scope)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 dark:text-slate-300">
                {(() => {
                  const def = rolePermissions[selectedRole];
                  if (!def) return (<tr><td colSpan={3} className="p-4 text-center">Aucune donnée</td></tr>);
                  
                  const modules = Object.keys(def) as AppModule[];
                  const moduleAvailableActions: Record<AppModule, string[]> = {
                    dashboard: ['voir'],
                    equipment: ['voir', 'creer', 'modifier', 'supprimer', 'importer', 'exporter'],
                    preventive: ['voir', 'creer', 'modifier', 'supprimer', 'lancer', 'suspendre', 'approuver', 'executer'],
                    corrective: ['voir', 'creer', 'modifier', 'supprimer', 'valider', 'rejeter', 'planifier', 'creer_ot'],
                    workorders: ['voir', 'creer', 'modifier', 'supprimer', 'assigner', 'demarrer', 'suspendre', 'terminer', 'cloturer', 'exporter'],
                    inventory: ['voir', 'creer', 'modifier', 'supprimer', 'entree', 'sortie', 'inventaire'],
                    suppliers: ['voir', 'creer', 'modifier', 'supprimer'],
                    reports: ['voir', 'exporter_pdf', 'exporter_excel', 'creer_rapport'],
                    admin: ['voir', 'gerer_utilisateurs', 'gerer_roles', 'parametres']
                  };

                  return modules.map((mod) => {
                    const perms = def[mod];
                    if (!perms) return null;
                    return (
                      <tr key={mod} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-3 font-bold capitalize align-top w-32">{mod}</td>
                        <td className="p-3 align-top">
                          <div className="flex flex-wrap gap-3">
                            {moduleAvailableActions[mod]?.map((act) => {
                              const hasAction = perms.actions.includes(act);
                              return (
                                <label key={act} className="flex items-center gap-1.5 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={hasAction}
                                    onChange={(e) => updateRolePermission(selectedRole, mod, act, perms.scope, e.target.checked)}
                                    className="rounded text-primary focus:ring-primary w-3.5 h-3.5 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer" 
                                  />
                                  <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">{act}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3 align-top w-40 text-right">
                          <select 
                            value={perms.scope}
                            onChange={(e) => updateRolePermission(selectedRole, mod, perms.actions[0] || 'voir', e.target.value as DataScope, true)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold py-1.5 px-2 focus:ring-primary focus:border-primary w-full outline-none cursor-pointer"
                          >
                            <option value="mes_donnees">Mes Données</option>
                            <option value="mon_equipe">Mon Équipe</option>
                            <option value="toute_usine">Toute l'usine</option>
                          </select>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
