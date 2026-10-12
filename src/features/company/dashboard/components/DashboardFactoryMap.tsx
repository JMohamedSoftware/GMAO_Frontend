import React, { useState } from 'react';
import { Maximize2, MapPin, ArrowRight, Gauge, Activity } from 'lucide-react';
import factoryPlanImg from '@/shared/assets/images/factory_plan.jpg';
import machineDefaultImg from '@/shared/assets/images/machine_default.jpg';
import { Equipment } from '@/shared/types/gmao';

interface DashboardFactoryMapProps {
  equipments: Equipment[];
  onSelectEquipment: (eq: Equipment) => void;
  onNavigate: (screen: string) => void;
}

export const DashboardFactoryMap: React.FC<DashboardFactoryMapProps> = ({
  equipments,
  onSelectEquipment,
  onNavigate
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zones = React.useMemo(() => {
    const baseZones = [
      { id: 'reception', label: 'Réception', x: 12, y: 52 },
      { id: 'lavage', label: 'Lavage', x: 26, y: 64 },
      { id: 'broyage', label: 'Broyage', x: 42, y: 46 },
      { id: 'chauffage', label: 'Chauffage / Évaporation', x: 52, y: 32 },
      { id: 'sterilisation', label: 'Stérilisation', x: 67, y: 40 },
      { id: 'conditionnement', label: 'Conditionnement', x: 78, y: 68 },
      { id: 'stockage', label: 'Stockage & Expédition', x: 91, y: 46 },
    ];

    return baseZones.map(z => {
      const matched = equipments.filter(e => {
        const term = z.id.toLowerCase();
        const cat = (e.category || '').toLowerCase();
        const loc = (e.localisation?.nom || '').toLowerCase();
        const name = (e.name || '').toLowerCase();
        return cat.includes(term) || loc.includes(term) || name.includes(term);
      });
      const hasPanne = matched.some(e => e.status === 'En panne');
      const hasMaint = matched.some(e => e.status === 'En maintenance');
      const status = hasPanne ? 'danger' : hasMaint ? 'warning' : 'ok';
      return { ...z, count: matched.length, status };
    });
  }, [equipments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-emerald-500 border-emerald-300 text-emerald-50';
      case 'warning': return 'bg-amber-500 border-amber-300 text-amber-50';
      case 'danger': return 'bg-rose-500 border-rose-300 text-rose-50 animate-pulse';
      default: return 'bg-slate-500 border-slate-300 text-white';
    }
  };

  const displayedEquipments = React.useMemo(() => {
    if (equipments.length > 0) {
      return equipments.slice(0, 6).map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        status: e.status,
        throughput: e.hoursCount ? `${e.hoursCount} h` : '—',
        raw: e
      }));
    }
    return [];
  }, [equipments]);

  return (
    <div className="flex flex-col gap-5">
      {/* Interactive Factory Aerial Map Container */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Map Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                Plan de l'usine & Ligne de Transformation
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Surveillance synoptique interactive des zones et flux de tomate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Flux temps réel
            </span>
            <button
              onClick={() => onNavigate('equipment')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Vue complète
            </button>
          </div>
        </div>

        {/* Visual Map with Hotspots */}
        <div className="relative w-full aspect-[21/9] min-h-[300px] max-h-[460px] bg-slate-950 overflow-hidden group">
          <img
            src={factoryPlanImg}
            alt="Plan Usine Pomodoro"
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.01]"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

          {/* Interactive Hotspots */}
          {zones.map(zone => {
            const isSelected = selectedZone === zone.id;
            return (
              <div
                key={zone.id}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin"
              >
                {/* Hotspot Pill Button */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-white scale-110 ring-4 ring-blue-500/30'
                      : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border-white/60 hover:scale-105'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(zone.status)}`} />
                  <span className="text-[11px] font-extrabold whitespace-nowrap">
                    {zone.label}
                  </span>
                </div>

                {/* Popover on click */}
                {isSelected && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-2xl border border-slate-200 dark:border-slate-700 text-xs z-30 animate-[fadeIn_0.2s_ease-out]">
                    <div className="font-extrabold text-slate-800 dark:text-white text-xs mb-1">
                      Zone {zone.label}
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between mb-2">
                      <span>Équipements :</span>
                      <span className="font-bold text-slate-800 dark:text-white">{zone.count} machines</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('equipment');
                      }}
                      className="w-full py-1 text-center bg-blue-50 text-blue-600 rounded-lg font-bold text-[10px] hover:bg-blue-100 transition-colors"
                    >
                      Voir les équipements
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Equipments Carousel / Grid Strip (Image 3 Bottom) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            Équipements Principaux de la Ligne
          </h4>
          <button
            onClick={() => onNavigate('equipment')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Voir tous ({equipments.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayedEquipments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <p className="font-semibold">Aucun équipement enregistré</p>
            <p className="text-[11px] mt-0.5">Ajoutez vos équipements pour les voir apparaître sur la ligne.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {displayedEquipments.map((item) => {
              const matchedEq = item.raw;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (matchedEq) onSelectEquipment(matchedEq);
                    onNavigate('equipment');
                  }}
                  className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/40 shadow-sm flex flex-col justify-between gap-2.5 transition-all cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={matchedEq?.photos?.[0] || machineDefaultImg}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                        item.status === 'En service'
                          ? 'bg-emerald-500 text-white'
                          : item.status === 'En maintenance'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block">
                      {item.id}
                    </span>
                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight truncate">
                      {item.name}
                    </h5>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      {item.throughput}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
