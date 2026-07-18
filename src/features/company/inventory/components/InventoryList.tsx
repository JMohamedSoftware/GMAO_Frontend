import React from 'react';
import { Search, ChevronDown, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { SparePart, Supplier } from '@/shared/types/gmao';

interface InventoryListProps {
  search: string;
  setSearch: (s: string) => void;
  filterSupplier: string;
  setFilterSupplier: (s: string) => void;
  filterAlertOnly: boolean;
  setFilterAlertOnly: (v: boolean) => void;
  suppliers: Supplier[];
  categories: string[];
  groupedParts: Record<string, SparePart[]>;
  expandedCategories: string[];
  toggleCategory: (cat: string) => void;
  selectedPartRef: string | null;
  setSelectedPartRef: (ref: string) => void;
  CATEGORY_ICONS: Record<string, string>;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  search, setSearch, filterSupplier, setFilterSupplier, filterAlertOnly, setFilterAlertOnly,
  suppliers, categories, groupedParts, expandedCategories, toggleCategory,
  selectedPartRef, setSelectedPartRef, CATEGORY_ICONS
}) => {
  return (
    <div className="w-[22rem] shrink-0 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            className="w-full pl-8 pr-3 py-1.5 rounded bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs outline-none placeholder-slate-400 font-semibold"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterSupplier} 
            onChange={(e) => setFilterSupplier(e.target.value)} 
            className="flex-1 text-xs p-1.5 rounded bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 outline-none text-slate-600 font-semibold"
          >
            <option value="">Tous les fournisseurs</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={filterAlertOnly}
            onChange={(e) => setFilterAlertOnly(e.target.checked)}
            className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
          />
          <span className={filterAlertOnly ? 'text-rose-500' : ''}>Rupture de stock uniquement</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-3">
        {categories.map(cat => {
          const catParts = groupedParts[cat] || [];
          if (catParts.length === 0) return null; // hide empty categories
          const isExpanded = expandedCategories.includes(cat);
          
          return (
            <div key={cat} className="flex flex-col gap-1">
              {/* Category Header */}
              <button 
                onClick={() => toggleCategory(cat)}
                className="flex items-center justify-between w-full text-left px-2 pt-2 pb-1 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <span className="text-base">{CATEGORY_ICONS[cat] || '📦'}</span>
                  {cat} ({catParts.length})
                </h4>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Parts in Category */}
              {isExpanded && (
                <div className="flex flex-col gap-1 mt-1">
                  {catParts.map(part => {
                    const isLow = part.stockCurrent <= part.stockMin;
                    const isActive = selectedPartRef === part.ref;
                    return (
                      <button
                        key={part.ref}
                        onClick={() => setSelectedPartRef(part.ref)}
                        className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-all ml-1 cursor-pointer
                          ${isActive
                            ? 'bg-primary/10 border border-primary/30 shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                      >
                        {/* Thumbnail */}
                        {part.photo ? (
                          <img src={part.photo} alt={part.name} className="w-8 h-8 rounded-md object-cover border border-slate-200/50 dark:border-slate-700 shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Package className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-bold truncate ${isActive ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>{part.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono truncate">{part.ref}</p>
                          {isLow && (
                            <span className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Rupture
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.values(groupedParts).every(arr => arr.length === 0) && (
          <div className="flex flex-col items-center justify-center text-center p-6 opacity-40">
            <Package className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-500">Aucune pièce trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};
