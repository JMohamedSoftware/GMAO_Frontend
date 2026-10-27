import { useState, useEffect, useCallback } from 'react';
import { Localisation } from '../types/gmao';
import { localisationsApi } from '../api/localisations.api';
import { useAppSelector } from '@/app/hooks';

export const useLocalisations = () => {
  const [localisations, setLocalisations] = useState<Localisation[]>([]);
  const [tree, setTree] = useState<Localisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const impersonatedTenantId = useAppSelector(s => s.gmao.impersonatedTenantId);
  const currentTenantId = useAppSelector(s => s.gmao.currentTenantId);
  const activeTenantId = impersonatedTenantId || currentTenantId;

  const fetchLocalisations = useCallback(async () => {
    try {
      setLoading(true);
      const [allNodes, treeNodes] = await Promise.all([
        localisationsApi.getAll(),
        localisationsApi.getTree()
      ]);
      setLocalisations(allNodes);
      setTree(treeNodes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des localisations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocalisations();
  }, [activeTenantId, fetchLocalisations]);

  const createLocalisation = async (data: Partial<Localisation>) => {
    try {
      const created = await localisationsApi.create(data);
      await fetchLocalisations();
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  const updateLocalisation = async (id: number, data: Partial<Localisation>) => {
    try {
      const updated = await localisationsApi.update(id, data);
      await fetchLocalisations();
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteLocalisation = async (id: number) => {
    try {
      await localisationsApi.delete(id);
      await fetchLocalisations();
    } catch (err: any) {
      if (err.response?.data) {
        throw new Error(err.response.data);
      }
      throw err;
    }
  };

  return {
    localisations,
    tree,
    loading,
    error,
    createLocalisation,
    updateLocalisation,
    deleteLocalisation,
    refresh: fetchLocalisations
  };
};
