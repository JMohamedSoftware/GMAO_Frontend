import { AppRole } from '@/shared/permissions';


export interface DocumentInfo {
  name: string;
  type: 'notice' | 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic';
  size: string;
  url: string;
}

export interface SensorInfo {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  history: number[];
}

export interface Equipment {
  id: string; 
  parentId?: string;
  name: string;
  category: string;
  subFamily: string;
  brand: string;
  model: string;
  serialNumber: string;
  supplierId?: string;
  purchaseDate?: string;
  endOfWarranty?: string;
  inventory?: string;
  responsibility?: string;
  barcode?: string;
  gipPresence?: boolean;
  site?: string;
  building?: string;
  floor?: string;
  room?: string;
  commissionDate: string;
  location: string;
  criticality: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  status: 'En service' | 'En panne' | 'En maintenance' | 'Hors service';
  healthIndex: number; 
  lastMaintenance: string;
  nextMaintenance: string;
  hoursCount: number;
  cycleCount: number;
  documents: DocumentInfo[];
  photos: string[];
  sensors: SensorInfo[];
  spareParts: string[]; 
}

export interface PartUsage {
  partRef: string;
  quantity: number;
}

export interface WorkOrder {
  id: string; 
  equipmentId: string;
  title: string;
  description: string;
  type: 'Correctif' | 'Préventif' | 'Curatif' | 'Amélioratif';
  priority: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  status: 'Brouillon' | 'En attente' | 'Affecté' | 'En cours' | 'Suspendu' | 'Terminé' | 'Clôturé';
  createdDate: string;
  startDate?: string;
  endDate?: string;
  technicianId?: string;
  assignedBy: string;
  durationMinutes: number;
  diagnostic?: string;
  solution?: string;
  signature?: string; 
  partsUsed: PartUsage[];
  externalCost: number;
  campaign: string;
}

export interface Incident {
  id: string; 
  equipmentId: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  urgency: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  technicianId?: string;
  status: 'Nouveau' | 'Validé' | 'Rejeté' | 'Clos' | 'Transformé en OT';
  photo?: string;
  workOrderId?: string;
}

export interface Technician {
  id: string;
  name: string;
  role: 'Électromécanicien' | 'Électricien industriel' | 'Automaticien' | 'Soudeur' | 'Mécanicien';
  qualification: string;
  skills: string[];
  status: 'Disponible' | 'Occupé' | 'Congé';
  hourlyRate: number;
  avatar: string;
}

export interface SparePart {
  ref: string;
  name: string;
  category: string;
  supplierId: string;
  stockCurrent: number;
  stockMin: number;
  stockMax: number;
  unitPrice: number;
  location: string;
  photo?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  contracts: {
    title: string;
    startDate: string;
    endDate: string;
    status: 'Actif' | 'Expiré';
    cost: number;
  }[];
  rating: number; 
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'En cours' | 'Terminée' | 'Planifiée';
}

export interface Notification {
  id: string;
  type: 'incident' | 'workorder' | 'stock' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface User {
  name: string;
  email: string;
  role: 'SuperAdmin' | 'CompanyAdmin' | 'Responsable Maintenance' | 'Chef d\'équipe' | 'Technicien' | 'Production' | 'Read-Only User';
  avatar: string;
  tenantId?: string;
  permissions?: string[];
}

export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  avatar: string;
  phone?: string;
  department?: string;
  lastConnection?: string;
  createdAt?: string;
}


// MULTI-TENANT CONTAINER STRUCT
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'Pending' | 'Active' | 'Suspended';
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
  createdAt: string;
  adminEmail: string;
  capacityTonsPerDay: number;
  
  // Isolated Database
  equipments: Equipment[];
  workOrders: WorkOrder[];
  incidents: Incident[];
  technicians: Technician[];
  parts: SparePart[];
  suppliers: Supplier[];
  campaigns: Campaign[];
  users: UserAccount[];
}




