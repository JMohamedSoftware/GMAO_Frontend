import { apiClient } from '@/shared/services/apiClient';
import { CreateIncidentDto, UpdateIncidentDto, IncidentUrgency } from '../types/incident.types';

const urgencyToInt = (urgency: IncidentUrgency): number => {
  switch (urgency) {
    case 'Faible':   return 1;
    case 'Haute':    return 3;
    case 'Critique': return 4;
    default:         return 2; // Moyenne
  }
};

const statusToInt = (status: string): number => {
  switch (status) {
    case 'Validé':           return 2;
    case 'Rejeté':           return 3;
    case 'Transformé en OT': return 4;
    case 'Clos':             return 5;
    default:                 return 1; // En attente / Nouveau
  }
};

export const incidentService = {
  getAll: async () => {
    const res = await apiClient.get('/api/Incidents');
    return res.data;
  },

  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/Incidents/${id}`);
    return res.data;
  },

  create: async (dto: CreateIncidentDto) => {
    const userStr = localStorage.getItem('gmao_current_user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;

    const payload = {
      equipementId: parseInt(dto.equipmentId, 10),
      demandeurId: currentUserId,
      datePanne: new Date().toISOString(),
      description: dto.description,
      priorite: urgencyToInt(dto.urgency),
      statut: 1, // EnAttente
      photoUrl: dto.photoUrl || null,
      commentaireRejet: null
    };

    const res = await apiClient.post('/api/Incidents', payload);
    return res.data;
  },

  updateStatus: async (id: number | string, status: string, commentaireRejet?: string) => {
    const payload = {
      id: Number(id),
      statut: statusToInt(status),
      commentaireRejet: commentaireRejet || null
    };
    const res = await apiClient.put(`/api/Incidents/${id}`, payload);
    return res.data;
  },

  delete: async (id: number | string) => {
    await apiClient.delete(`/api/Incidents/${id}`);
  }
};
