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
  const total = equipments.length;
  const enService = equipments.filter(e => e.status === 'En service').length;
  const enMaint = equipments.filter(e => e.status === 'En maintenance').length;
  const enPanne = equipments.filter(e => e.status === 'En panne').length;
  const aLarret = equipments.filter(e => e.status === 'Hors service').length;

  const donutData = total > 0 ? [
    { name: 'En service', value: enService, color: '#10B981' },
    { name: 'En maintenance', value: enMaint, color: '#F59E0B' },
    { name: 'En panne', value: enPanne, color: '#EF4444' },
    { name: "À l'arrêt", value: aLarret, color: '#94A3B8' }
  ].filter(d => d.value > 0) : [
    { name: 'Aucun équipement', value: 1, color: '#CBD5E1' }
  ];

  // Interventions bar chart data (dynamically aggregated from real workOrders)
  const otChartData = React.useMemo(() => {
    const now = new Date();
    const daysCount = timeRange === '7j' ? 7 : timeRange === '30j' ? 30 : 90;
    const intervals = 6;
    const stepDays = Math.ceil(daysCount / intervals);
    const buckets: { day: string; preventive: number; corrective: number }[] = [];

    for (let i = intervals - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * stepDays * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      buckets.push({ day: label, preventive: 0, corrective: 0 });
    }

    workOrders.forEach(w => {
      const wDate = new Date(w.createdDate || (w as any).date || now);
      const diffDays = Math.floor((now.getTime() - wDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays < daysCount) {
        const bucketIndex = Math.min(intervals - 1, Math.floor((daysCount - 1 - diffDays) / stepDays));
        if (bucketIndex >= 0 && bucketIndex < buckets.length) {
          if (w.type === 'Préventif') {
            buckets[bucketIndex].preventive += 1;
          } else {
            buckets[bucketIndex].corrective += 1;
          }
        }
      }
    });

    return buckets;
  }, [workOrders, timeRange]);

  // Top 5 solicited equipment calculated from real workOrders
  const topMachines = React.useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach(w => {
      if (w.equipmentId) {
        counts[w.equipmentId] = (counts[w.equipmentId] || 0) + 1;
      }
    });

    const sortedEqs = [...equipments].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      return countB - countA;
    }).slice(0, 5);

    const maxCount = Math.max(...sortedEqs.map(e => counts[e.id] || 0), 1);
    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-sky-400', 'bg-cyan-400', 'bg-teal-400'];

    return sortedEqs.map((eq, idx) => ({
      rank: idx + 1,
      id: eq.id,
      name: eq.name,
      count: counts[eq.id] || 0,
      max: maxCount,
      color: colors[idx % colors.length]
    }));
  }, [equipments, workOrders]);

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
                {enService} <span className="text-slate-400 font-normal">({total > 0 ? Math.round((enService / total) * 100) : 0}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                En maintenance
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                {enMaint} <span className="text-slate-400 font-normal">({total > 0 ? Math.round((enMaint / total) * 100) : 0}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                En panne
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                {enPanne} <span className="text-slate-400 font-normal">({total > 0 ? Math.round((enPanne / total) * 100) : 0}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                À l'arrêt
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                {aLarret} <span className="text-slate-400 font-normal">({total > 0 ? Math.round((aLarret / total) * 100) : 0}%)</span>
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
          {topMachines.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              <p className="font-semibold">Aucun équipement enregistré</p>
            </div>
          ) : (
            topMachines.map(m => {
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
            })
          )}
        </div>
      </div>

    </div>
  );
};
