import axios from 'axios';
import { Equipment, Supplier, SparePart, Incident, WorkOrder, Campaign, User } from '../types/gmao';

const rawUrl = import.meta.env.VITE_API_URL || 'https://gmao-backend-a6r2.onrender.com';
const API_URL = rawUrl.replace(/\/api\/?$/, '') + '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('gmao_access_token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchEquipments = async (): Promise<Equipment[]> => {
    const response = await axios.get(`${API_URL}/Equipement`, getAuthHeaders());
    return response.data.map((e: any) => ({
        id: e.id?.toString(),
        name: e.designation,
        category: e.familleNom || 'Autre',
        subFamily: e.familleNom || 'Autre',
        brand: e.marque || '',
        model: e.modele || '',
        serialNumber: e.numeroSerie || '',
        supplierId: e.fournisseurId?.toString(),
        purchaseDate: e.dateAchat,
        endOfWarranty: e.dateFinGarantie,
        commissionDate: e.dateMiseEnService || new Date().toISOString(),
        localisationId: e.localisationId,
        criticality: e.criticite === 1 ? 'Faible' : e.criticite === 2 ? 'Moyenne' : e.criticite === 3 ? 'Haute' : 'Critique',
        status: e.etat === 1 ? 'En service' : e.etat === 2 ? 'En panne' : e.etat === 3 ? 'En maintenance' : 'Hors service',
        healthIndex: 100,
        lastMaintenance: e.updatedAt || new Date().toISOString(),
        nextMaintenance: new Date().toISOString(),
        hoursCount: 0,
        cycleCount: 0,
        documents: [],
        photos: e.photoUrl ? [e.photoUrl] : [],
        sensors: [],
        spareParts: [],
        parentId: e.localisationId?.toString()
    }));
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
    const response = await axios.get(`${API_URL}/Fournisseurs`, getAuthHeaders());
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

const mapPieceCategory = (id?: number): string => {
    switch (id) {
        case 1: return 'Roulements';
        case 2: return 'Joints';
        case 3: return 'Courroies';
        case 4: return 'Garnitures';
        case 5: return 'Lubrifiants';
        case 6: return 'Électrique';
        case 7: return 'Visserie';
        default: return 'Autre';
    }
};

export const fetchParts = async (): Promise<SparePart[]> => {
    const response = await axios.get(`${API_URL}/Pieces`, getAuthHeaders());
    return response.data.map((p: any) => ({
        ref: p.reference,
        name: p.designation,
        category: mapPieceCategory(p.famillePieceId),
        supplierId: p.fournisseurId?.toString() || '',
        stockCurrent: p.stockActuel || 0,
        stockMin: p.stockMinimum || 0,
        stockMax: p.stockMaximum || 100,
        unitPrice: p.prixUnitaire || 0,
        location: p.emplacement || '',
        photo: p.photoUrl
    }));
};

export const fetchIncidents = async (): Promise<Incident[]> => {
    const response = await axios.get(`${API_URL}/Incidents`, getAuthHeaders());
    return response.data.map((i: any) => ({
        id: i.id?.toString(),
        title: i.description,
        equipmentId: i.equipementId?.toString(),
        reportedBy: i.demandeurId?.toString(),
        reportedDate: i.datePanne,
        urgency: i.priorite === 1 ? 'Faible' : i.priorite === 2 ? 'Moyenne' : i.priorite === 3 ? 'Haute' : 'Critique',
        status: i.statut === 1 ? 'Nouveau' : i.statut === 2 ? 'Validé' : i.statut === 3 ? 'Rejeté' : i.statut === 4 ? 'Transformé en OT' : 'Clos',
        description: i.description
    }));
};

export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
    const response = await axios.get(`${API_URL}/OrdresTravail`, getAuthHeaders());
    return response.data.map((w: any) => ({
        id: w.id?.toString(),
        equipmentId: w.equipementId?.toString() || '',
        title: w.numeroOT || '',
        description: w.description || '',
        type: w.typeMaintenance === 2 ? 'Préventif' : w.typeMaintenance === 4 ? 'Amélioratif' : 'Correctif',
        priority: w.priorite === 1 ? 'Faible' : w.priorite === 2 ? 'Moyenne' : w.priorite === 3 ? 'Haute' : 'Critique',
        status: w.statut === 1 ? 'Brouillon' : w.statut === 2 ? 'En attente' : w.statut === 3 ? 'En cours' : w.statut === 4 ? 'Suspendu' : w.statut === 5 ? 'Terminé' : 'Clôturé',
        createdDate: w.dateCreation || new Date().toISOString(),
        startDate: w.dateDebutReelle || w.dateDebutPrevue || undefined,
        endDate: w.dateFinReelle || w.dateFinPrevue || undefined,
        technicianId: w.technicienId?.toString() || undefined,
        assignedBy: w.responsableId?.toString() || '',
        durationMinutes: w.durationMinutes || 120,
        diagnostic: w.diagnostic || undefined,
        solution: w.solution || undefined,
        partsUsed: [],
        externalCost: w.coutSousTraitance || 0,
        campaign: w.campagneNom || ''
    }));
};

export const fetchCampaigns = async (): Promise<Campaign[]> => {
    const response = await axios.get(`${API_URL}/Campagnes`, getAuthHeaders());
    return response.data.map((c: any) => ({
        id: c.id?.toString(),
        name: c.nom,
        startDate: c.dateDebut,
        endDate: c.dateFin,
        status: c.etat === 2 ? 'En cours' : c.etat === 3 ? 'Terminée' : 'Planifiée'
    }));
};
