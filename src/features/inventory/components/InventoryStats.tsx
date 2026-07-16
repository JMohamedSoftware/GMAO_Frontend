import React from 'react';
import { Boxes, AlertTriangle, TrendingUp } from 'lucide-react';
import { SparePart } from '../../../types/gmao';

interface InventoryStatsProps {
  parts: SparePart[];
  lowStockParts: SparePart[];
  totalValuation: number;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ parts, lowStockParts, totalValuation }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Références</span>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{parts.length}</h3>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl"><Boxes className="w-5 h-5" /></div>
      </div>
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">Rupture de Stock</span>
          <h3 className="text-2xl font-extrabold text-rose-500 mt-0.5">{lowStockParts.length}</h3>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
      </div>
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valeur Stock</span>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{Math.round(totalValuation).toLocaleString()} €</h3>
        </div>
        <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
      </div>
    </div>
  );
};
