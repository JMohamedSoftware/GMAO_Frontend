import React from 'react';
import { UserPlus, Edit2, X, Check, Save } from 'lucide-react';
import { UserAccount } from '@/shared/types/gmao';

interface AdminModalsProps {
  isAddUserOpen: boolean;
  setIsAddUserOpen: (open: boolean) => void;
  handleAddUser: (e: React.FormEvent) => void;
  newUser: any;
  setNewUser: (user: any) => void;
  availableRoles: {id: number, nom: string}[];
  isSubmitting?: boolean;
  
  isEditUserOpen: boolean;
  setIsEditUserOpen: (open: boolean) => void;
  handleEditUser: (e: React.FormEvent) => void;
  editingUser: UserAccount | null;
  setEditingUser: (user: UserAccount | null) => void;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
  isAddUserOpen, setIsAddUserOpen, handleAddUser, newUser, setNewUser, availableRoles,
  isEditUserOpen, setIsEditUserOpen, handleEditUser, editingUser, setEditingUser, isSubmitting
}) => {
  return (
    <>
      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-custom-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-primary" />
                Ajouter un Utilisateur
              </h3>
              <button 
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5 items-center pb-2">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:border-primary transition-colors group">
                  {newUser.avatar ? (
                    <img src={newUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-[10px]">Changer</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewUser({ ...newUser, avatar: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">Photo de profil (Optionnel)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Nom Complet *</label>
                  <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="Jean Dupont" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Adresse E-mail *</label>
                  <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="jean.dupont@entreprise.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Téléphone</label>
                  <input type="text" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="+216 XX XXX XXX" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Département</label>
                  <input type="text" value={newUser.department} onChange={(e) => setNewUser({...newUser, department: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="Ex: Maintenance" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Mot de Passe *</label>
                  <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="••••••••" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Confirmer *</label>
                  <input type="password" required className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="••••••••" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Rôle *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    {availableRoles.map(r => (
                      <option key={r.id} value={r.nom}>{r.nom}</option>
                    ))}
                    {availableRoles.length === 0 && <option value="Technicien">Technicien</option>}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Statut</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>



              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Ajout en cours...' : "Confirmer l'ajout"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-custom-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-primary" />
                Modifier l'Utilisateur
              </h3>
              <button 
                onClick={() => setIsEditUserOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="p-5 flex flex-col gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-3">
                <img src={editingUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{editingUser.name}</div>
                  <div className="text-[10px] text-slate-500">{editingUser.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Nom Complet</label>
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Téléphone</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400">Rôle</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                >
                  {availableRoles.map(r => (
                    <option key={r.id} value={r.nom}>{r.nom}</option>
                  ))}
                  {availableRoles.length === 0 && <option value={editingUser.role}>{editingUser.role}</option>}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400">Statut</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-500 dark:text-slate-400">Nouveau Mot de Passe (optionnel)</label>
                <input 
                  type="password" 
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary"
                  placeholder="Laisser vide pour ne pas changer"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
