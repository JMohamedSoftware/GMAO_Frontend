import axios from 'axios';
import { Equipment, Supplier, SparePart, Incident, WorkOrder, Campaign, User } from '../types/gmao';

const API_URL = 'http://localhost:5033/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('gmao_token');
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
        type: e.familleNom,
        location: e.localisationNom,
        status: e.etat === '0' || e.etat === 'EnService' ? 'En service' : 'En panne',
        healthIndex: 100,
        lastMaintenance: e.updatedAt,
        nextMaintenance: '',
        parentId: e.localisationId?.toString(),
        sensors: []
    }));
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
    const response = await axios.get(`${API_URL}/Fournisseurs`, getAuthHeaders());
    return response.data.map((s: any) => ({
        id: s.id?.toString(),
        name: s.nom,
        contact: s.contact,
        email: s.email,
        phone: s.telephone,
        address: s.adresse,
        rating: 5,
        categories: []
    }));
};

export const fetchParts = async (): Promise<SparePart[]> => {
    const response = await axios.get(`${API_URL}/Pieces`, getAuthHeaders());
    return response.data.map((p: any) => ({
        id: p.id?.toString(),
        reference: p.reference,
        name: p.designation,
        category: p.famillePieceId?.toString() || 'Autre',
        stock: p.stockActuel,
        minStock: p.stockMinimum,
        unit: p.unite,
        unitPrice: p.prixUnitaire,
        location: p.emplacement,
        supplierId: p.fournisseurId?.toString()
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
        priority: i.priorite === 3 ? 'Urgent' : i.priorite === 2 ? 'Haute' : 'Moyenne',
        status: i.statut === 0 ? 'Nouveau' : i.statut === 1 ? 'En cours' : 'Résolu',
        description: i.description
    }));
};

export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
    const response = await axios.get(`${API_URL}/OrdresTravail`, getAuthHeaders());
    return response.data.map((w: any) => ({
        id: w.id?.toString(),
        title: w.description,
        equipmentId: w.equipementId?.toString(),
        assignedTo: w.technicienId?.toString(),
        plannedDate: w.dateDebutPrevue || w.dateCreation,
        status: w.statut === 0 ? 'Planifié' : w.statut === 2 ? 'En cours' : 'Terminé',
        type: w.typeMaintenance === 0 ? 'Préventif' : 'Correctif',
        priority: w.priorite === 3 ? 'Urgent' : 'Moyenne',
        estimatedDuration: 2,
        campaignId: w.campagneId?.toString()
    }));
};

export const fetchCampaigns = async (): Promise<Campaign[]> => {
    const response = await axios.get(`${API_URL}/Campagnes`, getAuthHeaders());
    return response.data.map((c: any) => ({
        id: c.id?.toString(),
        name: c.nom,
        startDate: c.dateDebut,
        endDate: c.dateFin,
        status: c.statut === 1 ? 'Active' : 'Terminée',
        description: c.objectifGlobal
    }));
};
