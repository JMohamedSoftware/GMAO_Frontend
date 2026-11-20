/**
 * ============================================================================
 * MODULE : Parc Équipements & Machines - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Equipement` pour la gestion des machines industrielles.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Equipment } from '@/shared/types/gmao';
import { CreateEquipmentDto } from '../types/equipment.types';

const rawUrl = import.meta.env.VITE_API_URL || 'https://gmao-backend-a6r2.onrender.com';
export const BASE_URL = rawUrl.replace(/\/api\/?$/, '');

export const normalizeEquipmentStatus = (etat: any): Equipment['status'] => {
  if (etat === null || etat === undefined) return 'En service';
  const str = String(etat).trim().toLowerCase().replace(/[\s_-]/g, '');
  if (str === '1' || str === '0' || str === 'enservice' || str === 'enattente') return 'En service';
  if (str === '2' || str === 'enpanne') return 'En panne';
  if (str === '3' || str === 'enmaintenance') return 'En maintenance';
  if (str === '4' || str === 'horsservice') return 'Hors service';
  return 'En service';
};

export const normalizeEquipmentCriticality = (crit: any): Equipment['criticality'] => {
  if (crit === null || crit === undefined) return 'Moyenne';
  const str = String(crit).trim().toLowerCase().replace(/[\s_-]/g, '');
  if (str === '1' || str === 'faible' || str === 'low') return 'Faible';
  if (str === '2' || str === 'moyenne' || str === 'medium') return 'Moyenne';
  if (str === '3' || str === 'haute' || str === 'high') return 'Haute';
  if (str === '4' || str === 'critique' || str === 'critical') return 'Critique';
  return 'Moyenne';
};

export const mapCriticiteToInt = (c: any): number => {
  if (c === null || c === undefined) return 2;
  const str = String(c).trim().toLowerCase().replace(/[\s_-]/g, '');
  if (str === '1' || str === 'faible' || str === 'low') return 1;
  if (str === '2' || str === 'moyenne' || str === 'medium') return 2;
  if (str === '3' || str === 'haute' || str === 'high') return 3;
  if (str === '4' || str === 'critique' || str === 'critical') return 4;
  return 2;
};

export const mapEtatToInt = (e: any): number => {
  if (e === null || e === undefined) return 1;
  const str = String(e).trim().toLowerCase().replace(/[\s_-]/g, '');
  if (str === '1' || str === 'enservice' || str === '0') return 1;
  if (str === '2' || str === 'enpanne') return 2;
  if (str === '3' || str === 'enmaintenance') return 3;
  if (str === '4' || str === 'horsservice') return 4;
  if (str === '5' || str === 'enattente') return 5;
  return 1;
};

export const resolveFamilleId = (cat?: string): number => {
  if (!cat) return 0;
  const c = cat.toLowerCase().trim();
  if (c.includes('chaud') || c.includes('chod')) return 2; // Chaudières
  if (c.includes('pomp')) return 1; // Pompes
  if (c.includes('convoy')) return 3; // Convoyeurs
  if (c.includes('compress')) return 4; // Compresseurs
  if (c.includes('moteur')) return 5; // Moteurs
  if (c.includes('frigo') || c.includes('refrig') || c.includes('réfrig')) return 6; // Réfrigération
  if (c.includes('steril') || c.includes('stéril') || c.includes('autoclave')) return 7; // Stérilisateurs
  if (c.includes('rempliss') || c.includes('dos')) return 8; // Remplisseuses
  return 0; // 0 signifie résolution dynamique côté backend
};

/**
 * Récupère tous les équipements pour Redux
 * GET /api/Equipement
 */
export const fetchEquipments = async (): Promise<Equipment[]> => {
  const response = await apiClient.get('/api/Equipement');
  return response.data.map((e: any) => ({
    id: e.id?.toString(),
    code: e.code || '',
    name: e.designation,
    location: e.localisationNom || '',
    category: e.familleNom || e.category || 'Autre',
    subFamily: e.familleNom || e.category || 'Autre',
    brand: e.marque || '',
    model: e.modele || '',
    serialNumber: e.numeroSerie || '',
    supplierId: e.fournisseurId?.toString(),
    purchaseDate: e.dateAchat,
    endOfWarranty: e.dateFinGarantie,
    commissionDate: e.dateMiseEnService || new Date().toISOString(),
    localisationId: e.localisationId,
    localisation: e.localisationNom ? { id: e.localisationId, nom: e.localisationNom } : undefined,
    criticality: normalizeEquipmentCriticality(e.criticite),
    status: normalizeEquipmentStatus(e.etat),
    healthIndex: 100,
    lastMaintenance: e.updatedAt || new Date().toISOString(),
    nextMaintenance: new Date().toISOString(),
    hoursCount: e.hoursCount || 0,
    cycleCount: 0,
    documents: e.documents?.map((d: any) => ({
      id: d.id,
      name: d.name || d.nom,
      type: d.type || 'autre',
      size: d.size || '0 KB',
      url: d.url?.startsWith('http') ? d.url : `${BASE_URL}${d.url}`,
      uploadedAt: d.createdAt
    })) || [],
    photos: e.photoUrl ? [e.photoUrl] : [],
    sensors: [],
    spareParts: e.piecesIds?.map((id: number) => id.toString()) || [],
    parentId: e.parentEquipementId ? e.parentEquipementId.toString() : undefined
  }));
};

