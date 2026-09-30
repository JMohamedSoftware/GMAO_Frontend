import React, { useState } from 'react';
import { 
  X, Calendar, Check, Users, FileText, Wrench, AlertTriangle,
  Play, Link as LinkIcon, Edit, User, Phone, MapPin, Printer, ShieldAlert,
  CheckCircle, MoreHorizontal, FileCheck, ShieldCheck, Settings2
} from 'lucide-react';
import { WorkOrder, Equipment, Technician, SparePart } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useGmao } from '@/shared/hooks/useGmao';
import { PERMISSIONS } from '@/shared/permissions';

interface WorkOrderDetailProps {
  activeOt: WorkOrder | null | undefined;
  activeOtEq: Equipment | null | undefined;
  activeOtTech: Technician | null | undefined;
  technicians: Technician[];
  parts: SparePart[];
  onClose: () => void;
  onClearSelectedOt: () => void;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;
}

export const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({
  activeOt,
  activeOtEq,
  activeOtTech,
  technicians,
  parts,
  onClose,
  onClearSelectedOt,
  updateWorkOrderStatus
}) => {
  const { can } = usePermissions();
  const { currentUser } = useGmao();
  const ownerIds = () => {
    const ids: number[] = [];
    if (activeOt?.technicianId) ids.push(Number(activeOt.technicianId));
    return ids;
  };

  const [activeTab, setActiveTab] = useState<'vue_generale' | 'taches' | 'pieces' | 'documents' | 'historique'>('vue_generale');

  if (!activeOt) return null;

  const getStatusColor = (s: WorkOrder['status']) => {
    switch (s) {
      case 'Brouillon': return 'text-slate-500';
      case 'En attente': return 'text-amber-500';
      case 'Affecté Chef': return 'text-blue-500';
      case 'Affecté': return 'text-emerald-500';
      case 'En cours': return 'text-amber-500';
      case 'Suspendu': return 'text-orange-500';
      case 'Terminé': return 'text-emerald-600';
      case 'Clôturé': return 'text-emerald-700';
      default: return 'text-slate-500';
    }
  };

  const getStatusBg = (s: WorkOrder['status']) => {
    switch (s) {
      case 'Brouillon': return 'bg-slate-100 text-slate-700';
      case 'En attente': return 'bg-amber-100 text-amber-700';
      case 'Affecté Chef': return 'bg-blue-100 text-blue-700';
      case 'Affecté': return 'bg-emerald-100 text-emerald-700';
      case 'En cours': return 'bg-amber-100 text-amber-700';
      case 'Suspendu': return 'bg-orange-100 text-orange-700';
      case 'Terminé': return 'bg-emerald-100 text-emerald-700';
      case 'Clôturé': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const workflowSteps = [
    { id: 'Créé', label: 'Créé', date: '11/07 08:30' },
    { id: 'Affecté', label: 'Affecté', date: '11/07 09:15' },
    { id: 'En cours', label: 'En cours', date: '-' },
    { id: 'En validation', label: 'En validation', date: '-' },
    { id: 'Terminé', label: 'Terminé', date: '-' }
  ];
  
  // Logic to determine workflow progress
  let currentStepIdx = 0;
  if (activeOt.status === 'Affecté') currentStepIdx = 1;
  if (activeOt.status === 'En cours') currentStepIdx = 2;
  if (activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') currentStepIdx = 4;

  return (
    <div className="h-full flex flex-col w-full bg-slate-50/50 dark:bg-slate-900 rounded-custom-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      
      {/* ─── HEADER ─── */}
      <div className="p-5 pb-0 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{activeOt.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeOt.priority === 'Critique' ? 'bg-rose-100 text-rose-700' :
                activeOt.priority === 'Haute' ? 'bg-orange-100 text-orange-700' :
                activeOt.priority === 'Moyenne' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {activeOt.priority}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {activeOt.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {activeOt.description}
            </p>
          </div>
          <button onClick={() => { onClearSelectedOt(); onClose(); }} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── TABS ─── */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveTab('vue_generale')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'vue_generale' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <FileCheck className="w-4 h-4" /> Vue générale
          </button>
          <button onClick={() => setActiveTab('taches')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'taches' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <CheckCircle className="w-4 h-4" /> Tâches (4)
          </button>
          <button onClick={() => setActiveTab('pieces')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pieces' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <Wrench className="w-4 h-4" /> Pièces (3)
          </button>
          <button onClick={() => setActiveTab('documents')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <FileText className="w-4 h-4" /> Documents (5)
          </button>
          <button onClick={() => setActiveTab('historique')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <Calendar className="w-4 h-4" /> Historique
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4">
        {activeTab === 'vue_generale' && (
          <div className="flex flex-col gap-5">
            {/* Equipment Header (Was Left Column) */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative flex items-center justify-center shrink-0">
                <Settings2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-base leading-tight">{activeOtEq?.name || activeOt.equipmentId}</p>
                <p className="text-sm text-slate-500 mt-0.5">Laveuse à tambour</p>
                <div className="mt-1 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> En service
                </div>
              </div>
            </div>

            {/* Right Column (Info) */}
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Informations OT */}
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white">Informations OT</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                    <PlusIcon className="w-3.5 h-3.5" /> Modifier
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">N° OT</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{activeOt.id}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Type</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" /> {activeOt.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Priorité</span>
                    <span className={`font-bold text-sm ${activeOt.priority === 'Critique' ? 'text-rose-600' : activeOt.priority === 'Haute' ? 'text-orange-500' : activeOt.priority === 'Moyenne' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {activeOt.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Statut</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBg(activeOt.status)}`}>
                      <CheckCircle className="w-3 h-3 mr-1" /> {activeOt.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Date planifiée</span>
                    <span className="font-bold text-sm text-rose-600 flex items-center gap-1.5">
                      12/07/2026 <span className="text-xs text-rose-500">08:00</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Durée estimée</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">2 h</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Date limite</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      12/07/2026 <span className="text-xs text-slate-400">17:00</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Zone */}
              <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">Description des travaux</h3>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeOt.description || 'Aucune description spécifique fournie pour cette intervention.'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">Zone géographique</h3>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    Tri - Ligne Remplissage
                  </div>
                </div>
              </div>

              {/* Technicians & Teams */}
              <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Technicien affecté</h3>
                  {activeOtTech ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={activeOtTech.avatar} alt={activeOtTech.name} className="w-10 h-10 rounded-full border border-slate-200" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{activeOtTech.name}</p>
                          <p className="text-xs text-slate-500">{activeOtTech.role || 'Maintenance'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200">
                          Changer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic">Non affecté</div>
                  )}
                </div>
                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Équipe</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">MK</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white -ml-3">AT</div>
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white -ml-3">SL</div>
                  </div>
                </div>
              </div>

              {/* Workflow Status */}
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-sm">Statut du workflow</h3>
                <div className="flex items-center justify-between relative px-2">
                  <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                  <div className={`absolute top-3 left-4 h-0.5 bg-emerald-500 -z-10 transition-all duration-500`} style={{ width: `${(currentStepIdx / (workflowSteps.length - 1)) * 100}%` }}></div>
                  
                  {workflowSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-slate-900 ${
                          isCompleted ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {isCompleted && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <div className="text-center">
                          <p className={`text-[11px] font-bold ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{step.label}</p>
                          <p className="text-[9px] font-medium text-slate-400">{step.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety & Parts */}
              <div className="flex flex-col gap-4">
                {/* LOTO */}
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-700 dark:text-amber-500 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" /> Consignes de sécurité (LOTO)
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-amber-300" />
                      Consignation Électrique (Cadenas Rouge)
                    </label>
                    <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-amber-300" />
                      Purge Fluides / Pneumatique
                    </label>
                    <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-amber-300" />
                      Port des EPI (Gants, Lunettes de protection)
                    </label>
                  </div>
                </div>

                {/* Pièces */}
                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-400" /> Pièces nécessaires (3)
                    </h3>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Vérifier stock</button>
                  </div>
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="px-4 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Wrench className="w-3 h-3 text-slate-500" />
                        </div>
                        Sonde de température PT100
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">2</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">En stock</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Wrench className="w-3 h-3 text-slate-500" />
                        </div>
                        Sonde de pression 0-10 bar
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">1</span>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Stock faible</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Wrench className="w-3 h-3 text-slate-500" />
                        </div>
                        Joint torique DN50
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">4</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">En stock</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
        
        {/* Empty states for other tabs */}
        {activeTab !== 'vue_generale' && (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium italic">
            Contenu de l'onglet {activeTab} à implémenter.
          </div>
        )}
      </div>

      {/* ─── FOOTER ACTIONS ─── */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">
          <Printer className="w-4 h-4" /> Imprimer OT
        </button>
        <div className="flex items-center gap-2">
          {activeOt.status !== 'En cours' && activeOt.status !== 'Terminé' && activeOt.status !== 'Clôturé' && (
            <button onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
              <Play className="w-4 h-4" /> Démarrer l'OT
            </button>
          )}
          {(activeOt.status === 'En cours' || activeOt.status === 'Terminé') && (
            <button onClick={() => updateWorkOrderStatus(activeOt.id, 'Clôturé')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
              <Check className="w-4 h-4" /> Clôturer l'OT
            </button>
          )}
          <button className="p-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
