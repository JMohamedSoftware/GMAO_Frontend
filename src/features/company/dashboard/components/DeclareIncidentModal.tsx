import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Equipment, Incident } from '@/shared/types/gmao';

interface DeclareIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  addIncident: (inc: any) => void;
}

export const DeclareIncidentModal: React.FC<DeclareIncidentModalProps> = ({
  isOpen,
  onClose,
  equipments,
  addIncident
}) => {
  const [eqId, setEqId] = useState('');
  const [desc, setDesc] = useState('');
  const [urgency, setUrgency] = useState<Incident['urgency']>('Moyenne');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqId || !desc) return;

    addIncident({
      equipmentId: eqId,
      description: desc,
      reportedBy: 'Opérateur Usine',
      urgency: urgency
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEqId('');
      setDesc('');
      setUrgency('Moyenne');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Déclarer une panne (Demande d'intervention)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
              Demande d'intervention transmise !
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              L'équipe de maintenance a été notifiée immédiatement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Machine / Équipement concerné *
              </label>
              <select
                required
                value={eqId}
                onChange={(e) => setEqId(e.target.value)}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none focus:border-rose-500"
              >
                <option value="">Sélectionner une machine...</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Niveau d'urgence
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none focus:border-rose-500"
              >
                <option value="Faible">Faible - Ne bloque pas la production</option>
                <option value="Moyenne">Moyenne - À surveiller</option>
                <option value="Haute">Haute - Ralentit la chaîne</option>
                <option value="Critique">Critique - Machine à l'arrêt complet</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Description de l'anomalie / Symptômes *
              </label>
              <textarea
                required
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Bruit suspect au niveau du roulement, fuite de liquide..."
                className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer la demande
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
