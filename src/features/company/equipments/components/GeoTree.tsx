import React from 'react';
import { ChevronRight, ChevronDown, MapPin, Building2, Layers, DoorOpen, Trash2, Plus, PlusSquare, MinusSquare, FolderOpen, Folder, PlusCircle } from 'lucide-react';
import { PERMISSIONS } from '@/shared/permissions';
import { usePermissions } from '@/shared/hooks/usePermissions';

export type GeoNode = {
  id: string;
  name: string;
  type: 'site' | 'building' | 'floor' | 'room';
  children: GeoNode[];
  isCustom?: boolean;
  parentId?: string;
};

interface GeoTreeProps {
  geoTree: GeoNode[];
  geoExpanded: Set<string>;
  selectedGeoNode: GeoNode | null;
  onToggleNode: (id: string) => void;
  onSelectNode: (node: GeoNode) => void;
  onAddGeo: () => void;
  onAddNewFromGeo: (node: GeoNode, e: React.MouseEvent) => void;
  onDeleteGeoNode: (node: GeoNode, e: React.MouseEvent) => void;
}

export const GeoTree: React.FC<GeoTreeProps> = ({
  geoTree,
  geoExpanded,
  selectedGeoNode,
  onToggleNode,
  onSelectNode,
  onAddGeo,
  onAddNewFromGeo,
  onDeleteGeoNode
}) => {
  const { can } = usePermissions();

  const renderNodes = (nodes: GeoNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = geoExpanded.has(node.id);
      const isSelected = selectedGeoNode?.id === node.id;
      const hasChildren = node.children.length > 0;
      
      return (
        <div key={node.id}>
          <div 
            className={`group flex items-center justify-between py-1.5 pr-2 rounded cursor-pointer text-xs ${isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => onSelectNode(node)}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div onClick={(e) => { e.stopPropagation(); onToggleNode(node.id); }} className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {hasChildren ? (
                  isExpanded ? <MinusSquare className="w-3.5 h-3.5 text-slate-500" /> : <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
                ) : <div className="w-3.5 h-3.5" />}
              </div>
              
              {isExpanded ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-amber-400'}`} /> : <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-amber-400'}`} />}
              
              <span className="truncate uppercase">{node.name}</span>
            </div>
            
            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                {can(PERMISSIONS.EQUIPMENT_CREATE) && node.type !== 'room' && (
                    <button 
                    onClick={(e) => onAddNewFromGeo(node, e)}
                    className={`p-1 rounded ${isSelected ? 'text-primary hover:bg-primary/20' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary shadow-sm'} shrink-0`}
                    title="Ajouter un sous-dossier"
                    >
                    <PlusCircle className="w-3 h-3" />
                    </button>
                )}
                {can(PERMISSIONS.EQUIPMENT_DELETE) && (
                <button 
                onClick={(e) => onDeleteGeoNode(node, e)}
                className={`p-1 rounded ${isSelected ? 'text-rose-500 hover:bg-rose-500/20' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 shadow-sm'} shrink-0`}
                title="Supprimer"
                >
                <Trash2 className="w-3 h-3" />
                </button>
                )}
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div>
              {renderNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-64 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden shrink-0">
      <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Localisations
        </h3>
        <button 
            onClick={onAddGeo}
            className="p-1 rounded bg-primary text-white hover:bg-primary/90 shadow-sm transition-transform hover:scale-105 active:scale-95"
            title="Ajouter une localisation"
        >
            <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
        {renderNodes(geoTree)}
      </div>
    </div>
  );
};
