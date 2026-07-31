// ================================================
// src/features/company/preventive/hooks/usePreventive.ts
// ================================================

import { useState, useCallback } from 'react';
import type { PlanPreventif, CreatePlanDto, PreventiveState } from '../types/preventive.types';
import {
  getPlansPreventifs,
  createPlan,
  updatePlan,
  deletePlan,
  genererOT,
  replanifier,
} from '../api/preventive.api';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePreventive() {
  const [state, setState] = useState<PreventiveState>({
    plans: [],
    status: 'idle',
    error: null,
  });

  const setLoading = () => setState(s => ({ ...s, status: 'loading', error: null }));
  const setError   = (msg: string) => setState(s => ({ ...s, status: 'error', error: msg }));

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadPlans = useCallback(async () => {
    setLoading();
    try {
      const plans = await getPlansPreventifs();
      setState({ plans, status: 'success', error: null });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur de chargement';
      setError(msg);
    }
  }, []);

  // ── Create ────────────────────────────────────────────────────────────────

  const addPlan = useCallback(async (dto: CreatePlanDto): Promise<PlanPreventif> => {
    const created = await createPlan(dto);
    setState(s => ({ ...s, plans: [...s.plans, created] }));
    return created;
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────

  const editPlan = useCallback(async (id: number, dto: CreatePlanDto): Promise<void> => {
    await updatePlan(id, dto);
    // Refresh the single plan from state (optimistic update of all fields)
    setState(s => ({
      ...s,
      plans: s.plans.map(p =>
        p.id === id
          ? { ...p, ...dto, id }
          : p
      ),
    }));
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────

  const removePlan = useCallback(async (id: number): Promise<void> => {
    await deletePlan(id);
    setState(s => ({ ...s, plans: s.plans.filter(p => p.id !== id) }));
  }, []);

  // ── Générer OT ────────────────────────────────────────────────────────────

  const triggerOT = useCallback(async (plan: PlanPreventif): Promise<string> => {
    const result = await genererOT(plan.id);
    // Update local plan dates
    setState(s => ({
      ...s,
      plans: s.plans.map(p =>
        p.id === plan.id
          ? {
              ...p,
              prochaineDate: result.prochaineDate?.split('T')[0],
              derniereDate:  new Date().toISOString().split('T')[0],
            }
          : p
      ),
    }));
    return result.numeroOT;
  }, []);

  // ── Replanifier (drag & drop) ─────────────────────────────────────────────

  const reschedule = useCallback(async (planId: number, newDate: string): Promise<void> => {
    await replanifier(planId, newDate);
    setState(s => ({
      ...s,
      plans: s.plans.map(p =>
        p.id === planId ? { ...p, prochaineDate: newDate } : p
      ),
    }));
  }, []);

  return {
    // State
    plans:   state.plans,
    status:  state.status,
    error:   state.error,
    isLoading: state.status === 'loading',

    // Actions
    loadPlans,
    addPlan,
    editPlan,
    removePlan,
    triggerOT,
    reschedule,
  };
}
