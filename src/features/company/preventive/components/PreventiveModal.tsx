import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Calendar, Clock, Zap, Layers,
  ChevronDown, CheckCircle, Circle, AlertTriangle
} from 'lucide-react';
import type { PlanPreventif, TachePreventive, CreatePlanDto } from '../types/preventive.types';

interface PreventiveModalProps {
  editingPlan: PlanPreventif | null;
  equipments: any[];
  onSave: (payload: CreatePlanDto) => Promise<void>;
  onClose: () => void;
}

const FREQ_PRESETS = [
  { label: '1 semaine',   frequence: 1,  uniteMesure: 'semaines' },
  { label: '2 semaines',  frequence: 2,  uniteMesure: 'semaines' },
  { label: '1 mois',      frequence: 1,  uniteMesure: 'mois' },
  { label: '3 mois',      frequence: 3,  uniteMesure: 'mois' },
  { label: '6 mois',      frequence: 6,  uniteMesure: 'mois' },
  { label: '1 an',        frequence: 12, uniteMesure: 'mois' },
  { label: '500 heures',  frequence: 500, uniteMesure: 'heures' },
  { label: '1000 heures', frequence: 1000, uniteMesure: 'heures' },
];

const TACHE_TEMPLATES: Record<string, string[]> = {
  'Pompe':        ['Contrôler l\'étanchéité', 'Vérifier la pression d\'huile', 'Graisser les roulements', 'Mesurer les vibrations'],
  'Convoyeur':    ['Vérifier la tension de la bande', 'Contrôler l\'alignement des rouleaux', 'Lubrifier les chaînes', 'Inspecter les galets'],
  'Compresseur':  ['Vidanger et remplacer l\'huile', 'Vérifier les filtres à air', 'Contrôler la pression de service', 'Tester les soupapes de sécurité'],
  'Chaudière':    ['Contrôle réglementaire pression vapeur', 'Vérifier les soupapes de sécurité', 'Analyser l\'eau de chaudière', 'Inspecter les brûleurs'],
  'Autoclave':    ['Test d\'étanchéité des joints', 'Vérifier la résistance électrique', 'Calibrer le capteur de température', 'Nettoyer le filtre vapeur'],
};

