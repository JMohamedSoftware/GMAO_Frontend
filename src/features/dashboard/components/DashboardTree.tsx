import React, { useState } from 'react';
import { Equipment } from '../../../types/gmao';
import { FolderTree, X, Wrench } from 'lucide-react';

interface TreeElementProps {
  node: { name: string; eqId?: string; children?: any[] };
  equipments: Equipment[];
  onSelectEquipment: (eq: Equipment) => void;
}

const TreeElement: React.FC<TreeElementProps> = ({ node, equipments, onSelectEquipment }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  const handleNodeClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (node.eqId) {
      const eq = equipments.find(e => e.id === node.eqId);
      if (eq) onSelectEquipment(eq);
    }
  };

  return (
    <div className="pl-4 select-none">
      <div 
        onClick={handleNodeClick}
        className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:text-primary dark:hover:text-primary cursor-pointer transition-colors"
      >
        {hasChildren ? (
          isOpen ? <span className="text-slate-400">▼</span> : <span className="text-slate-400">▶</span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700 ml-1.5 mr-0.5" />
        )}
        <span className={node.eqId ? 'font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200' : ''}>
          {node.name}
        </span>
      </div>
      {isOpen && hasChildren && (
        <div className="border-l border-slate-200/50 dark:border-slate-800 pl-2">
          {node.children!.map((child, idx) => (
            <TreeElement key={idx} node={child} equipments={equipments} onSelectEquipment={onSelectEquipment} />
          ))}
        </div>
      )}
    </div>
  );
};

interface DashboardTreeProps {
  factoryTree: any;
  equipments: Equipment[];
  selectedDashboardEq: Equipment | null;
  setSelectedDashboardEq: (eq: Equipment | null) => void;
  onNavigate: (screen: string) => void;
  onSelectEquipmentToNavigate: (eq: Equipment) => void;
}

export const DashboardTree: React.FC<DashboardTreeProps> = ({
  factoryTree,
  equipments,
  selectedDashboardEq,
  setSelectedDashboardEq,
  onNavigate,
  onSelectEquipmentToNavigate
}) => {
  return (
    <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
          <FolderTree className="w-4 h-4 text-primary" />
          Arborescence Technique Parc
        </h3>
        {selectedDashboardEq ? (
          <button
            onClick={() => setSelectedDashboardEq(null)}
            className="text-[9px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" /> Fermer fiche
          </button>
        ) : (
          <span className="text-[9px] text-slate-400">Cliquez sur un équipement pour sa fiche</span>
        )}
      </div>

      <div className="flex gap-4">
        {/* Tree */}
        <div className="flex-1 p-3 bg-white/40 dark:bg-slate-900/10 rounded-custom-sm border border-slate-150 dark:border-slate-850 max-h-[300px] overflow-y-auto">
          <TreeElement
            node={factoryTree}
            equipments={equipments}
            onSelectEquipment={(eq) => setSelectedDashboardEq(eq)}
          />
        </div>

        {/* Quick-peek panel */}
        {selectedDashboardEq ? (
          <div className="w-64 shrink-0 bg-white/70 dark:bg-slate-900/50 border border-primary/20 rounded-xl p-4 flex flex-col gap-3 text-xs animate-[fadeIn_0.2s_ease-out] overflow-y-auto max-h-[300px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[9px] text-slate-400 font-bold block">{selectedDashboardEq.id}</span>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight mt-0.5">{selectedDashboardEq.name}</h4>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{selectedDashboardEq.category}</span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                selectedDashboardEq.status === 'En service' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                selectedDashboardEq.status === 'En panne' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>{selectedDashboardEq.status}</span>
            </div>

            {/* Health ring */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="3" className="dark:stroke-slate-800" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={selectedDashboardEq.healthIndex >= 70 ? '#10B981' : selectedDashboardEq.healthIndex >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3"
                    strokeDasharray={`${(selectedDashboardEq.healthIndex / 100) * 94.2} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800 dark:text-white">{selectedDashboardEq.healthIndex}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Indice Santé</span>
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">{selectedDashboardEq.hoursCount.toLocaleString()} h</span>
                <span className="text-[9px] text-slate-400 block">Heures total machine</span>
              </div>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                <span className="text-[8px] text-slate-400 font-bold uppercase block">Criticité</span>
                <span className={`text-[10px] font-extrabold ${
                  selectedDashboardEq.criticality === 'Critique' ? 'text-rose-600' :
                  selectedDashboardEq.criticality === 'Haute' ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                }`}>{selectedDashboardEq.criticality}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                <span className="text-[8px] text-slate-400 font-bold uppercase block">Localisation</span>
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 truncate block">{selectedDashboardEq.location}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                <span className="text-[8px] text-slate-400 font-bold uppercase block">Dernière MP</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedDashboardEq.lastMaintenance}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                <span className="text-[8px] text-slate-400 font-bold uppercase block">Prochaine MP</span>
                <span className="text-[10px] font-bold text-emerald-600">{selectedDashboardEq.nextMaintenance}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { onSelectEquipmentToNavigate(selectedDashboardEq); onNavigate('equipment'); }}
                className="flex-1 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Fiche Complète
              </button>
              <button
                onClick={() => { const el = document.getElementById('di-form'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex-1 py-1.5 bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Déclarer DI
              </button>
            </div>
          </div>
        ) : (
          <div className="w-64 shrink-0 flex flex-col items-center justify-center text-center p-6 bg-white/30 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-60">
            <Wrench className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Sélectionnez une machine dans l'arborescence pour afficher sa fiche rapide</p>
          </div>
        )}
      </div>
    </div>
  );
};
