/**
 * ============================================================================
 * REGISTRE CENTRAL DES PAGES DE L'APPLICATION (Barrel Export)
 * ============================================================================
 * Centralise les exports de toutes les pages des différents modules
 * pour un import simplifié dans le routeur et les composants.
 */

// Pages des fonctionnalités de l'entreprise (Features)
export { Dashboard } from '@/features/company/dashboard/pages/Dashboard';
export { Equipment } from '@/features/company/equipments/pages/EquipmentPage';
export { Preventive } from '@/features/company/preventive/pages/Preventive';
export { Corrective } from '@/features/company/incidents/pages/Corrective';
export { WorkOrders } from '@/features/company/workOrders/pages/WorkOrdersPage';
export { Inventory } from '@/features/company/inventory/pages/Inventory';
export { Reports } from '@/features/company/reports/pages/Reports';
export { Suppliers } from '@/features/company/suppliers/pages/Suppliers';
export { Admin } from '@/features/company/settings/Admin';
export { EquipesPage } from '@/features/company/equipes/pages/EquipesPage';

// Authentification & SuperAdmin
export { Login } from '@/features/auth/pages/Login';
export { SuperAdmin } from '@/features/superAdmin/dashboard/SuperAdminPage';

// Pages génériques transversales
export { NotFoundPage } from './NotFoundPage';
export { UnauthorizedPage } from './UnauthorizedPage';
