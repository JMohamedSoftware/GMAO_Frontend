import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PreventivePlanList } from '../components/PreventivePlanList';
import { PreventiveCalendar } from '../components/PreventiveCalendar';
import { PreventiveDrawer } from '../components/PreventiveDrawer';

interface PreventiveProps {
  onNavigate: (screen: string) => void;
}

interface PreventiveRule {
  id: string;
  equipmentId: string;
  title: string;
  frequency: 'Quotidienne' | 'Hebdomadaire' | 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle';
  triggerType: 'Temps' | 'Compteur';
  thresholdValue: string;
  lastTriggered: string;
  nextTrigger: string;
  technicianId: string;
  priority: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
}

export const Preventive: React.FC<PreventiveProps> = ({ onNavigate }) => {
  const { equipments, technicians, workOrders, addWorkOrder } = useGmao();
  const { can } = usePermissions();
  
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // Juillet 2026
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<PreventiveRule | null>(null);

  // Filters
  const [filterEq, setFilterEq] = useState('');
  const [filterFam, setFilterFam] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [filterPrio, setFilterPrio] = useState('');

  // Initial mock preventive rules
  const [rules, setRules] = useState<PreventiveRule[]>([
    {
      id: 'PRV-001',
      equipmentId: 'EQ-BOIL-001',
      title: 'Contrôle Mensuel Réglementaire Pression Vapeur',
      frequency: 'Mensuelle',
      triggerType: 'Temps',
      thresholdValue: 'Tous les 30 jours',
      lastTriggered: '2026-06-06',
      nextTrigger: '2026-07-06',
      technicianId: 'TECH-002',
      priority: 'Critique'
    },
    {
      id: 'PRV-002',
      equipmentId: 'EQ-PUMP-001',
      title: 'Contrôle Roulements & Vibration',
      frequency: 'Trimestrielle',
      triggerType: 'Compteur',
      thresholdValue: 'Toutes les 500 heures',
      lastTriggered: '2026-05-15',
      nextTrigger: '2026-08-15',
      technicianId: 'TECH-001',
      priority: 'Moyenne'
    },
    {
      id: 'PRV-003',
      equipmentId: 'EQ-AUTO-001',
      title: 'Test d\'étanchéité des Soupapes Autoclave',
      frequency: 'Hebdomadaire',
      triggerType: 'Temps',
      thresholdValue: 'Chaque dimanche',
      lastTriggered: '2026-06-29',
      nextTrigger: '2026-07-05',
      technicianId: 'TECH-003',
      priority: 'Haute'
    },
    {
      id: 'PRV-004',
      equipmentId: 'EQ-CONV-001',
      title: 'Inspection Tension Bande & Alignement Rouleaux',
      frequency: 'Hebdomadaire',
      triggerType: 'Temps',
      thresholdValue: 'Chaque mercredi',
      lastTriggered: '2026-07-01',
      nextTrigger: '2026-07-08',
      technicianId: 'TECH-001',
      priority: 'Haute'
    },
    {
      id: 'PRV-005',
      equipmentId: 'EQ-PACK-001',
      title: 'Remplacement Préventif Buses de Remplissage',
      frequency: 'Semestrielle',
      triggerType: 'Compteur',
      thresholdValue: 'Tous les 10,000 cycles',
      lastTriggered: '2026-02-12',
      nextTrigger: '2026-08-12',
      technicianId: 'TECH-005',
      priority: 'Haute'
    }
  ]);

  const handleTriggerPlan = (rule: PreventiveRule) => {
    addWorkOrder({
      equipmentId: rule.equipmentId,
      title: rule.title,
      description: `Ordre de travail automatique généré à partir du plan préventif ${rule.id}. Action requise: ${rule.thresholdValue}.`,
      type: 'Préventif',
      priority: rule.priority,
      technicianId: rule.technicianId,
      assignedBy: 'POMODORO Scheduler',
      campaign: 'Campagne 2026'
    });

    setRules(prev =>
      prev.map(r => {
        if (r.id === rule.id) {
          const nextDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return { ...r, lastTriggered: new Date().toISOString().split('T')[0], nextTrigger: nextDate };
        }
        return r;
      })
    );
  };

  const buildCalendarCells = () => {
    const cells = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < startDay; i++) {
      cells.push({ dateStr: '', dayNum: 0 });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: day });
    }
    return cells;
  };

  const calendarCells = buildCalendarCells();

  const getEventsForDay = (dateStr: string) => {
    if (!dateStr) return [];
    const ots = workOrders.filter(ot => 
      ot.type === 'Préventif' && 
      ot.createdDate.split('T')[0] === dateStr
    );
    const filteredRules = rules.filter(r => {
      const eq = equipments.find(e => e.id === r.equipmentId);
      if (filterEq && eq?.id !== filterEq) return false;
      if (filterFam && eq?.category !== filterFam) return false;
      if (filterTech && r.technicianId !== filterTech) return false;
      if (filterPrio && r.priority !== filterPrio) return false;
      return true;
    });

    const scheduledRules = filteredRules.filter(r => r.nextTrigger === dateStr);
    return [
      ...ots.map(o => ({ id: o.id, title: o.title, status: o.status, type: 'ot', priority: o.priority })),
      ...scheduledRules.map(r => ({ id: r.id, title: r.title, status: 'Planifié', type: 'rule', priority: r.priority }))
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critique': return 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400';
      case 'Haute': return 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'Moyenne': return 'border-primary bg-primary/10 text-primary';
      default: return 'border-slate-300 bg-slate-100 text-slate-650';
    }
  };

  const [activePlanToDrag, setActivePlanToDrag] = useState<PreventiveRule | null>(null);

  const handleSelectPlanToDrag = (rule: PreventiveRule) => {
    setActivePlanToDrag(rule);
    setSelectedPlanDetails(rule);
  };

  const handleDropOnDay = (dateStr: string) => {
    if (!activePlanToDrag || !dateStr) return;
    setRules(prev =>
      prev.map(r => r.id === activePlanToDrag.id ? { ...r, nextTrigger: dateStr } : r)
    );
    setActivePlanToDrag(null);
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const goToPrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToToday = () => setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Title & Coverage */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Calendrier Maintenance Préventive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Planification périodique des contrôles réglementaires et gammes de maintenance
          </p>
        </div>

        {/* Taux de couverture */}
        <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm min-w-[250px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Couverture Mois</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">85%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5">34 / 40 préventifs réalisés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Rule Engine / Plan Queue */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <PreventivePlanList
            rules={rules}
            equipments={equipments}
            activePlanToDrag={activePlanToDrag}
            handleSelectPlanToDrag={handleSelectPlanToDrag}
            handleTriggerPlan={handleTriggerPlan}
          />
        </div>

        {/* Right Side: Calendar Grid */}
        <PreventiveCalendar
          currentMonth={currentMonth}
          goToPrevMonth={goToPrevMonth}
          goToNextMonth={goToNextMonth}
          goToToday={goToToday}
          capitalizedMonthLabel={capitalizedMonthLabel}
          calendarCells={calendarCells}
          getEventsForDay={getEventsForDay}
          getPriorityColor={getPriorityColor}
          handleDropOnDay={handleDropOnDay}
          activePlanToDrag={activePlanToDrag}
          todayDateStr={todayDateStr}
          filterEq={filterEq}
          setFilterEq={setFilterEq}
          filterFam={filterFam}
          setFilterFam={setFilterFam}
          filterTech={filterTech}
          setFilterTech={setFilterTech}
          filterPrio={filterPrio}
          setFilterPrio={setFilterPrio}
          equipments={equipments}
          technicians={technicians}
          can={can}
        />
      </div>

      {/* Drawer: Detailed Preventive Plan */}
      <PreventiveDrawer
        selectedPlanDetails={selectedPlanDetails}
        setSelectedPlanDetails={setSelectedPlanDetails}
        setActivePlanToDrag={setActivePlanToDrag}
        equipments={equipments}
        can={can}
        handleTriggerPlan={handleTriggerPlan}
      />
    </div>
  );
};
