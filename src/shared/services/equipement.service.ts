import { apiClient } from './apiClient';
import { Equipment } from '../types/gmao';

export const equipementService = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/api/equipement');
    
    // Map backend DTO to frontend Equipment interface
    return response.data.map((dto: any) => ({
      id: dto.id.toString(),
      name: dto.designation,
      category: dto.familleNom,
      subFamily: dto.familleNom, // Adjust mapping if subFamily exists in backend
      brand: dto.marque || '',
      model: dto.modele || '',
      serialNumber: dto.numeroSerie || '',
      supplierId: dto.fournisseurId?.toString(),
      purchaseDate: dto.dateAchat?.toString(),
      endOfWarranty: dto.dateFinGarantie?.toString(),
      commissionDate: dto.dateMiseEnService?.toString() || new Date().toISOString(),
      location: dto.localisationNom,
      criticality: dto.criticite,
      status: dto.etat,
      healthIndex: 100, // Not available in basic backend DTO
      lastMaintenance: new Date().toISOString(), // Fallback
      nextMaintenance: new Date().toISOString(), // Fallback
      hoursCount: 0,
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
      location: dto.localisationNom,
      criticality: dto.criticite,
      status: dto.etat,
      healthIndex: 100,
      lastMaintenance: new Date().toISOString(),
      nextMaintenance: new Date().toISOString(),
      hoursCount: 0,
      cycleCount: 0,
      documents: [],
      photos: dto.photoUrl ? [dto.photoUrl] : [],
      sensors: [],
      spareParts: []
    };
  },

  create: async (equipment: Partial<Equipment>): Promise<Equipment> => {
    const dto = {
      code: `EQ-${Date.now()}`, // Auto generated or let backend handle it
      designation: equipment.name,
      familleId: 1, // Default or map correctly
      localisationId: 1, // Default or map correctly
      marque: equipment.brand,
      modele: equipment.model,
      numeroSerie: equipment.serialNumber,
      criticite: 1, // Need to map enum (1 = Faible, 2 = Moyenne, etc.)
      etat: 1, // Need to map enum
      notes: ''
    };
    const response = await apiClient.post('/api/equipement', dto);
    // You can refetch or just return mapped
    return response.data;
  },

  update: async (id: string, equipment: Partial<Equipment>): Promise<void> => {
    // In a full implementation, you'd send the full modified DTO
    // For now we'll do a partial stub to keep compilation happy
    const response = await apiClient.put(`/api/equipement/${id}`, equipment);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/equipement/${id}`);
  }
};
