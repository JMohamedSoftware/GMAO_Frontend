/**
 * ============================================================================
 * MODULE : Équipes de Maintenance (Equipes) - Hook React
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { equipeService } from '../services/equipe.service';
import { CreateEquipeDto } from '../types/equipe.types';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useEquipes = () => {
  const [equipes, setEquipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const loadEquipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipeService.getAll();
      setEquipes(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des équipes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipes();
  }, [loadEquipes]);

  const addEquipe = async (dto: CreateEquipeDto) => {
    try {
      const created = await equipeService.create(dto);
      await loadEquipes();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  const removeEquipe = async (id: number | string) => {
    try {
      await equipeService.delete(id);
      await loadEquipes();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    equipes,
    loading,
    error,
    loadEquipes,
    addEquipe,
    removeEquipe
  };
};
