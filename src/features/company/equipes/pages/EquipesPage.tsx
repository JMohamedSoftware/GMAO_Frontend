import React, { useState } from "react";
import { useGmao } from "@/shared/hooks/useGmao";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Equipe } from "@/shared/types/gmao";
import {
  Users, Plus, Pencil, Trash2, X, Check, Shield,
  UserCheck, UsersRound, Star
} from "lucide-react";

const COLORS = [
  { label: "Bleu", bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30" },
  { label: "Vert", bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30" },
  { label: "Violet", bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/30" },
  { label: "Orange", bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30" },
  { label: "Rose", bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30" },
  { label: "Cyan", bg: "bg-cyan-500", text: "text-cyan-600", light: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-900/30" },
];

const DEFAULT_COLOR = COLORS[0];

interface EquipeFormData {
  nom: string;
  description: string;
  couleur: string;
  chefId: string;
  technicienIds: string[];
}

const emptyForm = (): EquipeFormData => ({
  nom: "", description: "", couleur: COLORS[0].bg, chefId: "", technicienIds: []
});

export const EquipesPage: React.FC = () => {
  const { equipes, users, technicians, addEquipe, updateEquipe, deleteEquipe } = useGmao();
  const { isResponsable } = usePermissions();

  const [showModal, setShowModal] = useState(false);
  const [editEquipe, setEditEquipe] = useState<Equipe | null>(null);
  const [form, setForm] = useState<EquipeFormData>(emptyForm());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const chefEquipeUsers = users.filter(u => u.role === "Chef d\u0027\u00e9quipe");

  const getColorDef = (colorClass?: string) =>
    COLORS.find(c => c.bg === colorClass) || DEFAULT_COLOR;

  const openCreate = () => {
    setEditEquipe(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (eq: Equipe) => {
    setEditEquipe(eq);
    setForm({ nom: eq.nom, description: eq.description || "", couleur: eq.couleur || COLORS[0].bg, chefId: eq.chefId, technicienIds: [...eq.technicienIds] });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nom || !form.chefId) return;
    if (editEquipe) { updateEquipe({ ...editEquipe, ...form }); }
    else { addEquipe(form); }
    setShowModal(false);
  };

  const toggleTech = (techId: string) => {
    setForm(prev => ({
      ...prev,
      technicienIds: prev.technicienIds.includes(techId)
        ? prev.technicienIds.filter(id => id !== techId)
        : [...prev.technicienIds, techId]
    }));
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <UsersRound className="w-6 h-6 text-primary" /> Gestion des Equipes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            Organisez les techniciens par equipe avec leur chef referent
          </p>
        </div>
        {isResponsable && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift cursor-pointer">
            <Plus className="w-4 h-4" /> Nouvelle Equipe
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Equipes", value: equipes.length, color: "text-primary" },
          { label: "Chefs d-equipe", value: chefEquipeUsers.length, color: "text-purple-600" },
          { label: "Techniciens assignes", value: equipes.reduce((acc, eq) => acc + eq.technicienIds.length, 0), color: "text-emerald-600" },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Empty */}
      {equipes.length === 0 && (
        <div className="glass-panel p-12 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col items-center gap-4">
          <UsersRound className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          <div className="text-center">
            <p className="font-bold text-slate-500">Aucune equipe creee</p>
            <p className="text-xs text-slate-400 mt-1">Cliquez sur "Nouvelle Equipe" pour commencer</p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {equipes.map(eq => {
          const colorDef = getColorDef(eq.couleur);
          const chef = users.find(u => String(u.id) === String(eq.chefId));
          const teamTechs = technicians.filter(t => eq.technicienIds.includes(t.id));
          return (
            <div key={eq.id} className="neumorphic-card bg-white/60 dark:bg-slate-900/20 rounded-custom-lg border border-white/50 dark:border-slate-850/40 p-5 flex flex-col gap-4 hover-lift group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colorDef.bg} flex items-center justify-center shadow-md`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">{eq.nom}</h3>
                    {eq.description && <p className="text-[10px] text-slate-400 mt-0.5">{eq.description}</p>}
                  </div>
                </div>
                {isResponsable && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(eq)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-800 text-slate-500 transition cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirmDelete(eq.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 text-slate-500 transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              {/* Chef */}
              <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${colorDef.light}`}>
                <Star className={`w-3.5 h-3.5 ${colorDef.text} flex-shrink-0`} />
                {chef ? (
                  <>
                    <img src={chef.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chef.name)}&background=random&color=fff&size=64`} alt={chef.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] font-extrabold ${colorDef.text} truncate`}>{chef.name}</p>
                      <p className="text-[9px] text-slate-400">Chef d-equipe</p>
                    </div>
                  </>
                ) : <span className="text-[10px] text-slate-400 italic">Chef non trouve</span>}
                <Shield className={`w-3 h-3 ${colorDef.text} flex-shrink-0`} />
              </div>
              {/* Techs */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Techniciens ({teamTechs.length})
                </span>
                {teamTechs.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">Aucun technicien assigne</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {teamTechs.map(t => (
                      <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <img src={t.avatar} alt={t.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{t.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.status === "Disponible" ? "bg-emerald-100 text-emerald-600" : t.status === "Occupe" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> {editEquipe ? "Modifier" : "Nouvelle equipe"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
              {/* Nom */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Nom de l-equipe *</label>
                <input type="text" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Ex: Equipe Electrique" className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary font-semibold" />
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Description (optionnel)</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ex: Specialisee en electricite industrielle" className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary" />
              </div>
              {/* Couleur */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c.bg} onClick={() => setForm(p => ({ ...p, couleur: c.bg }))} className={`w-7 h-7 rounded-full ${c.bg} cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${form.couleur === c.bg ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}>
                      {form.couleur === c.bg && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              {/* Chef */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Chef d-equipe *</label>
                {chefEquipeUsers.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">Aucun utilisateur avec le role Chef d-equipe</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {chefEquipeUsers.map(u => (
                      <button key={u.id} onClick={() => setForm(p => ({ ...p, chefId: String(u.id) }))} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all ${form.chefId === String(u.id) ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"}`}>
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff&size=64`} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">{u.name}</span>
                        {form.chefId === String(u.id) && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Techniciens */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Techniciens ({form.technicienIds.length} selectionne{form.technicienIds.length > 1 ? "s" : ""})</label>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {technicians.map(t => {
                    const selected = form.technicienIds.includes(t.id);
                    return (
                      <button key={t.id} onClick={() => toggleTech(t.id)} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all ${selected ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-700 hover:border-emerald-400/50"}`}>
                        <img src={t.avatar} alt={t.name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.role}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${t.status === "Disponible" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>{t.status}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer">Annuler</button>
              <button onClick={handleSave} disabled={!form.nom || !form.chefId} className="flex-1 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {editEquipe ? "Enregistrer" : "Creer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-800 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center"><Trash2 className="w-5 h-5 text-rose-500" /></div>
              <div><h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Supprimer l-equipe</h3><p className="text-xs text-slate-400 mt-0.5">Action irreversible.</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">Annuler</button>
              <button onClick={() => { deleteEquipe(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg cursor-pointer">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
