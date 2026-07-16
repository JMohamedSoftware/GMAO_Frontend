import React from 'react';
import { ShieldCheck, HardDrive, Mail } from 'lucide-react';

export const SuperAdminLogs: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
          <ShieldCheck className="w-4.5 h-4.5 text-primary" /> System Audit Logs
        </h3>
        <div className="flex flex-col gap-1">
          {[
            { time: '14:22', msg: 'Admin password reset for Conserves du Midi', type: 'warn' },
            { time: '11:05', msg: 'Subscription updated (Tomates du Nord -> Premium)', type: 'info' },
            { time: '09:14', msg: 'Tenant AgroTech Centre created', type: 'success' },
            { time: '09:14', msg: 'Database schema migration applied', type: 'info' },
            { time: 'Yesterday', msg: 'Company deleted (TestCorp)', type: 'error' },
          ].map((log, i) => (
            <div key={i} className="flex gap-4 items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded text-xs font-semibold">
              <span className="text-[10px] text-slate-400 font-mono w-12 shrink-0">{log.time}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${log.type === 'warn' ? 'bg-amber-500' : log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-rose-500' : 'bg-primary'}`}></span>
              <span className="text-slate-700 dark:text-slate-300">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Backup Status */}
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><HardDrive className="w-5 h-5"/></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dernier Backup</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">Today 03:00 AM</span>
            <span className="text-[10px] text-emerald-500 font-bold">Status: Success (24GB)</span>
          </div>
        </div>

        {/* Email Queue */}
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Mail className="w-5 h-5"/></div>
          <div className="w-full">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Queue (24h)</span>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Sent: 1,432</span>
              <span className="text-[10px] bg-rose-100 text-rose-600 px-2 rounded-full font-bold">Failed: 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
