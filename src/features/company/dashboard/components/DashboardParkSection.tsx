import React, { useState, useMemo, useEffect } from 'react';
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
  AlertTriangle,
  Folder,
  FolderOpen,
  Factory,
  Layers,
  Wrench,
  Loader2,
  ChevronsUpDown
} from 'lucide-react';
import { Equipment, Incident, WorkOrder, Localisation } from '@/shared/types/gmao';
import { useLocalisations } from '@/shared/hooks/useLocalisations';
import { useGmao } from '@/shared/hooks/useGmao';
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

interface TreeNodeData {
  id: string;
  name: string;
  type: 'root' | 'localisation' | 'category' | 'unassigned';
  level: number;
  equipments: Equipment[];
  subNodes: TreeNodeData[];
}

const countNodeEquipments = (node: TreeNodeData): number => {
  return node.equipments.length + node.subNodes.reduce((sum, child) => sum + countNodeEquipments(child), 0);
};

const filterTreeNode = (node: TreeNodeData, query: string): { matches: boolean; filteredNode: TreeNodeData | null } => {
  if (!query) return { matches: true, filteredNode: node };

  const q = query.toLowerCase();
  const nameMatches = node.name.toLowerCase().includes(q);

  const matchedEquipments = node.equipments.filter(e => 
    e.name.toLowerCase().includes(q) || 
    e.id.toLowerCase().includes(q) ||
    (e.serialNumber && e.serialNumber.toLowerCase().includes(q)) ||
    (e.category && e.category.toLowerCase().includes(q))
  );

  const filteredSubNodes: TreeNodeData[] = [];
  for (const child of node.subNodes) {
    const res = filterTreeNode(child, query);
    if (res.matches && res.filteredNode) {
      filteredSubNodes.push(res.filteredNode);
    }
  }

  const hasMatches = nameMatches || matchedEquipments.length > 0 || filteredSubNodes.length > 0;

  if (!hasMatches) {
    return { matches: false, filteredNode: null };
  }

  return {
    matches: true,
    filteredNode: {
      ...node,
      equipments: nameMatches ? node.equipments : matchedEquipments,
      subNodes: filteredSubNodes
    }
  };
};

const getAllNodeIds = (nodes: TreeNodeData[]): string[] => {
  let ids: string[] = [];
  for (const n of nodes) {
    ids.push(n.id);
    if (n.subNodes && n.subNodes.length > 0) {
      ids.push(...getAllNodeIds(n.subNodes));
    }
  }
  return ids;
};

