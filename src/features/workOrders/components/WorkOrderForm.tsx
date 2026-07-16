import React from 'react';
import { Wrench, X } from 'lucide-react';
import { WorkOrder, Equipment, Technician, Incident } from '../../../types/gmao';

interface WorkOrderFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  equipments: Equipment[];
  technicians: Technician[];
  newTitle: string;
  setNewTitle: (v: string) => void;
  newDesc: string;
  setNewDesc: (v: string) => void;
  newType: WorkOrder['type'];
  setNewType: (v: WorkOrder['type']) => void;
  newPriority: WorkOrder['priority'];
  setNewPriority: (v: WorkOrder['priority']) => void;
  newEqId: string;
  setNewEqId: (v: string) => void;
  newTechId: string;
  setNewTechId: (v: string) => void;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  show,
  onClose,
  onSubmit,
  equipments,
  technicians,
  newTitle,
  setNewTitle,
  newDesc,
  setNewDesc,
  newType,
  setNewType,
  newPriority,
  setNewPriority,
  newEqId,
  setNewEqId,
  newTechId,
  setNewTechId
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Créer un Ordre de Travail (OT)
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Équipement concerné *</label>
              <select
                required
                value={newEqId}
                onChange={(e) => setNewEqId(e.target.value)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
              >
                <option value="">Choisir la machine...</option>
                {equipments.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Technicien assigné</label>
              <select
                value={newTechId}
                onChange={(e) => setNewTechId(e.target.value)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
              >
                <option value="">Non assigné (En attente)</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Titre de l'intervention *</label>
            <input
              type="text"
              required
              placeholder="Ex: Remplacement du joint presse-étoupe pompe"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Instructions / Travaux requis</label>
            <textarea
              rows={3}
              placeholder="Détaillez la procédure d'intervention et consignes de sécurité..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Type de Maintenance</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as WorkOrder['type'])}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
              >
                <option value="Correctif">Corrective (Panne)</option>
                <option value="Préventif">Préventive (Calendrier)</option>
                <option value="Curatif">Curative (Urgente)</option>
                <option value="Amélioratif">Améliorative (Mise à jour)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Priorité</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as WorkOrder['priority'])}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
              >
                <option value="Critique">Critique</option>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md shadow-primary/10"
            >
              Générer le Bon OT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
