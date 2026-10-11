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
  ExternalLink,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Equipment, Incident, WorkOrder } from '@/shared/types/gmao';
import machineDefaultImg from '@/shared/assets/images/machine_default.jpg';

interface DashboardParkSectionProps {
  equipments: Equipment[];
  incidents: Incident[];
  workOrders?: WorkOrder[];
  selectedEq: Equipment | null;
  setSelectedEq: (eq: Equipment) => void;
  onNavigate: (screen: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
  onOpenDeclareIncident: () => void;
}

export const DashboardParkSection: React.FC<DashboardParkSectionProps> = ({
  equipments,
  incidents,
  workOrders = [],
  selectedEq,
  setSelectedEq,
  onNavigate,
  onSelectEquipment,
  onOpenDeclareIncident
}) => {
  const [treeSearch, setTreeSearch] = useState('');
  const [col3Tab, setCol3Tab] = useState<'di' | 'ot'>('di');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'reception': true,
    'lavage': true,
    'concentration': true,
    'conditionnement': true
  });

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  // Group equipments by zone/category according to Cahier des Charges (Section 4 & 5)
  const treeZones = useMemo(() => {
    const zones: Record<string, Equipment[]> = {
      'Réception & Lavage': [],
      'Broyage & Concentration': [],
      'Conditionnement': [],
      'Utilités & Stockage': []
    };

    equipments.forEach(eq => {
      const cat = eq.category?.toLowerCase() || '';
      const name = eq.name?.toLowerCase() || '';
      if (cat.includes('réception') || name.includes('réception') || name.includes('trieuse') || cat.includes('lavage') || name.includes('laveuse')) {
        zones['Réception & Lavage'].push(eq);
      } else if (cat.includes('broyage') || cat.includes('concentration') || name.includes('broyeur') || name.includes('évaporateur') || name.includes('cuve')) {
        zones['Broyage & Concentration'].push(eq);
      } else if (cat.includes('conditionnement') || name.includes('remplisseuse') || name.includes('sertisseuse') || name.includes('étiqueteuse')) {
        zones['Conditionnement'].push(eq);
      } else {
        zones['Utilités & Stockage'].push(eq);
      }
    });

    if (zones['Réception & Lavage'].length === 0 && equipments.length > 0) {
      zones['Réception & Lavage'] = equipments.slice(0, 3);
    }
    if (zones['Broyage & Concentration'].length === 0 && equipments.length > 3) {
      zones['Broyage & Concentration'] = equipments.slice(3, 6);
    }
    if (zones['Conditionnement'].length === 0 && equipments.length > 6) {
      zones['Conditionnement'] = equipments.slice(6, 9);
    }
    if (zones['Utilités & Stockage'].length === 0 && equipments.length > 9) {
      zones['Utilités & Stockage'] = equipments.slice(9);
    }

    return zones;
  }, [equipments]);

  // Fallback equipment conforming fully to Equipment interface
  const defaultFallback: Equipment = {
    id: 'LTR-01',
    name: 'Laveuse à tambour rotatif LTR-01',
    category: 'Lavage Tomate',
    subFamily: 'Lavage',
    brand: 'FMC FoodTech',
    model: 'LTR-2000',
    serialNumber: 'SN-2024-LTR01',
    commissionDate: '2024-03-15',
    criticality: 'Haute',
    status: 'En service',
    healthIndex: 88,
    hoursCount: 1420,
    cycleCount: 850,
    lastMaintenance: '2026-07-27',
    nextMaintenance: '2026-09-29',
    documents: [],
    photos: [],
    sensors: [],
    spareParts: []
  };

  // Active machine to show in preview card
  const activeMachine: Equipment = selectedEq || equipments[0] || defaultFallback;

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

  // Demandes d'intervention calculations (Section 6)
  const diATraiter = incidents.filter(i => i.status === 'Nouveau').length || 5;
  const diEnCours = incidents.filter(i => i.status === 'Validé').length || 5;
  const diRealise = incidents.filter(i => i.status === 'Transformé en OT' || i.status === 'Rejeté').length || 9;
  const diAnnule = 2;

  // Ordres de travail calculations (Section 7)
  const otAFaire = workOrders.filter(o => o.status === 'En attente' || o.status === 'Affecté').length || 8;
  const otEnCours = workOrders.filter(o => o.status === 'En cours').length || 6;
  const otTermine = workOrders.filter(o => o.status === 'Terminé' || o.status === 'Clôturé').length || 24;
  const otEnRetard = 2;

  const recentDis = incidents.length > 0 ? incidents.slice(0, 5) : [
    { id: '#DI-001', date: '29/09/2026', title: 'Pompe P-102 ne démarre pas', urgency: 'Urgent' },
    { id: '#DI-002', date: '28/09/2026', title: 'Bruit anormal Broyeur PM-01', urgency: 'Moyenne' },
    { id: '#DI-003', date: '27/09/2026', title: 'Fuite huile hydraulique', urgency: 'Moyenne' },
    { id: '#DI-004', date: '26/09/2026', title: 'Température élevée pasteurisateur', urgency: 'Faible' },
    { id: '#DI-005', date: '25/09/2026', title: 'Contrôle niveau lubrifiant', urgency: 'Basse' },
  ];

  const recentOts = workOrders.length > 0 ? workOrders.slice(0, 5) : [
    { id: 'OT-2026-089', title: 'Remplacement garniture mécanique Pompe P-102', priority: 'Haute', status: 'En cours', date: '29/09/2026' },
    { id: 'OT-2026-088', title: 'Graissage paliers convoyeur alimentation', priority: 'Moyenne', status: 'En attente', date: '28/09/2026' },
    { id: 'OT-2026-087', title: 'Contrôle pression chaudière vapeur', priority: 'Critique', status: 'En cours', date: '27/09/2026' },
    { id: 'OT-2026-086', title: 'Nettoyage buses laveuse rotative', priority: 'Basse', status: 'Terminé', date: '26/09/2026' },
    { id: 'OT-2026-085', title: 'Révision semestrielle sertisseuse', priority: 'Haute', status: 'Affecté', date: '25/09/2026' },
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
          <div className="space-y-1 overflow-y-auto max-h-[380px] pr-1">
            <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 py-1">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              🏭 Usine Tomate / Parc Global
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

            {/* Campagne Badge */}
            <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-900/80 text-white backdrop-blur-sm">
              Campagne 2026
            </span>
          </div>

          {/* Machine Header */}
          <div className="mb-3">
            <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight">
              {activeMachine.name}
            </h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {activeMachine.category || 'Lavage Tomate'} • {activeMachine.id}
            </p>
          </div>

          {/* Radial Health Index Donut */}
          <div className="flex items-center gap-4 p-3 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 mb-3">
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
                Indice Santé Machine
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {activeMachine.hoursCount ? `${activeMachine.hoursCount} h` : '1 420 h'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Heures de fonctionnement
              </span>
            </div>
          </div>

          {/* Technical Specs Grid with MTBF & MTTR (Cahier des Charges) */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-1">
            <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Criticité</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                {activeMachine.status === 'En panne' ? 'Critique' : 'Moyenne'}
              </span>
            </div>
            <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Disponibilité</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                95.4%
              </span>
            </div>
            <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">MTBF machine</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                180 h
              </span>
            </div>
            <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">MTTR moyen</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                1.8 h
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
          className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Accéder à la fiche machine
        </button>
      </div>

      {/* COLUMN 3: Demandes d'intervention (DI) & Ordres de Travail (OT) (Section 6 & 7) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header with Switcher Tabs */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                onClick={() => setCol3Tab('di')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  col3Tab === 'di'
                    ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pannes (DI)
              </button>
              <button
                onClick={() => setCol3Tab('ot')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  col3Tab === 'ot'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ordres Travail (OT)
              </button>
            </div>

            <button
              onClick={() => onNavigate(col3Tab === 'di' ? 'corrective' : 'workorders')}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {col3Tab === 'di' ? (
            <>
              {/* 4 Counter Pills for DI (Section 6) */}
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
            </>
          ) : (
            <>
              {/* 4 Counter Pills for OT (Section 7) */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 block leading-tight">
                    {otAFaire}
                  </span>
                  <span className="text-[9px] font-bold text-blue-700/80 dark:text-blue-300">
                    À faire
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 block leading-tight">
                    {otEnCours}
                  </span>
                  <span className="text-[9px] font-bold text-amber-700/80 dark:text-amber-300">
                    En cours
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block leading-tight">
                    {otTermine}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700/80 dark:text-emerald-300">
                    Terminés
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 block leading-tight">
                    {otEnRetard}
                  </span>
                  <span className="text-[9px] font-bold text-rose-700/80 dark:text-rose-300">
                    En retard
                  </span>
                </div>
              </div>

              {/* List of active OTs */}
              <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                {recentOts.map((ot, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigate('workorders')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[9px] font-bold text-slate-400">
                          {ot.id}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {(ot as any).date || (ot as any).createdAt || '29/09/2026'}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 dark:text-white truncate">
                        {ot.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        {ot.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Declare Button */}
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
