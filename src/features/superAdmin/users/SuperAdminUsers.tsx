import React, { useState, useMemo, useEffect } from 'react';
import { superAdminApi } from '../api/superAdmin.api';
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Shield,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  CheckCircle2,
  Check,
  X,
  Plus,
  ExternalLink,
  ShieldCheck,
  Lock,
  History,
  LogIn,
  FileCheck,
  Wrench,
  AlertCircle,
  Sparkles,
  KeyRound,
  Trash2,
  RotateCw
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  site: string;
  role: 'Admin Entreprise' | 'Technicien' | 'Responsable' | 'Super Admin';
  roleColor: string;
  status: 'Actif' | 'En attente' | 'Inactif';
  statusColor: string;
  lastLogin: string;
  registrationDate: string;
  jobTitle: string;
  avatar: string;
  permissions: string[];
  authorizedSites: { name: string; status: 'Actif' | 'Inactif' }[];
  recentActivities: {
    id: string;
    action: string;
    date: string;
    type: 'login' | 'workorder' | 'user' | 'equipment';
    iconBg: string;
  }[];
}

export const SuperAdminUsers: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('5');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'Informations' | 'Rôles & Accès' | 'Sites' | 'Activité' | 'Sécurité'>('Informations');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Action menus
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
  const [isManageSitesModalOpen, setIsManageSitesModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [usersList, setUsersList] = useState<UserItem[]>([]);

  // Form states for Add / Edit
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: 'Usine Tomates POMODORO',
    site: 'Usine Principale',
    role: 'Technicien' as UserItem['role'],
    jobTitle: 'Technicien Maintenance',
    status: 'Actif' as UserItem['status']
  });

  const [editUserForm, setEditUserForm] = useState<UserItem | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchUsers = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getUsers();
      if (data && data.length > 0) {
        const mapped: UserItem[] = data.map((u, idx) => ({
          id: String(u.id),
          name: u.fullName || `${u.prenom} ${u.nom}`.trim() || u.nom,
          email: u.email,
          phone: u.telephone || '+216 71 890 000',
          company: u.societeNom || 'SuperAdmin Global',
          site: 'Usine Principale',
          role: u.roleNom?.includes('Admin')
            ? 'Admin Entreprise'
            : (u.roleNom?.includes('Super')
              ? 'Super Admin'
              : (u.roleNom?.includes('Resp') ? 'Responsable' : 'Technicien')),
          roleColor: u.roleNom?.includes('Super')
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900'
            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          status: u.isActive ? 'Actif' : 'Inactif',
          statusColor: u.isActive
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
          lastLogin: new Date(u.lastLogin).toLocaleDateString('fr-FR') + ' ' + new Date(u.lastLogin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          registrationDate: new Date(u.createdAt).toLocaleDateString('fr-FR'),
          jobTitle: u.roleNom || 'Opérateur Maintenance',
          avatar: u.avatar || `https://images.unsplash.com/photo-${1534528741775 + (idx % 10)}?w=150&auto=format&fit=crop&q=80`,
          permissions: ['Gestion utilisateurs', 'Gestion équipements', 'Maintenance (OT)'],
          authorizedSites: [{ name: 'Usine Principale', status: 'Actif' }],
          recentActivities: [
            { id: `act-${u.id}`, action: 'Connexion à la plateforme', date: 'Aujourd’hui', type: 'login', iconBg: 'bg-blue-100 text-blue-600' }
          ]
        }));
        setUsersList(mapped);
        if (showNotification) showToast('Utilisateurs synchronisés avec PostgreSQL .NET');
      }
    } catch (err) {
      console.warn('[Users] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Selected user for inspection
  const selectedUser = useMemo(() => {
    return usersList.find(u => u.id === selectedUserId) || usersList[0];
  }, [usersList, selectedUserId]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const matchSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.site.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCompany = companyFilter === 'All' || user.company === companyFilter;
      const matchRole = roleFilter === 'All' || user.role === roleFilter;
      const matchStatus = statusFilter === 'All' || user.status === statusFilter;

      return matchSearch && matchCompany && matchRole && matchStatus;
    });
  }, [usersList, searchTerm, companyFilter, roleFilter, statusFilter]);

  // Unique companies list for filter dropdown
  const companiesList = useMemo(() => {
    return Array.from(new Set(usersList.map(u => u.company)));
  }, [usersList]);

  const totalUsersCount = usersList.length;
  const activeUsersCount = usersList.filter(u => u.status === 'Actif').length;
  const pendingUsersCount = usersList.filter(u => u.status === 'En attente').length;
  const inactiveUsersCount = usersList.filter(u => u.status === 'Inactif').length;
  const adminUsersCount = usersList.filter(u => u.role === 'Admin Entreprise' || u.role === 'Super Admin').length;

  const activeUsersPercent = totalUsersCount > 0 ? Math.round((activeUsersCount / totalUsersCount) * 100) : 0;
  const pendingUsersPercent = totalUsersCount > 0 ? Math.round((pendingUsersCount / totalUsersCount) * 100) : 0;
  const inactiveUsersPercent = totalUsersCount > 0 ? Math.round((inactiveUsersCount / totalUsersCount) * 100) : 0;
  const adminUsersPercent = totalUsersCount > 0 ? Math.round((adminUsersCount / totalUsersCount) * 100) : 0;

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Add user submission
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      alert('Veuillez remplir au moins le nom et l’email.');
      return;
    }

    const created: UserItem = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      phone: newUserForm.phone || '+216 20 000 000',
      company: newUserForm.company,
      site: newUserForm.site,
      role: newUserForm.role,
      roleColor:
        newUserForm.role === 'Admin Entreprise'
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
          : newUserForm.role === 'Responsable'
          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200'
          : newUserForm.role === 'Super Admin'
          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
      status: newUserForm.status,
      statusColor:
        newUserForm.status === 'Actif'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
          : newUserForm.status === 'En attente'
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
      lastLogin: '-',
      registrationDate: new Date().toLocaleDateString('fr-FR'),
      jobTitle: newUserForm.jobTitle,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      permissions: ['Gestion équipements', 'Maintenance (OT)'],
      authorizedSites: [{ name: newUserForm.site, status: 'Actif' }],
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          action: 'Création du compte',
          date: new Date().toLocaleDateString('fr-FR') + ' 12:00',
          type: 'user',
          iconBg: 'bg-emerald-100 text-emerald-600'
        }
      ]
    };

    setUsersList(prev => [created, ...prev]);
    setSelectedUserId(created.id);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      company: 'Usine Tomates POMODORO',
      site: 'Usine Principale',
      role: 'Technicien',
      jobTitle: 'Technicien Maintenance',
      status: 'Actif'
    });
    showToast(`Utilisateur "${created.name}" créé avec succès !`);
  };

  // Edit user submission
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserForm) return;

    try {
      const numId = parseInt(editUserForm.id, 10);
      if (!isNaN(numId)) {
        await superAdminApi.updateUser(numId, {
          nom: editUserForm.name,
          email: editUserForm.email,
          telephone: editUserForm.phone,
          isActive: editUserForm.status === 'Actif'
        });
      }
    } catch (err) {
      console.warn('Erreur mise à jour utilisateur backend:', err);
    }

    setUsersList(prev =>
      prev.map(u => (u.id === editUserForm.id ? editUserForm : u))
    );
    setIsEditUserModalOpen(false);
    showToast(`Modifications enregistrées pour ${editUserForm.name}`);
  };

  // Toggle user active / suspended
  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus: UserItem['status'] = user.status === 'Actif' ? 'Inactif' : 'Actif';
    const nextColor =
      nextStatus === 'Actif'
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';

    try {
      const numId = parseInt(user.id, 10);
      if (!isNaN(numId)) {
        await superAdminApi.updateUser(numId, {
          isActive: nextStatus === 'Actif'
        });
      }
    } catch (err) {
      console.warn('Erreur toggle statut backend:', err);
    }

    setUsersList(prev =>
      prev.map(u => (u.id === user.id ? { ...u, status: nextStatus, statusColor: nextColor } : u))
    );
    showToast(`Statut de ${user.name} mis à jour : ${nextStatus}`);
  };

  // Export CSV simulation
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nom,Email,Entreprise,Site,Rôle,Statut,Dernière Connexion']
        .concat(
          filteredUsers.map(
            u => `"${u.name}","${u.email}","${u.company}","${u.site}","${u.role}","${u.status}","${u.lastLogin}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `utilisateurs_plateforme_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportation CSV générée avec succès');
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 animate-[slideIn_0.2s_ease-out]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER WITH TOMATO BANNER */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Left branding */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shadow-inner">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Utilisateurs
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Gestion des utilisateurs de la plateforme
            </p>
          </div>
        </div>

        {/* Right industrial tomato banner with action button */}
        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
          <div className="relative h-14 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center shadow-inner px-4 bg-slate-900/10 dark:bg-slate-950/50">
            <img
              src={tomateImg}
              alt="Industrial Plant"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-slate-900/90 dark:via-slate-900/70" />
            <span className="relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300 hidden lg:inline mr-3">
              Gérez les accès et les rôles de toutes les entreprises
            </span>
          </div>

          {/* Synchronize button */}
          <button
            onClick={() => fetchUsers(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec PostgreSQL .NET"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      {/* 5 KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Utilisateurs total */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalUsersCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Utilisateurs total
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ 100%
                </span>
                <span className="text-[9px] text-slate-400">comptes réels</span>
              </div>
            </div>
          </div>
          {/* Blue mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-blue-200 dark:bg-blue-900 rounded-t" />
            <span className="w-2.5 h-4 bg-blue-300 dark:bg-blue-800 rounded-t" />
            <span className="w-2.5 h-5 bg-blue-400 dark:bg-blue-700 rounded-t" />
            <span className="w-2.5 h-7 bg-blue-500 dark:bg-blue-600 rounded-t" />
            <span className="w-2.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-t" />
          </div>
        </div>

        {/* KPI 2: Actifs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {activeUsersCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Actifs
              </div>
              <div className="mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {activeUsersPercent}%
                </span>
              </div>
            </div>
          </div>
          {/* Green mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-4 bg-emerald-200 dark:bg-emerald-900 rounded-t" />
            <span className="w-2.5 h-5 bg-emerald-300 dark:bg-emerald-800 rounded-t" />
            <span className="w-2.5 h-6 bg-emerald-400 dark:bg-emerald-700 rounded-t" />
            <span className="w-2.5 h-7 bg-emerald-500 dark:bg-emerald-600 rounded-t" />
            <span className="w-2.5 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-t" />
          </div>
        </div>

        {/* KPI 3: En attente */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {pendingUsersCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                En attente
              </div>
              <div className="mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  {pendingUsersPercent}%
                </span>
              </div>
            </div>
          </div>
          {/* Orange mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-2 bg-amber-200 dark:bg-amber-900 rounded-t" />
            <span className="w-2.5 h-4 bg-amber-300 dark:bg-amber-800 rounded-t" />
            <span className="w-2.5 h-5 bg-amber-400 dark:bg-amber-700 rounded-t" />
            <span className="w-2.5 h-4 bg-amber-500 dark:bg-amber-600 rounded-t" />
            <span className="w-2.5 h-6 bg-amber-600 dark:bg-amber-500 rounded-t" />
          </div>
        </div>

        {/* KPI 4: Inactifs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {inactiveUsersCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Inactifs
              </div>
              <div className="mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  {inactiveUsersPercent}%
                </span>
              </div>
            </div>
          </div>
          {/* Red mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-5 bg-rose-200 dark:bg-rose-900 rounded-t" />
            <span className="w-2.5 h-4 bg-rose-300 dark:bg-rose-800 rounded-t" />
            <span className="w-2.5 h-3 bg-rose-400 dark:bg-rose-700 rounded-t" />
            <span className="w-2.5 h-6 bg-rose-500 dark:bg-rose-600 rounded-t" />
            <span className="w-2.5 h-4 bg-rose-600 dark:bg-rose-500 rounded-t" />
          </div>
        </div>

        {/* KPI 5: Administrateurs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {adminUsersCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Administrateurs
              </div>
              <div className="mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  {adminUsersPercent}%
                </span>
              </div>
            </div>
          </div>
          {/* Purple mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-2 bg-purple-200 dark:bg-purple-900 rounded-t" />
            <span className="w-2.5 h-3 bg-purple-300 dark:bg-purple-800 rounded-t" />
            <span className="w-2.5 h-4 bg-purple-400 dark:bg-purple-700 rounded-t" />
            <span className="w-2.5 h-5 bg-purple-500 dark:bg-purple-600 rounded-t" />
            <span className="w-2.5 h-6 bg-purple-600 dark:bg-purple-500 rounded-t" />
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: TABLE (LEFT) + PROFILE PANEL (RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LISTE DES UTILISATEURS (approx 7.5 or 8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            {/* Table Header: Title + Action buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  Liste des utilisateurs
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => showToast('Options de filtrage avancé activées')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtres</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Company dropdown */}
              <div className="relative">
                <select
                  value={companyFilter}
                  onChange={e => setCompanyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="All">Toutes les entreprises</option>
                  {companiesList.map(comp => (
                    <option key={comp} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Role dropdown */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="All">Tous les rôles</option>
                  <option value="Admin Entreprise">Admin Entreprise</option>
                  <option value="Technicien">Technicien</option>
                  <option value="Responsable">Responsable</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Status dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="All">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="En attente">En attente</option>
                  <option value="Inactif">Inactif</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* USERS DATA TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedUserIds.length > 0 &&
                          selectedUserIds.length === filteredUsers.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Nom complet</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Entreprise</th>
                    <th className="py-3 px-3">Site / Usine</th>
                    <th className="py-3 px-3">Rôle</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3">Dernière connexion</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Aucun utilisateur trouvé avec ces critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.slice(0, itemsPerPage).map(user => {
                      const isSelected = user.id === selectedUser.id;
                      const isChecked = selectedUserIds.includes(user.id);

                      return (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedUserId(user.id)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/40 dark:bg-blue-950/20'
                              : ''
                          }`}
                        >
                          <td
                            className="py-3 px-3 text-center"
                            onClick={e => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectUser(user.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                onError={(e: any) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium">
                            {user.email}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {user.company}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {user.site}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${user.roleColor}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${user.statusColor}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {user.lastLogin}
                          </td>
                          <td
                            className="py-3 px-3 text-center"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setEditUserForm({ ...user });
                                setIsEditUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Modifier"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filteredUsers.length > 0 ? `1-${Math.min(filteredUsers.length, itemsPerPage)}` : '0'} sur {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-600/30"
              >
                1
              </button>
              <button
                disabled={true}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="ml-3 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={12}>12 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFIL & DÉTAILS DE L'UTILISATEUR (approx 4.5 or 4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-6">
          {/* User Profile Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                    {selectedUser.name}
                  </h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {selectedUser.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {selectedUser.email}
                </div>
                <div className="mt-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${selectedUser.roleColor}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions button group */}
            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={() => {
                  setEditUserForm({ ...selectedUser });
                  setIsEditUserModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isActionsDropdownOpen && (
                  <div className="absolute right-0 top-9 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-1.5 z-30">
                    <button
                      onClick={() => {
                        handleToggleStatus(selectedUser);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2"
                    >
                      <UserX className="w-3.5 h-3.5 text-amber-500" />
                      <span>{selectedUser.status === 'Actif' ? 'Suspendre' : 'Activer'}</span>
                    </button>
                    <button
                      onClick={() => {
                        showToast(`Lien de réinitialisation envoyé à ${selectedUser.email}`);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      <span>Réinitialiser MDP</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsManageRolesModalOpen(true);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                      <span>Gérer permissions</span>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer l'utilisateur ${selectedUser.name} ?`)) {
                          setUsersList(prev => prev.filter(u => u.id !== selectedUser.id));
                          showToast(`Utilisateur supprimé`);
                        }
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 text-xs font-bold overflow-x-auto pb-px">
            {(['Informations', 'Rôles & Accès', 'Sites', 'Activité', 'Sécurité'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: INFORMATIONS (SCREENSHOT VIEW) */}
          {activeTab === 'Informations' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.15s_ease-out]">
              {/* Informations générales */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                  Informations générales
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  {/* Nom complet */}
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Nom complet</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.name}
                      </div>
                    </div>
                  </div>

                  {/* Email pro */}
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium">Email pro</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Téléphone</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.phone}
                      </div>
                    </div>
                  </div>

                  {/* Entreprise */}
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Entreprise</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.company}
                      </div>
                    </div>
                  </div>

                  {/* Site principal */}
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Site principal</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.site}
                      </div>
                    </div>
                  </div>

                  {/* Fonction */}
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Fonction</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.jobTitle}
                      </div>
                    </div>
                  </div>

                  {/* Date d'inscription */}
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Date d'inscription</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.registrationDate}
                      </div>
                    </div>
                  </div>

                  {/* Dernière connexion */}
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Dernière connexion</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {selectedUser.lastLogin}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rôles et permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Rôles et permissions
                  </h4>
                  <button
                    onClick={() => setIsManageRolesModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >
                    Gérer les rôles
                  </button>
                </div>

                <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${selectedUser.roleColor}`}
                    >
                      {selectedUser.role}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Accès complet à l'entreprise et à ses sites.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    {selectedUser.permissions.map(perm => (
                      <div key={perm} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {perm}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sites autorisés */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Sites autorisés
                  </h4>
                  <button
                    onClick={() => setIsManageSitesModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >
                    Gérer les sites
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedUser.authorizedSites.map(site => (
                    <div
                      key={site.name}
                      className="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col gap-1 items-start"
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {site.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mt-1">
                        {site.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activité récente */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Activité récente
                  </h4>
                  <button
                    onClick={() => setActiveTab('Activité')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >
                    Voir tout →
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {selectedUser.recentActivities.map(act => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`}
                        >
                          {act.type === 'login' && <LogIn className="w-3.5 h-3.5" />}
                          {act.type === 'workorder' && <FileCheck className="w-3.5 h-3.5" />}
                          {act.type === 'user' && <UserPlus className="w-3.5 h-3.5" />}
                          {act.type === 'equipment' && <Wrench className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {act.action}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                        {act.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RÔLES & ACCÈS */}
          {activeTab === 'Rôles & Accès' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Niveau d'accès : {selectedUser.role}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Ce rôle permet de superviser l'ensemble des opérations industrielles sur les installations autorisées.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Matrice des privilèges :
                </h5>
                {[
                  { name: 'Lecture seule globale', enabled: true },
                  { name: 'Création et modification des OTs', enabled: true },
                  { name: 'Clôture et signature numérique', enabled: true },
                  { name: 'Gestion des stocks & pièces critiques', enabled: selectedUser.role !== 'Technicien' },
                  { name: 'Accès aux rapports financiers et KPIs', enabled: selectedUser.role === 'Admin Entreprise' || selectedUser.role === 'Super Admin' },
                  { name: 'Export des données de télémétrie', enabled: true },
                  { name: 'Modification des seuils d’alerte machines', enabled: selectedUser.role !== 'Technicien' }
                ].map(priv => (
                  <div
                    key={priv.name}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {priv.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        priv.enabled
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}
                    >
                      {priv.enabled ? 'Autorisé' : 'Refusé'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SITES */}
          {activeTab === 'Sites' && (
            <div className="flex flex-col gap-3 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Usines et installations associées ({selectedUser.authorizedSites.length})
                </span>
                <button
                  onClick={() => setIsManageSitesModalOpen(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Affecter un site
                </button>
              </div>

              {selectedUser.authorizedSites.map(site => (
                <div
                  key={site.name}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {site.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Entreprise : {selectedUser.company}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    {site.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: ACTIVITÉ */}
          {activeTab === 'Activité' && (
            <div className="flex flex-col gap-3 animate-[fadeIn_0.15s_ease-out]">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Journal des événements récents
              </h5>
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
                {selectedUser.recentActivities.concat([
                  { id: 'act-hist-1', action: 'Changement de mot de passe', date: '20/09/2026 09:00', type: 'login', iconBg: 'bg-purple-100 text-purple-600' },
                  { id: 'act-hist-2', action: 'Génération du rapport d’inspection', date: '15/09/2026 14:15', type: 'workorder', iconBg: 'bg-sky-100 text-sky-600' }
                ]).map(act => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {act.action}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{act.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SÉCURITÉ */}
          {activeTab === 'Sécurité' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Double authentification (2FA)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Protection via code TOTP / application mobile
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Activée
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Mot de passe
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Modifié pour la dernière fois le 20/09/2026
                  </div>
                </div>
                <button
                  onClick={() => showToast(`Lien envoyé par email à ${selectedUser.email}`)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Sessions actives
                  </div>
                  <div className="text-[10px] text-slate-400">
                    1 session connectée (Chrome / Windows 11)
                  </div>
                </div>
                <button
                  onClick={() => showToast('Toutes les autres sessions ont été révoquées')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold"
                >
                  Déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: AJOUTER UN UTILISATEUR */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">
                    Ajouter un utilisateur
                  </h3>
                  <p className="text-xs text-slate-400">
                    Créez un nouveau compte avec accès à la plateforme
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mourad Zouari"
                    value={newUserForm.name}
                    onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="m.zouari@entreprise.tn"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+216 22 111 222"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Entreprise
                  </label>
                  <select
                    value={newUserForm.company}
                    onChange={e => setNewUserForm({ ...newUserForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    {companiesList.map(comp => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Site / Usine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Usine Principale"
                    value={newUserForm.site}
                    onChange={e => setNewUserForm({ ...newUserForm, site: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={e =>
                      setNewUserForm({
                        ...newUserForm,
                        role: e.target.value as UserItem['role']
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Admin Entreprise">Admin Entreprise</option>
                    <option value="Technicien">Technicien</option>
                    <option value="Responsable">Responsable</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fonction / Poste
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Technicien de Maintenance Électrique"
                    value={newUserForm.jobTitle}
                    onChange={e => setNewUserForm({ ...newUserForm, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFIER L'UTILISATEUR */}
      {isEditUserModalOpen && editUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">
                    Modifier l'utilisateur
                  </h3>
                  <p className="text-xs text-slate-400">
                    Édition des coordonnées et privilèges de {editUserForm.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={editUserForm.name}
                    onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Statut
                  </label>
                  <select
                    value={editUserForm.status}
                    onChange={e =>
                      setEditUserForm({
                        ...editUserForm,
                        status: e.target.value as UserItem['status'],
                        statusColor:
                          e.target.value === 'Actif'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : e.target.value === 'En attente'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Actif">Actif</option>
                    <option value="En attente">En attente</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle
                  </label>
                  <select
                    value={editUserForm.role}
                    onChange={e =>
                      setEditUserForm({
                        ...editUserForm,
                        role: e.target.value as UserItem['role'],
                        roleColor:
                          e.target.value === 'Admin Entreprise'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
                            : e.target.value === 'Responsable'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200'
                            : e.target.value === 'Super Admin'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Admin Entreprise">Admin Entreprise</option>
                    <option value="Technicien">Technicien</option>
                    <option value="Responsable">Responsable</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={editUserForm.jobTitle}
                    onChange={e => setEditUserForm({ ...editUserForm, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GÉRER LES RÔLES ET PERMISSIONS */}
      {isManageRolesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Gérer les permissions ({selectedUser.name})
              </h3>
              <button
                onClick={() => setIsManageRolesModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
              {[
                'Gestion utilisateurs',
                'Gestion équipements',
                'Maintenance (OT)',
                'Stock & achats',
                'Rapports',
                'Paramètres entreprise',
                'Audit Système Global',
                'Exportation Télémetrie'
              ].map(perm => {
                const isChecked = selectedUser.permissions.includes(perm);
                return (
                  <label
                    key={perm}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100/50"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {perm}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const updatedPerms = isChecked
                          ? selectedUser.permissions.filter(p => p !== perm)
                          : [...selectedUser.permissions, perm];
                        setUsersList(prev =>
                          prev.map(u =>
                            u.id === selectedUser.id ? { ...u, permissions: updatedPerms } : u
                          )
                        );
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsManageRolesModalOpen(false);
                showToast('Permissions mises à jour avec succès');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
            >
              Valider les modifications
            </button>
          </div>
        </div>
      )}

      {/* MODAL: GÉRER LES SITES AUTORISÉS */}
      {isManageSitesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Sites autorisés ({selectedUser.name})
              </h3>
              <button
                onClick={() => setIsManageSitesModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
              {[
                'Usine Principale',
                'Site Sud',
                'Ligne Concentré',
                'Ligne 1',
                'Ligne 2',
                'Conditionnement',
                'Chambre Froide',
                'Dépôt Central'
              ].map(siteName => {
                const isAuthorized = selectedUser.authorizedSites.some(s => s.name === siteName);
                return (
                  <label
                    key={siteName}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {siteName}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAuthorized}
                      onChange={() => {
                        const updatedSites = isAuthorized
                          ? selectedUser.authorizedSites.filter(s => s.name !== siteName)
                          : [...selectedUser.authorizedSites, { name: siteName, status: 'Actif' as const }];
                        setUsersList(prev =>
                          prev.map(u =>
                            u.id === selectedUser.id ? { ...u, authorizedSites: updatedSites } : u
                          )
                        );
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsManageSitesModalOpen(false);
                showToast('Affectations de sites mises à jour');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
            >
              Enregistrer les affectations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
