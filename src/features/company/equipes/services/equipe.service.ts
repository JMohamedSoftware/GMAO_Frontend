/**
 * ============================================================================
 * MODULE : Équipes de Maintenance (Equipes) - Service Métier
 * ============================================================================
 */

import { 
  fetchEquipesApiCall, 
  fetchEquipeByIdApiCall, 
  createEquipeApiCall, 
  updateEquipeApiCall, 
  deleteEquipeApiCall 
} from '../api/equipe.api';
import { CreateEquipeDto, UpdateEquipeDto } from '../types/equipe.types';

export const equipeService = {
  getAll: async () => {
    return await fetchEquipesApiCall();
  },

  getById: async (id: number | string) => {
    return await fetchEquipeByIdApiCall(id);
  },

  create: async (dto: CreateEquipeDto) => {
    return await createEquipeApiCall(dto);
  },

  update: async (id: number | string, dto: Partial<UpdateEquipeDto>) => {
    return await updateEquipeApiCall(id, dto);
  },

  delete: async (id: number | string) => {
    await deleteEquipeApiCall(id);
  }
};
