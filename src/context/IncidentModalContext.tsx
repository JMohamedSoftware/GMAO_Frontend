import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useGmao } from '../hooks/useGmao';

interface IncidentModalContextType {
  openIncidentModal: (equipmentId?: string) => void;
  closeIncidentModal: () => void;
}

const IncidentModalContext = createContext<IncidentModalContextType | undefined>(undefined);

export const useIncidentModal = () => {
  const context = useContext(IncidentModalContext);
  if (!context) {
    throw new Error('useIncidentModal must be used within an IncidentModalProvider');
  }
  return context;
};

export const IncidentModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { equipments, addIncident, currentUser } = useGmao();
  
  const [isOpen, setIsOpen] = useState(false);
  const [eqId, setEqId] = useState('');
  const [desc, setDesc] = useState('');
  const [urgency, setUrgency] = useState<'Faible' | 'Moyenne' | 'Haute' | 'Critique'>('Moyenne');
  const [success, setSuccess] = useState(false);

  const openIncidentModal = (initialEquipmentId?: string) => {
    setEqId(initialEquipmentId || '');
    setDesc('');
    setUrgency('Moyenne');
    setSuccess(false);
    setIsOpen(true);
  };

  const closeIncidentModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqId || !desc) return;

    addIncident({
      equipmentId: eqId,
      description: desc,
      reportedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Operateur',
      urgency: urgency
    });

    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      closeIncidentModal();
    }, 2000);
  };

  return (
    <IncidentModalContext.Provider value={{ openIncidentModal, closeIncidentModal }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-850 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Signaler une Panne Machine
              </h3>
              <button 
                onClick={closeIncidentModal}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Panne signalée avec succès</h4>
                <p className="text-xs text-slate-500 leading-snug">
                  L'incident a été envoyé aux planificateurs. Les équipes de maintenance ont été notifiées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
                
                {/* Equipment field */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Équipement concerné *</label>
                  <select
                    required
                    value={eqId}
                    onChange={(e) => setEqId(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
                  >
                    <option value="">Choisir la machine...</option>
                    {equipments.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.id}) • {e.location}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Symptômes de la panne *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Décrire précisément le défaut constaté (ex: fuite vapeur bride, surchauffe moteur, bruit suspect...)"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none resize-none"
                  />
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
                        className={`py-2 rounded font-bold text-[10px] border transition ${
                          urgency === u 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                            : 'bg-transparent border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={closeIncidentModal}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold shadow-md shadow-rose-500/10 transition-colors"
                  >
                    Signaler l'Incident
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </IncidentModalContext.Provider>
  );
};
