import React, { useState } from 'react';
import { useGmao } from '../../../hooks/useGmao';
import { UserAccount } from '../../../types/gmao';
import { usePermissions } from '../../../hooks/usePermissions';
import { AppRole } from '../../../config/permissions';
import { CheckCircle2 } from 'lucide-react';

import { AdminDashboardStats } from '../components/Admin/AdminDashboardStats';
import { UserManagement } from '../components/Admin/UserManagement';
import { RoleManagement } from '../components/Admin/RoleManagement';
import { AdminSettings } from '../components/Admin/AdminSettings';
import { AdminModals } from '../components/Admin/AdminModals';

export const Admin: React.FC = () => {
  const { tenants, currentTenantId, addUser, rolePermissions, updateRolePermission } = useGmao();
  const { canDo } = usePermissions();
  
  const [successSaved, setSuccessSaved] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [selectedRole, setSelectedRole] = useState<AppRole>('Technicien');

  // Active users registry list
  const activeTenant = tenants.find(t => t.id === currentTenantId);
  const users = activeTenant?.users || [];

  // Roles permissions matrices UI dummy definitions (could be dynamic)
  const permissions = {
    'Administrateur': {},
    'Responsable Maintenance': {},
    'Chef d\'équipe': {},
    'Technicien': {},
    'Production': {}
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2500);
  };

  // Add user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({ 
      ...newUser, 
      status: newUser.status as "Actif" | "Inactif", 
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would update the user context
    setIsEditUserOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Administration du Système
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Gestion des habilitations, profils utilisateurs, langues et préférences graphiques
          </p>
        </div>
        
        {successSaved && (
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Paramètres enregistrés !</span>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      <AdminDashboardStats users={users} />

      {/* Users directory & Permission grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: User Directory & Habilitation Matrix */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <UserManagement 
            users={users} 
            canDo={canDo} 
            setIsAddUserOpen={setIsAddUserOpen} 
            setEditingUser={setEditingUser} 
            setIsEditUserOpen={setIsEditUserOpen} 
          />

          <RoleManagement 
            rolePermissions={rolePermissions as any}
            updateRolePermission={updateRolePermission}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        </div>

        {/* Right: System Settings & Preference Appearance */}
        <div className="flex flex-col gap-6">
          <AdminSettings 
            language={language}
            setLanguage={setLanguage}
            emailAlerts={emailAlerts}
            setEmailAlerts={setEmailAlerts}
            handleSaveSettings={handleSaveSettings}
            canDo={canDo}
          />
        </div>
      </div>

      {/* Modals */}
      <AdminModals 
        isAddUserOpen={isAddUserOpen}
        setIsAddUserOpen={setIsAddUserOpen}
        handleAddUser={handleAddUser}
        newUser={newUser}
        setNewUser={setNewUser}
        permissions={permissions}
        isEditUserOpen={isEditUserOpen}
        setIsEditUserOpen={setIsEditUserOpen}
        handleEditUser={handleEditUser}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
      />
    </div>
  );
};
