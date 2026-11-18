/**
 * ============================================================================
 * MODULE : Magasin & Pièces de Rechange (Inventory) - Hook React
 * ============================================================================
 * Fournit l'état du stock, les alertes de réapprovisionnement et les actions
 * de création ou mouvement de pièces.
 */

import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services/inventory.service';
import { CreateSparePartDto, CreateStockMovementDto } from '../types/inventory.types';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useInventory = () => {
  const [parts, setParts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  /**
   * Recharge la liste des pièces et mouvements
   */
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [partsData, movementsData] = await Promise.all([
        inventoryService.getParts(),
        inventoryService.getMovements()
      ]);
      setParts(partsData);
      setMovements(movementsData);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement du stock';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  /**
   * Ajoute une nouvelle pièce
   */
  const addPart = async (dto: CreateSparePartDto) => {
    try {
      const created = await inventoryService.createPart(dto);
      await loadInventory();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Enregistre un mouvement d'entrée ou sortie
   */
  const recordMovement = async (dto: CreateStockMovementDto) => {
    try {
      const result = await inventoryService.createMovement(dto);
      await loadInventory();
      await dispatch(fetchTenantDataAsync());
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    parts,
    movements,
    loading,
    error,
    loadInventory,
    addPart,
    recordMovement
  };
};
