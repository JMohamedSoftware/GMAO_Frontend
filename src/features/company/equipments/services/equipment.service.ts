import { apiClient } from '@/shared/services/apiClient';
import { Equipment } from '@/shared/types/gmao';
import { normalizeEquipmentCriticality, normalizeEquipmentStatus } from '@/shared/api/dataFetch.api';

export const equipmentService = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/api/equipement');
    
    return response.data.map((dto: any) => ({
      id: dto.id.toString(),
      name: dto.designation,
      category: dto.familleNom,
      subFamily: dto.familleNom,
      brand: dto.marque || '',
      model: dto.modele || '',
      serialNumber: dto.numeroSerie || '',
      supplierId: dto.fournisseurId?.toString(),
      purchaseDate: dto.dateAchat?.toString(),
      endOfWarranty: dto.dateFinGarantie?.toString(),
      commissionDate: dto.dateMiseEnService?.toString() || new Date().toISOString(),
      localisationId: dto.localisationId,
      criticality: normalizeEquipmentCriticality(dto.criticite),
      status: normalizeEquipmentStatus(dto.etat),
      healthIndex: 100,
      lastMaintenance: new Date().toISOString(),
      nextMaintenance: new Date().toISOString(),
      hoursCount: dto.hoursCount || 0,
      cycleCount: 0,
      documents: [],
      photos: dto.photoUrl ? [dto.photoUrl] : [],
      sensors: [],
      spareParts: []
    }));
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get(`/api/equipement/${id}`);
    const dto = response.data;
    
    return {
      id: dto.id.toString(),
      name: dto.designation,
      category: dto.familleNom,
      subFamily: dto.familleNom,
      brand: dto.marque || '',
      model: dto.modele || '',
      serialNumber: dto.numeroSerie || '',
      supplierId: dto.fournisseurId?.toString(),
      purchaseDate: dto.dateAchat?.toString(),
      endOfWarranty: dto.dateFinGarantie?.toString(),
      commissionDate: dto.dateMiseEnService?.toString() || new Date().toISOString(),
      localisationId: dto.localisationId,
      criticality: normalizeEquipmentCriticality(dto.criticite),
      status: normalizeEquipmentStatus(dto.etat),
      healthIndex: 100,
      lastMaintenance: new Date().toISOString(),
      nextMaintenance: new Date().toISOString(),
      hoursCount: dto.hoursCount || 0,
      cycleCount: 0,
      documents: [],
      photos: dto.photoUrl ? [dto.photoUrl] : [],
      sensors: [],
      spareParts: []
    };
  },

  create: async (equipment: Partial<Equipment>): Promise<Equipment> => {
    const dto = {
      code: equipment.code || `EQ-${Date.now()}`,
      designation: equipment.name,
      familleId: 1,
      localisationId: equipment.localisationId || 1,
      marque: equipment.brand,
      modele: equipment.model,
      numeroSerie: equipment.serialNumber,
      criticite: 1,
      etat: 1,
      notes: ''
    };
    const response = await apiClient.post('/api/equipement', dto);
    return response.data;
  },

  update: async (id: string, equipment: Partial<Equipment>): Promise<void> => {
    const response = await apiClient.put(`/api/equipement/${id}`, equipment);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/equipement/${id}`);
  }
};

// Aliased export for compatibility
export const equipementService = equipmentService;
