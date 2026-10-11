import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, TrendingUp, ArrowRight } from 'lucide-react';
import { Equipment, WorkOrder } from '@/shared/types/gmao';

interface DashboardAnalyticsProps {
  equipments: Equipment[];
  workOrders: WorkOrder[];
  onNavigate: (screen: string) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  equipments,
  workOrders,
  onNavigate
}) => {
  const [timeRange, setTimeRange] = useState<'30j' | '7j' | '3m'>('30j');

  // Status breakdown for Donut Chart
  const total = equipments.length || 124;
  const enService = equipments.filter(e => e.status === 'En service').length || 106;
  const enMaint = equipments.filter(e => e.status === 'En maintenance').length || 12;
  const enPanne = equipments.filter(e => e.status === 'En panne').length || 6;
  const aLarret = 0;

  const donutData = [
    { name: 'En service', value: enService, color: '#10B981' },
    { name: 'En maintenance', value: enMaint, color: '#F59E0B' },
    { name: 'En panne', value: enPanne, color: '#EF4444' },
    { name: "À l'arrêt", value: aLarret || 0.1, color: '#94A3B8' }
  ];

  // Interventions bar chart data (30 days sampled)
  const otChartData = [
    { day: '1 Sep', preventive: 4, corrective: 2 },
    { day: '5 Sep', preventive: 7, corrective: 4 },
    { day: '10 Sep', preventive: 6, corrective: 1 },
    { day: '15 Sep', preventive: 10, corrective: 5 },
    { day: '20 Sep', preventive: 5, corrective: 2 },
    { day: '25 Sep', preventive: 8, corrective: 4 },
    { day: '30 Sep', preventive: 9, corrective: 2 }
  ];

  // Top 5 solicited equipment
  const topMachines = [
    { rank: 1, name: 'Pompe P-102', count: 32, max: 35, color: 'bg-rose-500' },
    { rank: 2, name: 'Convoyeur C-04', count: 21, max: 35, color: 'bg-blue-500' },
    { rank: 3, name: 'Broyeur PM-01', count: 16, max: 35, color: 'bg-sky-400' },
    { rank: 4, name: 'Pasteurisateur PS-01', count: 9, max: 35, color: 'bg-cyan-400' },
    { rank: 5, name: 'Remplisseuse RM-01', count: 7, max: 35, color: 'bg-teal-400' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
      
      {/* 1. Répartition des équipements par état */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-emerald-500" />
            Répartition des équipements par état
          </h4>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          {/* Donut */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-lg font-black text-slate-800 dark:text-white block leading-tight">
                {total}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                Équipements
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs w-full sm:w-auto">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                En service
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                {enService} <span className="text-slate-400 font-normal">({Math.round((enService / total) * 100)}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                En maintenance
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                {enMaint} <span className="text-slate-400 font-normal">({Math.round((enMaint / total) * 100)}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                En panne
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                {enPanne} <span className="text-slate-400 font-normal">({Math.round((enPanne / total) * 100)}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                À l'arrêt
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                0 <span className="text-slate-400 font-normal">(0%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interventions (OT) – 30 derniers jours */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Interventions (OT)
          </h4>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-[10px] font-bold p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-600 dark:text-slate-300"
          >
            <option value="30j">30 jours</option>
            <option value="7j">7 jours</option>
            <option value="3m">3 mois</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold mb-2">
          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="w-2 h-2 rounded bg-blue-500"></span>
            Préventive
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2 h-2 rounded bg-rose-500"></span>
            Corrective
          </span>
        </div>

        {/* Bar Chart */}
        <div className="w-full h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={otChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} />
              <YAxis stroke="#94A3B8" fontSize={9} />
              <Tooltip />
              <Bar dataKey="preventive" name="Préventive" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="corrective" name="Corrective" fill="#F43F5E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Top 5 équipements les plus sollicités */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Top 5 équipements les plus sollicités
          </h4>
          <button
            onClick={() => onNavigate('workorders')}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {topMachines.map(m => {
            const percentWidth = Math.min(100, Math.round((m.count / m.max) * 100));
            return (
              <div key={m.rank} className="flex items-center gap-3 text-xs">
                <span className="w-4 text-center font-bold text-slate-400 text-[11px]">
                  {m.rank}
                </span>
                <span className="w-36 font-bold text-slate-700 dark:text-slate-200 truncate">
                  {m.name}
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentWidth}%` }}
                    className={`h-full rounded-full ${m.color}`}
                  />
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white text-[11px] shrink-0">
                  {m.count} OT
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
