import React from 'react';
import { Package, AlertTriangle, PackageX, ShoppingCart, Box } from 'lucide-react';
import { SparePart } from '@/shared/types/gmao';

interface InventoryStatsProps {
  parts: SparePart[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ parts }) => {
  const totalParts = parts.length;
  const criticalStockParts = parts.filter(p => p.stockCurrent > 0 && p.stockCurrent <= p.stockMin);
  const outOfStockParts = parts.filter(p => p.stockCurrent <= 0);
  const toOrderParts = parts.filter(p => p.stockCurrent <= p.stockMin);
  const totalValuation = parts.reduce((acc, p) => acc + (p.stockCurrent * p.unitPrice), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Total Pièces */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Total Pièces</span>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{totalParts.toLocaleString()}</h3>
          <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
             +12% ce mois
          </p>
        </div>
      </div>

      {/* Stock Critique */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start gap-4">
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Stock Critique</span>
          <h3 className="text-2xl font-extrabold text-rose-500 leading-none">{criticalStockParts.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">
             Pièces sous le minimum
          </p>
        </div>
      </div>

      {/* Ruptures */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start gap-4">
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg">
          <PackageX className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Ruptures</span>
          <h3 className="text-2xl font-extrabold text-red-500 leading-none">{outOfStockParts.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">
             Pièces en rupture
          </p>
        </div>
      </div>

      {/* À Commander */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start gap-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-lg">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">À Commander</span>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{toOrderParts.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1">
             Pièces à réapprovisionner
          </p>
        </div>
      </div>

      {/* Valeur du Stock */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start gap-4">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-lg">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Valeur du Stock</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">{Math.round(totalValuation).toLocaleString()} €</h3>
          <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
             +3% ce mois
          </p>
        </div>
      </div>
    </div>
  );
};
