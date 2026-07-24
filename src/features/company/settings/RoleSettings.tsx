import React, { useState, useEffect } from 'react';
import { Shield, Save, Check } from 'lucide-react';
import { PERMISSIONS, getPermissionScope, hasScopedPermission } from '@/shared/permissions';
import { apiClient } from '@/shared/services/apiClient';

export const RoleSettings: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Define modules and their permissions for the matrix
  const permissionMatrix = [
    { module: 'Dashboard', perms: [PERMISSIONS.DASHBOARD_VIEW] },
    { module: 'Equipements', perms: [PERMISSIONS.EQUIPMENT_VIEW, PERMISSIONS.EQUIPMENT_CREATE, PERMISSIONS.EQUIPMENT_UPDATE, PERMISSIONS.EQUIPMENT_DELETE] },
    { module: 'Correctif', perms: [PERMISSIONS.WORKORDER_VIEW, PERMISSIONS.WORKORDER_CREATE, PERMISSIONS.WORKORDER_UPDATE, PERMISSIONS.WORKORDER_DELETE, PERMISSIONS.WORKORDER_EXECUTE] },
    { module: 'Préventif', perms: [PERMISSIONS.PREVENTIVE_VIEW, PERMISSIONS.PREVENTIVE_CREATE, PERMISSIONS.PREVENTIVE_UPDATE, PERMISSIONS.PREVENTIVE_DELETE, PERMISSIONS.PREVENTIVE_EXECUTE] },
    { module: 'Stock & Pièces', perms: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_UPDATE, PERMISSIONS.INVENTORY_DELETE] },
    { module: 'Utilisateurs', perms: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE] },
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get('/api/Settings/Roles');
      // Filter out admin roles so they cannot be modified by the user
      const filteredRoles = res.data.filter((r: any) => 
        r.nom !== 'SuperAdmin' && r.nom !== 'Administrateur' && r.nom !== 'CompanyAdmin'
      );
      setRoles(filteredRoles);
      if (filteredRoles.length > 0) setSelectedRoleId(filteredRoles[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  const togglePermission = (perm: string) => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(r => {
      if (r.id !== selectedRole.id) return r;
      const hasPerm = hasScopedPermission(r.permissions, perm);
      
      let newPerms = [...r.permissions];
      if (hasPerm) {
        newPerms = newPerms.filter((p: string) => !p.startsWith(perm));
      } else {
        newPerms.push(perm);
      }

      return {
        ...r,
        permissions: newPerms
      };
    }));
  };

  const changeScope = (basePerm: string, newScope: string) => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(r => {
      if (r.id !== selectedRole.id) return r;
      let newPerms = r.permissions.filter((p: string) => !p.startsWith(basePerm));
      if (newScope !== 'NONE') {
        if (newScope === 'ALL') {
          newPerms.push(`${basePerm}_ALL`);
        } else {
          newPerms.push(`${basePerm}_${newScope}`);
        }
      }
      return { ...r, permissions: newPerms };
    }));
  };

  const renderPermissionControl = (moduleName: string, basePerm?: string) => {
    if (!basePerm || !selectedRole) return null;
    
    // Modules that support scoped permissions
    const supportsScope = moduleName === 'Correctif' || moduleName === 'Préventif';
    
    if (supportsScope) {
      const currentScope = getPermissionScope(selectedRole.permissions, basePerm);
      return (
        <select 
          className="text-xs p-1 border border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:border-primary bg-transparent text-slate-700 dark:text-slate-200"
          value={currentScope}
          onChange={(e) => changeScope(basePerm, e.target.value)}
        >
          <option value="NONE">Aucun</option>
          <option value="OWN">Personnel</option>
          <option value="TEAM">Équipe</option>
          <option value="ALL">Tout</option>
        </select>
      );
    }

    return (
      <input type="checkbox" className="w-4 h-4 text-primary rounded cursor-pointer"
             checked={hasScopedPermission(selectedRole.permissions, basePerm)}
             onChange={() => togglePermission(basePerm)} />
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      await apiClient.post(`/api/Settings/Roles/${selectedRole.id}/Permissions`, {
        permissions: selectedRole.permissions
      });
      setSuccessMsg('Permissions sauvegardées avec succès.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-xs">Chargement des rôles...</div>;

  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-blue-500" />
          Rôles et Permissions (Dynamique)
        </h3>
        {successMsg && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check className="w-4 h-4"/> {successMsg}</span>}
      </div>

      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              selectedRoleId === role.id 
                ? 'bg-primary text-white border-primary shadow-md' 
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
            }`}
          >
            {role.nom}
          </button>
        ))}
        {roles.length === 0 && (
          <span className="text-xs text-slate-500">Aucun rôle modifiable trouvé.</span>
        )}
      </div>

      {selectedRole && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Module</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Voir</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Créer</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Modifier</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Supprimer</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Exécuter</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map(row => (
                <tr key={row.module} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 text-xs font-bold text-slate-700 dark:text-slate-200">{row.module}</td>
                  {/* View */}
                  <td className="py-3 text-center">
                    {renderPermissionControl(row.module, row.perms.find(p => p.endsWith('VIEW')))}
                  </td>
                  {/* Create */}
                  <td className="py-3 text-center">
                    {renderPermissionControl(row.module, row.perms.find(p => p.endsWith('CREATE')))}
                  </td>
                  {/* Update */}
                  <td className="py-3 text-center">
                    {renderPermissionControl(row.module, row.perms.find(p => p.endsWith('UPDATE')))}
                  </td>
                  {/* Delete */}
                  <td className="py-3 text-center">
                    {renderPermissionControl(row.module, row.perms.find(p => p.endsWith('DELETE')))}
                  </td>
                  {/* Execute */}
                  <td className="py-3 text-center">
                    {renderPermissionControl(row.module, row.perms.find(p => p.endsWith('EXECUTE')))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 hover-lift disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les permissions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