// Recursive Tree Node Item component
const DynamicTreeNodeItem: React.FC<{
  node: TreeNodeData;
  level: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  selectedEqId: string | undefined;
  onSelectEquipment: (eq: Equipment) => void;
  treeSearch: string;
  getStatusBadge: (status: Equipment['status']) => React.ReactNode;
}> = ({
  node,
  level,
  expandedNodes,
  onToggle,
  selectedEqId,
  onSelectEquipment,
  treeSearch,
  getStatusBadge
}) => {
  const isSearchActive = treeSearch.trim().length > 0;
  const isExpanded = isSearchActive || expandedNodes.has(node.id);
  const totalEquipments = countNodeEquipments(node);
  const hasChildren = node.subNodes.length > 0 || node.equipments.length > 0;
  const isRoot = node.type === 'root' || level === 0;

  return (
    <div className="space-y-1 select-none">
      {/* Node Header Row */}
      <div
        onClick={() => hasChildren && onToggle(node.id)}
        className={`w-full flex items-center justify-between py-1 px-1.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${
          isRoot
            ? 'text-slate-800 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800'
            : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate pr-2">
          {hasChildren ? (
            <span className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </span>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}

          {isRoot ? (
            <Factory className="w-4 h-4 text-blue-600 shrink-0" />
          ) : node.type === 'unassigned' ? (
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}

          <span className="truncate">{node.name}</span>
        </span>

        <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
          {totalEquipments}
        </span>
      </div>

      {/* Children: Sub-localisations & Direct Equipments */}
      {isExpanded && hasChildren && (
        <div className="pl-3 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-3">
          {/* Sub Nodes */}
          {node.subNodes.map(subNode => (
            <DynamicTreeNodeItem
              key={subNode.id}
              node={subNode}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              selectedEqId={selectedEqId}
              onSelectEquipment={onSelectEquipment}
              treeSearch={treeSearch}
              getStatusBadge={getStatusBadge}
            />
          ))}

          {/* Direct Equipments */}
          {node.equipments.map(eq => {
            const isSelected = selectedEqId === eq.id;
            return (
              <div
                key={eq.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEquipment(eq);
                }}
                className={`group flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                      isSelected ? 'bg-blue-600 scale-125' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-400'
                    }`}
                  />
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
};

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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { currentUser, currentTenantId, tenants } = useGmao();
  const currentTenant = tenants.find(t => t.id === currentTenantId);
  const companyName = currentUser?.tenantName || currentUser?.company || currentTenant?.name || 'Votre Entreprise';
  const isPomodoro = currentTenantId === 'tenant-midi' || (currentTenant?.name || '').toLowerCase().includes('pomodoro');

  // Dynamic tree from real localisations API
  const { tree: geoTree, loading: locsLoading } = useLocalisations();

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Active machine to show in preview card (null if equipment list is empty)
  const activeMachine: Equipment | null = selectedEq || (equipments.length > 0 ? equipments[0] : null);

  // Build hierarchical dynamic tree
  const dynamicTreeNodes = useMemo<TreeNodeData[]>(() => {
    // Only use the seeded Pomodoro localisations if the tenant is Pomodoro
    if (isPomodoro && geoTree && geoTree.length > 0) {
      const assignedEqIds = new Set<string>();

      const buildLocNode = (loc: Localisation, lvl: number): TreeNodeData => {
        // Direct equipments for this localisation
        const directEqs = equipments.filter(e => {
          if (assignedEqIds.has(e.id)) return false;
          // Match by localisationId
          if (e.localisationId && Number(e.localisationId) === Number(loc.id)) {
            assignedEqIds.add(e.id);
            return true;
          }
          if (e.localisation && Number(e.localisation.id) === Number(loc.id)) {
            assignedEqIds.add(e.id);
            return true;
          }
          // Intelligent match by name/category if localisationId is missing and not root Usine
          if (!e.localisationId && loc.nom.toLowerCase() !== 'usine') {
            const locName = loc.nom.toLowerCase();
            const eqName = (e.name || '').toLowerCase();
            const eqCat = (e.category || '').toLowerCase();
            if (eqCat.includes(locName) || eqName.includes(locName)) {
              assignedEqIds.add(e.id);
              return true;
            }
          }
          return false;
        });

        // Sub localisations
        const subNodes = (loc.sousLocalisations || []).map(child => buildLocNode(child, lvl + 1));

        return {
          id: `loc-${loc.id}`,
          name: loc.nom,
          type: lvl === 0 ? 'root' : 'localisation',
          level: lvl,
          equipments: directEqs,
          subNodes
        };
      };

      const roots = geoTree.map(rootLoc => buildLocNode(rootLoc, 0));

      // Append unassigned equipments
      const unassignedEqs = equipments.filter(e => !assignedEqIds.has(e.id));
      if (unassignedEqs.length > 0) {
        roots.push({
          id: 'unassigned-root',
          name: 'Autres / Non assignés',
          type: 'unassigned',
          level: 0,
          equipments: unassignedEqs,
          subNodes: []
        });
      }

      return roots;
    }

    // Dynamic grouping by equipment category for custom / new tenants
    const catMap = new Map<string, Equipment[]>();
    equipments.forEach(eq => {
      const cat = eq.category?.trim() || eq.subFamily?.trim() || 'Équipements généraux';
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(eq);
    });

    const rootSiteName = `Site Principal - ${companyName}`;

    if (catMap.size > 0) {
      const catNodes: TreeNodeData[] = Array.from(catMap.entries()).map(([catName, eqs], idx) => ({
        id: `cat-${idx}-${catName}`,
        name: catName,
        type: 'category',
        level: 1,
        equipments: eqs,
        subNodes: []
      }));

      return [{
        id: 'company-site-root',
        name: rootSiteName,
        type: 'root',
        level: 0,
        equipments: [],
        subNodes: catNodes
      }];
    }

    // Default clean site node for newly created company
    return [{
      id: 'company-site-root',
      name: rootSiteName,
      type: 'root',
      level: 0,
      equipments: [],
      subNodes: []
    }];
  }, [isPomodoro, geoTree, equipments, companyName]);

  // Expand all level 0 and level 1 nodes by default
  useEffect(() => {
    if (dynamicTreeNodes.length > 0) {
      const initialExpanded = new Set<string>();
      dynamicTreeNodes.forEach(root => {
        initialExpanded.add(root.id);
        root.subNodes.forEach(sub => {
          initialExpanded.add(sub.id);
        });
      });
      setExpandedNodes(initialExpanded);
    }
  }, [dynamicTreeNodes]);

  // Filtered tree nodes based on search query
  const filteredTreeNodes = useMemo(() => {
    if (!treeSearch.trim()) return dynamicTreeNodes;
    const results: TreeNodeData[] = [];
    for (const root of dynamicTreeNodes) {
      const res = filterTreeNode(root, treeSearch);
      if (res.matches && res.filteredNode) {
        results.push(res.filteredNode);
      }
    }
    return results;
  }, [dynamicTreeNodes, treeSearch]);

  const allNodeIds = useMemo(() => getAllNodeIds(dynamicTreeNodes), [dynamicTreeNodes]);
  const isAllExpanded = allNodeIds.length > 0 && allNodeIds.every(id => expandedNodes.has(id));

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedNodes(new Set());
    } else {
      setExpandedNodes(new Set(allNodeIds));
    }
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

  // Dynamic stats for active machine
  const machineWorkOrders = useMemo(() => {
    if (!activeMachine) return [];
    return workOrders.filter(w => w.equipmentId === activeMachine.id);
  }, [workOrders, activeMachine?.id]);

  const machineIncidents = useMemo(() => {
    if (!activeMachine) return [];
    return incidents.filter(i => i.equipmentId === activeMachine.id);
  }, [incidents, activeMachine?.id]);

  const machineCompletedOts = useMemo(() => {
    return machineWorkOrders.filter(w => w.status === 'Terminé' || w.status === 'Clôturé');
  }, [machineWorkOrders]);

  const machineDispo = activeMachine ? (activeMachine.status === 'En panne' ? 0 : (activeMachine.healthIndex || 98)) : 0;

  const machineMtbf = useMemo(() => {
    if (!activeMachine) return 0;
    const failures = machineIncidents.length + machineWorkOrders.filter(w => w.type === 'Correctif').length;
    const hours = activeMachine.hoursCount || 1000;
    return failures > 0 ? Math.round(hours / failures) : hours;
  }, [machineIncidents, machineWorkOrders, activeMachine?.hoursCount]);

  const machineMttr = useMemo(() => {
    if (!activeMachine) return '0.0';
    if (machineCompletedOts.length > 0) {
      const totalMinutes = machineCompletedOts.reduce((sum, o) => sum + (o.durationMinutes || 90), 0);
      return (totalMinutes / (machineCompletedOts.length * 60)).toFixed(1);
    }
    return activeMachine.status === 'En panne' ? '2.0' : '0.0';
  }, [machineCompletedOts, activeMachine?.status]);

  // Demandes d'intervention calculations (Section 6)
  const diATraiter = incidents.filter(i => i.status === 'Nouveau').length;
  const diEnCours = incidents.filter(i => i.status === 'Validé').length;
  const diRealise = incidents.filter(i => i.status === 'Transformé en OT' || i.status === 'Clos').length;
  const diAnnule = incidents.filter(i => i.status === 'Rejeté').length;

  // Ordres de travail calculations (Section 7)
  const otAFaire = workOrders.filter(o => o.status === 'En attente' || o.status === 'Affecté').length;
  const otEnCours = workOrders.filter(o => o.status === 'En cours').length;
  const otTermine = workOrders.filter(o => o.status === 'Terminé' || o.status === 'Clôturé').length;
  const otEnRetard = workOrders.filter(o => {
    if (o.status === 'Terminé' || o.status === 'Clôturé') return false;
    const limit = (o as any).dateLimite || (o as any).date;
    return limit && new Date(limit) < new Date();
  }).length;

  const recentDis = incidents.slice(0, 5);
  const recentOts = workOrders.slice(0, 5);

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
            <div className="flex items-center gap-2">
              <button
                onClick={toggleExpandAll}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                title={isAllExpanded ? "Tout replier" : "Tout déplier"}
              >
                <ChevronsUpDown className="w-3 h-3" />
                {isAllExpanded ? 'Replier' : 'Déplier'}
              </button>
              <button
                onClick={() => onNavigate('equipment')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Voir tout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              placeholder="Rechercher par nom, code ou zone..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Tree Structure */}
          <div className="space-y-1 overflow-y-auto max-h-[380px] pr-1">
            {locsLoading && dynamicTreeNodes.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Chargement de l'arborescence...</span>
              </div>
            ) : filteredTreeNodes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Search className="w-6 h-6 mx-auto mb-2 text-slate-300 opacity-60" />
                <p className="font-semibold">Aucun équipement trouvé</p>
                <p className="text-[11px] text-slate-400 mt-0.5">pour "{treeSearch}"</p>
              </div>
            ) : (
              filteredTreeNodes.map(node => (
                <DynamicTreeNodeItem
                  key={node.id}
                  node={node}
                  level={0}
                  expandedNodes={expandedNodes}
                  onToggle={toggleNode}
                  selectedEqId={activeMachine ? activeMachine.id : undefined}
                  onSelectEquipment={(eq) => setSelectedEq(eq)}
                  treeSearch={treeSearch}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </div>
        </div>

        {/* Tree Footer stats */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {equipments.length} équipements gérés
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {locsLoading ? 'Synchronisation...' : `${dynamicTreeNodes.length} branche${dynamicTreeNodes.length > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* COLUMN 2: Machine Preview Card (or Empty State) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        {activeMachine ? (
          <>
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
                  {activeMachine.category || 'Équipement'} • {activeMachine.id}
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
                    {activeMachine.hoursCount ? `${activeMachine.hoursCount} h` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Heures de fonctionnement
                  </span>
                </div>
              </div>

              {/* Technical Specs Grid with MTBF & MTTR */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Criticité</span>
                  <span className={`font-bold text-xs ${
                    activeMachine.criticality === 'Critique' || activeMachine.criticality === 'Haute'
                      ? 'text-rose-600 dark:text-rose-400'
                      : activeMachine.criticality === 'Moyenne'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {activeMachine.criticality || 'Moyenne'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Disponibilité</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {machineDispo}%
                  </span>
                </div>
                <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">MTBF machine</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                    {machineMtbf} h
                  </span>
                </div>
                <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">MTTR moyen</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                    {machineMttr} h
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 my-auto min-h-[380px]">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm border border-blue-100 dark:border-blue-900/40">
              <Factory className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-slate-800 dark:text-white mb-1.5">
              Parc machines vide
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6 leading-relaxed">
              Bienvenue sur votre espace GMAO. Aucun équipement n'est encore enregistré pour <span className="font-bold text-slate-700 dark:text-slate-300">{companyName}</span>.
            </p>
            <button
              onClick={() => onNavigate('equipment')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ajouter votre premier équipement
            </button>
          </div>
        )}
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
                {recentDis.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <ClipboardList className="w-6 h-6 mx-auto mb-1.5 text-slate-300 opacity-60" />
                    <p className="font-semibold">Aucune demande d'intervention</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toutes les demandes ont été traitées</p>
                  </div>
                ) : (
                  recentDis.map((di, idx) => {
                    const urgencyLabel = (di as any).urgency || (di as any).priorite || 'Moyenne';
                    const urgencyColor = 
                      urgencyLabel === 'Urgent' || urgencyLabel === 'Critique' || urgencyLabel === 'Haute'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : urgencyLabel === 'Moyenne'
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
                              {di.id}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date((di as any).createdAt || (di as any).date || Date.now()).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-white truncate">
                            {di.description || (di as any).title || 'Intervention requise'}
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
                  })
                )}
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
                {recentOts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-slate-300 opacity-60" />
                    <p className="font-semibold">Aucun ordre de travail actif</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tous les ordres de travail sont à jour</p>
                  </div>
                ) : (
                  recentOts.map((ot, idx) => (
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
                            {new Date((ot as any).createdAt || (ot as any).date || Date.now()).toLocaleDateString('fr-FR')}
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
                  ))
                )}
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
