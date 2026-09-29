import React, { useState } from 'react';
import { 
  FileCheck, AlertTriangle, Clock3, Trash2, CheckCircle, 
  X, Calendar, Check, Users, ShieldCheck, FileText, Settings2, Wrench, ShieldAlert,
  Play, Pause, Link as LinkIcon, Edit, User
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

  const [activeTab, setActiveTab] = useState<'pieces' | 'rapport' | 'intervenants'>('pieces');
  const [selectedPartRef, setSelectedPartRef] = useState<string>('');
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);

  if (!activeOt) return null;

  const getStatusColor = (s: WorkOrder['status']) => {
    switch (s) {
      case 'Brouillon': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
      case 'En attente': return 'bg-amber-100 text-amber-700';
      case 'Affecté Chef': return 'bg-blue-100 text-blue-700';
      case 'Affecté': return 'bg-primary/10 text-primary';
      case 'En cours': return 'bg-rose-100 text-rose-700';
      case 'Suspendu': return 'bg-orange-100 text-orange-700';
      case 'Terminé': return 'bg-emerald-100 text-emerald-700';
      case 'Clôturé': return 'bg-emerald-200 text-emerald-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const workflowSteps: WorkOrder['status'][] = ['En attente', 'Affecté', 'En cours', 'Terminé', 'Clôturé'];
  const stepLabels: Record<string, string> = {
    'En attente': 'Créé',
    'Affecté': 'Affecté',
    'En cours': 'En cours',
    'Terminé': 'Terminé',
    'Clôturé': 'Clôturé',
  };
  const currentStepIdx = workflowSteps.indexOf(activeOt.status);

  const handleAddPartToOt = () => {
    // Note: To implement this properly, we'd need a function passed from parent
    // For now we'll just mock the visual change or leave it as a UI stub
    if (selectedPartRef && selectedPartQty > 0) {
      alert("Fonctionnalité d'ajout de pièce à implémenter");
    }
  };

  const handleDeletePartFromOt = (partRef: string) => {
    // Note: To implement this properly, we'd need a function passed from parent
    if (confirm("Êtes-vous sûr de vouloir retirer cette pièce de l'OT ?")) {
      alert("Fonctionnalité de retrait de pièce à implémenter");
    }
  };

  return (
    <div className="h-full flex flex-col w-full bg-white dark:bg-slate-900 rounded-custom-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      
      {/* ─── HEADER ─── */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-primary" />
          Détails Ordre de Travail
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { onClearSelectedOt(); onClose(); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-5">
        
        {/* Form / Details Content mimicking EquipmentDetails layout */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-6 mb-2">
            
            {/* Left: Images / Status Column */}
            <div className="w-[230px] shrink-0 flex flex-col gap-4">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative flex flex-col items-center justify-center p-4">
                <Settings2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                <span className="text-slate-400 font-bold text-xs text-center">{activeOtEq?.name || 'Équipement non défini'}</span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Progression</label>
                <div className="flex flex-col gap-2">
                  {workflowSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 ${
                          isCompleted ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'
                        }`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={`text-[11px] font-bold ${isCurrent ? 'text-primary' : isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
                          {stepLabels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Right: Info */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-slate-500 font-bold text-sm font-mono tracking-tight">{activeOt.id}</span>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white mt-1 leading-tight">{activeOt.title}</h2>
                </div>
                
                {/* Actions based on status */}
                <div className="flex items-center gap-2">
                  {can(PERMISSIONS.WORKORDER_UPDATE, ownerIds()) && activeOt.status === 'En attente' && (
                    <button onClick={() => updateWorkOrderStatus(activeOt.id, 'Affecté')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700">
                      Affecter
                    </button>
                  )}
                  {(can(PERMISSIONS.WORKORDER_UPDATE, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'Affecté' && (
                    <button onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-primary/90">
                      <Play className="w-3.5 h-3.5" /> Démarrer
                    </button>
                  )}
                  {(can(PERMISSIONS.WORKORDER_UPDATE, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'En cours' && (
                    <button onClick={() => updateWorkOrderStatus(activeOt.id, 'Terminé')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" /> Terminer
                    </button>
                  )}
                  {can(PERMISSIONS.WORKORDER_DELETE) && activeOt.status === 'Terminé' && (
                    <button onClick={() => updateWorkOrderStatus(activeOt.id, 'Clôturé')} className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" /> Clôturer
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-2 mb-6 flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 text-[11px] font-bold rounded-md ${getStatusColor(activeOt.status)}`}>
                  {activeOt.status}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-[11px] font-bold rounded-md ${
                  activeOt.priority === 'Critique' ? 'bg-rose-100 text-rose-700' :
                  activeOt.priority === 'Haute' ? 'bg-orange-100 text-orange-700' :
                  activeOt.priority === 'Moyenne' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Priorité: {activeOt.priority}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-[11px] font-bold rounded-md bg-purple-100 text-purple-700">
                  <Wrench className="w-3.5 h-3.5 mr-1" /> Type: {activeOt.type}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-y-6 gap-x-4 mt-2">
                <div className="col-span-3">
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Description de la panne / travaux</label>
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    {activeOt.description || 'Aucune description fournie.'}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Calendar className="w-3.5 h-3.5" /> Date Création</label>
                  <div className="text-[14px] font-bold text-slate-900 dark:text-white">
                    {new Date(activeOt.createdDate || Date.now()).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Clock3 className="w-3.5 h-3.5" /> Délai d'intervention</label>
                  <div className="text-[14px] font-bold text-slate-900 dark:text-white">
                    {activeOt.priority === 'Critique' ? 'Immédiat (< 2h)' : 
                     activeOt.priority === 'Haute' ? 'Dans la journée (< 8h)' : 
                     activeOt.priority === 'Moyenne' ? 'Dans la semaine' : 'Planifié'}
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><User className="w-3.5 h-3.5" /> Technicien affecté</label>
                  <div className="flex items-center gap-2 mt-1">
                    {activeOtTech ? (
                      <>
                        <img src={activeOtTech.avatar} alt={activeOtTech.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        <span className="text-[14px] font-bold text-slate-900 dark:text-white">{activeOtTech.name}</span>
                      </>
                    ) : (
                      <span className="text-[14px] font-bold text-slate-400 italic">Non assigné</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Sécurité</label>
                  <div className="text-[13px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded inline-block">
                    Consignation requise
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for details */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-2">
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto custom-scrollbar pb-1">
            <button onClick={() => setActiveTab('pieces')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pieces' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <LinkIcon className="w-4 h-4" /> Pièces Utilisées ({activeOt.partsUsed?.length || 0})
            </button>
            <button onClick={() => setActiveTab('rapport')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'rapport' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <FileText className="w-4 h-4" /> Rapport d'Intervention
            </button>
            <button onClick={() => setActiveTab('intervenants')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'intervenants' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <Users className="w-4 h-4" /> Intervenants & Main d'œuvre
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'pieces' && (
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pièces consommées pour cette intervention</h3>
                </div>

                {(!activeOt.partsUsed || activeOt.partsUsed.length === 0) ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Aucune pièce n'a été utilisée ou enregistrée.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg">
                    {activeOt.partsUsed.map(pu => {
                      const p = parts.find(pt => pt.ref === pu.partRef);
                      return (
                        <div key={pu.partRef} className="flex justify-between items-center px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p ? p.name : pu.partRef}</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{pu.partRef}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-black text-slate-700 dark:text-slate-300 text-lg">×{pu.quantity}</span>
                              <span className="text-[9px] text-slate-400 block font-bold">UNITÉS</span>
                            </div>
                            {activeOt.status === 'En cours' && (
                              <button onClick={() => handleDeletePartFromOt(pu.partRef)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {((can(PERMISSIONS.WORKORDER_UPDATE, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'En cours') && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Ajouter une pièce depuis le stock</label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={selectedPartRef}
                          onChange={e => setSelectedPartRef(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none font-medium text-[13px]"
                        >
                          <option value="">-- Sélectionnez une pièce --</option>
                          {parts.map(p => <option key={p.ref} value={p.ref}>{p.name} (Stock: {p.stockCurrent})</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <input type="number" min={1} value={selectedPartQty} onChange={e => setSelectedPartQty(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold outline-none text-center text-[13px]" />
                      </div>
                      <button onClick={handleAddPartToOt} disabled={!selectedPartRef}
                        className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm disabled:opacity-40 text-[13px] transition-colors">
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rapport' && (
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                {(activeOt.status === 'En cours' || activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') ? (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Diagnostic de la panne</label>
                      <textarea 
                        className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-800 dark:text-slate-200 outline-none resize-none font-medium placeholder:text-slate-400"
                        placeholder="Détaillez le diagnostic effectué..."
                        readOnly={activeOt.status !== 'En cours'}
                        defaultValue="Usure prématurée détectée."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Solution appliquée</label>
                      <textarea 
                        className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-800 dark:text-slate-200 outline-none resize-none font-medium placeholder:text-slate-400"
                        placeholder="Détaillez les travaux réalisés..."
                        readOnly={activeOt.status !== 'En cours'}
                        defaultValue="Remplacement des pièces défectueuses et test de fonctionnement OK."
                      />
                    </div>
                    {activeOt.status === 'En cours' && (
                      <div className="flex justify-end mt-2">
                        <button className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-slate-700 transition-colors">
                          Enregistrer le rapport
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    Le rapport d'intervention sera disponible une fois l'ordre de travail démarré.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'intervenants' && (
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Main d'œuvre et intervenants</h3>
                </div>
                
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Intervenant</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Heures passées</th>
                        <th className="p-3">Taux horaire</th>
                        <th className="p-3 text-right">Coût</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeOtTech ? (
                        <tr className="bg-white dark:bg-slate-900">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <img src={activeOtTech.avatar} alt={activeOtTech.name} className="w-6 h-6 rounded-full" />
                            {activeOtTech.name}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{activeOtTech.role}</td>
                          <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">2.5 h</td>
                          <td className="p-3 font-mono text-slate-500">25 DT</td>
                          <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-100">62.5 DT</td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 italic">Aucun intervenant enregistré.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
