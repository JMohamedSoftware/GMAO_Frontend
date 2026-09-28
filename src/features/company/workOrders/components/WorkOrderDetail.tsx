import React, { useState, useEffect, useRef } from 'react';
import { FileCheck, AlertTriangle, Clock3, Trash2, CheckCircle, X, Calendar, Check, Users } from 'lucide-react';
import { WorkOrder, Equipment, Technician, SparePart, UserAccount, User } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useGmao } from '@/shared/hooks/useGmao';
import { PERMISSIONS } from '@/shared/permissions';

interface WorkOrderDetailProps {
  activeOt: WorkOrder | undefined;
  activeOtEq: Equipment | undefined | null;
  activeOtTech: Technician | undefined | null;
  technicians: Technician[];
  parts: SparePart[];
  onClose: () => void;
  onClearSelectedOt: () => void;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status'], data?: any) => void;
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
  const { can, isResponsable, isChefEquipe } = usePermissions();
  const { currentUser, users, equipes, addPartMovement } = useGmao();

  // Helper: build owner ID array safely (no NaN)
  const ownerIds = (): (number | undefined)[] => [
    activeOt ? (Number(activeOt.technicianId) || undefined) : undefined,
    activeOt ? (Number(activeOt.assignedBy) || undefined) : undefined,
    activeOt ? (Number(activeOt.chefEquipeId) || undefined) : undefined,
  ].filter((v): v is number => v !== undefined);

  // Chef d'equipe users list (for Responsable to assign)
  const chefEquipeUsers = users.filter(u => u.role === "Chef d'equipe" || u.role === "Chef d'\u00e9quipe");

  // Determine the effective Chef ID for UI
  const assignedTechTeam = activeOt?.technicianId 
    ? equipes.find(eq => eq.technicienIds.map(String).includes(String(activeOt.technicianId))) 
    : undefined;
  const effectiveChefId = activeOt?.status === 'Affecté Chef' 
    ? activeOt.technicianId 
    : (assignedTechTeam ? String(assignedTechTeam.chefId) : '');

  const chefEquipe = equipes.find(eq => String(eq.chefId) === String(effectiveChefId));

  // Tech list for the chef to assign from
  const teamTechnicians = chefEquipe 
    ? technicians.filter(t => chefEquipe.technicienIds.map(String).includes(String(t.id))) 
    : technicians;
  const activeOtChef = effectiveChefId 
    ? users.find(u => String(u.id) === String(effectiveChefId)) 
    : null;

  const [diagText, setDiagText] = useState('');
  const [solText, setSolText] = useState('');

  const [checklist, setChecklist] = useState({
    pieces: false,
    rapport: false,
    signature: false,
    photos: false
  });

  const [loto, setLoto] = useState({
    electrique: false,
    fluides: false,
    epi: false
  });

  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [selectedPartRef, setSelectedPartRef] = useState('');
  const [selectedPartQty, setSelectedPartQty] = useState(1);

  const getAccumulated = (id: string) => parseInt(localStorage.getItem(`ot_acc_${id}`) || '0', 10);
  const setAccumulated = (id: string, secs: number) => localStorage.setItem(`ot_acc_${id}`, secs.toString());
  
  const getStartTime = (id: string) => parseInt(localStorage.getItem(`ot_start_${id}`) || '0', 10);
  const setStartTime = (id: string, time: number) => localStorage.setItem(`ot_start_${id}`, time.toString());
  const clearStartTime = (id: string) => localStorage.removeItem(`ot_start_${id}`);

