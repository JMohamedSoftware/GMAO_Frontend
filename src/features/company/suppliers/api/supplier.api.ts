/**
 * ============================================================================
 * MODULE : Fournisseurs & Prestataires (Suppliers) - API Client
 * ============================================================================
 * Appels HTTP vers `/api/Fournisseurs`.
 */

import { apiClient } from '@/shared/services/apiClient';
import { Supplier } from '@/shared/types/gmao';
import { CreateSupplierDto, UpdateSupplierDto } from '../types/supplier.types';

/**
 * Récupère tous les fournisseurs pour l'état global Redux
 * GET /api/Fournisseurs
 */
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await apiClient.get('/api/Fournisseurs');
  return response.data.map((s: any) => ({
    id: s.id?.toString(),
    name: s.nom,
    contact: s.contact || '',
    email: s.email || '',
    phone: s.telephone || '',
    address: s.adresse || '',
    rating: 5,
    contracts: []
  }));
};

/**
 * Crée un nouveau fournisseur
 * POST /api/Fournisseurs
 */
export const createSupplierApi = async (supplier: Supplier): Promise<Supplier> => {
  const response = await apiClient.post('/api/Fournisseurs', {
    nom: supplier.name,
    contact: supplier.contact,
    email: supplier.email,
    telephone: supplier.phone,
    adresse: supplier.address,
    code: supplier.id && !supplier.id.startsWith('SUP-') ? supplier.id : undefined,
    isActive: true
  });
  const s = response.data;
  return {
    id: s.id?.toString(),
    name: s.nom,
    contact: s.contact || '',
    email: s.email || '',
    phone: s.telephone || '',
    address: s.adresse || '',
    rating: supplier.rating || 5,
    contracts: supplier.contracts || []
  };
};

/**
 * Met à jour un fournisseur existant
 * PUT /api/Fournisseurs/{id}
 */
export const updateSupplierApi = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
  const response = await apiClient.put(`/api/Fournisseurs/${id}`, {
    id: Number(id),
    nom: supplier.name,
    contact: supplier.contact,
    email: supplier.email,
    telephone: supplier.phone,
    adresse: supplier.address,
    isActive: true
  });
  const s = response.data;
  return {
    id: s.id?.toString() || id,
    name: s.nom || supplier.name || '',
    contact: s.contact || supplier.contact || '',
    email: s.email || supplier.email || '',
    phone: s.telephone || supplier.phone || '',
    address: s.adresse || supplier.address || '',
    rating: supplier.rating || 5,
    contracts: supplier.contracts || []
  };
};

/**
 * Supprime un fournisseur
 * DELETE /api/Fournisseurs/{id}
 */
export const deleteSupplierApi = async (id: string): Promise<string> => {
  await apiClient.delete(`/api/Fournisseurs/${id}`);
  return id;
};

export const fetchSuppliersApiCall = async () => {
  const response = await apiClient.get('/api/Fournisseurs');
  return response.data;
};

export const fetchSupplierByIdApiCall = async (id: number | string) => {
  const response = await apiClient.get(`/api/Fournisseurs/${id}`);
  return response.data;
};

export const createSupplierApiCall = async (dto: CreateSupplierDto) => {
  const response = await apiClient.post('/api/Fournisseurs', dto);
  return response.data;
};

export const updateSupplierApiCall = async (id: number | string, dto: Partial<UpdateSupplierDto>) => {
  const response = await apiClient.put(`/api/Fournisseurs/${id}`, { id: Number(id), ...dto });
  return response.data;
};

export const deleteSupplierApiCall = async (id: number | string) => {
  await apiClient.delete(`/api/Fournisseurs/${id}`);
};
