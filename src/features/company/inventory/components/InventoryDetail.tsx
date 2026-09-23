import React from 'react';
import { Package, X, CheckCircle2, AlertCircle, TrendingDown, TrendingUp, Edit2, MoreHorizontal, FileText, ArrowUpFromLine, ArrowDownToLine, FileSpreadsheet } from 'lucide-react';
import { SparePart, Supplier } from '@/shared/types/gmao';

interface InventoryDetailProps {
  activePart: SparePart | undefined;
  suppliers: Supplier[];
  CATEGORY_ICONS: Record<string, React.ComponentType<any>>;
  can: (permission: any) => boolean;
  onNavigate: (screen: string) => void;
  handleOpenMovement: (partRef: string, type: 'in' | 'out') => void;
  activeTab: 'historique' | 'ots' | 'docs' | string;
  setActiveTab: (tab: any) => void;
  movementLogs: any[];
  onClose: () => void;
}

export const InventoryDetail: React.FC<InventoryDetailProps> = ({
  activePart, suppliers, CATEGORY_ICONS, can, onNavigate, handleOpenMovement,
  activeTab, setActiveTab, movementLogs, onClose
}) => {
  if (!activePart) {
    return null; // Don't render anything if no part is selected (handled by translate-x-full in parent)
  }

  const sup = suppliers.find(s => s.id === activePart.supplierId);
  const Icon = CATEGORY_ICONS[activePart.category] || Package;
  
  const isCritical = activePart.stockCurrent <= 0;
  const isLow = activePart.stockCurrent > 0 && activePart.stockCurrent <= activePart.stockMin;
  const isNormal = activePart.stockCurrent > activePart.stockMin;
  
  const percent = Math.min(100, Math.max(0, Math.round((activePart.stockCurrent / activePart.stockMax) * 100)));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex gap-4 items-start pr-8">
          {activePart.photo ? (
            <img src={activePart.photo} alt={activePart.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Icon className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-2">{activePart.name}</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{activePart.ref}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                <Icon className="w-3 h-3" /> {activePart.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="absolute right-4 bottom-5">
           {isNormal && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full">Stock OK</span>}
           {isLow && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">Stock bas</span>}
           {isCritical && <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full">Rupture</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('informations')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'informations' || activeTab === 'historique' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Informations
        </button>
        <button 
          onClick={() => setActiveTab('mouvements')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'mouvements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Mouvements
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'docs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Documents
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* Detail List & Stock Visualizer */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            {/* Infos */}
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Référence</span>
                <span className="font-bold text-slate-700">{activePart.ref}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Désignation</span>
                <span className="font-bold text-slate-700 truncate max-w-[150px]">{activePart.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Famille</span>
                <span className="font-bold text-slate-700">{activePart.category}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Fournisseur</span>
                <span className="font-bold text-slate-700">{sup?.name || activePart.supplierId}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Prix unitaire</span>
                <span className="font-bold text-slate-700">{activePart.unitPrice.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Valeur stock</span>
                <span className="font-bold text-slate-700">{(activePart.stockCurrent * activePart.unitPrice).toFixed(2)} €</span>
              </div>
            </div>

            {/* Stock Big Display */}
            <div className="w-[120px] flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1 text-slate-400">
                  <Package className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 block">Stock actuel</span>
                <span className="text-lg font-black text-slate-800">{activePart.stockCurrent} pièces</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center flex items-center justify-between">
                <div className="p-1 bg-white rounded shadow-sm text-slate-400"><TrendingDown className="w-3.5 h-3.5" /></div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-500 block">Stock min</span>
                  <span className="text-xs font-bold text-slate-800">{activePart.stockMin} p.</span>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center flex items-center justify-between">
                <div className="p-1 bg-white rounded shadow-sm text-slate-400"><TrendingUp className="w-3.5 h-3.5" /></div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-500 block">Stock max</span>
                  <span className="text-xs font-bold text-slate-800">{activePart.stockMax} p.</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Niveau de stock</span>
              <span className="text-slate-500">{percent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-blue-600'}`} 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
          
          <hr className="border-slate-100" />
          
          {/* Recent movements */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-800">Derniers mouvements</h3>
              <button className="text-[10px] font-bold text-blue-600 hover:underline">Voir tout</button>
            </div>
            <div className="flex flex-col gap-2">
              {movementLogs.filter(log => log.partRef === activePart.ref).slice(0, 4).map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`p-1.5 rounded text-white ${log.type === 'in' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                      {log.type === 'in' ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                    </div>
                    <span className="font-medium text-slate-500">{new Date(log.date).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">{log.type === 'in' ? 'Entrée stock' : 'Sortie stock'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black ${log.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.type === 'in' ? '+' : '-'}{log.qty}
                    </span>

                  </div>
                </div>
              ))}
              {movementLogs.filter(log => log.partRef === activePart.ref).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded border border-slate-100 italic">
                  Aucun mouvement récent pour cette pièce.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50">
        <button 
          onClick={() => handleOpenMovement(activePart.ref, 'in')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors"
        >
          <ArrowDownToLine className="w-4 h-4" /> Entrée stock
        </button>
        <button 
          onClick={() => handleOpenMovement(activePart.ref, 'out')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-colors"
        >
          <ArrowUpFromLine className="w-4 h-4" /> Sortie stock
        </button>
        <button 
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" /> Modifier
        </button>
        <button 
          className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
