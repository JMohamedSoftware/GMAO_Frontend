// ================================================
// src/features/company/preventive/api/preventive.api.ts
// ================================================

import { apiClient } from '@/shared/services/apiClient';
import type { PlanPreventif, CreatePlanDto, GenererOTResponse, TachePreventive } from '../types/preventive.types';

// ── Mapper ────────────────────────────────────────────────────────────────────

const mapPlan = (p: any): PlanPreventif => ({
  id:                p.id,
  titre:             p.titre || '',
  description:       p.description,
  typeDeclenchement: p.typeDeclenchement as 1 | 2 | 3,
  frequence:         p.frequence || 0,
  uniteMesure:       p.uniteMesure,
  derniereDate:      p.derniereDate?.split('T')[0],
  prochaineDate:     p.prochaineDate?.split('T')[0],
  actif:             p.actif ?? true,
  equipementId:      p.equipementId,
  equipementNom:     p.equipementNom,
  equipementFamille: p.equipementFamille,
  taches:            (p.taches || []).map((t: any): TachePreventive => ({
    id:                  t.id,
    description:         t.description,
    ordre:               t.ordre,
    dureeEstimeeMinutes: t.dureeEstimeeMinutes,
    estObligatoire:      t.estObligatoire ?? true,
  })),
});

const toUtcIso = (d: string | null | undefined): string | null => {
  if (!d) return null;
  const dateObj = new Date(d);
  return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
};

const toRequestBody = (dto: CreatePlanDto) => ({
  equipementId:      dto.equipementId,
  titre:             dto.titre,
  description:       dto.description,
  typeDeclenchement: dto.typeDeclenchement,
  frequence:         dto.frequence,
  uniteMesure:       dto.uniteMesure,
  derniereDate:      toUtcIso(dto.derniereDate),
  prochaineDate:     toUtcIso(dto.prochaineDate),
  taches: (dto.taches || []).map(t => ({
    description:         t.description,
    dureeEstimeeMinutes: t.dureeEstimeeMinutes ?? null,
    estObligatoire:      t.estObligatoire,
  })),
});

// ── API functions ─────────────────────────────────────────────────────────────

/** GET /api/PlansPreventif — returns all active plans */
export const getPlansPreventifs = async (): Promise<PlanPreventif[]> => {
  const res = await apiClient.get('/api/PlansPreventif');
  return (res.data as any[]).map(mapPlan);
};

/** GET /api/PlansPreventif/:id */
export const getPlanPreventifById = async (id: number): Promise<PlanPreventif> => {
  const res = await apiClient.get(`/api/PlansPreventif/${id}`);
  return mapPlan(res.data);
};

/** POST /api/PlansPreventif */
export const createPlan = async (dto: CreatePlanDto): Promise<PlanPreventif> => {
  const res = await apiClient.post('/api/PlansPreventif', toRequestBody(dto));
  // Backend returns { id } — refetch the full plan
  return getPlanPreventifById(res.data.id);
};

/** PUT /api/PlansPreventif/:id */
export const updatePlan = async (id: number, dto: CreatePlanDto): Promise<void> => {
  await apiClient.put(`/api/PlansPreventif/${id}`, toRequestBody(dto));
};

/** DELETE /api/PlansPreventif/:id (soft delete — sets actif=false) */
export const deletePlan = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/PlansPreventif/${id}`);
};

/** POST /api/PlansPreventif/:id/generer-ot */
export const genererOT = async (planId: number): Promise<GenererOTResponse> => {
  const res = await apiClient.post(`/api/PlansPreventif/${planId}/generer-ot`, {});
  return res.data as GenererOTResponse;
};

/** PUT /api/PlansPreventif/:id/replanifier */
export const replanifier = async (planId: number, nouvelleDate: string): Promise<void> => {
  const isoDate = toUtcIso(nouvelleDate) || new Date().toISOString();
  await apiClient.put(
    `/api/PlansPreventif/${planId}/replanifier`,
    { nouvelleDate: isoDate }
  );
};
