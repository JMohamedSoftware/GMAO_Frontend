import { useState, useEffect, useCallback } from 'react';
import { campaignService } from '../services/campaign.service';
import { Campagne, CreateCampagneDto, EtatCampagne } from '../types/campaign.types';
import { useAppDispatch } from '@/app/hooks';
import { setSelectedCampaign, fetchTenantDataAsync } from '@/app/gmaoSlice';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campagne[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getAll();
      setCampaigns(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du chargement des campagnes';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const activeCampaign = campaigns.find(c => c.etat === EtatCampagne.EnCours);

  const createCampaign = async (dto: CreateCampagneDto) => {
    try {
      const created = await campaignService.create(dto);
      if (dto.etat === EtatCampagne.EnCours) {
        dispatch(setSelectedCampaign(dto.nom.trim()));
      }
      await fetchCampaigns();
      await dispatch(fetchTenantDataAsync());
      return created;
    } catch (err: any) {
      throw err;
    }
  };

  const cloturerCampaign = async (id: number) => {
    try {
      await campaignService.cloturer(id);
      await fetchCampaigns();
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      throw err;
    }
  };

  return {
    campaigns,
    activeCampaign,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    cloturerCampaign
  };
};
