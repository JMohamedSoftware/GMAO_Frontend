import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { Incident } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { Plus, Search } from 'lucide-react';

import { IncidentList } from '../components/IncidentList';
import { IncidentModals } from '../components/IncidentModals';

interface CorrectiveProps {
  onNavigate: (screen: string) => void;
  onOpenCreateOtWithIncident: (inc: Incident) => void;
}

export const Corrective: React.FC<CorrectiveProps> = ({ onNavigate, onOpenCreateOtWithIncident }) => {
  const { incidents, equipments, currentUser, addIncident, updateIncidentStatus } = useGmao();
  const { canDo, isProduction, isTechnicien } = usePermissions();
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('Toutes');
  
  // Incident Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Incident['urgency']>('Moyenne');
  const [photo, setPhoto] = useState('');

  // Filter incidents based on search query and role
  const filteredIncidents = incidents.filter(inc => {
    // Production/Technicien see only their own DIs
    if (isProduction || isTechnicien) {
      if (currentUser && !inc.reportedBy.includes(currentUser.name)) return false;
    }

    const eq = equipments.find(e => e.id === inc.equipmentId);
    const matchesSearch = inc.description.toLowerCase().includes(search.toLowerCase()) ||
                          inc.id.toLowerCase().includes(search.toLowerCase()) ||
                          inc.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
                          (eq && eq.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesUrgency = filterUrgency === 'Toutes' || inc.urgency === filterUrgency;

    return matchesSearch && matchesUrgency;
  });

  const getUrgencyColor = (urg: Incident['urgency']) => {
    switch (urg) {
      case 'Critique': return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'Haute': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Moyenne': return 'text-primary bg-primary/5 border-primary/10';
      default: return 'text-slate-500 bg-slate-50 border-slate-205';
    }
  };

  const getColumnIncidents = (status: Incident['status']) => {
    return filteredIncidents.filter(inc => inc.status === status);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId || !description) return;

    addIncident({
      equipmentId: selectedEqId,
      description,
      reportedBy: 'Youssef Mansouri (Prod)',
      urgency,
      photo: photo || undefined
    });

    // Reset
    setSelectedEqId('');
    setDescription('');
    setUrgency('Moyenne');
    setPhoto('');
    setShowAddModal(false);
  };

  const columns: { id: Incident['status']; label: string; color: string }[] = [
    { id: 'Nouveau', label: 'Nouveau / Déclaré', color: 'bg-rose-500' },
    { id: 'Validé', label: 'Validé / À Planifier', color: 'bg-amber-500' },
    { id: 'Transformé en OT', label: 'En Cours d\'OT', color: 'bg-primary' },
    { id: 'Rejeté', label: 'Rejeté', color: 'bg-slate-400' },
    { id: 'Clos', label: 'Clos', color: 'bg-emerald-500' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {isProduction ? 'Mes Demandes d\'Intervention' : 'Tableau des Pannes & Incidents (Correctif)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            {isProduction
              ? 'Suivez vos demandes et déclarez une nouvelle panne'
              : 'Déclaration rapide des pannes par la production et workflow de validation'
            }
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Déclarer Panne</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-custom-sm bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            placeholder="Rechercher un incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-2 text-xs rounded border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/10 outline-none focus:border-primary text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
          >
            <option value="Toutes">Toutes les urgences</option>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
            <option value="Critique">Critique</option>
          </select>
          <div className="text-xs font-semibold text-slate-400 border-l border-slate-200/50 dark:border-slate-800/50 pl-4">
            Total : {filteredIncidents.length} alertes actives
          </div>
        </div>
      </div>

      {/* Kanban Layout */}
      <IncidentList
        columns={columns}
        getColumnIncidents={getColumnIncidents}
        equipments={equipments}
        getUrgencyColor={getUrgencyColor}
        canDo={canDo}
        isProduction={isProduction}
        isTechnicien={isTechnicien}
        updateIncidentStatus={updateIncidentStatus}
        onOpenCreateOtWithIncident={onOpenCreateOtWithIncident}
        onNavigate={onNavigate}
      />

      {/* Add Incident Modal */}
      <IncidentModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        equipments={equipments}
        selectedEqId={selectedEqId}
        setSelectedEqId={setSelectedEqId}
        description={description}
        setDescription={setDescription}
        urgency={urgency}
        setUrgency={setUrgency}
        photo={photo}
        setPhoto={setPhoto}
        handleReportIncident={handleReportIncident}
      />

    </div>
  );
};
