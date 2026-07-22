import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { UserAccount } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { AppRole } from '@/shared/permissions';
import { CheckCircle2 } from 'lucide-react';

import { AdminDashboardStats } from './AdminDashboardStats';
import { UserManagement } from '../users/UserManagement';
import { RoleSettings } from './RoleSettings';
import { AdminSettings } from './AdminSettings';
import { AdminModals } from '../users/AdminModals';
import { usersApi } from '../users/api/users.api';

export const Admin: React.FC = () => {
  const { tenants, currentTenantId, addUser, rolePermissions, updateRolePermission } = useGmao();
  const { can } = usePermissions();
  
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map role to backend RoleId
      const roleMapping: Record<string, number> = {
        'Administrateur': 1,
        'CompanyAdmin': 1,
        'Responsable Maintenance': 2,
        'Chef d\'équipe': 3,
        'Technicien': 4,
        'Production': 5,
        'Magasinier': 6,
        'SuperAdmin': 7
      };

      const parts = newUser.name.trim().split(' ');
      const prenom = parts[0] || 'Prénom';
      const nom = parts.slice(1).join(' ') || 'Nom';
      
      const roleId = roleMapping[newUser.role] || 4; // Default to Technicien

      await usersApi.createUser({
        user: {
          nom,
          prenom,
          email: newUser.email,
          telephone: newUser.phone || '',
          roleId,
          societeId: 1,
          isActive: newUser.status === 'Actif',
        },
        password: newUser.password
      });

      // Update local Redux state for instant UI update
      addUser({ 
        ...newUser, 
        status: newUser.status as "Actif" | "Inactif", 
        avatar: newUser.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().split('T')[0]
      });

      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });
      setSuccessSaved(true);
      setTimeout(() => setSuccessSaved(false), 2500);
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Erreur lors de la création de l\'utilisateur.');
    } finally {
      setIsSubmitting(false);
    }
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
            can={can} 
            setIsAddUserOpen={setIsAddUserOpen} 
            setEditingUser={setEditingUser} 
            setIsEditUserOpen={setIsEditUserOpen} 
          />

          <RoleSettings />
        </div>

        {/* Right: System Settings & Preference Appearance */}
        <div className="flex flex-col gap-6">
          <AdminSettings 
            language={language}
            setLanguage={setLanguage}
            emailAlerts={emailAlerts}
            setEmailAlerts={setEmailAlerts}
            handleSaveSettings={handleSaveSettings}
            can={can}
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
