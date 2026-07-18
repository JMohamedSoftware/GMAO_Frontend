import React from 'react';
import { Package, BarChart2, MapPin, User, ArrowDown, ArrowUp, ClipboardList, ShoppingCart, Activity, FileText, QrCode } from 'lucide-react';
import { SparePart, Supplier } from '@/shared/types/gmao';

interface InventoryDetailProps {
  activePart: SparePart | undefined;
  suppliers: Supplier[];
  CATEGORY_ICONS: Record<string, string>;
  canDo: (module: any, action: string) => boolean;
  onNavigate: (screen: string) => void;
  handleOpenMovement: (partRef: string, type: 'in' | 'out', e: React.MouseEvent) => void;
  activeTab: 'historique' | 'ots' | 'docs';
  setActiveTab: (tab: 'historique' | 'ots' | 'docs') => void;
  movementLogs: any[];
}

export const InventoryDetail: React.FC<InventoryDetailProps> = ({
  activePart, suppliers, CATEGORY_ICONS, canDo, onNavigate, handleOpenMovement,
  activeTab, setActiveTab, movementLogs
}) => {
  if (!activePart) {
    return (
      <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden items-center justify-center text-center p-10 opacity-30">
        <Package className="w-16 h-16 text-slate-400 mb-3" />
        <p className="text-sm font-bold text-slate-500">Sélectionnez une pièce pour voir sa fiche</p>
      </div>
    );
  }

  const isLow = activePart.stockCurrent <= activePart.stockMin;
  const percent = Math.min(100, Math.round((activePart.stockCurrent / activePart.stockMax) * 100));
  const sup = suppliers.find(s => s.id === activePart.supplierId);

  return (
    <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Part header with photo */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex gap-5 items-start bg-slate-50/30 dark:bg-slate-900/20">
          <div className="shrink-0">
            {activePart.photo ? (
              <img src={activePart.photo} alt={activePart.name}
                className="w-24 h-24 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-[10px] font-bold text-slate-400 font-mono">{activePart.ref}</p>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">{activePart.name}</h2>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {CATEGORY_ICONS[activePart.category] || '📦'} {activePart.category}
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${isLow ? 'bg-rose-500/10 text-rose-600 border border-rose-200' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'}`}>
                {isLow ? '⚠️ Rupture de stock' : '✅ Stock OK'}
              </span>
            </div>

            {/* Stock bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                <span>Stock : <strong className="text-slate-800 dark:text-white text-base">{activePart.stockCurrent}</strong> / {activePart.stockMax}</span>
                <span>Min : {activePart.stockMin} &nbsp; Max : {activePart.stockMax}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-3.5 rounded-xl border border-white/40 dark:border-slate-800/40">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BarChart2 className="w-3 h-3" /> Prix Unitaire
              </p>
              <p className="text-xl font-extrabold text-primary">{activePart.unitPrice} €</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Valeur totale : {(activePart.stockCurrent * activePart.unitPrice).toFixed(2)} €</p>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-white/40 dark:border-slate-800/40">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Localisation Rayon
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{activePart.location}</p>
            </div>
          </div>

          {sup && (
            <div className="glass-panel p-3.5 rounded-xl border border-white/40 dark:border-slate-800/40">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <User className="w-3 h-3" /> Fournisseur
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{sup.name}</p>
              <p className="text-[10px] text-slate-400">{sup.email} · {sup.phone}</p>
            </div>
          )}

          {/* Stock actions */}
          <div className="flex gap-2">
            {canDo('inventory', 'entree') && (
              <button
                onClick={e => handleOpenMovement(activePart.ref, 'in', e)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-xs hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" /> Entrée
              </button>
            )}
            {canDo('inventory', 'sortie') && (
              <button
                onClick={e => handleOpenMovement(activePart.ref, 'out', e)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-rose-500/10 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" /> Sortie
              </button>
            )}
            {canDo('inventory', 'inventaire') && (
              <button
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-amber-500/10 text-amber-600 border border-amber-200 rounded-xl font-bold text-xs hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all cursor-pointer"
              >
                <ClipboardList className="w-5 h-5" /> Inventaire
              </button>
            )}
          </div>

          {/* Commander button */}
          {canDo('suppliers', 'voir') && (
            <button
              onClick={() => onNavigate('suppliers')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary border border-primary/25 rounded-xl font-bold text-xs hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Commander (Voir Fournisseur)
            </button>
          )}

          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveTab('historique')} className={`pb-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer ${activeTab === 'historique' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>Historique</button>
            <button onClick={() => setActiveTab('ots')} className={`pb-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer ${activeTab === 'ots' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>OT liés</button>
            <button onClick={() => setActiveTab('docs')} className={`pb-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer ${activeTab === 'docs' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>Documents</button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[150px]">
            {activeTab === 'historique' && (
              <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-4 mt-2">
                {movementLogs.filter(l => l.partRef === activePart.ref).length === 0 ? (
                  <p className="text-[10px] text-slate-400">Aucun mouvement enregistré</p>
                ) : movementLogs.filter(l => l.partRef === activePart.ref).map(log => (
                  <div key={log.id} className="relative">
                    <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${log.type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">{log.id} · {new Date(log.date).toLocaleDateString()}</span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${log.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.type === 'in' ? '⬇' : '⬆'} {log.category || (log.type === 'in' ? 'Achat' : 'Sortie')}
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">{log.reason}</p>
                      </div>
                      <span className={`font-black text-sm ${log.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {log.type === 'in' ? '+' : '-'}{log.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ots' && (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Activity className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500">Aucun OT lié à cette pièce</p>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500">Aucun document technique</p>
              </div>
            )}
          </div>

          {/* QR scanner placeholder */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center gap-3">
            <QrCode className="w-10 h-10 text-slate-300 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Scanner Code-barres Pièce</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Compatible douchettes industrielles & terminaux</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
