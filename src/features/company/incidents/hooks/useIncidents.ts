/**
 * ============================================================================
 * MODULE : Incidents & Demandes d'Intervention - Hook React
 * ============================================================================
 * Ce hook fournit l'état des pannes en cours et les méthodes pour signaler,
 * valider ou rejeter un incident.
 */

import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incident.service';
import { CreateIncidentDto } from '../types/incident.types';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  /**
   * Recharge la liste des incidents depuis le backend
   */
  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentService.getAll();
      setIncidents(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des incidents';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  /**
   * Déclare une panne et actualise l'état global
   */
  const reportIncident = async (dto: CreateIncidentDto) => {
    try {
      const created = await incidentService.create(dto);
      await loadIncidents();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Valide un incident (statut Validé)
   */
  const validateIncident = async (id: number | string) => {
    try {
      await incidentService.updateStatus(id, 'Validé');
      await loadIncidents();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Rejette un incident avec un motif
   */
  const rejectIncident = async (id: number | string, commentaireRejet: string) => {
    try {
      await incidentService.updateStatus(id, 'Rejeté', commentaireRejet);
      await loadIncidents();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    loadIncidents,
    reportIncident,
    validateIncident,
    rejectIncident
  };
};
