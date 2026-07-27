import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { UserAccount } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { AppRole } from '@/shared/permissions';
import { CheckCircle2 } from 'lucide-react';

import { AdminDashboardStats } from './AdminDashboardStats';
import { UserManagement } from '../users/UserManagement';
import { RoleSettings } from './RoleSettings';
import { LocalisationSettings } from './LocalisationSettings';
import { AdminSettings } from './AdminSettings';
import { AdminModals } from '../users/AdminModals';
import { usersApi } from '../users/api/users.api';
import { TeamManagement } from '../users/TeamManagement';
import { apiClient } from '@/shared/services/apiClient';

export const Admin: React.FC = () => {
  const { tenants, currentTenantId, addUser, rolePermissions, updateRolePermission } = useGmao();
  const { can } = usePermissions();
  
  const [successSaved, setSuccessSaved] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [activeTab, setActiveTab] = useState<'utilisateurs' | 'equipes' | 'roles' | 'localisations' | 'parametres'>('utilisateurs');
  
  const [selectedRole, setSelectedRole] = useState<AppRole>('Technicien');

  // Active users registry list
  const [users, setUsers] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getUsers();
        // map backend user models to frontend UserAccount type expected by UI
        const mappedUsers = data.map((u: any) => ({
          id: u.id.toString(),
          name: `${u.prenom} ${u.nom}`.trim(),
          email: u.email,
          role: u.role?.nom || 'Technicien',
          department: 'Général',
          status: u.isActive ? 'Actif' : 'Inactif',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
          lastActive: 'À l\'instant',
          createdAt: u.createdAt
        }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };
    fetchUsers();
  }, []);

  // Roles permissions matrices UI dummy definitions (could be dynamic)
  const permissions = {
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

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });
  const [availableRoles, setAvailableRoles] = useState<{id: number, nom: string}[]>([]);

  React.useEffect(() => {
    apiClient.get('/api/Settings/Roles').then(res => {
      setAvailableRoles(res.data.filter((r: any) => !['Administrateur', 'SuperAdmin'].includes(r.nom)));
    }).catch(() => {});
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map role to backend RoleId
      const roleMapping: Record<string, number> = {
        'Responsable Maintenance': 2,
        'Chef d\'équipe': 3,
        'Technicien': 4,
        'Production': 5
      };

      const parts = newUser.name.trim().split(' ');
      const prenom = parts[0] || 'Prénom';
      const nom = parts.slice(1).join(' ') || 'Nom';
      
      const roleId = roleMapping[newUser.role] || 4; // Default to Technicien

      const createdUser = await usersApi.createUser({
        user: {
          nom,
          prenom,
          email: newUser.email,
          telephone: newUser.phone || '',
          roleId,
          societeId: 1,
          isActive: newUser.status === 'Actif',
          avatar: newUser.avatar || undefined,
        },
        password: newUser.password
      });

      // Update local state for instant UI update
      setUsers([...users, {
        id: createdUser.id?.toString() || Date.now().toString(),
        name: `${createdUser.prenom} ${createdUser.nom}`.trim(),
        email: createdUser.email,
        role: newUser.role,
        department: 'Général',
        status: createdUser.isActive ? 'Actif' : 'Inactif',
        avatar: createdUser.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
        lastActive: 'À l\'instant',
        createdAt: createdUser.createdAt
      }]);

      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });
      setSuccessSaved(true);
      setTimeout(() => setSuccessSaved(false), 2500);
    } catch (err: any) {
      console.error('Error creating user full:', err.response?.data || err);
      let msg = err.response?.data?.message || err.response?.data;
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
      }
      alert(msg || err.message || "Erreur lors de la création de l'utilisateur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const roleMapping: Record<string, number> = {};
      availableRoles.forEach(r => { roleMapping[r.nom] = r.id; });

      const parts = (editingUser.name || '').trim().split(' ');
      const prenom = parts[0] || 'Prénom';
      const nom = parts.slice(1).join(' ') || 'Nom';

      await usersApi.updateUser(editingUser.id, {
        nom,
        prenom,
        email: editingUser.email,
        telephone: editingUser.phone || '',
        roleId: roleMapping[editingUser.role] || undefined,
        isActive: editingUser.status === 'Actif',
      });

      // Refresh list
      const data = await usersApi.getUsers();
      const mappedUsers = data.map((u: any) => ({
        id: u.id.toString(),
        name: `${u.prenom} ${u.nom}`.trim(),
        email: u.email,
        role: u.role?.nom || 'Technicien',
        department: 'Général',
        phone: u.telephone,
        status: u.isActive ? 'Actif' : 'Inactif',
        avatar: u.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
        lastActive: 'À l\'instant',
        createdAt: u.createdAt
      }));
      setUsers(mappedUsers);

      setIsEditUserOpen(false);
      setEditingUser(null);
      setSuccessSaved(true);
      setTimeout(() => setSuccessSaved(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Erreur lors de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await usersApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccessSaved(true);
      setTimeout(() => setSuccessSaved(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Erreur lors de la suppression.");
    }
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('utilisateurs')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'utilisateurs'
              ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('equipes')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'equipes'
              ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Équipes
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'roles'
              ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Rôles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('localisations')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'localisations'
              ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Localisations
        </button>
        <button
          onClick={() => setActiveTab('parametres')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'parametres'
              ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Système
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'utilisateurs' && (
          <UserManagement 
            users={users} 
            can={can} 
            setIsAddUserOpen={setIsAddUserOpen} 
            setEditingUser={setEditingUser} 
            setIsEditUserOpen={setIsEditUserOpen}
            onDeleteUser={handleDeleteUser}
          />
        )}
        
        {activeTab === 'equipes' && (
          <TeamManagement can={can} />
        )}

        {activeTab === 'roles' && (
          <RoleSettings />
        )}

        {activeTab === 'localisations' && (
          <LocalisationSettings />
        )}

        {activeTab === 'parametres' && (
          <div className="max-w-3xl">
            <AdminSettings 
              language={language}
              setLanguage={setLanguage}
              emailAlerts={emailAlerts}
              setEmailAlerts={setEmailAlerts}
              handleSaveSettings={handleSaveSettings}
              can={can}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminModals 
        isAddUserOpen={isAddUserOpen}
        setIsAddUserOpen={setIsAddUserOpen}
        handleAddUser={handleAddUser}
        newUser={newUser}
        setNewUser={setNewUser}
        availableRoles={availableRoles}
        isEditUserOpen={isEditUserOpen}
        setIsEditUserOpen={setIsEditUserOpen}
        handleEditUser={handleEditUser}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
