import React from 'react';
import { PlusSquare, MinusSquare, Settings2, Package, PlusCircle, Trash2, Search } from 'lucide-react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { Equipment as EquipmentType } from '@/shared/types/gmao';
import { GeoNode } from './GeoTree';

export type EqNode = {
  id: string;
  name: string;
  type: 'category' | 'equipment';
  children: EqNode[];
  equipmentRef?: EquipmentType;
  isCustom?: boolean;
};

interface EqTreeProps {
  eqTree: EqNode[];
  eqExpanded: Set<string>;
  selectedEqId: string | null;
  selectedGeoNode: GeoNode | null;
  search: string;
  onSearchChange: (search: string) => void;
  filterCriticality: string;
  onFilterCriticalityChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  onToggleNode: (id: string) => void;
  onSelectEquipment: (eq: EquipmentType) => void;
  onAddNewFromEq: (node: EqNode, e: React.MouseEvent) => void;
  onDeleteEqNode: (node: EqNode, e: React.MouseEvent) => void;
}

export const EqTree: React.FC<EqTreeProps> = ({
  eqTree,
  eqExpanded,
  selectedEqId,
  selectedGeoNode,
  search,
  onSearchChange,
  filterCriticality,
  onFilterCriticalityChange,
  filterStatus,
  onFilterStatusChange,
  onToggleNode,
  onSelectEquipment,
  onAddNewFromEq,
  onDeleteEqNode
}) => {
  const { can } = usePermissions();

  const renderNodes = (nodes: EqNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = eqExpanded.has(node.id);
      const isSelected = selectedEqId === node.equipmentRef?.id;
      const hasChildren = node.children.length > 0;
      
      return (
        <div key={node.id}>
          <div 
            className={`group flex items-center justify-between py-1.5 pr-2 rounded cursor-pointer text-xs border border-transparent ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (node.type === 'equipment' && node.equipmentRef) {
                onSelectEquipment(node.equipmentRef);
              } else {
                onToggleNode(node.id);
              }
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div onClick={(e) => { e.stopPropagation(); onToggleNode(node.id); }} className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {hasChildren ? (
                  isExpanded ? <MinusSquare className="w-3.5 h-3.5 text-slate-500" /> : <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
                ) : <div className="w-3.5 h-3.5" />}
              </div>
              
              {node.type === 'category' ? (
                <Package className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              ) : (
                <Settings2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
              )}
              
              <span className="truncate">{node.type === 'category' ? `Famille : ${node.name}` : node.name}</span>
            </div>

            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                {can(PERMISSIONS.EQUIPMENT_CREATE) && (
                <button 
                onClick={(e) => onAddNewFromEq(node, e)}
                className={`p-1 rounded ${isSelected ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary shadow-sm'} shrink-0`}
                title={node.type === 'category' ? "Ajouter un équipement dans cette famille" : "Ajouter un sous-équipement"}
                >
                <PlusCircle className="w-3 h-3" />
                </button>
                )}
                {can(PERMISSIONS.EQUIPMENT_DELETE) && (
                <button 
                onClick={(e) => onDeleteEqNode(node, e)}
                className={`p-1 rounded ${isSelected ? 'text-white hover:bg-rose-500/80' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 shadow-sm'} shrink-0`}
                title="Supprimer"
                >
                <Trash2 className="w-3 h-3" />
                </button>
                )}
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div className="relative">
              <div className="absolute left-[14px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" style={{ left: `${level * 16 + 14}px` }} />
              {renderNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-72 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden shrink-0">
      <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Équipements
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCriticality}
            onChange={(e) => onFilterCriticalityChange(e.target.value)}
            className="flex-1 py-1 px-2 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-primary text-slate-700 dark:text-slate-300"
          >
            <option value="Toutes">Criticité (Toutes)</option>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
            <option value="Critique">Critique</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="flex-1 py-1 px-2 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-primary text-slate-700 dark:text-slate-300"
          >
            <option value="Tous">Statut (Tous)</option>
            <option value="En service">En service</option>
            <option value="En panne">En panne</option>
            <option value="En maintenance">En maintenance</option>
            <option value="Hors service">Hors service</option>
          </select>
        </div>
      </div>
      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
        {!selectedGeoNode ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic text-center px-4">
            Sélectionnez une localisation à gauche
          </div>
        ) : eqTree.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic text-center px-4">
            Aucun équipement trouvé
          </div>
        ) : (
          renderNodes(eqTree)
        )}
      </div>
    </div>
  );
};
