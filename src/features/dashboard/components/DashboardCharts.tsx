import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Activity, Droplet, Thermometer, Battery } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { TomatoVisualizer } from '../../../components/TomatoVisualizer';
import { Equipment } from '../../../types/gmao';

interface DashboardChartsProps {
  monthlyTrendsData: any[];
  btFait: number;
  btEnCours: number;
  btAFaire: number;
  onSelectEquipment: (eq: Equipment) => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyTrendsData,
  btFait,
  btEnCours,
  btAFaire,
  onSelectEquipment
}) => {
  const [showCharts, setShowCharts] = useState(true);

  return (
    <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm flex flex-col gap-4">
      <button 
        onClick={() => setShowCharts(!showCharts)}
        className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-850 pb-2 outline-none cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Activity className="w-4.5 h-4.5 text-primary" />
          Supervision Technique Avancée & Performance Graphiques
        </span>
        {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showCharts && (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
          {/* Supervision visualizer */}
          <TomatoVisualizer onSelectEquipment={onSelectEquipment} />

          {/* Performance charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spark chart */}
            <div className="md:col-span-2 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-xl">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase mb-3">Tendance Mensuelle Pannes & Coûts</h4>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                    <YAxis stroke="#94A3B8" fontSize={9} />
                    <Tooltip />
                    <Area type="monotone" dataKey="pannes" name="Pannes" stroke="#EF4444" fill="#EF4444" fillOpacity={0.05} strokeWidth={2} />
                    <Area type="monotone" dataKey="cost" name="Coûts (€)" stroke="#2563EB" fill="#2563EB" fillOpacity={0.05} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Pie Chart */}
            <div className="border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between items-center text-center">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase w-full text-left mb-2">Taux Résolution OT</h4>
              <div className="w-full h-28 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Fait', value: btFait, color: '#10B981' },
                        { name: 'En cours', value: btEnCours, color: '#0EA5E9' },
                        { name: 'À faire', value: btAFaire, color: '#F59E0B' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#0EA5E9" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-[9px] font-bold text-slate-500 justify-center">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Fait ({btFait})</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>En cours ({btEnCours})</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>À faire ({btAFaire})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
