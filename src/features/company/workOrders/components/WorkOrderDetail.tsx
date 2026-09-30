import React, { useState } from 'react';
import { 
  X, Calendar, Check, FileText, Wrench, AlertTriangle,
  Play, User, Printer, Pause,
  CheckCircle, MoreHorizontal, FileCheck, Settings2, Clock
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

  const [activeTab, setActiveTab] = useState<'vue_generale' | 'historique'>('vue_generale');

  if (!activeOt) return null;

  const getStatusBg = (s: WorkOrder['status']) => {
    switch (s) {
      case 'Brouillon':     return 'bg-slate-100 text-slate-700';
      case 'En attente':    return 'bg-amber-100 text-amber-700';
      case 'Affecté Chef':  return 'bg-blue-100 text-blue-700';
      case 'Affecté':       return 'bg-emerald-100 text-emerald-700';
      case 'En cours':      return 'bg-amber-100 text-amber-700';
      case 'Suspendu':      return 'bg-orange-100 text-orange-700';
      case 'Terminé':       return 'bg-emerald-100 text-emerald-700';
      case 'Clôturé':       return 'bg-emerald-100 text-emerald-800';
      default:              return 'bg-slate-100 text-slate-700';
    }
  };

  const workflowSteps = [
    { id: 'Créé',     label: 'Créé' },
    { id: 'Affecté',  label: 'Affecté' },
    { id: 'En cours', label: 'En cours' },
    { id: 'Suspendu', label: 'Suspendu', optional: true },
    { id: 'Terminé',  label: 'Terminé' },
    { id: 'Clôturé',  label: 'Clôturé' },
  ];

  const statusOrder = ['Créé', 'Affecté Chef', 'Affecté', 'En cours', 'Suspendu', 'Terminé', 'Clôturé'];
  const currentStepIdx = statusOrder.indexOf(activeOt.status);

  const partsUsed = (activeOt.partsUsed || []).map(pu => {
    const part = parts.find(p => p.ref === pu.partRef);
    return { ...pu, name: part?.name || pu.partRef, unitPrice: part?.unitPrice || 0 };
  });

  const durationH = activeOt.durationMinutes
    ? `${Math.floor(activeOt.durationMinutes / 60)}h${activeOt.durationMinutes % 60 > 0 ? (activeOt.durationMinutes % 60) + 'min' : ''}`
    : '—';

  const laborCost = activeOtTech
    ? ((activeOt.durationMinutes || 0) / 60) * (activeOtTech.hourlyRate || 0)
    : 0;
  const partsCost = partsUsed.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
  const totalCost = laborCost + partsCost + (activeOt.externalCost || 0);

  const canStart    = can(PERMISSIONS.WORKORDER_START) &&
    !['En cours', 'Terminé', 'Clôturé'].includes(activeOt.status);
  const canSuspend  = can(PERMISSIONS.WORKORDER_SUSPEND) && activeOt.status === 'En cours';
  const canResume   = can(PERMISSIONS.WORKORDER_START) && activeOt.status === 'Suspendu';
  const canClose    = can(PERMISSIONS.WORKORDER_CLOSE) &&
    ['En cours', 'Terminé'].includes(activeOt.status);

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
                activeOt.priority === 'Haute'    ? 'bg-orange-100 text-orange-700' :
                activeOt.priority === 'Moyenne'  ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {activeOt.priority}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBg(activeOt.status)}`}>
                {activeOt.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {activeOt.title}
            </h2>
          </div>
          <button
            onClick={() => { onClearSelectedOt(); onClose(); }}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── TABS ─── */}
        <div className="flex items-center gap-6 mt-5 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('vue_generale')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'vue_generale' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <FileCheck className="w-4 h-4" /> Vue générale
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Calendar className="w-4 h-4" /> Historique statut
          </button>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4">

        {activeTab === 'vue_generale' && (
          <div className="flex flex-col gap-4">

            {/* Équipement concerné */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                <Settings2 className="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Équipement concerné</p>
                <p className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                  {activeOtEq?.name || activeOt.equipmentId}
                </p>
                {activeOtEq && (
                  <p className="text-xs text-slate-500 mt-0.5">{activeOtEq.family} — {activeOtEq.location}</p>
                )}
              </div>
            </div>

            {/* Informations OT */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Informations OT</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">N° OT</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">{activeOt.id}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Type intervention</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" /> {activeOt.type}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Priorité</span>
                  <span className={`font-bold text-sm ${
                    activeOt.priority === 'Critique' ? 'text-rose-600' :
                    activeOt.priority === 'Haute'    ? 'text-orange-500' :
                    activeOt.priority === 'Moyenne'  ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
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
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Date création</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    {activeOt.createdDate ? new Date(activeOt.createdDate).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Date début</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    {activeOt.startDate ? new Date(activeOt.startDate).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Date fin</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    {activeOt.endDate ? new Date(activeOt.endDate).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Temps passé</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {durationH}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Campagne</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">{activeOt.campaign || '—'}</span>
                </div>
                {activeOt.incidentId && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Demande liée</span>
                    <span className="font-bold text-sm text-primary">{activeOt.incidentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description des travaux */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">Description des travaux</h3>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeOt.description || 'Aucune description fournie.'}
              </p>
            </div>

            {/* Technicien affecté */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Responsable / Technicien</h3>
              {activeOtTech ? (
                <div className="flex items-center gap-3">
                  <img src={activeOtTech.avatar} alt={activeOtTech.name} className="w-10 h-10 rounded-full border border-slate-200" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{activeOtTech.name}</p>
                    <p className="text-xs text-slate-500">{activeOtTech.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activeOtTech.qualification}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                  <User className="w-4 h-4" /> Non affecté
                </div>
              )}
            </div>

            {/* Diagnostic & Solution */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Rapport d'intervention</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Diagnostic / Cause panne</span>
                  {activeOt.diagnostic ? (
                    <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{activeOt.diagnostic}</p>
                  ) : (
                    <p className="text-[13px] text-slate-400 italic">Aucun diagnostic enregistré.</p>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Solution appliquée</span>
                  {activeOt.solution ? (
                    <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{activeOt.solution}</p>
                  ) : (
                    <p className="text-[13px] text-slate-400 italic">Aucune solution enregistrée.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pièces consommées */}
            {partsUsed.length > 0 && (
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" /> Pièces consommées ({partsUsed.length})
                  </h3>
                </div>
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {partsUsed.map((pu, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{pu.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-600 dark:text-slate-400">Qté: {pu.quantity}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {(pu.unitPrice * pu.quantity).toFixed(2)} DT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coûts */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Coûts de l'intervention</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Main d'œuvre</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{laborCost.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pièces</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{partsCost.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prestataires externes</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{(activeOt.externalCost || 0).toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 mt-1">
                  <span className="font-bold text-slate-800 dark:text-white">Total OT</span>
                  <span className="font-black text-primary text-base">{totalCost.toFixed(2)} DT</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'historique' && (
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-sm">Cycle de vie de l'OT</h3>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
              <div
                className="absolute top-3 left-4 h-0.5 bg-emerald-500 -z-10 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStepIdx / (statusOrder.length - 1))) * 100}%` }}
              />
              {statusOrder.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-slate-900 ${
                      isCompleted ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700'
                    }`}>
                      {isCompleted && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-500">Créé le</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {activeOt.createdDate ? new Date(activeOt.createdDate).toLocaleString('fr-FR') : '—'}
                </span>
              </div>
              {activeOt.startDate && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-500">Démarré le</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(activeOt.startDate).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}
              {activeOt.endDate && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-slate-500">Terminé le</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(activeOt.endDate).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ─── FOOTER ACTIONS ─── */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="text-xs text-slate-400 font-medium">
          {activeOt.id} · {activeOt.type}
        </div>
        <div className="flex items-center gap-2">
          {canStart && (
            <button
              onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Démarrer
            </button>
          )}
          {canResume && (
            <button
              onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Reprendre
            </button>
          )}
          {canSuspend && (
            <button
              onClick={() => updateWorkOrderStatus(activeOt.id, 'Suspendu')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> Suspendre
            </button>
          )}
          {canClose && (
            <button
              onClick={() => updateWorkOrderStatus(activeOt.id, 'Clôturé')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Clôturer
            </button>
          )}
          {activeOt.status === 'Clôturé' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" /> OT Clôturé
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
