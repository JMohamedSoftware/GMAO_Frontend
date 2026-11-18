/**
 * ============================================================================
 * MODULE : Utilisateurs & Comptes (Users) - Hook React
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import { CreateUserDto } from '../types/user.types';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des utilisateurs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = async (dto: CreateUserDto) => {
    try {
      const created = await userService.create(dto);
      await loadUsers();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  const removeUser = async (id: number | string) => {
    try {
      await userService.delete(id);
      await loadUsers();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    removeUser
  };
};
