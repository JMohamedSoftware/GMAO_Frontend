import React, { useState, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { useAppDispatch } from '@/app/hooks';
import { createWorkOrderAsync } from '@/app/gmaoSlice';
import { WorkOrder, Incident } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
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
  Wrench,
  Settings2
} from 'lucide-react';
import { WorkOrderForm } from '../components/WorkOrderForm';
import { WorkOrderDetail } from '../components/WorkOrderDetail';

interface WorkOrdersProps {
  selectedOtFromUrl: string | null;
  onClearSelectedOt: () => void;
  prefilledIncident: Incident | null;
  onClearPrefilledIncident: () => void;
  newWorkOrderEqId?: string | null;
}

export const WorkOrders: React.FC<WorkOrdersProps> = ({ 
  selectedOtFromUrl, 
  onClearSelectedOt,
  prefilledIncident,
  onClearPrefilledIncident,
  newWorkOrderEqId
}) => {
  const { 
    workOrders, 
    equipments, 
    technicians, 
    parts, 
    currentUser,
    equipes,
    updateWorkOrderStatus 
  } = useGmao();

  const dispatch = useAppDispatch();

  const { can, isTechnicien, isChefEquipe } = usePermissions();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Selected OT details
  const [selectedOtId, setSelectedOtId] = useState<string | null>(selectedOtFromUrl);

  // OT creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  // Handle state for new OT
  useEffect(() => {
    if (newWorkOrderEqId !== undefined && newWorkOrderEqId !== null) {
      setShowCreateModal(true);
      if (newWorkOrderEqId !== '') {
        setNewEqId(newWorkOrderEqId);
      }
    }
  }, [newWorkOrderEqId]);

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
      // Technicien sees only OTs assigned to them
      if (String(ot.technicianId) !== String(currentUser?.id)) return false;
    } else if (isChefEquipe) {
      // Chef d'équipe sees OTs assigned directly to them (as a routing step) OR assigned to their team members
      const myEquipe = equipes.find(eq => String(eq.chefId) === String(currentUser?.id));
      const myTeamTechIds = myEquipe ? myEquipe.technicienIds.map(String) : [];
      const isAssignedToMe = String(ot.technicianId) === String(currentUser?.id);
      const isAssignedToMyTeam = ot.technicianId && myTeamTechIds.includes(String(ot.technicianId));
      if (!isAssignedToMe && !isAssignedToMyTeam) return false;
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

  const handleCreateOtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newEqId) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await dispatch(createWorkOrderAsync({
        title: newTitle,
        description: newDesc,
        equipmentId: newEqId,
        type: newType,
        priority: newPriority,
        technicianId: newTechId || undefined,
        incidentId: prefilledIncident?.id,
      })).unwrap();

      setNewTitle('');
      setNewDesc('');
      setNewEqId('');
      setNewTechId('');
      setShowCreateModal(false);
      if (prefilledIncident) onClearPrefilledIncident();
    } catch (err: any) {
      setSubmitError(err?.message || 'Erreur lors de la création. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25';
      case 'En cours': return 'bg-rose-500/10 text-rose-600 border border-rose-500/25 animate-pulse';
      case 'En attente': return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
      case 'Affecté Chef': return 'bg-purple-500/10 text-purple-600 border border-purple-500/25';
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

        {can(PERMISSIONS.WORKORDER_CREATE) && (
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
            {workOrders.filter(o => o.status === 'Affecté' || o.status === 'Affecté Chef' || o.status === 'En attente').length}
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
              <option value="Affecté Chef">Affecté Chef</option>
              <option value="Affecté">Affecté Technicien</option>
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

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden mt-4">
        <div className={`flex flex-col gap-4 overflow-y-auto transition-all duration-500 ease-in-out ${selectedOtId ? 'w-[55%] shrink-0' : 'w-full'}`}>
          {filteredOts.length === 0 ? (
            <div className="glass-panel p-16 text-center text-slate-400 dark:text-slate-500 rounded-custom-lg border border-white/45">
              <FileCheck className="w-12 h-12 mx-auto mb-4 text-slate-350 dark:text-slate-700" />
              <h3 className="text-base font-bold">Aucun ordre de travail</h3>
              <p className="text-xs mt-1">Ajustez vos filtres ou créez une nouvelle tâche de maintenance.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] whitespace-nowrap">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-slate-300" /></th>
                      <th className="p-3">N° OT</th>
                      <th className="p-3 text-center">Type</th>
                      <th className="p-3">Titre / Description</th>
                      <th className="p-3">Équipement</th>
                      <th className="p-3">Priorité</th>
                      <th className="p-3">Statut</th>
                      {!selectedOtId && <th className="p-3">Technicien</th>}
                      {!selectedOtId && <th className="p-3">Date planifiée</th>}
                      {!selectedOtId && <th className="p-3 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredOts.map(ot => {
                      const eq = equipments.find(e => e.id === ot.equipmentId);
                      const tech = technicians.find(t => t.id === ot.technicianId);
                      const isSelected = selectedOtId === ot.id;
                      
                      return (
                        <tr 
                          key={ot.id}
                          onClick={() => setSelectedOtId(ot.id)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        >
                          <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={isSelected} readOnly className="rounded border-slate-300 text-primary focus:ring-primary" />
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{ot.id}</td>
                          <td className="p-3 text-center">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                              <Wrench className="w-4 h-4" />
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{ot.title}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{ot.description}</p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{eq ? eq.name : ot.equipmentId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold ${
                              ot.priority === 'Critique' ? 'text-rose-600' :
                              ot.priority === 'Haute' ? 'text-orange-500' :
                              ot.priority === 'Moyenne' ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {ot.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(ot.status)}`}>
                              {ot.status}
                            </span>
                          </td>
                          {!selectedOtId && (
                            <td className="p-3">
                              {tech ? (
                                <div className="flex items-center gap-2">
                                  <img src={tech.avatar} alt={tech.name} className="w-6 h-6 rounded-full" />
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 leading-none">{tech.name}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Non affecté</span>
                              )}
                            </td>
                          )}
                          {!selectedOtId && (
                            <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                              {new Date(ot.createdDate || Date.now()).toLocaleDateString('fr-FR')}
                            </td>
                          )}
                          {!selectedOtId && (
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                  <FileCheck className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedOtId && (
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-custom-md border border-slate-200/50 dark:border-slate-800/50 shadow-md overflow-hidden relative flex flex-col animate-[slideInRight_0.35s_ease-out]">
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
          </div>
        )}
      </div>

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
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
};
