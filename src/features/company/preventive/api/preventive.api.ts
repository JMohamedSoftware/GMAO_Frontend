// ================================================
// src/features/company/preventive/api/preventive.api.ts
// ================================================

import axios from 'axios';
import type { PlanPreventif, CreatePlanDto, GenererOTResponse, TachePreventive } from '../types/preventive.types';

const rawUrl = import.meta.env.VITE_API_URL || 'https://gmao-backend-a6r2.onrender.com';
const API_BASE = rawUrl.replace(/\/api\/?$/, '') + '/api';

const getHeaders = () => {
  const token = localStorage.getItem('gmao_access_token');
  return { headers: { Authorization: token ? `Bearer ${token}` : '' } };
};

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

const toRequestBody = (dto: CreatePlanDto) => ({
  equipementId:      dto.equipementId,
  titre:             dto.titre,
  description:       dto.description,
  typeDeclenchement: dto.typeDeclenchement,
  frequence:         dto.frequence,
  uniteMesure:       dto.uniteMesure,
  derniereDate:      dto.derniereDate  ? new Date(dto.derniereDate).toISOString()  : null,
  prochaineDate:     dto.prochaineDate ? new Date(dto.prochaineDate).toISOString() : null,
  taches: (dto.taches || []).map(t => ({
    description:         t.description,
    dureeEstimeeMinutes: t.dureeEstimeeMinutes ?? null,
    estObligatoire:      t.estObligatoire,
  })),
});

// ── API functions ─────────────────────────────────────────────────────────────

/** GET /api/PlansPreventif — returns all active plans */
export const getPlansPreventifs = async (): Promise<PlanPreventif[]> => {
  const res = await axios.get(`${API_BASE}/PlansPreventif`, getHeaders());
  return (res.data as any[]).map(mapPlan);
};

/** GET /api/PlansPreventif/:id */
export const getPlanPreventifById = async (id: number): Promise<PlanPreventif> => {
  const res = await axios.get(`${API_BASE}/PlansPreventif/${id}`, getHeaders());
  return mapPlan(res.data);
};

/** POST /api/PlansPreventif */
export const createPlan = async (dto: CreatePlanDto): Promise<PlanPreventif> => {
  const res = await axios.post(`${API_BASE}/PlansPreventif`, toRequestBody(dto), getHeaders());
  // Backend returns { id } — refetch the full plan
  return getPlanPreventifById(res.data.id);
};

/** PUT /api/PlansPreventif/:id */
export const updatePlan = async (id: number, dto: CreatePlanDto): Promise<void> => {
  await axios.put(`${API_BASE}/PlansPreventif/${id}`, toRequestBody(dto), getHeaders());
};

/** DELETE /api/PlansPreventif/:id (soft delete — sets actif=false) */
export const deletePlan = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/PlansPreventif/${id}`, getHeaders());
};

/** POST /api/PlansPreventif/:id/generer-ot */
export const genererOT = async (planId: number): Promise<GenererOTResponse> => {
  const res = await axios.post(`${API_BASE}/PlansPreventif/${planId}/generer-ot`, {}, getHeaders());
  return res.data as GenererOTResponse;
};

/** PUT /api/PlansPreventif/:id/replanifier */
export const replanifier = async (planId: number, nouvelleDate: string): Promise<void> => {
  await axios.put(
    `${API_BASE}/PlansPreventif/${planId}/replanifier`,
    { nouvelleDate: new Date(nouvelleDate).toISOString() },
    getHeaders(),
  );
};
