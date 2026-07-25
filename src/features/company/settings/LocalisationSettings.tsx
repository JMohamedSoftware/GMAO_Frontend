import React, { useState } from 'react';
import { useLocalisations } from '@/shared/hooks/useLocalisations';
import { Plus, Trash2, Edit2, MapPin, ChevronRight, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import { Localisation } from '@/shared/types/gmao';

export const LocalisationSettings: React.FC = () => {
  const { tree, createLocalisation, updateLocalisation, deleteLocalisation, loading, error } = useLocalisations();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [addingParentId, setAddingParentId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (parentId?: number) => {
    if (!newName.trim()) return;
    try {
      await createLocalisation({ nom: newName, parentId });
      setNewName('');
      setAddingParentId(null);
      if (parentId) {
        setExpanded(prev => new Set(prev).add(parentId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await updateLocalisation(id, { nom: editName });
      setEditingId(null);
      setEditName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette localisation ?")) return;
    try {
      await deleteLocalisation(id);
    } catch (e: any) {
      alert(e.message || "Erreur lors de la suppression.");
    }
  };

  const renderNode = (node: Localisation, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.sousLocalisations && node.sousLocalisations.length > 0;
    const isEditing = editingId === node.id;
    const isAddingChild = addingParentId === node.id;

    return (
      <div key={node.id} className="w-full">
        <div 
          className="flex items-center group py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <button 
            onClick={() => toggleExpand(node.id)}
            className="w-6 h-6 flex items-center justify-center mr-1 text-slate-400 hover:text-primary transition-colors"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : <span className="w-4 h-4" />}
          </button>
          
          <div className="mr-2 text-amber-500">
            {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0 flex items-center">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-sm">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate(node.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
                <button onClick={() => handleUpdate(node.id)} className="text-xs font-bold text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">Ok</button>
                <button onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Annuler</button>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{node.nom}</span>
            )}
          </div>

          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button 
                onClick={() => {
                  setAddingParentId(node.id);
                  setNewName('');
                }}
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded"
                title="Ajouter une sous-localisation"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  setEditingId(node.id);
                  setEditName(node.nom);
                }}
                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded"
                title="Modifier"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleDelete(node.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {isAddingChild && (
          <div 
            className="flex items-center py-2 px-3 bg-primary/5 rounded-lg my-1 border border-primary/20"
            style={{ marginLeft: `${(level + 1) * 24 + 12}px` }}
          >
            <Folder className="w-4 h-4 text-primary/50 mr-2" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du sous-dossier..."
              className="flex-1 bg-white dark:bg-slate-900 border border-primary/30 rounded px-2 py-1 text-sm outline-none focus:border-primary text-slate-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate(node.id);
                if (e.key === 'Escape') setAddingParentId(null);
              }}
            />
            <div className="flex gap-2 ml-3">
              <button onClick={() => handleCreate(node.id)} className="text-xs font-bold text-primary hover:text-indigo-600 bg-primary/10 px-2 py-1 rounded">Ajouter</button>
              <button onClick={() => setAddingParentId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">Annuler</button>
            </div>
          </div>
        )}

        {isExpanded && node.sousLocalisations && node.sousLocalisations.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Arborescence des Localisations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez la structure géographique de votre usine (Sites, Bâtiments, Lignes, etc.)</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-4 border border-rose-100">
          {error}
        </div>
      )}

      <div className="mb-4">
        {!addingParentId && (
          <button 
            onClick={() => { setAddingParentId(0); setNewName(''); }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau Site (Racine)
          </button>
        )}

        {addingParentId === 0 && (
          <div className="flex items-center py-2 px-3 bg-primary/5 rounded-lg my-1 border border-primary/20 max-w-md">
            <Folder className="w-4 h-4 text-primary/50 mr-2" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du site principal..."
              className="flex-1 bg-white dark:bg-slate-900 border border-primary/30 rounded px-2 py-1 text-sm outline-none focus:border-primary text-slate-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate(undefined);
                if (e.key === 'Escape') setAddingParentId(null);
              }}
            />
            <div className="flex gap-2 ml-3">
              <button onClick={() => handleCreate(undefined)} className="text-xs font-bold text-primary hover:text-indigo-600 bg-primary/10 px-2 py-1 rounded">Ajouter</button>
              <button onClick={() => setAddingParentId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">Annuler</button>
            </div>
          </div>
        )}
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50">
        {loading && <div className="p-8 text-center text-slate-500">Chargement de l'arborescence...</div>}
        {!loading && tree.length === 0 && (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <MapPin className="w-8 h-8 text-slate-300 mb-2" />
            <p>Aucune localisation trouvée.</p>
          </div>
        )}
        {!loading && tree.map(node => renderNode(node, 0))}
      </div>
    </div>
  );
};
