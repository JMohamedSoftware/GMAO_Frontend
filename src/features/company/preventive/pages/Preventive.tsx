import React, { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useGmao } from '@/shared/hooks/useGmao';
import { PlanPreventif } from '@/shared/types/gmao';
import {
  fetchPlansPreventifs,
  createPlanPreventif,
  updatePlanPreventif,
  genererOTPreventif,
  replanifierPlanPreventif
} from '@/shared/api/dataFetch.api';
import { PreventivePlanList } from '../components/PreventivePlanList';
import { PreventiveCalendar } from '../components/PreventiveCalendar';
import { PreventiveDrawer } from '../components/PreventiveDrawer';
import { PreventiveModal } from '../components/PreventiveModal';

interface PreventiveProps {
  onNavigate: (screen: string) => void;
}

export const Preventive: React.FC<PreventiveProps> = ({ onNavigate }) => {
  const { equipments, technicians } = useGmao();
  const { can } = usePermissions();

  // ── State ──────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<PlanPreventif[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const [selectedPlan, setSelectedPlan] = useState<PlanPreventif | null>(null);
  const [activePlanToDrag, setActivePlanToDrag] = useState<PlanPreventif | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanPreventif | null>(null);

  // Filters
  const [filterEq, setFilterEq] = useState('');
  const [filterFam, setFilterFam] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [filterPrio, setFilterPrio] = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Load plans from backend ────────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPlansPreventifs();
      setPlans(data);
    } catch (err) {
      console.error('Erreur chargement plans préventifs:', err);
      showToast('Erreur de chargement des plans', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGenererOT = async (plan: PlanPreventif) => {
    try {
      const result = await genererOTPreventif(plan.id);
      // Update local plan date
      setPlans(prev => prev.map(p =>
        p.id === plan.id ? { ...p, prochaineDate: result.prochaineDate?.split('T')[0], derniereDate: new Date().toISOString().split('T')[0] } : p
      ));
      showToast(`✅ OT créé : ${result.numeroOT}`, 'success');
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la génération de l\'OT', 'error');
    }
  };

  const handleDropOnDay = async (dateStr: string) => {
    if (!activePlanToDrag || !dateStr) return;
    try {
      await replanifierPlanPreventif(activePlanToDrag.id, dateStr);
      setPlans(prev => prev.map(p =>
        p.id === activePlanToDrag.id ? { ...p, prochaineDate: dateStr } : p
      ));
      showToast(`📅 Plan replanifié au ${dateStr}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la replanification', 'error');
    }
    setActivePlanToDrag(null);
  };

  const handleSavePlan = async (payload: Omit<PlanPreventif, 'id'>) => {
    try {
      if (editingPlan) {
        await updatePlanPreventif(editingPlan.id, payload);
        showToast('Plan mis à jour avec succès', 'success');
      } else {
        await createPlanPreventif(payload);
        showToast('Plan créé avec succès', 'success');
      }
      setShowModal(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleOpenEdit = (plan: PlanPreventif) => {
    setEditingPlan(plan);
    setShowModal(true);
    setSelectedPlan(null);
  };

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const buildCalendarCells = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const cells: { dateStr: string; dayNum: number }[] = [];
    for (let i = 0; i < startDay; i++) cells.push({ dateStr: '', dayNum: 0 });
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: day });
    }
    return cells;
  };

  const calendarCells = buildCalendarCells();

  const getEventsForDay = (dateStr: string) => {
    if (!dateStr) return [];
    return plans.filter(p => {
      if (filterEq && p.equipementId.toString() !== filterEq) return false;
      if (filterFam && p.equipementFamille !== filterFam) return false;
      return p.prochaineDate === dateStr;
    }).map(p => ({
      id: p.id.toString(),
      title: p.titre,
      status: 'Planifié',
      type: 'plan',
      priority: 'Haute' as const,
      plan: p
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critique': return 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400';
      case 'Haute':    return 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'Moyenne':  return 'border-primary bg-primary/10 text-primary';
      default:         return 'border-slate-300 bg-slate-100 text-slate-650';
    }
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const goToPrevMonth = () => setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  const goToToday    = () => { const n = new Date(); setCurrentMonth(new Date(n.getFullYear(), n.getMonth(), 1)); };

  // Coverage stats
  const plansThisMonth = plans.filter(p => p.prochaineDate?.startsWith(
    `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
  ));
  const totalActive = plans.length;

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Calendrier Maintenance Préventive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Planification périodique des contrôles réglementaires et gammes de maintenance
          </p>
        </div>

        {/* Coverage bar */}
        <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm min-w-[250px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Plans ce mois
            </span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {plansThisMonth.length} / {totalActive}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: totalActive > 0 ? `${Math.round((plansThisMonth.length / totalActive) * 100)}%` : '0%' }}
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5">
            {totalActive} plans préventifs actifs au total
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-500 text-sm">Chargement des plans préventifs…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left: Plan list */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <PreventivePlanList
              plans={plans}
              equipments={equipments}
              activePlanToDrag={activePlanToDrag}
              onSelectPlan={(p) => { setActivePlanToDrag(p); setSelectedPlan(p); }}
              onGenererOT={handleGenererOT}
              onNewPlan={handleOpenCreate}
              can={can}
            />
          </div>

          {/* Right: Calendar */}
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
            onEventClick={(plan) => setSelectedPlan(plan)}
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
            onNewPlan={handleOpenCreate}
          />
        </div>
      )}

      {/* Drawer */}
      <PreventiveDrawer
        plan={selectedPlan}
        onClose={() => { setSelectedPlan(null); setActivePlanToDrag(null); }}
        onEdit={handleOpenEdit}
        onGenererOT={handleGenererOT}
        can={can}
      />

      {/* Modal create/edit */}
      {showModal && (
        <PreventiveModal
          editingPlan={editingPlan}
          equipments={equipments}
          onSave={handleSavePlan}
          onClose={() => { setShowModal(false); setEditingPlan(null); }}
        />
      )}
    </div>
  );
};
