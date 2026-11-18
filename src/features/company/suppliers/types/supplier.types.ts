/**
 * ============================================================================
 * MODULE : Fournisseurs & Prestataires (Suppliers) - Types & DTOs
 * ============================================================================
 * Définit les modèles et DTOs pour la gestion des fournisseurs de pièces
 * et prestataires de sous-traitance.
 */

export interface SupplierModel {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  rating?: number;
  activeContractsCount?: number;
}

export interface CreateSupplierDto {
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export interface UpdateSupplierDto {
  id: number;
  nom?: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}
