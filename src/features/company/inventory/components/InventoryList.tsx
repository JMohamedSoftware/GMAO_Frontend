import React, { useState } from 'react';
import { Search, Filter, Eye, Edit2, MoreVertical, AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { SparePart, Supplier } from '@/shared/types/gmao';

interface InventoryListProps {
  parts: SparePart[];
  search: string;
  setSearch: (s: string) => void;
  filterSupplier: string;
  setFilterSupplier: (s: string) => void;
  filterAlertOnly: boolean;
  setFilterAlertOnly: (v: boolean) => void;
  suppliers: Supplier[];
  categories: string[];
  selectedPartRef: string | null;
  setSelectedPartRef: (ref: string | null) => void;
  CATEGORY_ICONS: Record<string, React.ComponentType<any>>;
  can: (permission: string) => boolean;
  handleEditPart: (ref: string) => void;
  handleOpenOrder: (ref: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  parts, search, setSearch, filterSupplier, setFilterSupplier, filterAlertOnly, setFilterAlertOnly,
  suppliers, categories, selectedPartRef, setSelectedPartRef, CATEGORY_ICONS, can,
  handleEditPart, handleOpenOrder
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'empty' | 'order' | 'movements'>('all');
  
  // Calculate counts for tabs
  const criticalCount = parts.filter(p => p.stockCurrent > 0 && p.stockCurrent <= p.stockMin).length;
  const emptyCount = parts.filter(p => p.stockCurrent <= 0).length;
  const orderCount = parts.filter(p => p.stockCurrent <= p.stockMin).length;

  // Filter parts based on active tab and search
  const filteredParts = parts.filter(p => {
    // Search filter
    if (search && !p.ref.toLowerCase().includes(search.toLowerCase()) && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    // Supplier filter
    if (filterSupplier && p.supplierId !== filterSupplier) return false;
    
    // Tab filter
    if (activeTab === 'critical') return p.stockCurrent > 0 && p.stockCurrent <= p.stockMin;
    if (activeTab === 'empty') return p.stockCurrent <= 0;
    if (activeTab === 'order') return p.stockCurrent <= p.stockMin;
    
    return true;
  });

  const getStatusBadge = (part: SparePart) => {
    if (part.stockCurrent <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critique
        </span>
      );
    }
    if (part.stockCurrent <= part.stockMin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Stock bas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Normal
      </span>
    );
  };

  const getStockColor = (part: SparePart) => {
    if (part.stockCurrent <= 0) return 'text-red-600 font-bold';
    if (part.stockCurrent <= part.stockMin) return 'text-amber-500 font-bold';
    return 'text-emerald-600 font-bold';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Toutes les pièces ({parts.length})
        </button>
        <button 
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'critical' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Stock critique ({criticalCount})
        </button>
        <button 
          onClick={() => setActiveTab('empty')}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'empty' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <AlertCircle className="w-3.5 h-3.5" /> Ruptures ({emptyCount})
        </button>
        <button 
          onClick={() => setActiveTab('order')}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'order' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          À commander ({orderCount})
        </button>
        <button 
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'movements' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Mouvements récents
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-blue-500 font-medium"
            placeholder="Rechercher une pièce..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <select className="text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-600 min-w-[150px]">
          <option value="">Toutes les familles</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          value={filterSupplier} 
          onChange={(e) => setFilterSupplier(e.target.value)}
          className="text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-600 min-w-[150px]"
        >
          <option value="">Tous les fournisseurs</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>


        
        <select className="text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-600 min-w-[150px]">
          <option value="">Tous les statuts</option>
        </select>

        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 font-bold text-xs ml-auto">
          <Filter className="w-3.5 h-3.5" /> Filtres
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
              <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-slate-300" /></th>
              <th className="p-3">Référence</th>
              <th className="p-3">Désignation</th>
              <th className="p-3">Famille</th>
              <th className="p-3 text-right">Stock actuel</th>
              <th className="p-3 text-right">Stock min</th>
              <th className="p-3 text-right">Stock max</th>

              <th className="p-3">Fournisseur</th>
              <th className="p-3 text-right">Prix unitaire</th>
              <th className="p-3 text-right">Valeur stock</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredParts.map(part => {
              const Icon = CATEGORY_ICONS[part.category || ''] || Package;
              const isSelected = selectedPartRef === part.ref;
              const sup = suppliers.find(s => s.id === part.supplierId);
              
              return (
                <tr 
                  key={part.ref} 
                  onClick={() => setSelectedPartRef(isSelected ? null : part.ref)}
                  className={`group cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="p-3 text-xs font-semibold text-slate-600">{part.ref}</td>
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{part.name}</span>
                  </td>
                  <td className="p-3 text-xs text-slate-500">{part.category}</td>
                  <td className={`p-3 text-xs text-right ${getStockColor(part)}`}>{part.stockCurrent}</td>
                  <td className="p-3 text-xs text-slate-500 text-right">{part.stockMin}</td>
                  <td className="p-3 text-xs text-slate-500 text-right">{part.stockMax}</td>

                  <td className="p-3 text-xs text-slate-500">{sup?.name || part.supplierId}</td>
                  <td className="p-3 text-xs text-slate-500 text-right">{part.unitPrice.toFixed(2)} €</td>
                  <td className="p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">{(part.stockCurrent * part.unitPrice).toFixed(2)} €</td>
                  <td className="p-3 text-center">
                    {getStatusBadge(part)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedPartRef(part.ref); }}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditPart(part.ref); }}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenOrder(part.ref); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Commander"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredParts.length === 0 && (
              <tr>
                <td colSpan={13} className="p-12 text-center text-slate-500">
                  <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-sm">Aucune pièce trouvée</p>
                  <p className="text-xs">Modifiez vos filtres de recherche.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
