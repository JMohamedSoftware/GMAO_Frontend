import React from 'react';
import { ChevronRight, ChevronDown, MapPin, FolderOpen, Folder, PlusSquare, MinusSquare } from 'lucide-react';
import { Localisation } from '@/shared/types/gmao';

interface GeoTreeProps {
  geoTree: Localisation[];
  geoExpanded: Set<number>;
  selectedGeoNode: Localisation | null;
  onToggleNode: (id: number) => void;
  onSelectNode: (node: Localisation) => void;
}

export const GeoTree: React.FC<GeoTreeProps> = ({
  geoTree,
  geoExpanded,
  selectedGeoNode,
  onToggleNode,
  onSelectNode,
}) => {

  const renderNodes = (nodes: Localisation[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = geoExpanded.has(node.id);
      const isSelected = selectedGeoNode?.id === node.id;
      const hasChildren = node.sousLocalisations && node.sousLocalisations.length > 0;
      
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
              
              <span className="truncate uppercase">{node.nom}</span>
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div>
              {renderNodes(node.sousLocalisations!, level + 1)}
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
      </div>
      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
        {renderNodes(geoTree)}
      </div>
    </div>
  );
};
