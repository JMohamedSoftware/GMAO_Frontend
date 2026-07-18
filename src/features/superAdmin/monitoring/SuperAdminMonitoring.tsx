import React from 'react';
import { Activity, Globe } from 'lucide-react';

export const SuperAdminMonitoring: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Activity className="w-4.5 h-4.5 text-primary" /> Monitoring Serveur & Infrastructure
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: '45%' }}></div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPU Usage</span>
          <span className="text-2xl font-black text-slate-850 dark:text-white">45%</span>
          <span className="text-[9px] text-emerald-500 font-bold">Normal</span>
        </div>
        {/* RAM */}
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-1 bg-amber-500" style={{ width: '62%' }}></div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RAM Allocation</span>
          <span className="text-2xl font-black text-slate-850 dark:text-white">62%</span>
          <span className="text-[9px] text-slate-500 font-bold">19.8 GB / 32 GB</span>
        </div>
        {/* Database */}
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: '25%' }}></div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database IOPS</span>
          <span className="text-2xl font-black text-slate-850 dark:text-white">840</span>
          <span className="text-[9px] text-emerald-500 font-bold">Performant</span>
        </div>
        {/* Storage */}
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-1 bg-rose-500" style={{ width: '78%' }}></div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Storage SSD</span>
          <span className="text-2xl font-black text-slate-850 dark:text-white">78%</span>
          <span className="text-[9px] text-rose-500 font-bold">Scale up bientôt requis</span>
        </div>
      </div>

      {/* Fake Network Graph */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm">
        <h4 className="text-[10px] font-bold text-slate-450 uppercase mb-3 flex items-center gap-2"><Globe className="w-3.5 h-3.5"/> Network Traffic (Simulated)</h4>
        <div className="w-full h-32 flex items-end gap-1 px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = Math.floor(Math.random() * 80) + 10;
            return (
              <div key={i} className={`w-full rounded-t-sm transition-all duration-500 ${height > 70 ? 'bg-amber-400' : 'bg-primary/60'}`} style={{ height: `${height}%` }}></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
