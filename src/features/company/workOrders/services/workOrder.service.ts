import { apiClient } from '@/shared/services/apiClient';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../types/workOrder.types';

const typeToInt = (type: string): number => {
  switch (type) {
    case 'Préventif':   return 2;
    case 'Prédictif':   return 3;
    case 'Amélioratif': return 4;
    default:            return 1; // Correctif
  }
};

const priorityToInt = (priority: string): number => {
  switch (priority) {
    case 'Faible':   return 1;
    case 'Haute':    return 3;
    case 'Critique': return 4;
    default:         return 2; // Moyenne
  }
};

export const workOrderService = {
  getAll: async () => {
    const res = await apiClient.get('/api/OrdresTravail');
    return res.data;
  },

  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/OrdresTravail/${id}`);
    return res.data;
  },

  create: async (dto: CreateWorkOrderDto) => {
    const userStr = localStorage.getItem('gmao_current_user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    const currentUserId = userObj?.id ? parseInt(userObj.id, 10) : 1;

    const payload = {
      numeroOT: '', // Backend auto-generates sequential number per company
      demandeId: dto.incidentId ? parseInt(dto.incidentId, 10) : null,
      equipementId: parseInt(dto.equipmentId, 10),
      responsableId: dto.responsableId || currentUserId || 1,
      technicienId: dto.technicianId ? parseInt(dto.technicianId, 10) : null,
      priorite: priorityToInt(dto.priority),
      typeMaintenance: typeToInt(dto.type),
      statut: 1, // Cree
      dateCreation: new Date().toISOString(),
      dateDebutPrevue: dto.dateDebutPrevue || null,
      dateFinPrevue: dto.dateFinPrevue || null,
      description: dto.title || dto.description,
      instructions: dto.description || null,
      campagneId: dto.campagneId || null
    };

    const res = await apiClient.post('/api/OrdresTravail', payload);
    return res.data;
  },

  update: async (id: number | string, dto: Partial<UpdateWorkOrderDto>) => {
    const res = await apiClient.put(`/api/OrdresTravail/${id}`, { id, ...dto });
    return res.data;
  },

  updateStatus: async (id: number | string, statut: number) => {
    const res = await apiClient.put(`/api/OrdresTravail/${id}`, { id: Number(id), statut });
    return res.data;
  },

  delete: async (id: number | string) => {
    await apiClient.delete(`/api/OrdresTravail/${id}`);
  }
};
