/**
 * ============================================================================
 * MODULE : Équipes de Maintenance (Equipes) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Equipes`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateEquipeDto, UpdateEquipeDto } from '../types/equipe.types';

export const fetchEquipes = async (): Promise<any[]> => {
  const response = await apiClient.get('/api/Equipes');
  return response.data.map((e: any) => ({
    id: e.id?.toString(),
    nom: e.nom,
    description: e.description || '',
    couleur: 'bg-slate-500',
    chefId: e.chefEquipeId?.toString(),
    technicienIds: e.membres?.map((m: any) => m.id.toString()) || []
  }));
};

export const createEquipeApi = async (equipe: any): Promise<any> => {
  const payload = {
    nom: equipe.nom,
    description: equipe.description,
    chefEquipeId: equipe.chefId ? parseInt(equipe.chefId) : null,
    membreIds: equipe.technicienIds ? equipe.technicienIds.map((id: string) => parseInt(id)) : [],
    societeId: 1
  };
  const response = await apiClient.post('/api/Equipes', payload);
  const e = response.data;
  return {
    id: e.id?.toString(),
    nom: e.nom,
    description: e.description || '',
    couleur: 'bg-slate-500',
    chefId: e.chefEquipeId?.toString(),
    technicienIds: e.membres?.map((m: any) => m.id.toString()) || []
  };
};

export const updateEquipeApi = async (id: string, equipe: any): Promise<void> => {
  const payload = {
    nom: equipe.nom,
    description: equipe.description,
    chefEquipeId: equipe.chefId ? parseInt(equipe.chefId) : null,
    membreIds: equipe.technicienIds ? equipe.technicienIds.map((id: string) => parseInt(id)) : [],
    societeId: 1
  };
  await apiClient.put(`/api/Equipes/${id}`, payload);
};

export const deleteEquipeApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/Equipes/${id}`);
};

export const fetchEquipesApiCall = async () => {
  const response = await apiClient.get('/api/Equipes');
  return response.data;
};

export const fetchEquipeByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Equipes/${id}`);
  return response.data;
};

export const createEquipeApiCall = async (dto: CreateEquipeDto) => {
  const response = await apiClient.post('/api/Equipes', dto);
  return response.data;
};

export const updateEquipeApiCall = async (id: number | string, dto: Partial<UpdateEquipeDto>) => {
  const response = await apiClient.put(`/api/Equipes/${id}`, { id: Number(id), ...dto });
  return response.data;
};

export const deleteEquipeApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Equipes/${id}`);
};