const sanitizeDate = (d?: string | null): string | null => {
  if (!d || d === '-' || d.trim() === '' || d === 'null' || d === 'undefined') return null;
  const match = d.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
};

const sanitizeInt = (v?: any): number | null => {
  if (v === null || v === undefined || v === '' || v === '-' || v === 'null') return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
};

/**
 * Crée un nouvel équipement
 * POST /api/Equipement
 */
export const createEquipmentApi = async (equipment: Partial<Equipment>): Promise<Equipment> => {
  const catId = equipment.category ? resolveFamilleId(equipment.category) : 0;
  const catNom = equipment.category?.trim() || 'Pompes';
  const entity = {
    code: equipment.id || equipment.code || `EQ-${Date.now()}`,
    designation: equipment.name || 'Nouvel Équipement',
    name: equipment.name,
    familleId: catId > 0 ? catId : 1, 
    familleNom: catNom,
    category: catNom,
    localisationId: sanitizeInt(equipment.localisationId) || 1,
    marque: equipment.brand || '',
    modele: equipment.model || '',
    numeroSerie: equipment.serialNumber || '',
    dateAchat: sanitizeDate(equipment.purchaseDate),
    dateMiseEnService: sanitizeDate(equipment.commissionDate) || new Date().toISOString().split('T')[0],
    dateFinGarantie: sanitizeDate(equipment.endOfWarranty),
    criticite: equipment.criticality || 'Moyenne',
    criticality: equipment.criticality || 'Moyenne',
    etat: equipment.status || 'En service',
    status: equipment.status || 'En service',
    fournisseurId: sanitizeInt(equipment.supplierId),
    photoUrl: equipment.photos?.[0] || '',
    notes: ''
  };
  try {
    const response = await apiClient.post('/api/Equipement', entity);
    const resEntity = response.data;
    return {
      id: resEntity.id?.toString(),
      code: resEntity.code || entity.code,
      location: equipment.location || resEntity.localisationNom || '',
      parentId: equipment.parentId,
      name: resEntity.designation || resEntity.Designation,
      category: resEntity.familleNom || resEntity.category || equipment.category || 'Général',
      subFamily: equipment.subFamily || resEntity.familleNom || '',
      brand: resEntity.marque || resEntity.Marque || '',
      model: resEntity.modele || resEntity.Modele || '',
      serialNumber: resEntity.numeroSerie || resEntity.NumeroSerie || '',
      supplierId: equipment.supplierId || '',
      localisationId: equipment.localisationId,
      commissionDate: resEntity.dateMiseEnService || resEntity.DateMiseEnService || new Date().toISOString(),
      criticality: normalizeEquipmentCriticality(resEntity.criticite || equipment.criticality),
      status: normalizeEquipmentStatus(resEntity.etat || equipment.status),
      healthIndex: 100,
      lastMaintenance: '',
      nextMaintenance: '',
      hoursCount: resEntity.hoursCount || 0,
      cycleCount: 0,
      documents: [],
      photos: resEntity.photoUrl ? [resEntity.photoUrl] : (resEntity.PhotoUrl ? [resEntity.PhotoUrl] : []),
      sensors: [],
      spareParts: resEntity.piecesIds?.map((id: number) => id.toString()) || []
    };
  } catch (error: any) {
    console.warn('API Error (falling back to local):', error.message);
    return {
      id: entity.code,
      code: entity.code,
      location: equipment.location || '',
      parentId: equipment.parentId,
      name: entity.designation,
      category: equipment.category || 'Général',
      subFamily: equipment.subFamily || '',
      brand: entity.marque || '',
      model: entity.modele || '',
      serialNumber: entity.numeroSerie || '',
      supplierId: equipment.supplierId || '',
      localisationId: equipment.localisationId,
      commissionDate: entity.dateMiseEnService || new Date().toISOString(),
      criticality: equipment.criticality || 'Moyenne',
      status: equipment.status || 'En service',
      healthIndex: 100,
      lastMaintenance: '',
      nextMaintenance: '',
      hoursCount: 0,
      cycleCount: 0,
      documents: [],
      photos: entity.photoUrl ? [entity.photoUrl] : [],
      sensors: [],
      spareParts: []
    };
  }
};

