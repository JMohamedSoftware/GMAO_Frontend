import React from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { Equipment } from '@/shared/types/gmao';
import {
  Flame,
  RefreshCw,
  Layers,
  Package,
  Cpu,
  AlertCircle
} from 'lucide-react';

interface VisualizerProps {
  onSelectEquipment: (eq: Equipment) => void;
}

interface StageTemplate {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  keywords: string[];
}

const PROCESS_STAGES: StageTemplate[] = [
  {
    key: 'reception',
    title: '1. Réception & Lavage',
    icon: RefreshCw,
    description: 'Convoyeurs & lavage industriel',
    keywords: ['convoy', 'lave', 'lavage', 'récept', 'recept', 'tri', 'élévateur', 'elevateur']
  },
  {
    key: 'concentration',
    title: '2. Broyage & Concentration',
    icon: Layers,
    description: 'Broyeurs & évaporateurs',
    keywords: ['évap', 'evap', 'broyeu', 'broyage', 'concentr', 'cuve', 'raffin', 'pulpe']
  },
  {
    key: 'pasteurisation',
    title: '3. Pasteurisation & Thermique',
    icon: Flame,
    description: 'Chaudières & échangeurs thermiques',
    keywords: ['chaud', 'pasteur', 'vapeur', 'échangeur', 'echangeur', 'therm', 'pompe']
  },
  {
    key: 'sterilisation',
    title: '4. Stérilisation',
    icon: Cpu,
    description: 'Autoclaves & sertisseuses',
    keywords: ['stéril', 'steril', 'autoclave', 'sertiss']
  },
  {
    key: 'conditionnement',
    title: '5. Conditionnement',
    icon: Package,
    description: 'Remplissage, étiquetage & palettisation',
    keywords: ['rempliss', 'conditionn', 'ensach', 'étiquet', 'etiquet', 'palett', 'embouteil']
  }
];

export const TomatoVisualizer: React.FC<VisualizerProps> = ({ onSelectEquipment }) => {
  const { equipments } = useGmao();

  const getStatusColor = (status?: Equipment['status']) => {
    switch (status) {
      case 'En service': return 'bg-emerald-500 text-emerald-50';
      case 'En maintenance': return 'bg-amber-500 text-amber-50';
      case 'En panne':
      case 'Hors service': return 'bg-rose-500 text-rose-50 animate-pulse';
      default: return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getBorderColor = (status?: Equipment['status']) => {
    switch (status) {
      case 'En service': return 'border-emerald-500/30 dark:border-emerald-500/20';
      case 'En maintenance': return 'border-amber-500/30 dark:border-amber-500/20';
      case 'En panne':
      case 'Hors service': return 'border-rose-500/40 dark:border-rose-500/20';
      default: return 'border-slate-200 dark:border-slate-800';
    }
  };

  const getGlowEffect = (status?: Equipment['status']) => {
    switch (status) {
      case 'En service': return 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      case 'En maintenance': return 'shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'En panne':
      case 'Hors service': return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
      default: return '';
    }
  };

  const usedIds = new Set<string>();
  const resolvedStages = PROCESS_STAGES.map(stage => {
    const match = equipments.find(eq => {
      if (usedIds.has(eq.id)) return false;
      const haystack = `${eq.category || ''} ${eq.subFamily || ''} ${eq.name || ''} ${eq.location || ''}`.toLowerCase();
      return stage.keywords.some(kw => haystack.includes(kw));
    });
    if (match) usedIds.add(match.id);
    return { stage, eq: match };
  });

  const matchedCount = resolvedStages.filter(s => !!s.eq).length;
  const cardsToRender =
    matchedCount > 0
      ? resolvedStages
      : equipments.slice(0, 5).map((eq, idx) => ({
          stage: {
            key: `eq-${eq.id}`,
            title: `${idx + 1}. ${eq.category || 'Équipement'}`,
            icon: PROCESS_STAGES[idx % PROCESS_STAGES.length].icon,
            description: eq.location || eq.subFamily || 'Ligne de production',
            keywords: []
          },
          eq
        }));

  return (
    <div className="w-full relative py-8 px-6 glass-panel rounded-custom-lg overflow-hidden border border-white/40 dark:border-slate-800/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            Supervision Technique en Temps Réel
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chaîne de production du site & état réel des équipements enregistrés
          </p>
        </div>
        <div className="flex items-center gap-4 mt-3 md:mt-0 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">En Service</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-300">En Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>En Panne</span>
          </div>
        </div>
      </div>

      {cardsToRender.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6 text-slate-400" />
          <p className="font-semibold">Aucun équipement enregistré pour ce tenant.</p>
        </div>
      ) : (
        <div className="relative w-full flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-4 z-10">
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-1 border-t-2 border-dashed border-slate-300 dark:border-slate-700 -translate-y-1/2 -z-10" />

          {cardsToRender.map(({ stage, eq }) => {
            const Icon = stage.icon;
            const status = eq?.status;

            return (
              <div
                key={stage.key}
                className={`flex-1 flex flex-col justify-between p-5 rounded-custom-md border neumorphic-card ${eq ? 'hover-lift cursor-pointer' : 'opacity-75'} ${getBorderColor(status)} ${getGlowEffect(status)}`}
                onClick={() => eq && onSelectEquipment(eq)}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {stage.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(status)}`}>
                      {status || 'Non rattaché'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-custom-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm ${status === 'En panne' ? 'text-rose-500 animate-bounce' : 'text-primary'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {eq ? eq.name : 'Aucun équipement'}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {eq?.code ? `${eq.code} • ${stage.description}` : stage.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {eq ? `${eq.hoursCount ?? 0} h` : '—'}
                  </span>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider block">
                      Indice santé
                    </span>
                    <span className={`font-bold ${
                      !eq ? 'text-slate-400' : eq.healthIndex > 80 ? 'text-emerald-500' : eq.healthIndex > 50 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {eq ? `${eq.healthIndex}%` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
