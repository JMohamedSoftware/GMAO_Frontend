/**
 * ============================================================================
 * MODULE : Fournisseurs & Prestataires (Suppliers) - Hook React
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplier.service';
import { CreateSupplierDto } from '../types/supplier.types';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des fournisseurs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const addSupplier = async (dto: CreateSupplierDto) => {
    try {
      const created = await supplierService.create(dto);
      await loadSuppliers();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  const removeSupplier = async (id: number | string) => {
    try {
      await supplierService.delete(id);
      await loadSuppliers();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    loadSuppliers,
    addSupplier,
    removeSupplier
  };
};