/**
 * Met à jour un équipement
 * PUT /api/Equipement/{id}
 */
export const updateEquipmentApi = async (equipmentId: string, equipment: Partial<Equipment>): Promise<void> => {
  const catId = equipment.category ? resolveFamilleId(equipment.category) : 0;
  const catNom = equipment.category?.trim() || '';

  const entity: any = {
    code: equipment.code || equipment.id || equipmentId,
    designation: equipment.name || '',
    name: equipment.name,
    category: catNom,
    familleNom: catNom,
    localisationId: sanitizeInt(equipment.localisationId),
    marque: equipment.brand || '',
    modele: equipment.model || '',
    numeroSerie: equipment.serialNumber || '',
    dateAchat: sanitizeDate(equipment.purchaseDate),
    dateMiseEnService: sanitizeDate(equipment.commissionDate),
    dateFinGarantie: sanitizeDate(equipment.endOfWarranty),
    criticite: equipment.criticality || 'Moyenne',
    criticality: equipment.criticality || 'Moyenne',
    etat: equipment.status || 'En service',
    status: equipment.status || 'En service',
    fournisseurId: sanitizeInt(equipment.supplierId),
    photoUrl: equipment.photos?.[0] || '',
    notes: (equipment as any).notes || ''
  };

  if (catId > 0) {
    entity.familleId = catId;
  }

  await apiClient.put(`/api/Equipement/${equipmentId}`, entity);
};

/**
 * Met à jour le statut opérationnel d'un équipement
 */
export const updateEquipmentStatusApi = async (equipmentId: string, newStatus: Equipment['status']): Promise<void> => {
  try {
    const res = await apiClient.get(`/api/Equipement/${equipmentId}`);
    const dto = res.data;

    const entity = {
      id: dto.id,
      societeId: dto.societeId,
      code: dto.code || '',
      designation: dto.designation || '',
      familleId: dto.familleId || 1,
      familleNom: dto.familleNom || '',
      category: dto.familleNom || '',
      localisationId: dto.localisationId,
      marque: dto.marque,
      modele: dto.modele,
      numeroSerie: dto.numeroSerie,
      dateAchat: sanitizeDate(dto.dateAchat),
      dateMiseEnService: sanitizeDate(dto.dateMiseEnService),
      dateFinGarantie: sanitizeDate(dto.dateFinGarantie),
      criticite: dto.criticite || 'Moyenne',
      criticality: dto.criticite || 'Moyenne',
      etat: newStatus || 'En service', 
      status: newStatus || 'En service',
      fournisseurId: dto.fournisseurId,
      photoUrl: dto.photoUrl,
      notes: dto.notes
    };

    await apiClient.put(`/api/Equipement/${equipmentId}`, entity);
  } catch (err) {
    console.error('Failed to update equipment status on backend', err);
  }
};

/**
 * Associe une pièce de rechange à une machine
 * POST /api/Equipement/{equipmentId}/pieces/{pieceId}
 */
export const linkPieceToEquipmentApi = async (equipmentId: string, pieceId: string): Promise<void> => {
  await apiClient.post(`/api/Equipement/${equipmentId}/pieces/${pieceId}`, {});
};

/**
 * Dissocie une pièce de rechange d'une machine
 * DELETE /api/Equipement/{equipmentId}/pieces/{pieceId}
 */
export const unlinkPieceFromEquipmentApi = async (equipmentId: string, pieceId: string): Promise<void> => {
  await apiClient.delete(`/api/Equipement/${equipmentId}/pieces/${pieceId}`);
};

export const fetchEquipmentsApiCall = async () => {
  const response = await apiClient.get('/api/Equipement');
  return response.data;
};

export const fetchEquipmentByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Equipement/${id}`);
  return response.data;
};

export const createEquipmentApiCall = async (dto: CreateEquipmentDto) => {
  const payload = {
    code: dto.code || `EQ-${Date.now()}`,
    designation: dto.name,
    familleId: dto.familleId || 1,
    localisationId: dto.localisationId || 1,
    marque: dto.marque || '',
    modele: dto.modele || '',
    numeroSerie: dto.numeroSerie || '',
    criticite: dto.criticite || 1,
    etat: dto.etat || 1,
    notes: dto.notes || '',
    hoursCount: dto.hoursCount || 0
  };
  const response = await apiClient.post('/api/Equipement', payload);
  return response.data;
};

export const updateEquipmentApiCall = async (id: number | string, data: any) => {
  const response = await apiClient.put(`/api/Equipement/${id}`, data);
  return response.data;
};

export const deleteEquipmentApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Equipement/${id}`);
};
