import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Settings, Trash2, Edit2 } from 'lucide-react';
import { Equipe } from '@/shared/types/gmao';

interface TeamManagementProps {
  can: (permission: string) => boolean;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ can }) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      // Mock data since equipesApi is deleted
      setEquipes([]);
    } catch (err) {
      console.error('Failed to load equipes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette équipe ?')) return;
    try {
      setEquipes(equipes.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete equipe', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div>Chargement des équipes...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-white">Équipes</h3>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-sm font-medium transition-colors"
          onClick={() => { /* Open modal to create team */ alert("Modal Création Equipe - à implémenter") }}
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Équipe</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nom de l'équipe</th>
              <th className="px-4 py-3 font-medium">Chef d'équipe</th>
              <th className="px-4 py-3 font-medium">Membres</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {equipes.map((equipe) => (
              <tr key={equipe.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {equipe.nom}
                  </div>
                  <div className="text-xs text-slate-500">{equipe.description}</div>
                </td>
                <td className="px-4 py-3">
                  {equipe.chefEquipeNom || <span className="text-slate-400 italic">Non assigné</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
                      {equipe.membres?.length || 0} membres
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 text-slate-400 hover:text-indigo-500 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(equipe.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {equipes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Aucune équipe trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
