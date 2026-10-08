import React, { useState, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { useAuth } from '@/features/auth';
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
  const { currentUser: authUser } = useAuth();

  // Use the real authenticated user ID (from JWT) for reliable filtering
  const myUserId = authUser?.id ?? currentUser?.id;

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
      // Technicien sees only OTs assigned to them (use real auth ID)
      if (String(ot.technicianId) !== String(myUserId)) return false;
    } else if (isChefEquipe) {
      // Chef d'équipe sees OTs assigned to them or their team
      const myEquipe = equipes.find(eq => String(eq.chefId) === String(myUserId));
      const myTeamTechIds = myEquipe ? myEquipe.technicienIds.map(String) : [];
      const isAssignedToMeAsTech = String(ot.technicianId) === String(myUserId);
      const isAssignedToMeAsChef = String(ot.chefEquipeId) === String(myUserId);
      const isAssignedToMyTeam = ot.technicianId && myTeamTechIds.includes(String(ot.technicianId));
      if (!isAssignedToMeAsTech && !isAssignedToMeAsChef && !isAssignedToMyTeam) return false;
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
      case 'Terminé':     return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25';
      case 'Clôturé':     return 'bg-emerald-600/10 text-emerald-700 border border-emerald-600/25';
      case 'En cours':    return 'bg-rose-500/10 text-rose-600 border border-rose-500/25 animate-pulse';
      case 'En attente':  return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
      case 'Affecté Chef':return 'bg-purple-500/10 text-purple-600 border border-purple-500/25';
      case 'Affecté':     return 'bg-primary/10 text-primary border border-primary/25';
      case 'Suspendu':    return 'bg-orange-500/10 text-orange-600 border border-orange-500/25';
      case 'Brouillon':   return 'bg-slate-100 text-slate-500 border border-slate-200';
      default:            return 'bg-slate-100 text-slate-500';
    }
  };

  // Computed KPI values from real data
  const today = new Date();
  const todayStr = today.toDateString();
  const countToday = workOrders.filter(o =>
    o.createdDate && new Date(o.createdDate).toDateString() === todayStr
  ).length;
  const countLate = workOrders.filter(o =>
    o.endDate && new Date(o.endDate) < today &&
    !['Terminé', 'Clôturé'].includes(o.status)
  ).length;

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
            {countToday}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-orange-500/20 bg-orange-500/5 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">En Retard</span>
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-xl font-black text-orange-700 dark:text-orange-300 z-10">
            {countLate}
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
              <option value="Suspendu">Suspendu</option>
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
                      <th className="px-2 py-2.5">N° OT</th>
                      <th className="px-2 py-2.5 text-center">Type</th>
                      <th className="px-2 py-2.5">Titre / Description</th>
                      <th className="px-2 py-2.5">Équipement</th>
                      <th className="px-2 py-2.5">Priorité</th>
                      <th className="px-2 py-2.5">Statut</th>
                      {!selectedOtId && <th className="px-2 py-2.5">Technicien</th>}
                      {!selectedOtId && <th className="px-2 py-2.5">Date début</th>}
                      {!selectedOtId && <th className="px-2 py-2.5">Date fin</th>}
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
                          <td className="px-2 py-2.5 font-bold text-slate-800 dark:text-slate-200">{ot.id}</td>
                          <td className="px-2 py-2.5 text-center">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-md">
                              {ot.type}
                            </span>
                          </td>
                          <td className="px-2 py-2.5">
                            <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{ot.title}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{ot.description}</p>
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{eq ? eq.name : ot.equipmentId}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5">
                            <span className={`text-[10px] font-bold ${
                              ot.priority === 'Critique' ? 'text-rose-600' :
                              ot.priority === 'Haute'    ? 'text-orange-500' :
                              ot.priority === 'Moyenne'  ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {ot.priority}
                            </span>
                          </td>
                          <td className="px-2 py-2.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(ot.status)}`}>
                              {ot.status}
                            </span>
                          </td>
                          {!selectedOtId && (
                            <td className="px-2 py-2.5">
                              {tech ? (
                                <div className="flex items-center gap-2">
                                  <img src={tech.avatar} alt={tech.name} className="w-5 h-5 rounded-full" />
                                  <span className="font-bold text-slate-800 dark:text-slate-200 leading-none">{tech.name}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Non affecté</span>
                              )}
                            </td>
                          )}
                          {!selectedOtId && (
                            <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-medium">
                              {ot.startDate ? new Date(ot.startDate).toLocaleDateString('fr-FR') : '—'}
                            </td>
                          )}
                          {!selectedOtId && (
                            <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-medium">
                              {ot.endDate ? new Date(ot.endDate).toLocaleDateString('fr-FR') : '—'}
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
