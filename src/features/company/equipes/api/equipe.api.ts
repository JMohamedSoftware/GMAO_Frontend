/**
 * ============================================================================
 * MODULE : Équipes de Maintenance (Equipes) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Equipes`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { CreateEquipeDto, UpdateEquipeDto } from '../types/equipe.types';

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
