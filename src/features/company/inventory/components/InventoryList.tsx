import React, { useState, useMemo } from 'react';
import { 
  Search, Eye, Edit2, MoreVertical, AlertCircle, AlertTriangle, 
  CheckCircle2, ChevronRight, ChevronLeft, Package, ShoppingCart, 
  Filter, CheckSquare, Square, Download
} from 'lucide-react';
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
  movementLogs: any[];
}

export const InventoryList: React.FC<InventoryListProps> = ({
  parts, search, setSearch, filterSupplier, setFilterSupplier, filterAlertOnly, setFilterAlertOnly,
  suppliers, categories, selectedPartRef, setSelectedPartRef, CATEGORY_ICONS, can,
  handleEditPart, handleOpenOrder, movementLogs
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'empty' | 'order' | 'movements'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  
  // Calculate counts for tabs
  const criticalCount = parts.filter(p => p.stockCurrent > 0 && p.stockCurrent <= p.stockMin).length;
  const emptyCount = parts.filter(p => p.stockCurrent <= 0).length;
  const orderCount = parts.filter(p => p.stockCurrent <= p.stockMin).length;

  // Filter parts based on active tab, search, and all filter toggles
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      // Search filter
      if (search && !p.ref.toLowerCase().includes(search.toLowerCase()) && !p.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Supplier filter
      if (filterSupplier && p.supplierId !== filterSupplier) return false;
      // Category filter
      if (filterCategory && p.category !== filterCategory) return false;
      
      // Filter alert only toggle
      if (filterAlertOnly && p.stockCurrent > p.stockMin) return false;

      // Status dropdown filter
      if (filterStatus === 'normal' && p.stockCurrent <= p.stockMin) return false;
      if (filterStatus === 'low' && !(p.stockCurrent > 0 && p.stockCurrent <= p.stockMin)) return false;
      if (filterStatus === 'empty' && p.stockCurrent > 0) return false;
      
      // Tab filter
      if (activeTab === 'critical') return p.stockCurrent > 0 && p.stockCurrent <= p.stockMin;
      if (activeTab === 'empty') return p.stockCurrent <= 0;
      if (activeTab === 'order') return p.stockCurrent <= p.stockMin;
      
      return true;
    });
  }, [parts, search, filterSupplier, filterCategory, filterAlertOnly, filterStatus, activeTab]);

  // Paginated items
  const totalItems = activeTab === 'movements' ? movementLogs.length : filteredParts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const displayedParts = filteredParts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Checkbox selection helpers
  const isAllCurrentPageSelected = displayedParts.length > 0 && displayedParts.every(p => selectedRefs.has(p.ref));

  const toggleSelectAll = () => {
    const next = new Set(selectedRefs);
    if (isAllCurrentPageSelected) {
      displayedParts.forEach(p => next.delete(p.ref));
    } else {
      displayedParts.forEach(p => next.add(p.ref));
    }
    setSelectedRefs(next);
  };

  const toggleSelectRow = (ref: string) => {
    const next = new Set(selectedRefs);
    if (next.has(ref)) {
      next.delete(ref);
    } else {
      next.add(ref);
    }
    setSelectedRefs(next);
  };

  const getStatusBadge = (part: SparePart) => {
    if (part.stockCurrent <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Rupture
        </span>
      );
    }
    if (part.stockCurrent <= part.stockMin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Stock bas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Normal
      </span>
    );
  };

  const getStockColor = (part: SparePart) => {
    if (part.stockCurrent <= 0) return 'text-red-600 dark:text-red-400 font-bold';
    if (part.stockCurrent <= part.stockMin) return 'text-amber-500 dark:text-amber-400 font-bold';
    return 'text-emerald-600 dark:text-emerald-400 font-bold';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50">
        <button 
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === 'all' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Toutes les pièces ({parts.length})
        </button>
        <button 
          onClick={() => { setActiveTab('critical'); setCurrentPage(1); }}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'critical' ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Stock critique ({criticalCount})
        </button>
        <button 
          onClick={() => { setActiveTab('empty'); setCurrentPage(1); }}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'empty' ? 'border-red-500 text-red-600 dark:text-red-400 dark:border-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <AlertCircle className="w-3.5 h-3.5" /> Ruptures ({emptyCount})
        </button>
        <button 
          onClick={() => { setActiveTab('order'); setCurrentPage(1); }}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'order' ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> À commander ({orderCount})
        </button>
        <button 
          onClick={() => { setActiveTab('movements'); setCurrentPage(1); }}
          className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === 'movements' ? 'border-slate-800 text-slate-800 dark:border-slate-100 dark:text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Mouvements récents ({movementLogs.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 dark:text-slate-100"
            placeholder="Rechercher par référence, désignation..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <select 
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          className="text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] cursor-pointer"
        >
          <option value="">Toutes les familles ({categories.length})</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          value={filterSupplier} 
          onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}
          className="text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] cursor-pointer"
        >
          <option value="">Tous les fournisseurs ({suppliers.length})</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        <select 
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold text-slate-700 dark:text-slate-200 min-w-[130px] cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          <option value="normal">Normal (Stock OK)</option>
          <option value="low">Stock bas (Sous min)</option>
          <option value="empty">Rupture totale</option>
        </select>

        {/* Quick Alert Filter Toggle */}
        <button
          onClick={() => {
            setFilterAlertOnly(!filterAlertOnly);
            setCurrentPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterAlertOnly 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Alertes Seules</span>
        </button>

        {(search || filterCategory || filterSupplier || filterStatus || filterAlertOnly) && (
          <button 
            onClick={() => {
              setSearch('');
              setFilterCategory('');
              setFilterSupplier('');
              setFilterStatus('');
              setFilterAlertOnly(false);
              setCurrentPage(1);
            }}
            className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-auto cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Selected Batch Actions Bar */}
      {selectedRefs.size > 0 && activeTab !== 'movements' && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-700 dark:text-blue-300">
              {selectedRefs.size} pièce(s) sélectionnée(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const first = Array.from(selectedRefs)[0];
                if (first) handleOpenOrder(first);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Commander la sélection</span>
            </button>
            <button
              onClick={() => setSelectedRefs(new Set())}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold px-2 py-1 rounded"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'movements' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/50">
                <th className="p-3">ID Mouvement</th>
                <th className="p-3">Date</th>
                <th className="p-3">Référence Pièce</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Quantité</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Raison / OT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {movementLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{log.id}</td>
                  <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{new Date(log.date).toLocaleString()}</td>
                  <td className="p-3 text-xs font-bold text-blue-600 dark:text-blue-400">{log.partRef}</td>
                  <td className="p-3 text-xs font-bold">
                    {log.type === 'in' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Entrée</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Sortie</span>
                    )}
                  </td>
                  <td className={`p-3 text-xs font-black text-right ${log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {log.type === 'in' ? '+' : '-'}{log.qty}
                  </td>
                  <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{log.category}</td>
                  <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{log.reason || 'N/A'}</td>
                </tr>
              ))}
              {movementLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-sm">Aucun mouvement trouvé dans l'historique</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/50">
                <th className="px-3 py-3 w-10 text-center">
                  <button 
                    type="button" 
                    onClick={toggleSelectAll} 
                    className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {isAllCurrentPageSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-3 py-3 whitespace-nowrap">Référence</th>
                <th className="px-3 py-3">Désignation</th>
                <th className="px-3 py-3">Famille</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Stock actuel</th>
                <th className="px-3 py-3 text-center">Statut</th>
                <th className="px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedParts.map(part => {
                const Icon = CATEGORY_ICONS[part.category || ''] || Package;
                const isSelected = selectedPartRef === part.ref;
                const isChecked = selectedRefs.has(part.ref);
                const isUnderMin = part.stockCurrent <= part.stockMin;
                
                return (
                  <tr 
                    key={part.ref} 
                    onClick={() => setSelectedPartRef(isSelected ? null : part.ref)}
                    className={`group cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/70 dark:bg-blue-900/30' 
                        : isChecked 
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        onClick={() => toggleSelectRow(part.ref)}
                        className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {part.ref}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {part.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Empl : {part.location || 'Magasin Central'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">
                      {part.category}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`text-xs ${getStockColor(part)}`}>{part.stockCurrent}</span>
                      <span className="text-[10px] text-slate-400 ml-1">/ min {part.stockMin}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {getStatusBadge(part)}
                    </td>
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isUnderMin && (
                          <button 
                            onClick={() => handleOpenOrder(part.ref)}
                            className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Commander cette pièce"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedPartRef(part.ref)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditPart(part.ref)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Modifier la pièce"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredParts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="font-bold text-sm">Aucune pièce trouvée</p>
                    <p className="text-xs mt-1">Ajustez vos critères de recherche ou réinitialisez les filtres.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span>Afficher</span>
          <select 
            value={itemsPerPage} 
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>par page</span>
          <span className="text-slate-400 ml-2">
            ({totalItems} au total)
          </span>
        </div>

        <div className="flex gap-1 items-center">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            // Windowed display: show page 1, last page, and +/- 2 around currentPage
            if (
              pageNum === 1 || 
              pageNum === totalPages || 
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={pageNum} className="px-1 text-slate-400">...</span>;
            }
            return null;
          })}

          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
