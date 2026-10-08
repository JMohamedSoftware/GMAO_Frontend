import React, { useState } from 'react';
import {
  X, Calendar, Check, FileText, Wrench,
  Play, User, Pause,
  CheckCircle, FileCheck, Settings2, Clock,
  File, Image as ImageIcon, FileBadge2,
  SendHorizontal, UserPlus, PenLine, Plus, Trash2,
  Loader2, Package
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
  updateWorkOrderStatus: (id: string, status: WorkOrder['status'], updates?: Partial<WorkOrder>) => void;
}

type Tab = 'vue_generale' | 'documents' | 'historique';

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
  const { can, isManagerLevel, isChefEquipe, isTechnicien, isAdmin } = usePermissions();
  const { currentUser, incidents, users, equipes } = useGmao();

  const [activeTab, setActiveTab] = useState<Tab>('vue_generale');

  // ── Rapport d'intervention (edit mode) ──
  const [editingReport, setEditingReport] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');
  const [solution, setSolution] = useState('');
  const [externalCost, setExternalCost] = useState('');
  const [savingReport, setSavingReport] = useState(false);

  // ── Ajout de pièce consommée ──
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPartRef, setNewPartRef] = useState('');
  const [newPartQty, setNewPartQty] = useState('1');
  const [partError, setPartError] = useState<string | null>(null);

  // ── Affectation Chef / Technicien ──
  const [showAssignModal, setShowAssignModal] = useState<'chef' | 'tech' | null>(null);
  const [assignTechId, setAssignTechId] = useState('');
  const [assigningWho, setAssigningWho] = useState(false);

  if (!activeOt) return null;

  const getStatusBg = (s: WorkOrder['status']) => {
    switch (s) {
      case 'Brouillon':     return 'bg-slate-100 text-slate-700';
      case 'En attente':    return 'bg-amber-100 text-amber-700';
      case 'Affecté Chef':  return 'bg-blue-100 text-blue-700';
      case 'Affecté':       return 'bg-emerald-100 text-emerald-700';
      case 'En cours':      return 'bg-amber-100 text-amber-700';
      case 'Suspendu':      return 'bg-orange-100 text-orange-700';
      case 'Terminé':       return 'bg-teal-100 text-teal-700';
      case 'Clôturé':       return 'bg-emerald-100 text-emerald-800';
      default:              return 'bg-slate-100 text-slate-700';
    }
  };

  const statusOrder = ['En attente', 'Affecté Chef', 'Affecté', 'En cours', 'Suspendu', 'Terminé', 'Clôturé'];
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

  // ── Workflow visibility ──
  const isDraft       = activeOt.status === 'Brouillon';
  const otOwnerIds    = [
    activeOt.technicianId ? Number(activeOt.technicianId) : null,
    activeOt.assignedBy   ? Number(activeOt.assignedBy)   : null,
  ];
  const canSubmit     = (isManagerLevel || isAdmin) && isDraft;
  const canAssignChef = (isManagerLevel || isAdmin) && (activeOt.status === 'En attente' || activeOt.status === 'Brouillon');
  const canAssignTech = (isChefEquipe || isManagerLevel || isAdmin) && activeOt.status === 'Affecté Chef';
  const canStart      = can(PERMISSIONS.WORKORDER_START,   otOwnerIds) && activeOt.status === 'Affecté';
  const canSuspend    = can(PERMISSIONS.WORKORDER_SUSPEND, otOwnerIds) && activeOt.status === 'En cours';
  const canResume     = can(PERMISSIONS.WORKORDER_START,   otOwnerIds) && activeOt.status === 'Suspendu';
  const canFinish     = can(PERMISSIONS.WORKORDER_FINISH,  otOwnerIds) && activeOt.status === 'En cours';
  const canClose      = can(PERMISSIONS.WORKORDER_CLOSE)   && activeOt.status === 'Terminé';
  const canEditReport = (isTechnicien || isChefEquipe || isManagerLevel || isAdmin) &&
    ['En cours', 'Suspendu', 'Terminé'].includes(activeOt.status);
  const canAddParts   = canEditReport;

  // ── Handlers ──
  const handleSubmitDraft = () => {
    updateWorkOrderStatus(activeOt.id, 'En attente');
  };

  const handleAssignChef = () => {
    if (!assignTechId) return;
    setAssigningWho(true);
    updateWorkOrderStatus(activeOt.id, 'Affecté Chef', { chefEquipeId: assignTechId });
    setAssigningWho(false);
    setShowAssignModal(null);
    setAssignTechId('');
  };

  const handleAssignTech = () => {
    if (!assignTechId) return;
    setAssigningWho(true);
    updateWorkOrderStatus(activeOt.id, 'Affecté', { technicianId: assignTechId });
    setAssigningWho(false);
    setShowAssignModal(null);
    setAssignTechId('');
  };

  const handleSaveReport = () => {
    setSavingReport(true);
    const updates: Partial<WorkOrder> = {};
    if (diagnostic.trim()) updates.diagnostic = diagnostic.trim();
    if (solution.trim()) updates.solution = solution.trim();
    if (externalCost !== '') updates.externalCost = parseFloat(externalCost) || 0;
    updateWorkOrderStatus(activeOt.id, activeOt.status, updates);
    setEditingReport(false);
    setSavingReport(false);
  };

  const handleAddPart = () => {
    setPartError(null);
    const part = parts.find(p => p.ref === newPartRef);
    if (!part) { setPartError('Référence pièce introuvable.'); return; }
    const qty = parseInt(newPartQty, 10);
    if (!qty || qty < 1) { setPartError('Quantité invalide.'); return; }
    if (part.stockCurrent < qty) { setPartError(`Stock insuffisant (dispo: ${part.stockCurrent}).`); return; }
    const existing = (activeOt.partsUsed || []).find(p => p.partRef === newPartRef);
    const newParts = existing
      ? (activeOt.partsUsed || []).map(p => p.partRef === newPartRef ? { ...p, quantity: p.quantity + qty } : p)
      : [...(activeOt.partsUsed || []), { partRef: newPartRef, quantity: qty }];
    updateWorkOrderStatus(activeOt.id, activeOt.status, { partsUsed: newParts });
    setShowAddPart(false);
    setNewPartRef('');
    setNewPartQty('1');
  };

  const handleRemovePart = (ref: string) => {
    const newParts = (activeOt.partsUsed || []).filter(p => p.partRef !== ref);
    updateWorkOrderStatus(activeOt.id, activeOt.status, { partsUsed: newParts });
  };

  const openEditReport = () => {
    setDiagnostic(activeOt.diagnostic || '');
    setSolution(activeOt.solution || '');
    setExternalCost(activeOt.externalCost ? String(activeOt.externalCost) : '');
    setEditingReport(true);
  };

  // Documents attached to the OT's equipment (from existing Equipment.documents)
  const eqDocuments = activeOtEq?.documents || [];

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'electrical':  return <FileBadge2 className="w-4 h-4 text-yellow-500" />;
      case 'mechanical':  return <Wrench className="w-4 h-4 text-slate-500" />;
      case 'notice':      return <FileText className="w-4 h-4 text-blue-500" />;
      case 'hydraulic':   return <File className="w-4 h-4 text-cyan-500" />;
      case 'pneumatic':   return <File className="w-4 h-4 text-purple-500" />;
      default:            return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  const typeLabel: Record<string, string> = {
    electrical: 'Schéma électrique',
    mechanical: 'Plan mécanique',
    hydraulic:  'Schéma hydraulique',
    pneumatic:  'Schéma pneumatique',
    notice:     'Notice constructeur',
  };

  const eqPhotos = activeOtEq?.photos || [];
  const linkedIncident = activeOt.incidentId ? incidents?.find(i => i.id === activeOt.incidentId) : null;
  const incidentPhoto = linkedIncident?.photo;
  const totalPhotosCount = eqPhotos.length + (incidentPhoto ? 1 : 0);

  return (
    <div className="h-full flex flex-col w-full bg-slate-50/50 dark:bg-slate-900 rounded-custom-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      
      {/* ─── HEADER ─── */}
      <div className="p-5 pb-0 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">{activeOt.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                activeOt.priority === 'Critique' ? 'bg-rose-100 text-rose-700' :
                activeOt.priority === 'Haute'    ? 'bg-orange-100 text-orange-700' :
                activeOt.priority === 'Moyenne'  ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {activeOt.priority}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getStatusBg(activeOt.status)}`}>
                {activeOt.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight truncate">
              {activeOt.title}
            </h2>
          </div>
          <button
            onClick={() => { onClearSelectedOt(); onClose(); }}
            className="ml-3 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shadow-sm shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── QUICK ACTIONS ─── */}
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 font-bold shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            {activeOt.id} · {activeOt.type}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Soumettre (Brouillon → En attente) */}
            {canSubmit && (
              <button
                onClick={handleSubmitDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <SendHorizontal className="w-3.5 h-3.5" /> Soumettre
              </button>
            )}
            {/* Affecter Chef d'équipe */}
            {canAssignChef && (
              <button
                onClick={() => { setAssignTechId(''); setShowAssignModal('chef'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Affecter Chef
              </button>
            )}
            {/* Affecter Technicien */}
            {canAssignTech && (
              <button
                onClick={() => { setAssignTechId(''); setShowAssignModal('tech'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Affecter Technicien
              </button>
            )}
            {canStart && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Démarrer
              </button>
            )}
            {canResume && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Reprendre
              </button>
            )}
            {canSuspend && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'Suspendu')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <Pause className="w-3.5 h-3.5" /> Suspendre
              </button>
            )}
            {canFinish && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'Terminé')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Terminer
              </button>
            )}
            {canClose && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'Clôturé')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Clôturer
              </button>
            )}
            {activeOt.status === 'Clôturé' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" /> OT Clôturé
              </span>
            )}
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div className="flex items-center gap-1 mt-5 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {([
            { id: 'vue_generale', label: 'Vue générale',    icon: <FileCheck className="w-4 h-4" /> },
            { id: 'documents',    label: `Documents${eqDocuments.length > 0 ? ` (${eqDocuments.length})` : ''}`, icon: <FileText className="w-4 h-4" /> },
            { id: 'historique',   label: 'Historique statut', icon: <Calendar className="w-4 h-4" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap mr-4 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4">

        {/* ══ TAB: Vue générale ══ */}
        {activeTab === 'vue_generale' && (
          <div className="flex flex-col gap-4">

            {/* Brouillon banner */}
            {activeOt.status === 'Brouillon' && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-0.5">OT en mode Brouillon</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Cet OT n'a pas encore été soumis au workflow. Cliquez sur <strong>Soumettre</strong> pour le mettre en attente d'affectation.
                  </p>
                </div>
              </div>
            )}

            {/* Équipement concerné */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                {activeOtEq?.photos && activeOtEq.photos.length > 0 ? (
                  <img src={activeOtEq.photos[0]} alt={activeOtEq.name} className="w-full h-full object-cover" />
                ) : (
                  <Settings2 className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Équipement concerné</p>
                <p className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate">
                  {activeOtEq?.name || activeOt.equipmentId}
                </p>
                {activeOtEq && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeOtEq.category}{activeOtEq.localisation?.nom ? ` — ${activeOtEq.localisation.nom}` : ''}
                  </p>
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

            {/* Rapport d'intervention */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Rapport d'intervention</h3>
                {canEditReport && !editingReport && (
                  <button
                    onClick={openEditReport}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <PenLine className="w-3 h-3" /> Saisir / Modifier
                  </button>
                )}
              </div>
              {editingReport ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Diagnostic / Cause panne</label>
                    <textarea
                      rows={3}
                      value={diagnostic}
                      onChange={e => setDiagnostic(e.target.value)}
                      placeholder="Décrivez la cause de la panne..."
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Solution appliquée</label>
                    <textarea
                      rows={3}
                      value={solution}
                      onChange={e => setSolution(e.target.value)}
                      placeholder="Décrivez les actions correctives effectuées..."
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Coût prestataire externe (DT)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={externalCost}
                      onChange={e => setExternalCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setEditingReport(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveReport}
                      disabled={savingReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-60"
                    >
                      {savingReport ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            {/* Pièces consommées */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" /> Pièces consommées ({partsUsed.length})
                </h3>
                {canAddParts && (
                  <button
                    onClick={() => { setShowAddPart(v => !v); setPartError(null); }}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                )}
              </div>
              {/* Add part inline form */}
              {showAddPart && (
                <div className="px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Pièce (référence)</label>
                      <select
                        value={newPartRef}
                        onChange={e => setNewPartRef(e.target.value)}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-primary outline-none"
                      >
                        <option value="">Choisir une pièce...</option>
                        {parts.filter(p => p.stockCurrent > 0).map(p => (
                          <option key={p.ref} value={p.ref}>
                            {p.name} — {p.ref} (Stock: {p.stockCurrent})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Qté</label>
                      <input
                        type="number"
                        min="1"
                        value={newPartQty}
                        onChange={e => setNewPartQty(e.target.value)}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-primary outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddPart}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded transition-colors"
                    >
                      <Check className="w-3 h-3" /> OK
                    </button>
                    <button
                      onClick={() => { setShowAddPart(false); setPartError(null); }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {partError && (
                    <p className="text-[10px] text-rose-600 font-semibold">{partError}</p>
                  )}
                </div>
              )}
              {partsUsed.length === 0 ? (
                <div className="px-4 py-5 text-center text-xs text-slate-400 italic">Aucune pièce enregistrée pour cet OT.</div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {partsUsed.map((pu, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs group">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{pu.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-600 dark:text-slate-400">Qté: {pu.quantity}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {(pu.unitPrice * pu.quantity).toFixed(2)} DT
                        </span>
                        {canAddParts && (
                          <button
                            onClick={() => handleRemovePart(pu.partRef)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                  <span className="text-slate-500">Prestataires externes (sous-traitance)</span>
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

        {/* ══ TAB: Documents / Photos ══ */}
        {activeTab === 'documents' && (
          <div className="flex flex-col gap-4">

            {/* Documents techniques de l'équipement */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Documents techniques ({eqDocuments.length})
                </h3>
              </div>
              {eqDocuments.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FileText className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 italic">Aucun document attaché à cet équipement.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Ajoutez des documents depuis la fiche équipement.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {eqDocuments.map((doc, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {getDocIcon(doc.type)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{typeLabel[doc.type] || doc.type} · {doc.size}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-bold text-[10px] transition-colors"
                      >
                        Ouvrir
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photos équipement & incident */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Photos ({totalPhotosCount})
                </h3>
              </div>
              {totalPhotosCount === 0 ? (
                <div className="px-4 py-8 text-center">
                  <ImageIcon className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 italic">Aucune photo disponible.</p>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-4">
                  {/* Photo de la panne (Incident) */}
                  {incidentPhoto && (
                    <div>
                      <h4 className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-2">Photo de la panne (Demande d'intervention)</h4>
                      <a href={incidentPhoto} target="_blank" rel="noopener noreferrer">
                        <img
                          src={incidentPhoto}
                          alt="Photo de la panne"
                          className="w-full max-h-48 object-cover rounded-lg border-2 border-rose-100 dark:border-rose-900/30 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    </div>
                  )}
                  {/* Photos équipement */}
                  {eqPhotos.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Photos de l'équipement</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {eqPhotos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Photo équipement ${i + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>



          </div>
        )}

        {/* ══ TAB: Historique statut ══ */}
        {activeTab === 'historique' && (
          <div className="flex flex-col gap-4">

            {/* Workflow visuel */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-sm">Cycle de vie de l'OT</h3>
              <div className="overflow-x-auto pb-2">
                <div className="flex items-start justify-between relative px-2 min-w-[400px]">
                  <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
                  <div
                    className="absolute top-3 left-4 h-0.5 bg-emerald-500 -z-10 transition-all duration-700"
                    style={{ width: `${Math.max(0, currentStepIdx / (statusOrder.length - 1)) * 100}%` }}
                  />
                  {statusOrder.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx && currentStepIdx >= 0;
                    const isCurrent   = idx === currentStepIdx;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-slate-900 ${
                          isCurrent   ? 'border-primary'     :
                          isCompleted ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {isCompleted && !isCurrent && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          {isCurrent && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <p className={`text-[10px] font-bold text-center ${
                          isCurrent   ? 'text-primary' :
                          isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                        }`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dates clés */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Dates clés</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-slate-500 w-28 shrink-0">Créé le</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {activeOt.createdDate ? new Date(activeOt.createdDate).toLocaleString('fr-FR') : '—'}
                  </span>
                </div>
                {activeOt.startDate && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">
                      {['En attente', 'Brouillon'].includes(activeOt.status) ? 'Prévu le' : 'Démarré le'}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(activeOt.startDate).toLocaleString('fr-FR')}
                    </span>
                  </div>
                )}
                {activeOt.endDate && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">
                      {['Terminé', 'Clôturé'].includes(activeOt.status) ? 'Terminé le' : 'Date prévue'}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(activeOt.endDate).toLocaleString('fr-FR')}
                    </span>
                  </div>
                )}
                {activeOt.status === 'Clôturé' && activeOt.endDate && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Clôturé le</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(activeOt.endDate).toLocaleString('fr-FR')}
                    </span>
                  </div>
                )}
                {activeOt.durationMinutes > 0 && (
                  <div className="flex items-center gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Durée totale</span>
                    <span className="font-black text-primary">{durationH}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ══ MODAL: Affectation Chef / Technicien ══ */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                {showAssignModal === 'chef' ? "Affecter un Chef d'équipe" : "Affecter un Technicien"}
              </h3>
              <button onClick={() => setShowAssignModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">
                {showAssignModal === 'chef' ? "Chef d'équipe" : "Technicien"}
              </label>
              <select
                value={assignTechId}
                onChange={e => setAssignTechId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:border-primary outline-none"
              >
                <option value="">— Choisir —</option>
                {showAssignModal === 'chef'
                  ? equipes.map(eq => {
                      const chef = users.find(u => String(u.id) === String(eq.chefId));
                      return (
                        <option key={eq.id} value={eq.chefId}>
                          {eq.nom} (Chef: {chef?.name || 'Inconnu'})
                        </option>
                      );
                    })
                  : technicians
                      .filter(t => {
                        if (!activeOt.chefEquipeId) return true;
                        const assignedEquipe = equipes.find(eq => String(eq.chefId) === String(activeOt.chefEquipeId));
                        if (!assignedEquipe) return true;
                        return assignedEquipe.technicienIds.map(String).includes(String(t.id));
                      })
                      .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {t.role} {t.status === 'Disponible' ? '✓' : `(${t.status})`}
                      </option>
                    ))
                }
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAssignModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={showAssignModal === 'chef' ? handleAssignChef : handleAssignTech}
                disabled={!assignTechId || assigningWho}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50"
              >
                {assigningWho ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Confirmer l'affectation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
