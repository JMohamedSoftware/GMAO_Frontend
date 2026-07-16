import React, { useState } from 'react';
import { Equipment, Incident } from '../../../types/gmao';

interface DashboardRecentActivitiesProps {
  equipments: Equipment[];
  unassignedOts: any[];
  addIncident: (inc: any) => void;
  onNavigate: (screen: string) => void;
}

export const DashboardRecentActivities: React.FC<DashboardRecentActivitiesProps> = ({
  equipments,
  unassignedOts,
  addIncident,
  onNavigate
}) => {
  const [formEqId, setFormEqId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrgency, setFormUrgency] = useState<Incident['urgency']>('Moyenne');
  const [successSaved, setSuccessSaved] = useState(false);

  const handleInlineIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEqId || !formDesc) return;

    addIncident({
      equipmentId: formEqId,
      description: formDesc,
      reportedBy: 'Utilisateur Actuel', // In a real app, from context
      urgency: formUrgency
    });

    setFormEqId('');
    setFormDesc('');
    setFormUrgency('Moyenne');
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2500);
  };

  return (
    <>
      {/* Demande d'intervention inline Form */}
      <div 
        id="di-form" 
        className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm flex flex-col gap-4 relative"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">
            Déclarer une panne (Demande d'intervention)
          </h3>
          {successSaved && (
            <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-pulse">
              Envoyé !
            </span>
          )}
        </div>

        <form onSubmit={handleInlineIncidentSubmit} className="flex flex-col gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-[9px] uppercase font-bold">Équipement en panne *</label>
            <select
              required
              value={formEqId}
              onChange={(e) => setFormEqId(e.target.value)}
              className="p-2 bg-white/50 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="" className="dark:bg-slate-900">Sélectionner la machine...</option>
              {equipments.map(e => (
                <option key={e.id} value={e.id} className="dark:bg-slate-900">{e.name} ({e.id})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-[9px] uppercase font-bold">Symptômes constatés *</label>
            <textarea
              required
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Expliquez brièvement le problème..."
              className="p-2 bg-white/50 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-[9px] uppercase font-bold">Urgence</label>
              <select
                value={formUrgency}
                onChange={(e) => setFormUrgency(e.target.value as Incident['urgency'])}
                className="p-2 bg-white/50 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200 dark:bg-slate-900"
              >
                <option value="Faible" className="dark:bg-slate-900">Faible</option>
                <option value="Moyenne" className="dark:bg-slate-900">Moyenne</option>
                <option value="Haute" className="dark:bg-slate-900">Haute</option>
                <option value="Critique" className="dark:bg-slate-900">Critique (Arrêt)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg shadow transition hover-lift text-center cursor-pointer"
              >
                Transmettre DI
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Interventions non affectées panel */}
      <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
          Interventions non affectées (OT en attente)
        </h3>
        
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
          {unassignedOts.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-slate-400 font-semibold">
              Toutes les interventions sont affectées !
            </div>
          ) : (
            unassignedOts.map(ot => (
              <div 
                key={ot.id}
                onClick={() => onNavigate(`workorder-detail:${ot.id}`)}
                className="p-2.5 rounded bg-white/45 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-800/80 flex justify-between items-center hover:border-primary/40 cursor-pointer transition-colors"
              >
                <div className="overflow-hidden mr-3">
                  <span className="font-mono text-[9px] font-bold text-slate-400 leading-none">{ot.id}</span>
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-350 truncate mt-0.5">{ot.title}</h4>
                </div>
                <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                  Affecter
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