export const PreventiveModal: React.FC<PreventiveModalProps> = ({
  editingPlan, equipments, onSave, onClose
}) => {
  const isEdit = Boolean(editingPlan);

  // Form state
  const [titre,             setTitre]           = useState('');
  const [description,       setDescription]     = useState('');
  const [equipementId,      setEquipementId]     = useState<number | ''>('');
  const [typeDeclenchement, setTypeDeclenchement] = useState<1 | 2 | 3>(1);
  const [frequence,         setFrequence]        = useState<number>(30);
  const [uniteMesure,       setUniteMesure]      = useState('jours');
  const [derniereDate,      setDerniereDate]     = useState('');
  const [prochaineDate,     setProchaineDate]    = useState('');
  const [taches,            setTaches]           = useState<Omit<TachePreventive, 'id' | 'ordre'>[]>([
    { description: '', dureeEstimeeMinutes: undefined, estObligatoire: true }
  ]);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'taches'>('info');

  // Populate on edit
  useEffect(() => {
    if (editingPlan) {
      setTitre(editingPlan.titre);
      setDescription(editingPlan.description || '');
      setEquipementId(editingPlan.equipementId);
      setTypeDeclenchement(editingPlan.typeDeclenchement);
      setFrequence(editingPlan.frequence);
      setUniteMesure(editingPlan.uniteMesure || 'jours');
      setDerniereDate(editingPlan.derniereDate || '');
      setProchaineDate(editingPlan.prochaineDate || '');
      setTaches(editingPlan.taches.length > 0
        ? editingPlan.taches.map(t => ({ description: t.description, dureeEstimeeMinutes: t.dureeEstimeeMinutes, estObligatoire: t.estObligatoire }))
        : [{ description: '', dureeEstimeeMinutes: undefined, estObligatoire: true }]
      );
    }
  }, [editingPlan]);

  // Auto-compute prochaine date when derniereDate or frequence changes
  useEffect(() => {
    if (!derniereDate || !frequence) return;
    const base = new Date(derniereDate);
    if (uniteMesure === 'jours')    base.setDate(base.getDate() + frequence);
    else if (uniteMesure === 'semaines') base.setDate(base.getDate() + frequence * 7);
    else if (uniteMesure === 'mois')  base.setMonth(base.getMonth() + frequence);
    else return; // heures → manuel
    setProchaineDate(base.toISOString().split('T')[0]);
  }, [derniereDate, frequence, uniteMesure]);

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!titre.trim())          e.titre = 'Le titre est obligatoire';
    if (!equipementId)          e.equipementId = 'Sélectionnez un équipement';
    if (!frequence || frequence <= 0) e.frequence = 'La fréquence doit être > 0';
    if (!prochaineDate)         e.prochaineDate = 'La prochaine date est obligatoire';
    const tachesInvalides = taches.some(t => !t.description.trim());
    if (tachesInvalides)        e.taches = 'Toutes les tâches doivent avoir une description';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        titre,
        description: description || undefined,
        equipementId: equipementId as number,
        typeDeclenchement,
        frequence,
        uniteMesure,
        derniereDate: derniereDate || undefined,
        prochaineDate,
        actif: true,
        taches: taches
          .filter(t => t.description.trim())
          .map((t, i) => ({ ...t, ordre: i + 1 })),
      });
    } finally {
      setSaving(false);
    }
  };

  const addTache = () => setTaches(p => [...p, { description: '', dureeEstimeeMinutes: undefined, estObligatoire: true }]);
  const removeTache = (i: number) => setTaches(p => p.filter((_, idx) => idx !== i));
  const updateTache = (i: number, field: string, value: any) =>
    setTaches(p => p.map((t, idx) => idx === i ? { ...t, [field]: value } : t));

  const applyTemplate = (template: string[]) => {
    setTaches(template.map(desc => ({ description: desc, dureeEstimeeMinutes: undefined, estObligatoire: true })));
  };

  const applyPreset = (preset: typeof FREQ_PRESETS[0]) => {
    setFrequence(preset.frequence);
    setUniteMesure(preset.uniteMesure);
  };

  // Detect equipment category for template suggestions
  const selectedEq = equipments.find(e => e.id?.toString() === equipementId?.toString());
  const templateKey = selectedEq ? Object.keys(TACHE_TEMPLATES).find(k => selectedEq.category?.includes(k) || selectedEq.name?.includes(k)) : null;
  const suggestedTemplate = templateKey ? TACHE_TEMPLATES[templateKey] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 dark:text-white text-base">
                {isEdit ? 'Modifier le Plan Préventif' : 'Nouveau Plan Préventif'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isEdit ? `PRV-${editingPlan!.id.toString().padStart(3, '0')}` : 'Planification périodique ou par compteur'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
          {(['info', 'taches'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'info' ? '📋 Informations' : `✅ Tâches (${taches.filter(t => t.description).length})`}
              {tab === 'taches' && errors.taches && (
                <AlertTriangle className="w-3 h-3 text-rose-500 inline ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">

          {/* ── Tab: Informations ── */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-5">

              {/* Titre */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Titre du plan <span className="text-rose-500">*</span>
                </label>
                <input
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  placeholder="Ex: Contrôle mensuel pression vapeur"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.titre ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}
                />
                {errors.titre && <p className="text-rose-500 text-[10px] mt-1">{errors.titre}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Contexte, notes réglementaires…"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                />
              </div>

              {/* Équipement */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Équipement <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={equipementId}
                    onChange={e => setEquipementId(parseInt(e.target.value) || '')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 appearance-none transition ${errors.equipementId ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    <option value="">— Sélectionner un équipement —</option>
                    {equipments.map(e => (
                      <option key={e.id} value={e.id}>{e.name} {e.category && `(${e.category})`}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.equipementId && <p className="text-rose-500 text-[10px] mt-1">{errors.equipementId}</p>}
              </div>

              {/* Type déclenchement */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Type de déclenchement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { val: 1 as const, label: 'Périodique', icon: <Clock className="w-4 h-4" />, color: 'text-sky-600 border-sky-300 bg-sky-50 dark:bg-sky-900/20' },
                    { val: 2 as const, label: 'Compteur',   icon: <Zap className="w-4 h-4" />,   color: 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20' },
                    { val: 3 as const, label: 'Saisonnier', icon: <Layers className="w-4 h-4" />, color: 'text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-900/20' },
                  ]).map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setTypeDeclenchement(opt.val)}
                      className={`flex flex-col items-center gap-1.5 py-3 border rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        typeDeclenchement === opt.val ? opt.color + ' ring-2 ring-offset-1 ring-primary/40' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fréquence */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Fréquence <span className="text-rose-500">*</span>
                </label>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {FREQ_PRESETS.filter(p =>
                    typeDeclenchement === 2 ? p.uniteMesure === 'heures' : p.uniteMesure !== 'heures'
                  ).map(p => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        frequence === p.frequence && uniteMesure === p.uniteMesure
                          ? 'bg-primary text-white border-primary'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={frequence}
                    onChange={e => setFrequence(parseInt(e.target.value) || 1)}
                    className={`w-28 border rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.frequence ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  <select
                    value={uniteMesure}
                    onChange={e => setUniteMesure(e.target.value)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="jours">Jours</option>
                    <option value="semaines">Semaines</option>
                    <option value="mois">Mois</option>
                    <option value="heures">Heures machine</option>
                  </select>
                </div>
                {errors.frequence && <p className="text-rose-500 text-[10px] mt-1">{errors.frequence}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Dernière intervention
                  </label>
                  <input
                    type="date"
                    value={derniereDate}
                    onChange={e => setDerniereDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Prochaine date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={prochaineDate}
                    onChange={e => setProchaineDate(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.prochaineDate ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  {errors.prochaineDate && <p className="text-rose-500 text-[10px] mt-1">{errors.prochaineDate}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Tâches ── */}
          {activeTab === 'taches' && (
            <div className="flex flex-col gap-4">

              {/* Template suggestion */}
              {suggestedTemplate && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
                  <div className="text-primary mt-0.5">💡</div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-primary mb-1">
                      Modèle disponible pour "{templateKey}"
                    </p>
                    <p className="text-[10px] text-slate-500 mb-2">
                      {suggestedTemplate.length} tâches types préchargées
                    </p>
                    <button
                      onClick={() => applyTemplate(suggestedTemplate)}
                      className="text-[10px] font-bold text-primary border border-primary/30 px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition cursor-pointer"
                    >
                      Appliquer ce modèle
                    </button>
                  </div>
                </div>
              )}

              {errors.taches && (
                <p className="text-rose-500 text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.taches}
                </p>
              )}

              {/* Tâche list */}
              <div className="flex flex-col gap-2">
                {taches.map((tache, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <button
                      onClick={() => updateTache(i, 'estObligatoire', !tache.estObligatoire)}
                      className="mt-2.5 flex-shrink-0 cursor-pointer transition"
                      title={tache.estObligatoire ? 'Obligatoire' : 'Optionnel'}
                    >
                      {tache.estObligatoire
                        ? <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                        : <Circle className="w-4.5 h-4.5 text-slate-400" />
                      }
                    </button>

                    <div className="flex-1 flex gap-2">
                      <input
                        value={tache.description}
                        onChange={e => updateTache(i, 'description', e.target.value)}
                        placeholder={`Tâche ${i + 1}…`}
                        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="min"
                        value={tache.dureeEstimeeMinutes || ''}
                        onChange={e => updateTache(i, 'dureeEstimeeMinutes', parseInt(e.target.value) || undefined)}
                        className="w-16 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition text-center"
                      />
                    </div>

                    <button
                      onClick={() => removeTache(i)}
                      disabled={taches.length === 1}
                      className="mt-2 text-slate-300 hover:text-rose-500 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addTache}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-3 text-xs font-bold text-slate-400 hover:border-primary hover:text-primary transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter une tâche
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Cliquez sur ✅/○ pour marquer une tâche comme obligatoire ou optionnelle · Entrez la durée en minutes
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-white text-sm font-bold transition cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'info' && (
              <button
                onClick={() => setActiveTab('taches')}
                className="text-xs font-bold text-primary border border-primary/30 px-4 py-2.5 rounded-lg hover:bg-primary/5 transition cursor-pointer"
              >
                Suivant : Tâches →
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer le plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
