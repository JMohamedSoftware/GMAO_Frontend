import React from 'react';
import { Search, Plus, MapPin, FolderOpen, Folder, ChevronRight, ChevronDown, Factory } from 'lucide-react';
import { Localisation, Equipment } from '@/shared/types/gmao';
import { useGmao } from '@/shared/hooks/useGmao';

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
  const [search, setSearch] = React.useState('');
  const { equipments } = useGmao();

  // Helper to count equipments recursively
  const getEquipmentCount = (locId: number): number => {
    let count = 0;
    const findNodeAndChildrenIds = (nodes: Localisation[], targetId: number): number[] => {
      let ids: number[] = [];
      const traverse = (n: Localisation, collect: boolean) => {
        if (n.id === targetId || collect) {
          ids.push(n.id);
          if (n.sousLocalisations) {
            n.sousLocalisations.forEach(child => traverse(child, true));
          }
        } else {
          if (n.sousLocalisations) {
            n.sousLocalisations.forEach(child => traverse(child, false));
          }
        }
      };
      nodes.forEach(n => traverse(n, false));
      return ids;
    };
    
    const validIds = findNodeAndChildrenIds(geoTree, locId);
    return equipments.filter(e => e.localisationId && validIds.includes(Number(e.localisationId))).length;
  };

  const renderNodes = (nodes: Localisation[], level = 0) => {
    return nodes.map(node => {
      // Filter by search
      if (search && !node.nom.toLowerCase().includes(search.toLowerCase())) {
        // Only hide if children also don't match (simple implementation: just match name for now)
      }

      const isExpanded = geoExpanded.has(node.id);
      const isSelected = selectedGeoNode?.id === node.id;
      const hasChildren = node.sousLocalisations && node.sousLocalisations.length > 0;
      const eqCount = getEquipmentCount(node.id);
      const isRoot = level === 0;
      
      return (
        <div key={node.id}>
          <div 
            className={`group flex items-center justify-between py-2 pr-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${isSelected ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => onSelectNode(node)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div onClick={(e) => { e.stopPropagation(); onToggleNode(node.id); }} className="w-4 h-4 flex items-center justify-center shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
                {hasChildren ? (
                  isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                ) : <div className="w-3.5 h-3.5" />}
              </div>
              
              {isRoot ? (
                <Factory className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-500' : 'text-blue-500'}`} />
              ) : (
                isExpanded ? <FolderOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-500' : 'text-amber-400'}`} /> : <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-500' : 'text-amber-400'}`} />
              )}
              
              <span className="truncate">{node.nom} {eqCount > 0 && <span className="text-slate-400 dark:text-slate-500 font-medium">({eqCount})</span>}</span>
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
    <div className="w-[280px] flex flex-col bg-slate-50/30 dark:bg-slate-900/10 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden shrink-0">
      <div className="p-3 flex justify-between items-center">
        <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Localisations
        </h3>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <Search className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-0.5">
        {renderNodes(geoTree)}
      </div>
    </div>
  );
};
