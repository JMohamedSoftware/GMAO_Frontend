import React, { useState, useEffect, useRef } from 'react';
import { FileCheck, AlertTriangle, Clock3, Trash2, CheckCircle, X, Calendar, Check } from 'lucide-react';
import { WorkOrder, Equipment, Technician, SparePart } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
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
  const { can } = usePermissions();

  const [diagText, setDiagText] = useState('');
  const [solText, setSolText] = useState('');

  const [checklist, setChecklist] = useState({
    pieces: false,
    rapport: false,
    signature: false,
    photos: false
  });

  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [selectedPartRef, setSelectedPartRef] = useState('');
  const [selectedPartQty, setSelectedPartQty] = useState(1);

  useEffect(() => {
    if (activeOt?.status === 'En cours' && !timerActive) {
      setTimerActive(true);
      setTimerSeconds(0);
    } else if (activeOt?.status !== 'En cours') {
      setTimerActive(false);
    }
  }, [activeOt?.status]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

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
    let signatureUrl = '';
    const canvas = canvasRef.current;
    if (canvas) {
      signatureUrl = canvas.toDataURL();
    }

    updateWorkOrderStatus(activeOt!.id, 'Terminé', {
      diagnostic: diagText || 'Aucun diagnostic précisé.',
      solution: solText || 'Travaux de maintenance effectués.',
      signature: signatureUrl || 'signed',
      durationMinutes: Math.max(1, Math.round(timerSeconds / 60))
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
    
    setSelectedPartRef('');
    setSelectedPartQty(1);
  };

  const handleDeletePartFromOt = (partRef: string) => {
    if (!activeOt) return;
    const partsUsed = activeOt.partsUsed.filter(p => p.partRef !== partRef);
    updateWorkOrderStatus(activeOt.id, activeOt.status, { partsUsed });
  };

  if (!activeOt) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-50 dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800/80 shadow-2xl z-40 flex flex-col animate-[slideLeft_0.25s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="p-5 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-primary/10 text-primary">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight block leading-none">
                {activeOt.id}
              </span>
              {activeOt.priority === 'Critique' && <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-sm leading-none">🔴 Critique</span>}
              {activeOt.priority === 'Haute' && <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-sm leading-none">🟠 Haute</span>}
              {activeOt.priority === 'Moyenne' && <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-sm leading-none">🟡 Moyenne</span>}
              {activeOt.priority === 'Faible' && <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm leading-none">🟢 Faible</span>}
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
              {activeOt.title}
            </h3>
          </div>
        </div>
        
        <button 
          onClick={() => { 
            onClose(); 
            onClearSelectedOt(); 
            setChecklist({pieces: false, rapport: false, signature: false, photos: false});
          }}
          className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 text-xs custom-scrollbar">
        
        {/* Status Workflow Progress Tracker */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-4">
            Statut Workflow Tâche
          </h4>
          
          <div className="flex justify-between items-center relative">
            <div className="absolute left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 top-1/2 -translate-y-1/2 -z-10" />

            {(['En attente', 'Affecté', 'En cours', 'Terminé'] as const).map((step, idx) => {
              const isDone = activeOt.status === 'Terminé' || 
                             (activeOt.status === 'En cours' && step !== 'Terminé') ||
                             (activeOt.status === 'Affecté' && (step === 'En attente' || step === 'Affecté')) ||
                             (activeOt.status === 'En attente' && step === 'En attente');
              const isCurrent = activeOt.status === step;
              
              return (
                <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all ${
                    isDone 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-primary/10 scale-110' : ''}`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold ${isCurrent ? 'text-primary' : 'text-slate-450'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* General Description Card */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div>
            <span className="text-slate-400 block mb-0.5">Description des travaux</span>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {activeOt.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div>
              <span className="text-slate-400 block mb-0.5">Équipement rattaché</span>
              <span className="font-bold text-slate-700 dark:text-slate-350">{activeOtEq?.name}</span>
              <span className="text-[9px] text-slate-450 font-mono block mt-0.5">{activeOt.equipmentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Zone géographique</span>
              <span className="font-bold text-slate-700 dark:text-slate-350">{activeOtEq?.location || activeOtEq?.site}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div>
              <span className="text-slate-400 block mb-0.5">Date prévue</span>
              <span className="font-bold text-slate-700 dark:text-slate-350">11/07/2026</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Date limite</span>
              <span className="font-bold text-rose-600">12/07/2026</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div>
              <span className="text-slate-400 block mb-0.5">Temps estimé</span>
              <span className="font-bold text-slate-700 dark:text-slate-350">2 h</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Temps réel</span>
              <span className="font-bold text-slate-700 dark:text-slate-350">
                {activeOt.status === 'Terminé' || activeOt.status === 'Clôturé' ? (activeOt.durationMinutes ? `${Math.floor(activeOt.durationMinutes / 60)}h${activeOt.durationMinutes % 60}m` : '2h45') : formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          {activeOt.type === 'Correctif' && (
            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-500/10 p-2 rounded border border-rose-500/20">
                <Clock3 className="w-4 h-4" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block leading-none mb-0.5">Machine arrêtée</span>
                  <span className="font-bold">01h24</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Consignes de Sécurité LOTO */}
        <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 shadow-sm flex flex-col gap-3">
          <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Consignes de Sécurité (LOTO)
          </h4>
          <div className="flex flex-col gap-2 mt-1">
            <label className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-500">
              <input type="checkbox" className="rounded border-amber-300 text-amber-500 focus:ring-amber-500 w-4 h-4 accent-amber-500" />
              Consignation Électrique (Cadenas Rouge)
            </label>
            <label className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-500">
              <input type="checkbox" className="rounded border-amber-300 text-amber-500 focus:ring-amber-500 w-4 h-4 accent-amber-500" />
              Purge Fluides / Pneumatique
            </label>
            <label className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-500">
              <input type="checkbox" className="rounded border-amber-300 text-amber-500 focus:ring-amber-500 w-4 h-4 accent-amber-500" />
              Port des EPI (Gants, Lunettes de protection)
            </label>
          </div>
        </div>

        {/* Documents joints */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            Documents joints
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
            <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2">
              <FileCheck className="w-6 h-6 text-rose-500" />
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">PDF Notice</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2">
              <FileCheck className="w-6 h-6 text-primary" />
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">Manuel</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2">
              <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                <span className="text-[8px] font-bold">IMG</span>
              </div>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">Photo 1</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2">
              <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                <span className="text-[8px] font-bold">IMG</span>
              </div>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">Photo 2</span>
            </button>
          </div>
        </div>

        {/* Assignment & Operational Actions */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            Affectation Personnel & Actionneur
          </h4>

          {can(PERMISSIONS.WORKORDER_ASSIGN) && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-slate-400 block mb-1">Technicien Référent</label>
              <select 
                value={activeOt.technicianId || ''}
                onChange={(e) => {
                  updateWorkOrderStatus(activeOt.id, e.target.value ? 'Affecté' : 'En attente', { technicianId: e.target.value });
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-semibold outline-none"
              >
                <option value="">Non affecté</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                ))}
              </select>
            </div>
            
            {can(PERMISSIONS.WORKORDER_UPDATE) && (
            <div className="flex-1">
              <label className="text-slate-400 block mb-1">Priorité d'intervention</label>
              <select 
                value={activeOt.priority}
                onChange={(e) => {
                  updateWorkOrderStatus(activeOt.id, activeOt.status, { priority: e.target.value as WorkOrder['priority'] });
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-semibold outline-none"
              >
                <option value="Critique">Critique</option>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
            </div>
            )}
          </div>
          )}


          {/* Status control buttons + live timer */}
          <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {activeOt.status === 'En cours' && (
              <div className="flex items-center justify-between bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">OT En cours</span>
                </div>
                <span className="font-mono text-lg font-black text-rose-500 tabular-nums tracking-tight">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            )}
            {can(PERMISSIONS.WORKORDER_UPDATE) && activeOt.status === 'Affecté' && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <Clock3 className="w-4 h-4" />
                Démarrer l'OT
              </button>
            )}

            {can(PERMISSIONS.WORKORDER_UPDATE) && activeOt.status === 'En cours' && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => updateWorkOrderStatus(activeOt.id, 'Suspendu')}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm"
                >
                  Pause
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('cloture-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm"
                >
                  Terminer
                </button>
              </div>
            )}

            {can(PERMISSIONS.WORKORDER_UPDATE) && activeOt.status === 'Suspendu' && (
              <button
                onClick={() => updateWorkOrderStatus(activeOt.id, 'En cours')}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow-sm"
              >
                Reprendre l'OT
              </button>
            )}
          </div>
        </div>

        {/* Spare parts sheet for EN COURS and completed OTs */}
        {(activeOt.status === 'En cours' || activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') && (
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
              Consommation de Pièces de Rechange
            </h4>

            {activeOt.partsUsed.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2.5">
                {activeOt.partsUsed.map(pu => {
                  const p = parts.find(part => part.ref === pu.partRef);
                  return (
                    <div key={pu.partRef} className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold">{p ? p.name : pu.partRef}</span>
                        <span className="text-[9px] font-mono block text-slate-400">{pu.partRef}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-700 dark:text-slate-350">x{pu.quantity}</span>
                        {activeOt.status === 'En cours' && (
                          <button 
                            onClick={() => handleDeletePartFromOt(pu.partRef)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {can(PERMISSIONS.WORKORDER_UPDATE) && activeOt.status === 'En cours' && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[9px] text-slate-450 font-bold block mb-1">Pièce de Rechange</label>
                  <select
                    value={selectedPartRef}
                    onChange={(e) => setSelectedPartRef(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none font-semibold"
                  >
                    <option value="">Sélectionner une pièce...</option>
                    {parts.map(p => (
                      <option key={p.ref} value={p.ref}>{p.name} ({p.stockCurrent} Dispo)</option>
                    ))}
                  </select>
                </div>

                <div className="w-16">
                  <label className="text-[9px] text-slate-450 font-bold block mb-1">Qté</label>
                  <input
                    type="number"
                    min={1}
                    value={selectedPartQty}
                    onChange={(e) => setSelectedPartQty(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-bold outline-none text-center"
                  />
                </div>

                <button
                  onClick={handleAddPartToOt}
                  disabled={!selectedPartRef}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black dark:bg-slate-800 text-white font-bold rounded-lg shadow disabled:opacity-40"
                >
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Diagnostic reporting sheet & validation pad */}
        {can(PERMISSIONS.WORKORDER_UPDATE) && activeOt.status === 'En cours' && (
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
              Rapport de Résolution Diagnostic
            </h4>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold">Diagnostic de la Panne</label>
                <textarea 
                  rows={2}
                  value={diagText}
                  onChange={(e) => setDiagText(e.target.value)}
                  placeholder="Indiquez l'origine constatée du défaut..."
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent outline-none font-medium text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold">Solution Appliquée</label>
                <textarea 
                  rows={2}
                  value={solText}
                  onChange={(e) => setSolText(e.target.value)}
                  placeholder="Expliquez la réparation effectuée (remplacement, nettoyage...)"
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent outline-none font-medium text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Validation Drawing canvas */}
            <div className="flex flex-col gap-1.5" id="cloture-section">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-bold">Signature pour Clôture Légale</label>
                <button 
                  onClick={clearCanvas}
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  Effacer
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden h-28 bg-white relative">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="w-full h-full cursor-crosshair bg-white"
                />
                <div className="absolute bottom-1 right-2 text-[9px] text-slate-350 pointer-events-none select-none">
                  Dessiner signature
                </div>
              </div>
            </div>

            {/* Closing Checklist */}
            <div className="flex flex-col gap-2 mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Checklist de clôture</h5>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={checklist.pieces} onChange={e => setChecklist({...checklist, pieces: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                Pièces utilisées enregistrées
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={checklist.rapport} onChange={e => setChecklist({...checklist, rapport: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                Rapport rempli (Diag & Solution)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={checklist.photos} onChange={e => setChecklist({...checklist, photos: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                Photos après intervention
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={checklist.signature} onChange={e => setChecklist({...checklist, signature: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                Signature technicien
              </label>
            </div>

            <button
              onClick={handleFinalizeWorkOrder}
              disabled={!checklist.pieces || !checklist.rapport || !checklist.signature || !checklist.photos}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all"
            >
              Clôturer Officiellement l'Ordre de Travail
            </button>
          </div>
        )}

        {/* If OT is already Terminé, show summary */}
        {(activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-3 text-emerald-850 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-xs">Intervention Clôturée avec Succès</span>
            </div>
            
            <div className="text-[11px] flex flex-col gap-2 border-t border-emerald-500/20 pt-3">
              <div>
                <strong>Diagnostic :</strong>
                <p className="text-slate-650 dark:text-slate-350 mt-0.5">{activeOt.diagnostic}</p>
              </div>
              <div>
                <strong>Action corrective :</strong>
                <p className="text-slate-650 dark:text-slate-350 mt-0.5">{activeOt.solution}</p>
              </div>
              {activeOt.signature && (
                <div className="mt-1">
                  <strong>Signature Technicien :</strong>
                  <div className="w-32 h-12 bg-white rounded border border-emerald-500/25 mt-1 overflow-hidden flex items-center justify-center">
                    {activeOt.signature.startsWith('data:') ? (
                      <img src={activeOt.signature} alt="Sign" className="max-h-full" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">Signé Électroniquement</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historique Tracker */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 mt-4">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            Historique de l'OT
          </h4>
          <div className="flex flex-col gap-4 relative pl-4 mt-2">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
            <div className="relative flex items-center gap-3">
              <div className="absolute -left-[18px] w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-850"></div>
              <span className="text-[10px] text-slate-400 font-mono w-24">11/07 08:30</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">OT Créé</span>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="absolute -left-[18px] w-2 h-2 rounded-full bg-primary ring-4 ring-white dark:ring-slate-850"></div>
              <span className="text-[10px] text-slate-400 font-mono w-24">11/07 09:15</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Affecté à {activeOtTech?.name || 'Technicien'}</span>
            </div>
            {activeOt.status !== 'En attente' && activeOt.status !== 'Affecté' && (
              <div className="relative flex items-center gap-3">
                <div className="absolute -left-[18px] w-2 h-2 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-850"></div>
                <span className="text-[10px] text-slate-400 font-mono w-24">11/07 10:00</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">OT Démarré</span>
              </div>
            )}
            {(activeOt.status === 'Terminé' || activeOt.status === 'Clôturé') && (
              <div className="relative flex items-center gap-3">
                <div className="absolute -left-[18px] w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-850"></div>
                <span className="text-[10px] text-slate-400 font-mono w-24">11/07 12:45</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">OT Clôturé</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
