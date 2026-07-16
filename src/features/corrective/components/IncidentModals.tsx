import React from 'react';
import { Incident, Equipment } from '../../../types/gmao';
import { AlertCircle, X, MapPin, Camera, Video, FileText, Mic } from 'lucide-react';

interface IncidentModalsProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  equipments: Equipment[];
  selectedEqId: string;
  setSelectedEqId: (id: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  urgency: Incident['urgency'];
  setUrgency: (urg: Incident['urgency']) => void;
  photo: string;
  setPhoto: (photo: string) => void;
  handleReportIncident: (e: React.FormEvent) => void;
}

export const IncidentModals: React.FC<IncidentModalsProps> = ({
  showAddModal, setShowAddModal, equipments, selectedEqId, setSelectedEqId,
  description, setDescription, urgency, setUrgency, photo, setPhoto, handleReportIncident
}) => {
  return (
    <>
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Signaler une Panne Machine
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="p-6 flex flex-col gap-4 text-xs">
              
              {/* Equipment field */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Équipement concerné *</label>
                <select
                  required
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900 cursor-pointer"
                >
                  <option value="">Choisir la machine...</option>
                  {equipments.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id}) • {e.location}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Symptômes constatés *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Exemple: Bruit de frottement métallique au niveau du convoyeur, odeur de chaud..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:border-rose-500 outline-none resize-none shadow-inner"
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 cursor-pointer">Fuite</button>
                  <button type="button" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 cursor-pointer">Bruit anormal</button>
                  <button type="button" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 cursor-pointer">Arrêt machine</button>
                </div>
              </div>

              {/* Impact Production */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Impact sur la Production</label>
                <select className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:border-rose-500 outline-none shadow-inner cursor-pointer">
                  <option>Aucun impact (machine en marche)</option>
                  <option>Marche dégradée (cadence réduite)</option>
                  <option>Arrêt total de la ligne</option>
                </select>
              </div>

              {/* Localisation (Auto-filled) */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Localisation</label>
                <div className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {selectedEqId ? equipments.find(e => e.id === selectedEqId)?.location : 'Sélectionnez un équipement d\'abord'}
                  </span>
                </div>
              </div>

              {/* Attachments / Upload */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Pièces jointes</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>Photo</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer">
                    <Video className="w-4 h-4" />
                    <span>Vidéo</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer">
                    <Mic className="w-4 h-4" />
                    <span>Audio</span>
                  </button>
                </div>
              </div>

              {/* Urgency */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Niveau d'urgence / Criticité panne</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Faible', 'Moyenne', 'Haute', 'Critique'] as const).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`py-2 rounded font-bold text-[10px] border transition cursor-pointer ${
                        urgency === u 
                          ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                          : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden Photo Link Simulation for Mockup */}
              <input
                type="hidden"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Signaler l'Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