  useEffect(() => {
    if (!activeOt) return;

    if (activeOt.status === 'En cours') {
      let start = getStartTime(activeOt.id);
      if (!start) {
        start = Date.now();
        setStartTime(activeOt.id, start);
      }
      
      const acc = getAccumulated(activeOt.id);
      setTimerSeconds(Math.floor((Date.now() - start) / 1000) + acc);
      setTimerActive(true);

      timerRef.current = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - start) / 1000) + acc);
      }, 1000);

    } else {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const start = getStartTime(activeOt.id);
      if (start) {
        const acc = getAccumulated(activeOt.id);
        const elapsed = Math.floor((Date.now() - start) / 1000);
        setAccumulated(activeOt.id, acc + elapsed);
        clearStartTime(activeOt.id);
        setTimerSeconds(acc + elapsed);
      } else {
        setTimerSeconds(getAccumulated(activeOt.id));
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeOt?.status, activeOt?.id]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFinalizeWorkOrder = () => {
    if (!activeOt) return;
    let signatureUrl = '';
    const canvas = canvasRef.current;
    if (canvas) {
      signatureUrl = canvas.toDataURL();
    }

    let finalSeconds = getAccumulated(activeOt.id);
    const start = getStartTime(activeOt.id);
    if (start) {
      finalSeconds += Math.floor((Date.now() - start) / 1000);
      setAccumulated(activeOt.id, finalSeconds);
      clearStartTime(activeOt.id);
    }
    const durationMinutes = Math.floor(finalSeconds / 60) || 1;

    updateWorkOrderStatus(activeOt.id, 'Terminé', {
      diagnostic: diagText || 'Aucun diagnostic prÃ©cisÃ©.',
      solution: solText || 'Travaux de maintenance effectuÃ©s.',
      signature: signatureUrl || 'signed',
      durationMinutes
    });

    setDiagText('');
    setSolText('');
    onClose();
  };

  const handleAddPartToOt = () => {
    if (!selectedPartRef || !activeOt) return;
    const targetPart = parts.find(p => p.ref === selectedPartRef);
    if (!targetPart || targetPart.stockCurrent < selectedPartQty) return;

    const partsUsed = [...activeOt.partsUsed];
    const index = partsUsed.findIndex(p => p.partRef === selectedPartRef);
    if (index >= 0) {
      partsUsed[index].quantity += selectedPartQty;
    } else {
      partsUsed.push({ partRef: selectedPartRef, quantity: selectedPartQty });
    }

    updateWorkOrderStatus(activeOt.id, activeOt.status, { partsUsed });
    
    // Register the movement and deduct stock
    addPartMovement(selectedPartRef, selectedPartQty, 'out', activeOt.id);

    setSelectedPartRef('');
    setSelectedPartQty(1);
  };

  const handleDeletePartFromOt = (partRef: string) => {
    if (!activeOt) return;
    const partToRestore = activeOt.partsUsed.find(p => p.partRef === partRef);
    const partsUsed = activeOt.partsUsed.filter(p => p.partRef !== partRef);
    updateWorkOrderStatus(activeOt.id, activeOt.status, { partsUsed });

    // Restore stock
    if (partToRestore) {
      addPartMovement(partRef, partToRestore.quantity, 'in', activeOt.id);
    }
  };

  if (!activeOt) return null;

  const statusColor = (s: WorkOrder['status']) => {
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
    'En attente': 'CrÃ©Ã©',
    'Affecté': 'Affecté',
    'En cours': 'En cours',
    'Terminé': 'Terminé',
    'Clôturé': 'Clôturé',
  };
  const currentStepIdx = workflowSteps.indexOf(activeOt.status);

  const tabItems = [
    { key: 'general', label: 'Vue gÃ©nÃ©rale' },
    { key: 'pieces', label: `PiÃ¨ces (${activeOt.partsUsed.length})` },
    { key: 'rapport', label: 'Rapport' },
  ] as const;
  const [activeDetailTab, setActiveDetailTab] = React.useState<'general' | 'pieces' | 'rapport'>('general');

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800/80 shadow-2xl z-40 flex flex-col animate-[slideLeft_0.25s_cubic-bezier(0.16,1,0.3,1)]">
      
      {/* â”€â”€ HEADER â”€â”€ */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{activeOt.id}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                activeOt.priority === 'Critique' ? 'bg-rose-100 text-rose-700' :
                activeOt.priority === 'Haute' ? 'bg-orange-100 text-orange-700' :
                activeOt.priority === 'Moyenne' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>{activeOt.priority}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor(activeOt.status)}`}>{activeOt.status}</span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight truncate">{activeOt.title}</h3>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeOt.description}</p>
          </div>
        </div>
        <button
          onClick={() => { onClose(); onClearSelectedOt(); setChecklist({ pieces: false, rapport: false, signature: false, photos: false }); }}
          className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* â”€â”€ TABS â”€â”€ */}
      <div className="flex gap-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4">
        {tabItems.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveDetailTab(tab.key)}
            className={`px-4 py-2.5 text-[11px] font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeDetailTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* â”€â”€ CONTENT â”€â”€ */}
      <div className="flex-1 overflow-y-auto text-xs custom-scrollbar bg-slate-50 dark:bg-slate-950">

        {/* â•â•â• VUE GÃ‰NÃ‰RALE â•â•â• */}
        {activeDetailTab === 'general' && (
          <div className="flex flex-col gap-4 p-4">

            {/* Equipment banner */}
            <div className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-slate-100 dark:border-slate-800 flex items-end">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <FileCheck className="w-24 h-24 text-primary" />
              </div>
              <div className="relative p-3 w-full bg-gradient-to-t from-slate-900/60 to-transparent">
                <span className="text-white font-bold text-sm block leading-tight">{activeOtEq?.name || 'Ã‰quipement'}</span>
                <span className="text-white/60 text-[9px] font-mono">{activeOt.equipmentId}</span>
                {activeOtEq?.localisation?.nom && (
                  <span className="text-white/70 text-[9px] ml-2">â€¢ {activeOtEq.localisation.nom}</span>
                )}
              </div>
            </div>

            {/* Informations OT grid */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Informations OT</span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800">
                {[
                  { label: 'NÂ° OT', value: activeOt.id, mono: true },
                  { label: 'Type', value: activeOt.type },
                  { label: 'PrioritÃ©', value: activeOt.priority },
                  { label: 'Date crÃ©ation', value: new Date(activeOt.createdDate).toLocaleDateString('fr-FR') },
                  { label: 'Responsable', value: users.find(u => String(u.id) === String(activeOt.assignedBy))?.name || activeOt.assignedBy || '-' },
                  { label: 'Temps rÃ©el', value: (activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') ? (activeOt.durationMinutes ? `${Math.floor(activeOt.durationMinutes / 60)}h${(activeOt.durationMinutes % 60).toString().padStart(2,'0')}m` : '-') : formatTimer(timerSeconds) },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="bg-white dark:bg-slate-900 px-3 py-2.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{label}</span>
                    <span className={`text-[12px] font-bold text-slate-800 dark:text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description des travaux */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Description des travaux</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[12px]">{activeOt.description}</p>
            </div>

            {/* Technicien + Chef */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Affectation Personnel</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
                <div className="p-3">
                  <span className="text-[9px] text-slate-400 font-bold block mb-2">Technicien Affecté</span>
                  {activeOtTech ? (
                    <div className="flex items-center gap-2">
                      <img src={activeOtTech.avatar} alt={activeOtTech.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary/30" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white text-[11px] block">{activeOtTech.name}</span>
                        <span className="text-[9px] text-slate-400">{activeOtTech.role}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">Non Affecté</span>
                  )}
                  {/* Responsable/Chef can change tech */}
                  {(isResponsable || isChefEquipe) && (activeOt.status === 'Affecté Chef' || activeOt.status === 'Affecté' || activeOt.status === 'En cours') && (
                    <select
                      value={activeOt.status !== 'Affecté Chef' ? (activeOt.technicianId || '') : ''}
                      onChange={e => updateWorkOrderStatus(activeOt.id, e.target.value ? 'Affecté' : 'Affecté Chef', { technicianId: e.target.value || undefined })}
                      className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[10px] outline-none"
                    >
                      <option value="">SÃ©lectionner...</option>
                      {teamTechnicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[9px] text-slate-400 font-bold block mb-2">Chef d'Ã©quipe</span>
                  {activeOtChef ? (
                    <div className="flex items-center gap-2">
                      <img src={activeOtChef.avatar} alt={activeOtChef.name} className="w-8 h-8 rounded-full object-cover border-2 border-blue-200" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white text-[11px] block">{activeOtChef.name}</span>
                        <span className="text-[9px] text-slate-400">Chef d'Ã©quipe</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">Non assignÃ©</span>
                  )}
                  {isResponsable && (activeOt.status === 'En attente' || activeOt.status === 'Affecté Chef') && (
                    <select
                      value={effectiveChefId || ''}
                      onChange={e => updateWorkOrderStatus(activeOt.id, e.target.value ? 'Affecté Chef' : 'En attente', { technicianId: e.target.value || undefined })}
                      className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[10px] outline-none"
                    >
                      <option value="">SÃ©lectionner...</option>
                      {chefEquipeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              {/* Priority update */}
              {(isResponsable || isChefEquipe) && (
                <div className="px-3 pb-3">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">PrioritÃ© d'intervention</label>
                  <select
                    value={activeOt.priority}
                    onChange={e => updateWorkOrderStatus(activeOt.id, activeOt.status, { priority: e.target.value as WorkOrder['priority'] })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-bold outline-none text-[10px]"
                  >
                    <option>Critique</option><option>Haute</option><option>Moyenne</option><option>Faible</option>
                  </select>
                </div>
              )}
            </div>

            {/* Statut du workflow */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-4">Statut du workflow</span>
              <div className="flex justify-between items-center relative">
                <div className="absolute left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800 top-3.5 -z-0" />
                <div className={`absolute left-4 h-0.5 bg-primary top-3.5 -z-0 transition-all`} style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (workflowSteps.length - 1)) * 92}%` : '0%' }} />
                {workflowSteps.map((step, idx) => {
                  const done = currentStepIdx >= idx;
                  const current = activeOt.status === step;
                  return (
                    <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[9px] font-bold transition-all ${
                        done ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                      } ${current ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                        {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className={`text-[8px] font-bold text-center leading-tight ${current ? 'text-primary' : 'text-slate-400'}`}>{stepLabels[step]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live timer if En cours */}
            {(activeOt.status === 'En cours' || activeOt.status === 'Suspendu') && (
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${activeOt.status === 'En cours' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'}`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    {activeOt.status === 'En cours' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeOt.status === 'En cours' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${activeOt.status === 'En cours' ? 'text-rose-600' : 'text-amber-600'}`}>{activeOt.status === 'En cours' ? 'Intervention en cours' : 'OT Suspendu'}</span>
                </div>
                <span className={`font-mono text-xl font-black tabular-nums ${activeOt.status === 'En cours' ? 'text-rose-500' : 'text-amber-500'}`}>{formatTimer(timerSeconds)}</span>
              </div>
            )}

            {/* LOTO */}
            <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
              <h4 className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-3.5 h-3.5" /> Consignes de SÃ©curitÃ© (LOTO)
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { key: 'electrique', label: 'Consignation Ã‰lectrique (Cadenas Rouge)' },
                  { key: 'fluides', label: 'Purge Fluides / Pneumatique' },
                  { key: 'epi', label: 'Port des EPI (Gants, Lunettes de protection)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loto[key as keyof typeof loto]}
                      onChange={e => setLoto({ ...loto, [key]: e.target.checked })}
                      disabled={activeOt.status === 'Terminé' || activeOt.status === 'Clôturé'}
                      className="rounded border-amber-300 text-amber-500 focus:ring-amber-500 w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* â•â•â• PIÃˆCES â•â•â• */}
        {activeDetailTab === 'pieces' && (
          <div className="flex flex-col gap-4 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PiÃ¨ces nÃ©cessaires / utilisÃ©es</span>
              </div>
              {activeOt.partsUsed.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-[10px]">Aucune piÃ¨ce enregistrÃ©e</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeOt.partsUsed.map(pu => {
                    const p = parts.find(pt => pt.ref === pu.partRef);
                    const inStock = p ? p.stockCurrent > 0 : false;
                    return (
                      <div key={pu.partRef} className="flex justify-between items-center px-4 py-3">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{p ? p.name : pu.partRef}</span>
                          <span className="text-[9px] font-mono text-slate-400 block">{pu.partRef}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {inStock ? 'En stock' : 'Stock faible'}
                          </span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">Ã—{pu.quantity}</span>
                          {activeOt.status === 'En cours' && (
                            <button onClick={() => handleDeletePartFromOt(pu.partRef)} className="text-slate-300 hover:text-rose-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {(can(PERMISSIONS.WORKORDER_UPDATE, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'En cours' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Ajouter une piÃ¨ce</span>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={selectedPartRef}
                      onChange={e => setSelectedPartRef(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none font-semibold text-[11px]"
                    >
                      <option value="">SÃ©lectionner une piÃ¨ce...</option>
                      {parts.map(p => <option key={p.ref} value={p.ref}>{p.name} ({p.stockCurrent} Dispo)</option>)}
                    </select>
                  </div>
                  <div className="w-16">
                    <input type="number" min={1} value={selectedPartQty} onChange={e => setSelectedPartQty(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold outline-none text-center text-[11px]" />
                  </div>
                  <button onClick={handleAddPartToOt} disabled={!selectedPartRef}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow disabled:opacity-40 text-[11px]">
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* â•â•â• RAPPORT â•â•â• */}
        {activeDetailTab === 'rapport' && (
          <div className="flex flex-col gap-4 p-4">
            {/* Summary if terminated */}
            {(activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-[12px] text-emerald-700 dark:text-emerald-400">Intervention Clôturée avec SuccÃ¨s</span>
                </div>
                <div className="text-[11px] flex flex-col gap-3 border-t border-emerald-200 dark:border-emerald-500/20 pt-3">
                  <div>
                    <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">Diagnostic :</strong>
                    <p className="text-slate-600 dark:text-slate-300">{activeOt.diagnostic || '-'}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">Solution appliquÃ©e :</strong>
                    <p className="text-slate-600 dark:text-slate-300">{activeOt.solution || '-'}</p>
                  </div>
                  {activeOt.signature && (
                    <div>
                      <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">Signature Technicien :</strong>
                      <div className="w-32 h-12 bg-white rounded border border-emerald-200 overflow-hidden flex items-center justify-center">
                        {activeOt.signature.startsWith('data:') ? (
                          <img src={activeOt.signature} alt="Signature" className="max-h-full" />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">SignÃ© Ã‰lectroniquement</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rapport form if En cours */}
            {(can(PERMISSIONS.WORKORDER_UPDATE, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'En cours' && (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rapport de RÃ©solution</span>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold text-[10px]">Diagnostic de la Panne</label>
                    <textarea rows={3} value={diagText} onChange={e => setDiagText(e.target.value)}
                      placeholder="Indiquez l'origine constatÃ©e du dÃ©faut..."
                      className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none text-[11px] text-slate-800 dark:text-slate-100 resize-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold text-[10px]">Solution AppliquÃ©e</label>
                    <textarea rows={3} value={solText} onChange={e => setSolText(e.target.value)}
                      placeholder="Expliquez la rÃ©paration effectuÃ©e..."
                      className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none text-[11px] text-slate-800 dark:text-slate-100 resize-none" />
                  </div>
                </div>

                {/* Signature */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4" id="cloture-section">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Signature ClÃ´ture</label>
                    <button onClick={clearCanvas} className="text-[10px] text-primary font-bold hover:underline">Effacer</button>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-28 bg-white relative">
                    <canvas
                      ref={canvasRef} width={520} height={110}
                      onMouseDown={startDrawing} onMouseMove={draw}
                      onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
                      className="w-full h-full cursor-crosshair bg-white"
                    />
                    <div className="absolute bottom-1 right-2 text-[9px] text-slate-300 pointer-events-none select-none">Signer ici</div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Checklist de clÃ´ture</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: 'pieces', label: 'PiÃ¨ces utilisÃ©es enregistrÃ©es' },
                      { key: 'rapport', label: 'Rapport rempli (Diagnostic & Solution)' },
                      { key: 'photos', label: 'Photos aprÃ¨s intervention' },
                      { key: 'signature', label: 'Signature technicien' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={checklist[key as keyof typeof checklist]} onChange={e => setChecklist({ ...checklist, [key]: e.target.checked })}
                          className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!(activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') && activeOt.status !== 'En cours' && (
              <div className="py-10 text-center text-slate-400 text-[10px]">Le rapport sera disponible lorsque l'OT sera en cours d'exÃ©cution.</div>
            )}
          </div>
        )}
      </div>

      {/* â”€â”€ FOOTER ACTIONS â”€â”€ */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-[11px]">
          <Calendar className="w-4 h-4" />
          Imprimer OT
        </button>

        {/* DÃ©marrer */}
        {(can(PERMISSIONS.WORKORDER_START, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'Affecté' && (
          <button onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
            className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg shadow-sm text-[11px] flex items-center justify-center gap-2">
            <Clock3 className="w-4 h-4" /> DÃ©marrer l'OT
          </button>
        )}

        {/* Pause / Terminer */}
        {(can(PERMISSIONS.WORKORDER_SUSPEND, ownerIds()) || can(PERMISSIONS.WORKORDER_FINISH, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'En cours' && (
          <>
            {(can(PERMISSIONS.WORKORDER_SUSPEND, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && (
              <button onClick={() => updateWorkOrderStatus(activeOt.id, 'Suspendu')}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px]">
                Mettre en pause
              </button>
            )}
            {(can(PERMISSIONS.WORKORDER_FINISH, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && (
              <button
                onClick={() => { setActiveDetailTab('rapport'); setTimeout(() => document.getElementById('cloture-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[11px]">
                Terminer
              </button>
            )}
          </>
        )}

        {/* Reprendre */}
        {(can(PERMISSIONS.WORKORDER_START, ownerIds()) || String(activeOt.technicianId) === String(currentUser?.id)) && activeOt.status === 'Suspendu' && (
          <button onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
            className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg text-[11px]">
            Reprendre l'OT
          </button>
        )}

        {/* ClÃ´turer officially */}
        {activeDetailTab === 'rapport' && activeOt.status === 'En cours' && (
          <button
            onClick={handleFinalizeWorkOrder}
            disabled={!checklist.pieces || !checklist.rapport || !checklist.signature || !checklist.photos}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> ClÃ´turer l'OT
          </button>
        )}
      </div>
    </div>
  );
};
