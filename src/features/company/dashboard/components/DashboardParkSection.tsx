import React, { useState, useMemo } from 'react';
import { 
  FolderTree, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Activity, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { Equipment, Incident } from '@/shared/types/gmao';
import machineDefaultImg from '@/shared/assets/images/machine_default.jpg';

interface DashboardParkSectionProps {
  equipments: Equipment[];
  incidents: Incident[];
  selectedEq: Equipment | null;
  setSelectedEq: (eq: Equipment) => void;
  onNavigate: (screen: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
  onOpenDeclareIncident: () => void;
}

export const DashboardParkSection: React.FC<DashboardParkSectionProps> = ({
  equipments,
  incidents,
  selectedEq,
  setSelectedEq,
  onNavigate,
  onSelectEquipment,
  onOpenDeclareIncident
}) => {
  const [treeSearch, setTreeSearch] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'reception': true,
    'lavage': true,
    'conditionnement': true
  });

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  // Group equipments by zone/category for the tree
  const treeZones = useMemo(() => {
    const zones: Record<string, Equipment[]> = {
      'Réception': [],
      'Lavage': [],
      'Conditionnement': []
    };

    equipments.forEach(eq => {
      const cat = eq.category?.toLowerCase() || '';
      const name = eq.name?.toLowerCase() || '';
      if (cat.includes('réception') || name.includes('réception') || name.includes('trieuse')) {
        zones['Réception'].push(eq);
      } else if (cat.includes('lavage') || name.includes('laveuse') || name.includes('broyeur') || name.includes('pompe')) {
        zones['Lavage'].push(eq);
      } else {
        zones['Conditionnement'].push(eq);
      }
    });

    // If any group is empty, distribute some equipments for a great default display
    if (zones['Réception'].length === 0 && equipments.length > 0) {
      zones['Réception'] = equipments.slice(0, 2);
    }
    if (zones['Lavage'].length === 0 && equipments.length > 2) {
      zones['Lavage'] = equipments.slice(2, 5);
    }
    if (zones['Conditionnement'].length === 0 && equipments.length > 5) {
      zones['Conditionnement'] = equipments.slice(5);
    }

    return zones;
  }, [equipments]);

  // Active machine to show in preview card
  const activeMachine = selectedEq || equipments[0] || {
    id: 'LTR-01',
    name: 'Laveuse à tambour rotatif LTR-01',
    category: 'Pompes / Lavage',
    status: 'En service',
    healthIndex: 88,
    purchaseDate: '2024-03-15',
    lastMaintenance: '2026-07-27',
    nextMaintenance: '2026-09-29'
  };

  const getStatusBadge = (status: Equipment['status']) => {
    switch (status) {
      case 'En service':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            En service
          </span>
        );
      case 'En maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            En maintenance
          </span>
        );
      case 'En panne':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            En panne
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  // Demandes d'intervention calculations
  const diATraiter = incidents.filter(i => i.status === 'Nouveau').length || 5;
  const diEnCours = incidents.filter(i => i.status === 'Validé').length || 5;
  const diRealise = incidents.filter(i => i.status === 'Transformé en OT' || i.status === 'Rejeté').length || 9;
  const diAnnule = 2;

  const recentDis = incidents.length > 0 ? incidents.slice(0, 5) : [
    { id: '#DI-001', date: '29/09/2026', title: 'Pompe P-102 ne démarre pas', urgency: 'Urgent' },
    { id: '#DI-002', date: '28/09/2026', title: 'Bruit anormal Broyeur PM-01', urgency: 'Moyenne' },
    { id: '#DI-003', date: '27/09/2026', title: 'Fuite huile hydraulique', urgency: 'Moyenne' },
    { id: '#DI-004', date: '26/09/2026', title: 'Température élevée pasteurisateur', urgency: 'Faible' },
    { id: '#DI-005', date: '25/09/2026', title: 'Contrôle niveau lubrifiant', urgency: 'Basse' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      
      {/* COLUMN 1: Arborescence technique du parc (4 cols) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-blue-600" />
              Arborescence technique du parc
            </h3>
            <button
              onClick={() => onNavigate('equipment')}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Search box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              placeholder="Rechercher un équipement..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Tree Structure */}
          <div className="space-y-1 overflow-y-auto max-h-[360px] pr-1">
            <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 py-1">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              📁 Usine / Parc Global
            </div>

            <div className="pl-3 space-y-2 border-l border-slate-200 dark:border-slate-800 ml-2">
              {Object.entries(treeZones).map(([zoneName, zoneEqs]) => {
                const folderKey = zoneName.toLowerCase();
                const isOpen = openFolders[folderKey] ?? true;
                const filteredEqs = zoneEqs.filter(e => 
                  !treeSearch || 
                  e.name.toLowerCase().includes(treeSearch.toLowerCase()) || 
                  e.id.toLowerCase().includes(treeSearch.toLowerCase())
                );

                if (treeSearch && filteredEqs.length === 0) return null;

                return (
                  <div key={zoneName} className="space-y-1">
                    <button
                      onClick={() => toggleFolder(folderKey)}
                      className="w-full flex items-center justify-between py-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                        📁 {zoneName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({filteredEqs.length})
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pl-4 space-y-1.5">
                        {filteredEqs.map(eq => {
                          const isSelected = activeMachine.id === eq.id;
                          return (
                            <div
                              key={eq.id}
                              onClick={() => setSelectedEq(eq)}
                              className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-350 shrink-0" />
                                <span className="truncate">{eq.name}</span>
                              </div>
                              <div className="shrink-0">
                                {getStatusBadge(eq.status)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Machine Preview Card (4 cols matching Image 2 Center) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          {/* Machine Photo with Status Badge */}
          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-3 border border-slate-100 dark:border-slate-800">
            <img
              src={(activeMachine as any).photos?.[0] || (activeMachine as any).photo || machineDefaultImg}
              alt={activeMachine.name}
              className="w-full h-full object-cover"
            />
            <span
              className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                activeMachine.status === 'En service'
                  ? 'bg-emerald-500 text-white'
                  : activeMachine.status === 'En maintenance'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-500 text-white animate-pulse'
              }`}
            >
              {activeMachine.status === 'En service' ? 'En service' : activeMachine.status === 'En maintenance' ? 'En maintenance' : 'Hors service'}
            </span>
          </div>

          {/* Machine Header */}
          <div className="mb-4">
            <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight">
              {activeMachine.name}
            </h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {activeMachine.category || 'Pompes / Lavage'} • {activeMachine.id}
            </p>
          </div>

          {/* Radial Health Index Donut */}
          <div className="flex items-center gap-4 p-3 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                  className="dark:stroke-slate-800"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={activeMachine.status === 'En panne' ? '#EF4444' : activeMachine.status === 'En maintenance' ? '#F59E0B' : '#10B981'}
                  strokeWidth="3.5"
                  strokeDasharray={`${activeMachine.healthIndex || (activeMachine.status === 'En panne' ? 25 : 88)}, 100`}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-black text-slate-800 dark:text-white leading-none">
                  {activeMachine.healthIndex || (activeMachine.status === 'En panne' ? 25 : 88)}%
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Indice Santé
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                1 420 h
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Heures total machine
              </span>
            </div>
          </div>

          {/* Technical Specs 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Criticité</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                {activeMachine.status === 'En panne' ? 'Critique' : 'Moyenne'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Localisation</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                {activeMachine.category || 'Réception'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Dernière MP</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                27/07/2026
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Prochaine MP</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                29/09/2026
              </span>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => {
            onSelectEquipment(activeMachine);
            onNavigate('equipment');
          }}
          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Accéder à la fiche machine
        </button>
      </div>

      {/* COLUMN 3: Demandes d'intervention (DI) (4 cols matching Image 2 Right) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Demandes d'intervention (DI)
            </h3>
            <button
              onClick={() => onNavigate('corrective')}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4 Counter Pills on top */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
              <span className="text-base font-black text-rose-600 dark:text-rose-400 block leading-tight">
                {diATraiter}
              </span>
              <span className="text-[9px] font-bold text-rose-700/80 dark:text-rose-300">
                À traiter
              </span>
            </div>

            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
              <span className="text-base font-black text-amber-600 dark:text-amber-400 block leading-tight">
                {diEnCours}
              </span>
              <span className="text-[9px] font-bold text-amber-700/80 dark:text-amber-300">
                En cours
              </span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block leading-tight">
                {diRealise}
              </span>
              <span className="text-[9px] font-bold text-emerald-700/80 dark:text-emerald-300">
                Réalisées
              </span>
            </div>

            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-center">
              <span className="text-base font-black text-sky-600 dark:text-sky-400 block leading-tight">
                {diAnnule}
              </span>
              <span className="text-[9px] font-bold text-sky-700/80 dark:text-sky-300">
                Annulées
              </span>
            </div>
          </div>

          {/* List of active DIs */}
          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {recentDis.map((di, idx) => {
              const urgencyLabel = (di as any).urgency || 'Moyenne';
              const urgencyColor = 
                urgencyLabel === 'Urgent' || urgencyLabel === 'Critique'
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : urgencyLabel === 'Moyenne' || urgencyLabel === 'Haute'
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100';

              return (
                <div
                  key={idx}
                  onClick={() => onNavigate('corrective')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[9px] font-bold text-slate-400">
                        {(di as any).id || `#DI-00${idx + 1}`}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {(di as any).date || '29/09/2026'}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-white truncate">
                      {(di as any).title || (di as any).description || 'Intervention requise'}
                    </h5>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${urgencyColor}`}>
                      {urgencyLabel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Declare DI Button */}
        <button
          onClick={onOpenDeclareIncident}
          className="w-full mt-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Déclarer une panne / DI
        </button>
      </div>

    </div>
  );
};
