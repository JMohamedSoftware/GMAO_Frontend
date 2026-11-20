import { apiClient } from '@/shared/services/apiClient';
import { Equipment } from '@/shared/types/gmao';
import { normalizeEquipmentCriticality, normalizeEquipmentStatus, resolveFamilleId } from '../api/equipment.api';

export const equipmentService = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/api/equipement');
    
    return response.data.map((dto: any) => ({
      id: dto.id.toString(),
      name: dto.designation,
      category: dto.familleNom || dto.category || 'Autre',
      subFamily: dto.familleNom || dto.category || 'Autre',
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
      category: dto.familleNom || dto.category || 'Autre',
      subFamily: dto.familleNom || dto.category || 'Autre',
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
    const catId = resolveFamilleId(equipment.category);
    const dto = {
      code: equipment.code || equipment.id || `EQ-${Date.now()}`,
      designation: equipment.name,
      name: equipment.name,
      familleId: catId > 0 ? catId : undefined,
      familleNom: equipment.category || '',
      category: equipment.category || '',
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
    const catId = equipment.category ? resolveFamilleId(equipment.category) : 0;
    const payload = {
      ...equipment,
      familleId: catId > 0 ? catId : undefined,
      familleNom: equipment.category,
      category: equipment.category
    };
    const response = await apiClient.put(`/api/equipement/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/equipement/${id}`);
  }
};

// Aliased export for compatibility
export const equipementService = equipmentService;
