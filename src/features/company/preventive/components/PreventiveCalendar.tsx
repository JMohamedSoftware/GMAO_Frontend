import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Plus } from 'lucide-react';
import type { PlanPreventif } from '../types/preventive.types';
import { PERMISSIONS } from '@/shared/permissions';

interface CalendarEvent {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: string;
  plan?: PlanPreventif;
}

interface PreventiveCalendarProps {
  currentMonth: Date;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  capitalizedMonthLabel: string;
  calendarCells: { dateStr: string; dayNum: number }[];
  getEventsForDay: (dateStr: string) => CalendarEvent[];
  getPriorityColor: (priority: string) => string;
  handleDropOnDay: (dateStr: string) => void;
  onEventClick: (plan: PlanPreventif) => void;
  activePlanToDrag: PlanPreventif | null;
  todayDateStr: string;
  filterEq: string;
  setFilterEq: (v: string) => void;
  filterFam: string;
  setFilterFam: (v: string) => void;
  filterTech: string;
  setFilterTech: (v: string) => void;
  filterPrio: string;
  setFilterPrio: (v: string) => void;
  equipments: any[];
  technicians: any[];
  can: (permission: any) => boolean;
  onNewPlan: () => void;
}

export const PreventiveCalendar: React.FC<PreventiveCalendarProps> = ({
  currentMonth, goToPrevMonth, goToNextMonth, goToToday, capitalizedMonthLabel,
  calendarCells, getEventsForDay, getPriorityColor, handleDropOnDay, onEventClick,
  activePlanToDrag, todayDateStr,
  filterEq, setFilterEq, filterFam, setFilterFam,
  filterTech, setFilterTech, filterPrio, setFilterPrio,
  equipments, technicians, can, onNewPlan
}) => {

  const families = Array.from(new Set(equipments.map(e => e.category).filter(Boolean)));

  return (
    <div className="lg:col-span-3 flex flex-col gap-4">

      {/* Filters Bar */}
      <div className="glass-panel p-3 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Filtres</span>
        </div>

        <select
          value={filterEq}
          onChange={e => setFilterEq(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold"
        >
          <option value="">Équipement (Tous)</option>
          {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <select
          value={filterFam}
          onChange={e => setFilterFam(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold"
        >
          <option value="">Famille (Toutes)</option>
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select
          value={filterTech}
          onChange={e => setFilterTech(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold"
        >
          <option value="">Technicien (Tous)</option>
          {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="flex-1" />

        {can(PERMISSIONS.PREVENTIVE_CREATE) && (
          <button
            onClick={onNewPlan}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Plan Préventif
          </button>
        )}
      </div>

      {/* Calendar Panel */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between flex-1">

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
              {capitalizedMonthLabel}
            </h3>
          </div>

          <div className="flex gap-1.5 border border-slate-200/50 dark:border-slate-800/50 rounded-lg overflow-hidden bg-white/40 dark:bg-slate-900/10 p-0.5">
            <button onClick={goToPrevMonth} className="p-1 text-slate-500 hover:bg-slate-150 rounded cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToToday} className="text-[10px] font-bold text-slate-550 px-2.5 hover:bg-slate-150 rounded cursor-pointer">
              Aujourd'hui
            </button>
            <button onClick={goToNextMonth} className="p-1 text-slate-500 hover:bg-slate-150 rounded cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Lun</span><span>Mar</span><span>Mer</span>
          <span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            const hasDay = cell.dayNum > 0;
            const events = getEventsForDay(cell.dateStr);
            const isToday = cell.dateStr === todayDateStr;
            const isDragTarget = activePlanToDrag && hasDay;

            return (
              <div
                key={idx}
                onClick={() => hasDay && handleDropOnDay(cell.dateStr)}
                className={`min-h-[90px] border rounded-custom-sm p-1.5 flex flex-col gap-1.5 transition-all select-none ${
                  !hasDay
                    ? 'bg-transparent border-transparent cursor-default'
                    : isToday
                      ? 'border-primary bg-primary/5 shadow-[inset_0_0_10px_rgba(37,99,235,0.05)]'
                      : 'border-slate-200/50 dark:border-slate-850 bg-white/40 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800'
                } ${isDragTarget ? 'ring-2 ring-primary/20 cursor-pointer border-dashed border-primary/50' : ''}`}
              >
                {/* Day number */}
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-extrabold ${
                    isToday
                      ? 'text-white bg-primary px-1.5 py-0.5 rounded-full'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {hasDay ? cell.dayNum : ''}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[8px] font-bold text-slate-400">{events.length}</span>
                  )}
                </div>

                {/* Events */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                  {events.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      title={ev.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ev.plan) onEventClick(ev.plan);
                      }}
                      className={`text-[8px] font-bold px-1 py-0.5 rounded border truncate leading-none cursor-pointer hover:opacity-80 ${getPriorityColor(ev.priority)}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>

                {/* Drop hint */}
                {isDragTarget && events.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[8px] text-primary/40 font-bold">
                    Déposer ici
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500 rounded-sm" />
            <span>En retard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500 rounded-sm" />
            <span>Urgent (≤3j)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-sky-500/20 border border-sky-400 rounded-sm" />
            <span>Cette semaine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-primary/20 border border-primary rounded-sm" />
            <span>Planifié</span>
          </div>
        </div>
      </div>
    </div>
  );
};
