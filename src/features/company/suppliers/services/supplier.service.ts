/**
 * ============================================================================
 * MODULE : Fournisseurs & Prestataires (Suppliers) - Service Métier
 * ============================================================================
 */

import { 
  fetchSuppliersApiCall, 
  fetchSupplierByIdApiCall, 
  createSupplierApiCall, 
  updateSupplierApiCall, 
  deleteSupplierApiCall 
} from '../api/supplier.api';
import { CreateSupplierDto, UpdateSupplierDto } from '../types/supplier.types';

export const supplierService = {
  getAll: async () => {
    return await fetchSuppliersApiCall();
  },

  getById: async (id: number | string) => {
    return await fetchSupplierByIdApiCall(id);
  },

  create: async (dto: CreateSupplierDto) => {
    return await createSupplierApiCall(dto);
  },

  update: async (id: number | string, dto: Partial<UpdateSupplierDto>) => {
    return await updateSupplierApiCall(id, dto);
  },

  delete: async (id: number | string) => {
    await deleteSupplierApiCall(id);
  }
};
