/**
 * ============================================================================
 * MODULE : Parc Équipements & Machines - Hook React
 * ============================================================================
 * Fournit l'état des machines du parc, le chargement, et les actions
 * de création, modification et suppression.
 */

import { useState, useEffect, useCallback } from 'react';
import { equipmentService } from '../services/equipment.service';
import { Equipment } from '@/shared/types/gmao';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useEquipments = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  /**
   * Recharge la liste des machines depuis le backend
   */
  const loadEquipments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getAll();
      setEquipments(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des équipements';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipments();
  }, [loadEquipments]);

  /**
   * Enregistre un nouvel équipement
   */
  const addEquipment = async (equipment: Partial<Equipment>) => {
    try {
      const created = await equipmentService.create(equipment);
      await loadEquipments();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Met à jour une machine
   */
  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      await equipmentService.update(id, updates);
      await loadEquipments();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Supprime un équipement
   */
  const deleteEquipment = async (id: string) => {
    try {
      await equipmentService.delete(id);
      await loadEquipments();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    equipments,
    loading,
    error,
    loadEquipments,
    addEquipment,
    updateEquipment,
    deleteEquipment
  };
};
