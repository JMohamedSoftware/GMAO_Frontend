/**
 * ============================================================================
 * MODULE : Ordres de Travail (Work Orders) - Hook React
 * ============================================================================
 * Ce hook fournit l'état et les méthodes pour manipuler les ordres de travail
 * dans n'importe quel composant de l'application sans duplication de code.
 */

import { useState, useEffect, useCallback } from 'react';
import { workOrderService } from '../services/workOrder.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../types/workOrder.types';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  /**
   * Recharge la liste des ordres de travail depuis le backend
   */
  const loadWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workOrderService.getAll();
      setWorkOrders(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des OTs';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkOrders();
  }, [loadWorkOrders]);

  /**
   * Crée un nouvel OT et synchronise l'état global Redux
   */
  const createWorkOrder = async (dto: CreateWorkOrderDto) => {
    try {
      const created = await workOrderService.create(dto);
      await loadWorkOrders();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Met à jour un OT existant
   */
  const updateWorkOrder = async (id: number | string, dto: Partial<UpdateWorkOrderDto>) => {
    try {
      const updated = await workOrderService.update(id, dto);
      await loadWorkOrders();
      await dispatch(fetchTenantDataAsync());
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Supprime un OT
   */
  const deleteWorkOrder = async (id: number | string) => {
    try {
      await workOrderService.delete(id);
      await loadWorkOrders();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    workOrders,
    loading,
    error,
    loadWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder
  };
};
