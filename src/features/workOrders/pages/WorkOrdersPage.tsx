import React, { useState, useEffect } from 'react';
import { useGmao } from '../../../hooks/useGmao';
import { WorkOrder, Incident } from '../../../types/gmao';
import { usePermissions } from '../../../hooks/usePermissions';
import { 
  Search, 
  Plus, 
  User, 
  Clock, 
  FileCheck, 
  Check, 
  CheckCircle,
  Calendar,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { WorkOrderForm } from '../components/WorkOrderForm';
import { WorkOrderDetail } from '../components/WorkOrderDetail';

interface WorkOrdersProps {
  selectedOtFromUrl: string | null;
  onClearSelectedOt: () => void;
  prefilledIncident: Incident | null;
  onClearPrefilledIncident: () => void;
}

export const WorkOrders: React.FC<WorkOrdersProps> = ({ 
  selectedOtFromUrl, 
  onClearSelectedOt,
  prefilledIncident,
  onClearPrefilledIncident
}) => {
  const { 
    workOrders, 
    equipments, 
    technicians, 
    parts, 
    currentUser,
    addWorkOrder, 
    updateWorkOrderStatus 
  } = useGmao();

  const { canDo, isTechnicien } = usePermissions();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Selected OT details
  const [selectedOtId, setSelectedOtId] = useState<string | null>(selectedOtFromUrl);

  // OT creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<WorkOrder['type']>('Correctif');
  const [newPriority, setNewPriority] = useState<WorkOrder['priority']>('Moyenne');
  const [newEqId, setNewEqId] = useState('');
  const [newTechId, setNewTechId] = useState('');

  // Sync selectedOtFromUrl
  useEffect(() => {
    if (selectedOtFromUrl) {
      setSelectedOtId(selectedOtFromUrl);
    }
  }, [selectedOtFromUrl]);

  // Sync prefilledIncident
  useEffect(() => {
    if (prefilledIncident) {
      setNewEqId(prefilledIncident.equipmentId);
      setNewTitle(`Réparation suite à incident ${prefilledIncident.id}`);
      setNewDesc(prefilledIncident.description);
      setNewPriority(prefilledIncident.urgency);
      setNewType('Correctif');
      setShowCreateModal(true);
    }
  }, [prefilledIncident]);

  const activeOt = workOrders.find(ot => ot.id === selectedOtId);
  const activeOtEq = activeOt ? equipments.find(e => e.id === activeOt.equipmentId) : null;
  const activeOtTech = activeOt ? technicians.find(t => t.id === activeOt.technicianId) : null;

  // Filter orders
  const filteredOts = workOrders.filter(ot => {
    if (isTechnicien) {
      const tech = technicians.find(t => t.name === currentUser?.name);
      if (tech && ot.technicianId !== tech.id) return false;
    }

    const eq = equipments.find(e => e.id === ot.equipmentId);
    const matchesSearch = ot.id.toLowerCase().includes(search.toLowerCase()) ||
                          ot.title.toLowerCase().includes(search.toLowerCase()) ||
                          (eq && eq.name.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'All' || ot.type === filterType;
    const matchesStatus = filterStatus === 'All' || ot.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || ot.priority === filterPriority;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const handleCreateOtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newEqId) return;

    addWorkOrder({
      title: newTitle,
      description: newDesc,
      equipmentId: newEqId,
      type: newType,
      priority: newPriority,
      technicianId: newTechId || undefined,
      assignedBy: 'Karim Gherbi (Resp. Maintenance)',
      campaign: 'Campagne 2026'
    }, prefilledIncident?.id);

    setNewTitle('');
    setNewDesc('');
    setNewEqId('');
    setNewTechId('');
    setShowCreateModal(false);
    
    if (prefilledIncident) {
      onClearPrefilledIncident();
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25';
      case 'En cours': return 'bg-rose-500/10 text-rose-600 border border-rose-500/25 animate-pulse';
      case 'En attente': return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
      case 'Affecté': return 'bg-primary/10 text-primary border border-primary/25';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {isTechnicien ? 'Mes Ordres de Travail' : 'Ordres de Travail (OT)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            {isTechnicien
              ? 'Vos interventions assignées — démarrez, suivez et clôturez vos OTs'
              : 'Gestion du workflow d\'exécution, affectation des techniciens et rapport de clôture'
            }
          </p>
        </div>

        {canDo('workorders', 'creer') && (
          <button 
            onClick={() => {
              onClearPrefilledIncident();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un OT</span>
          </button>
        )}
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total OTs</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 z-10">{workOrders.length}</span>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Affectés</span>
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 z-10">
            {workOrders.filter(o => o.status === 'Affecté' || o.status === 'En attente').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-rose-500/20 bg-rose-500/5 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">En Cours</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-black text-rose-600 dark:text-rose-400 z-10">
            {workOrders.filter(o => o.status === 'En cours').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Terminés</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 z-10">
            {workOrders.filter(o => o.status === 'Terminé' || o.status === 'Clôturé').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-emerald-500/20 bg-emerald-500/5 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aujourd'hui</span>
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 z-10">
            6
          </span>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-orange-500/20 bg-orange-500/5 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">En Retard</span>
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-xl font-black text-orange-700 dark:text-orange-300 z-10">
            4
          </span>
        </div>
      </div>

      {/* Filter Options */}
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-custom-sm bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            placeholder="Rechercher par numéro OT, titre, machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 rounded-custom-sm px-3 py-2 text-xs font-semibold text-slate-650 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="All">Tous les types</option>
            <option value="Correctif">Correctif</option>
            <option value="Préventif">Préventif</option>
            <option value="Curatif">Curatif</option>
            <option value="Amélioratif">Amélioratif</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 rounded-custom-sm px-3 py-2 text-xs font-semibold text-slate-650 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="All">Tous les statuts</option>
            <option value="En attente">En Attente</option>
            <option value="Affecté">Affecté</option>
            <option value="En cours">En Cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Clôturé">Clôturé</option>
          </select>

          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 rounded-custom-sm px-3 py-2 text-xs font-semibold text-slate-650 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="All">Toutes les priorités</option>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
            <option value="Critique">Critique</option>
          </select>
        </div>
      </div>

      {/* Grid of work orders */}
      {filteredOts.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 dark:text-slate-500 rounded-custom-lg border border-white/45">
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-slate-350 dark:text-slate-700" />
          <h3 className="text-base font-bold">Aucun ordre de travail</h3>
          <p className="text-xs mt-1">Ajustez vos filtres ou créez une nouvelle tâche de maintenance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOts.map(ot => {
            const eq = equipments.find(e => e.id === ot.equipmentId);
            const tech = technicians.find(t => t.id === ot.technicianId);
            
            return (
              <div
                key={ot.id}
                onClick={() => setSelectedOtId(ot.id)}
                className={`p-5 rounded-custom-md border transition-all cursor-pointer relative overflow-hidden neumorphic-card hover-lift ${
                  selectedOtId === ot.id ? 'border-primary/60 dark:border-primary/40 ring-2 ring-primary/10' : 'border-white/50 dark:border-slate-850/40'
                }`}
              >
                {ot.priority === 'Critique' && (
                  <div className="absolute right-0 top-0 w-12 h-12 bg-rose-500/10 dark:bg-rose-500/5 text-rose-500 rounded-bl-full flex items-center justify-center pl-2 pb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{ot.id}</span>
                    <span className="text-[10px] text-slate-350">•</span>
                    <span className="text-[10px] text-slate-450">{ot.type}</span>
                  </div>
                  
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ot.status)}`}>
                    {ot.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {ot.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                    {ot.description}
                  </p>
                  
                  {ot.type === 'Préventif' && ot.status !== 'Terminé' && ot.status !== 'Clôturé' && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {parseInt(ot.id.split('-').pop() || '0') % 2 === 0 ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">Prévu aujourd'hui</span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">En retard</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{eq ? eq.name : ot.equipmentId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tech ? (
                      <div className="flex items-center gap-2">
                        <img src={tech.avatar} alt={tech.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-none">
                            {tech.name.split(' ')[0]}
                          </span>
                          <span className="text-[8px] font-semibold text-slate-400 mt-0.5 leading-none">
                            {tech.role.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-900 border border-slate-200/50 text-slate-400 px-2 py-0.5 rounded">
                        Non affecté
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <WorkOrderDetail 
        activeOt={activeOt}
        activeOtEq={activeOtEq}
        activeOtTech={activeOtTech}
        technicians={technicians}
        parts={parts}
        onClose={() => setSelectedOtId(null)}
        onClearSelectedOt={onClearSelectedOt}
        updateWorkOrderStatus={updateWorkOrderStatus}
      />

      <WorkOrderForm
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          onClearPrefilledIncident();
        }}
        onSubmit={handleCreateOtSubmit}
        equipments={equipments}
        technicians={technicians}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
        newType={newType}
        setNewType={setNewType}
        newPriority={newPriority}
        setNewPriority={setNewPriority}
        newEqId={newEqId}
        setNewEqId={setNewEqId}
        newTechId={newTechId}
        setNewTechId={setNewTechId}
      />
    </div>
  );
};
