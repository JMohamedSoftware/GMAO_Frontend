import React from 'react';
import { Search, Filter, Settings2, Package, CheckCircle, AlertTriangle, AlertCircle, Wrench } from 'lucide-react';
import { Equipment as EquipmentType, Localisation } from '@/shared/types/gmao';
import { useGmao } from '@/shared/hooks/useGmao';

interface EquipmentListProps {
  equipments: EquipmentType[];
  selectedEqId: string | null;
  selectedGeoNode: Localisation | null;
  search: string;
  onSearchChange: (search: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  onSelectEquipment: (eq: EquipmentType) => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipments,
  selectedEqId,
  selectedGeoNode,
  search,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  onSelectEquipment,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  
  const { equipments: allEquipments } = useGmao();
  const uniqueCategories = React.useMemo(() => {
    return Array.from(new Set(allEquipments.map(e => e.category).filter(Boolean)));
  }, [allEquipments]);

  const totalPages = Math.max(1, Math.ceil(equipments.length / pageSize));
  
  const paginatedEquipments = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return equipments.slice(start, start + pageSize);
  }, [equipments, currentPage, pageSize]);

  return (
    <div className="w-[380px] flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-xl border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          Liste des Équipements
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
          {equipments.length}
        </span>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="p-3 flex flex-col gap-3 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            value={filterCategory}
            onChange={e => onFilterCategoryChange(e.target.value)}
          >
            <option value="Toutes">Toutes familles</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            value={filterStatus}
            onChange={e => onFilterStatusChange(e.target.value)}
          >
            <option value="Tous">Tous statuts</option>
            <option value="En service">En service</option>
            <option value="Hors service">Hors service</option>
            <option value="En maintenance">En maintenance</option>
          </select>
          <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-primary bg-primary/5 hover:bg-primary/10">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
        {paginatedEquipments.map(eq => {
          const isSelected = selectedEqId === eq.id;
          return (
            <div 
              key={eq.id}
              onClick={() => onSelectEquipment(eq)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                isSelected 
                  ? 'bg-blue-50/50 dark:bg-blue-900/20 border-primary shadow-sm' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-sm'
              }`}
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                {eq.photos && eq.photos.length > 0 ? (
                  <img src={eq.photos[0]} alt={eq.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-primary truncate">{eq.id}</span>
                  {/* Status Badge */}
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                    eq.status === 'En service' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    eq.status === 'En maintenance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    eq.status === 'Hors service' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {eq.status === 'En service' && <CheckCircle className="w-3 h-3" />}
                    {eq.status === 'En maintenance' && <Wrench className="w-3 h-3" />}
                    {eq.status === 'Hors service' && <AlertTriangle className="w-3 h-3" />}
                    {eq.status}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
                  {eq.name}
                </h4>
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {eq.category} • {eq.brand || eq.model || '-'}
                </p>
              </div>
            </div>
          );
        })}
        {equipments.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400">
            <Package className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-bold">Aucun équipement trouvé</p>
          </div>
        )}
      </div>
      
      {/* Footer Pagination */}
      <div className="p-2 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <span>Afficher</span>
          <select 
            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1 outline-none text-slate-700 dark:text-slate-300"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>par page</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-slate-500">
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, Math.min(currentPage - 2, totalPages - 3)),
            Math.max(3, Math.min(currentPage + 1, totalPages))
          ).map(p => (
            <button 
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-6 h-6 rounded flex items-center justify-center ${
                currentPage === p 
                  ? 'bg-white dark:bg-slate-800 border border-primary text-primary shadow-sm' 
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
          {totalPages > 3 && currentPage < totalPages - 1 && <span>...</span>}
        </div>
      </div>
    </div>
  );
};
