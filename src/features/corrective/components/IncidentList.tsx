import React from 'react';
import { Incident, Equipment } from '../../../types/gmao';
import { AlertCircle, User, Clock, Check, X, ArrowRight, FileText } from 'lucide-react';

interface IncidentListProps {
  columns: { id: Incident['status']; label: string; color: string }[];
  getColumnIncidents: (status: Incident['status']) => Incident[];
  equipments: Equipment[];
  getUrgencyColor: (urgency: Incident['urgency']) => string;
  canDo: (m: any, a: string) => boolean;
  isProduction: boolean;
  isTechnicien: boolean;
  updateIncidentStatus: (id: string, status: Incident['status']) => void;
  onOpenCreateOtWithIncident: (inc: Incident) => void;
  onNavigate: (screen: string) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  columns, getColumnIncidents, equipments, getUrgencyColor, canDo,
  isProduction, isTechnicien, updateIncidentStatus, onOpenCreateOtWithIncident,
  onNavigate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      {columns.map(column => {
        const colIncidents = getColumnIncidents(column.id);
        
        return (
          <div key={column.id} className="flex flex-col gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {column.label}
                </span>
              </div>
              <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 font-bold px-2 py-0.5 rounded text-slate-500">
                {colIncidents.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 flex flex-col gap-3 min-h-[450px] p-2 bg-slate-200/20 dark:bg-slate-900/10 rounded-custom-lg border border-slate-200/40 dark:border-slate-800/40">
              {colIncidents.length === 0 ? (
                <div className="text-center py-12 text-[10px] text-slate-400 font-medium">
                  Aucune panne
                </div>
              ) : (
                colIncidents.map(inc => {
                  const eq = equipments.find(e => e.id === inc.equipmentId);
                  
                  // Calcul du temps écoulé fictif
                  const diffMs = Date.now() - new Date(inc.reportedDate).getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const timeElapsedStr = diffDays > 0 
                    ? `Il y a ${diffDays} j` 
                    : (diffHours > 0 ? `Il y a ${diffHours} h` : 'À l\'instant');

                  // Avatar aléatoire basé sur l'ID
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(inc.reportedBy.split(' ')[0])}&background=random&color=fff&size=64`;
                  
                  const affectedTechName = inc.technicianId 
                    ? 'Ahmed Bensaid' // Hardcoded for demo, normally from context
                    : 'Non affecté';

                  return (
                    <div 
                      key={inc.id}
                      className="p-4 rounded-custom-md border border-white/50 dark:border-slate-850/40 bg-white/60 dark:bg-slate-900/20 neumorphic-card hover-lift flex flex-col gap-3 group relative overflow-hidden"
                    >
                      {/* Hover effect gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="flex justify-between items-start z-10 mb-1">
                        <span className="text-[9px] font-bold text-slate-400 font-mono leading-none flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          {inc.id}
                        </span>
                      </div>

                      <div className="z-10">
                        <h4 className="font-bold text-xs text-slate-750 dark:text-slate-250 leading-tight">
                          {eq ? eq.name : inc.equipmentId}
                        </h4>
                        <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{inc.equipmentId}</span>
                        
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getUrgencyColor(inc.urgency)}`}>
                            Urgence: {inc.urgency}
                          </span>
                          {inc.priority && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-400">
                              Priorité: {inc.priority}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          {inc.description}
                        </p>
                      </div>

                      {inc.photo && (
                        <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 z-10 relative group-hover:shadow-md transition-shadow">
                          <img src={inc.photo} alt="Panne" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-slate-150 dark:border-slate-850 z-10">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`text-[10px] font-semibold ${inc.technicianId ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                            Tech: {affectedTechName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Déclaré: {timeElapsedStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img src={avatarUrl} alt="Avatar" className="w-4 h-4 rounded-full ring-1 ring-slate-200 dark:ring-slate-700" />
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 leading-none">
                            Par: {inc.reportedBy.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Interactive transitions block inside card */}
                      <div className="flex gap-1.5 mt-1 z-10">
                        {canDo('corrective', 'valider') && inc.status === 'Nouveau' && (
                          <>
                            <button
                              title="Valider cet incident"
                              onClick={() => updateIncidentStatus(inc.id, 'Validé')}
                              className="flex-1 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition text-[9px] font-bold border border-emerald-500/20 flex items-center justify-center gap-0.5 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Valider</span>
                            </button>
                            <button
                              title="Rejeter cet incident"
                              onClick={() => updateIncidentStatus(inc.id, 'Rejeté')}
                              className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition text-[9px] font-bold border border-rose-500/20 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {canDo('corrective', 'valider') && inc.status === 'Validé' && (
                          <button
                            onClick={() => onOpenCreateOtWithIncident(inc)}
                            className="w-full py-1 rounded bg-primary text-white hover:bg-primary/95 transition text-[9px] font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Planifier l'OT</span>
                          </button>
                        )}

                        {/* Production/Technicien: see status only */}
                        {!canDo('corrective', 'valider') && (isProduction || isTechnicien) && (
                          <div className={`w-full py-1 rounded text-[9px] font-bold text-center border ${
                            inc.status === 'Nouveau' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/30' :
                            inc.status === 'Validé' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            inc.status === 'Transformé en OT' ? 'bg-primary/10 text-primary border-primary/20' :
                            inc.status === 'Clos' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {inc.status === 'Nouveau' ? '⏳ En attente de validation' :
                             inc.status === 'Validé' ? '✅ Validée — Planification en cours' :
                             inc.status === 'Transformé en OT' ? '🔧 OT créé — Technicien affecté' :
                             inc.status === 'Clos' ? '✅ Résolu' :
                             inc.status}
                          </div>
                        )}

                        {inc.status === 'Transformé en OT' && (
                          <button
                            onClick={() => inc.workOrderId && onNavigate(`workorder-detail:${inc.workOrderId}`)}
                            className="w-full py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 transition text-[9px] font-bold flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-800 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Voir OT ({inc.workOrderId})</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
