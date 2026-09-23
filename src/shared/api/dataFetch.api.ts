import axios from 'axios';
import { Equipment, Supplier, SparePart, Incident, WorkOrder, Campaign, Technician, PlanPreventif, TachePreventive, UserAccount, Tenant } from '../types/gmao';

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
        localisation: e.localisationNom ? { id: e.localisationId, nom: e.localisationNom } : undefined,
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
        parentId: e.parentEquipementId ? e.parentEquipementId.toString() : undefined
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

const TECHNICIAN_ROLE_ID = 4;

/** Maps a role label to the closest Technician.role union type */
const mapTechRole = (roleId: number): Technician['role'] => {
    return 'Électromécanicien'; // default — backend has no speciality field yet
};

export const fetchTechnicians = async (): Promise<Technician[]> => {
    const response = await axios.get(`${API_URL}/Users`, getAuthHeaders());
    return response.data
        .filter((u: any) => u.roleId === TECHNICIAN_ROLE_ID && u.isActive !== false)
        .map((u: any): Technician => ({
            id: u.id?.toString(),
            name: `${u.prenom} ${u.nom}`.trim(),
            role: mapTechRole(u.roleId),
            qualification: 'Technicien de Maintenance',
            skills: [],
            status: 'Disponible',
            hourlyRate: 0,
            avatar: u.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.prenom}+${u.nom}`)}&background=e11d48&color=fff&size=150`,
        }));
};

const mapRoleIdToName = (roleId: number): string => {
    switch (roleId) {
        case 1: return 'Administrateur';
        case 2: return 'Technicien';
        case 3: return 'Demandeur';
        default: return 'Utilisateur';
    }
};

export const fetchUsers = async (): Promise<UserAccount[]> => {
    const response = await axios.get(`${API_URL}/Users`, getAuthHeaders());
    return response.data.map((u: any) => ({
        id: u.id?.toString(),
        name: `${u.prenom} ${u.nom}`.trim(),
        email: u.email,
        role: u.role?.nom || mapRoleIdToName(u.roleId),
        status: u.isActive !== false ? 'Actif' : 'Inactif',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.prenom}+${u.nom}`)}&background=e11d48&color=fff&size=150`,
        phone: u.telephone,
        createdAt: u.createdAt
    }));
};



// ─── Enum converters ───────────────────────────────────────────────────────────

/** Backend PrioriteIntervention → Frontend urgency string */
const intToUrgency = (n: number): Incident['urgency'] => {
    switch (n) {
        case 1:  return 'Faible';
        case 3:  return 'Haute';
        case 4:  return 'Critique';
        default: return 'Moyenne';
    }
};

/** Backend StatutDemande → Frontend status string */
const intToStatus = (n: number): Incident['status'] => {
    switch (n) {
        case 2:  return 'Validé';
        case 3:  return 'Rejeté';
        case 4:  return 'Transformé en OT';
        default: return 'Nouveau';
    }
};

/** Frontend urgency string → backend PrioriteIntervention integer */
const urgencyToInt = (urgency: string): number => {
    switch (urgency) {
        case 'Faible':   return 1;
        case 'Haute':    return 3;
        case 'Critique': return 4;
        default:         return 2; // 'Moyenne'
    }
};

/** Frontend status string → backend StatutDemande integer */
const statusToInt = (status: string): number => {
    switch (status) {
        case 'Validé':            return 2;
        case 'Rejeté':            return 3;
        case 'Transformé en OT':  return 4;
        default:                  return 1; // 'Nouveau' / 'EnAttente'
    }
};

// ─── Incidents ─────────────────────────────────────────────────────────────────

export const fetchIncidents = async (): Promise<Incident[]> => {
    const response = await axios.get(`${API_URL}/Incidents`, getAuthHeaders());
    return response.data.map((i: any) => ({
        id: i.id?.toString(),
        equipmentId: i.equipementId?.toString(),
        reportedBy: i.demandeurId?.toString(),
        reportedDate: i.datePanne,
        urgency: intToUrgency(i.priorite),
        status: intToStatus(i.statut),
        description: i.description,
        photo: i.photoUrl || undefined,
        commentaireRejet: i.commentaireRejet || undefined,
    }));
};

export interface CreateIncidentPayload {
    equipmentId: string;
    description: string;
    urgency: string;
    demandeurId?: number;
    photo?: string;
}

/** POST /api/Incidents — persists a new incident to the backend */
export const createIncidentApi = async (payload: CreateIncidentPayload): Promise<Incident> => {
    const body = {
        equipementId: parseInt(payload.equipmentId, 10),
        demandeurId: payload.demandeurId || 1,
        datePanne: new Date().toISOString(),
        description: payload.description,
        priorite: urgencyToInt(payload.urgency),
        statut: 1, // EnAttente / Nouveau
        photoUrl: payload.photo || null,
    };
    const response = await axios.post(`${API_URL}/Incidents`, body, getAuthHeaders());
    const i = response.data;
    return {
        id: i.id?.toString(),
        equipmentId: i.equipementId?.toString(),
        reportedBy: i.demandeurId?.toString(),
        reportedDate: i.datePanne || new Date().toISOString(),
        urgency: payload.urgency as Incident['urgency'],
        status: 'Nouveau',
        description: i.description,
        photo: i.photoUrl || undefined,
    };
};

/** PUT /api/Incidents/{id} — updates an incident's status on the backend */
export const patchIncidentStatusApi = async (
    id: string,
    status: Incident['status'],
    fullIncident: Incident,
    commentaireRejet?: string
): Promise<void> => {
    const body = {
        id: parseInt(id, 10),
        equipementId: parseInt(fullIncident.equipmentId, 10),
        demandeurId: parseInt(fullIncident.reportedBy, 10) || 1,
        datePanne: fullIncident.reportedDate,
        description: fullIncident.description,
        priorite: urgencyToInt(fullIncident.urgency),
        statut: statusToInt(status),
        photoUrl: fullIncident.photo || null,
        commentaireRejet: commentaireRejet || null,
    };
    await axios.put(`${API_URL}/Incidents/${id}`, body, getAuthHeaders());
};

// ─── Work Orders write ─────────────────────────────────────────────────────────

export interface CreateWorkOrderPayload {
    title: string;
    description: string;
    equipmentId: string;
    type: WorkOrder['type'];
    priority: WorkOrder['priority'];
    technicianId?: string;
    incidentId?: string;   // links to DemandeIntervention
    responsableId?: number;
}

const typeToInt = (type: string): number => {
    switch (type) {
        case 'Préventif':   return 2;
        case 'Amélioratif': return 4;
        default:            return 1; // Corrective
    }
};

const otPriorityToInt = (priority: string): number => {
    switch (priority) {
        case 'Faible':   return 1;
        case 'Haute':    return 3;
        case 'Critique': return 4;
        default:         return 2; // Moyenne
    }
};

/** POST /api/OrdresTravail — creates a new OT and auto-transitions the linked incident */
export const createWorkOrderApi = async (payload: CreateWorkOrderPayload): Promise<WorkOrder> => {
    const now = new Date().toISOString();
    // Generate a sequential-looking number (backend uses auto-increment ID)
    const body = {
        numeroOT: `OT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        demandeId: payload.incidentId ? parseInt(payload.incidentId, 10) : null,
        equipementId: parseInt(payload.equipmentId, 10),
        responsableId: payload.responsableId || 1,
        technicienId: payload.technicianId ? parseInt(payload.technicianId, 10) : null,
        priorite: otPriorityToInt(payload.priority),
        typeMaintenance: typeToInt(payload.type),
        statut: 1, // Cree
        dateCreation: now,
        dateDebutPrevue: null,
        dateFinPrevue: null,
        description: payload.description,
        instructions: null,
        coutMainOeuvre: null,
        coutPieces: null,
        coutSousTraitance: null,
        campagneId: null,
    };
    const response = await axios.post(`${API_URL}/OrdresTravail`, body, getAuthHeaders());
    const w = response.data;
    return {
        id: w.id?.toString(),
        equipmentId: w.equipementId?.toString() || payload.equipmentId,
        title: w.numeroOT || payload.title,
        description: w.description || payload.description,
        type: payload.type,
        priority: payload.priority,
        status: 'Brouillon',
        createdDate: w.dateCreation || now,
        startDate: undefined,
        endDate: undefined,
        technicianId: w.technicienId?.toString() || undefined,
        assignedBy: w.responsableId?.toString() || '1',
        durationMinutes: 0,
        partsUsed: [],
        externalCost: 0,
        campaign: '',
    };
};

export const patchWorkOrderStatusApi = async (
    id: string,
    status: WorkOrder['status'],
    fullOt: WorkOrder,
    updates?: Partial<WorkOrder>
): Promise<void> => {
    const merged = { ...fullOt, ...updates, status };
    
    let statutOt = 1; // Brouillon
    switch(merged.status) {
        case 'En attente': statutOt = 2; break;
        case 'Affecté Chef': statutOt = 2; break; 
        case 'Affecté': statutOt = 2; break; // Map 'Affecté' and 'En attente' to 2 (EnAttente/Affecte)
        case 'En cours': statutOt = 3; break;
        case 'Suspendu': statutOt = 4; break;
        case 'Terminé': statutOt = 5; break;
        case 'Clôturé': statutOt = 6; break;
    }

    const body = {
        id: parseInt(id, 10),
        numeroOT: merged.title || `OT-${id}`,
        demandeId: merged.incidentId ? parseInt(merged.incidentId, 10) : null,
        equipementId: parseInt(merged.equipmentId, 10),
        responsableId: merged.assignedBy ? parseInt(merged.assignedBy, 10) : 1,
        technicienId: merged.technicianId ? parseInt(merged.technicianId, 10) : null,
        priorite: otPriorityToInt(merged.priority),
        typeMaintenance: typeToInt(merged.type),
        statut: statutOt,
        dateCreation: merged.createdDate,
        dateDebutPrevue: null,
        dateFinPrevue: null,
        dateDebutReelle: merged.startDate || null,
        dateFinReelle: merged.endDate || null,
        description: merged.description,
        instructions: merged.solution || null,
        coutMainOeuvre: null,
        coutPieces: merged.externalCost || null,
        coutSousTraitance: null,
        campagneId: null,
    };
    
    await axios.put(`${API_URL}/OrdresTravail/${id}`, body, getAuthHeaders());
};

export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
    const response = await axios.get(`${API_URL}/OrdresTravail`, getAuthHeaders());
    return response.data.map((w: any) => {
        let mappedStatus: WorkOrder['status'] = 'Brouillon';
        if (w.statut === 1) mappedStatus = 'Brouillon';
        else if (w.statut === 2) {
            mappedStatus = w.technicienId ? 'Affecté' : 'En attente';
        }
        else if (w.statut === 3) mappedStatus = 'En cours';
        else if (w.statut === 4) mappedStatus = 'Suspendu';
        else if (w.statut === 5) mappedStatus = 'Terminé';
        else if (w.statut === 6) mappedStatus = 'Clôturé';

        return {
            id: w.id?.toString(),
            incidentId: w.demandeId != null ? w.demandeId.toString() : undefined,
            equipmentId: w.equipementId?.toString() || '',
            title: w.numeroOT || '',
            description: w.description || '',
            type: w.typeMaintenance === 2 ? 'Préventif' : w.typeMaintenance === 4 ? 'Amélioratif' : 'Correctif',
            priority: w.priorite === 1 ? 'Faible' : w.priorite === 2 ? 'Moyenne' : w.priorite === 3 ? 'Haute' : 'Critique',
            status: mappedStatus,
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
        };
    });
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


// ── Plans Préventifs API ───────────────────────────────────────────────────

const mapPlan = (p: any): PlanPreventif => ({
    id: p.id,
    titre: p.titre || '',
    description: p.description,
    typeDeclenchement: p.typeDeclenchement as 1 | 2 | 3,
    frequence: p.frequence || 0,
    uniteMesure: p.uniteMesure,
    derniereDate: p.derniereDate?.split('T')[0],
    prochaineDate: p.prochaineDate?.split('T')[0],
    actif: p.actif ?? true,
    equipementId: p.equipementId,
    equipementNom: p.equipementNom,
    equipementFamille: p.equipementFamille,
    taches: (p.taches || []).map((t: any): TachePreventive => ({
        id: t.id,
        description: t.description,
        ordre: t.ordre,
        dureeEstimeeMinutes: t.dureeEstimeeMinutes,
        estObligatoire: t.estObligatoire ?? true,
    }))
});

export const fetchPlansPreventifs = async (): Promise<PlanPreventif[]> => {
    const res = await axios.get(`${API_URL}/PlansPreventif`, getAuthHeaders());
    return res.data.map(mapPlan);
};

export const createPlanPreventif = async (payload: Omit<PlanPreventif, 'id'>): Promise<PlanPreventif> => {
    const body = {
        equipementId:      payload.equipementId,
        titre:             payload.titre,
        description:       payload.description,
        typeDeclenchement: payload.typeDeclenchement,
        frequence:         payload.frequence,
        uniteMesure:       payload.uniteMesure,
        derniereDate:      payload.derniereDate ? new Date(payload.derniereDate).toISOString() : null,
        prochaineDate:     payload.prochaineDate ? new Date(payload.prochaineDate).toISOString() : null,
        taches:            (payload.taches || []).map(t => ({
            description:         t.description,
            dureeEstimeeMinutes: t.dureeEstimeeMinutes ?? null,
            estObligatoire:      t.estObligatoire,
        }))
    };
    const res = await axios.post(`${API_URL}/PlansPreventif`, body, getAuthHeaders());
    // Refetch the created plan by id
    const created = await axios.get(`${API_URL}/PlansPreventif/${res.data.id}`, getAuthHeaders());
    return mapPlan(created.data);
};

export const updatePlanPreventif = async (id: number, payload: Omit<PlanPreventif, 'id'>): Promise<void> => {
    const body = {
        equipementId:      payload.equipementId,
        titre:             payload.titre,
        description:       payload.description,
        typeDeclenchement: payload.typeDeclenchement,
        frequence:         payload.frequence,
        uniteMesure:       payload.uniteMesure,
        derniereDate:      payload.derniereDate ? new Date(payload.derniereDate).toISOString() : null,
        prochaineDate:     payload.prochaineDate ? new Date(payload.prochaineDate).toISOString() : null,
        taches:            (payload.taches || []).map(t => ({
            description:         t.description,
            dureeEstimeeMinutes: t.dureeEstimeeMinutes ?? null,
            estObligatoire:      t.estObligatoire,
        }))
    };
    await axios.put(`${API_URL}/PlansPreventif/${id}`, body, getAuthHeaders());
};

export const genererOTPreventif = async (planId: number): Promise<{ otId: number; numeroOT: string; prochaineDate: string }> => {
    const res = await axios.post(`${API_URL}/PlansPreventif/${planId}/generer-ot`, {}, getAuthHeaders());
    return res.data;
};

export const replanifierPlanPreventif = async (planId: number, nouvelleDate: string): Promise<void> => {
    await axios.put(`${API_URL}/PlansPreventif/${planId}/replanifier`,
        { nouvelleDate: new Date(nouvelleDate).toISOString() },
        getAuthHeaders()
    );
};

export const fetchTenants = async (): Promise<Tenant[]> => {
    const response = await axios.get(`${API_URL}/Societes`, getAuthHeaders());
    return response.data.map((s: any) => ({
        id: s.codeTenant,
        dbId: s.id,
        name: s.nom,
        domain: s.adresse || '',
        status: s.isActive ? 'Active' : 'Suspended',
        subscriptionPlan: s.subscriptionPlan || 'Basic',
        createdAt: s.createdAt,
        adminEmail: s.emailContact || '',
        capacityTonsPerDay: s.capacityTonsPerDay || 450,
        equipments: [],
        workOrders: [],
        incidents: [],
        technicians: [],
        parts: [],
        suppliers: [],
        campaigns: [],
        users: []
    }));
};

export const createTenantApi = async (tenantData: any): Promise<any> => {
    const body = {
        codeTenant: tenantData.id,
        nom: tenantData.name,
        adresse: tenantData.domain,
        emailContact: tenantData.adminEmail,
        subscriptionPlan: tenantData.subscriptionPlan,
        capacityTonsPerDay: tenantData.capacityTonsPerDay || 450,
        isActive: true
    };
    const response = await axios.post(`${API_URL}/Societes`, body, getAuthHeaders());
    return response.data;
};

export const updateTenantApi = async (dbId: number, tenantData: any): Promise<any> => {
    const body = {
        id: dbId,
        codeTenant: tenantData.id,
        nom: tenantData.name,
        adresse: tenantData.domain,
        emailContact: tenantData.adminEmail,
        subscriptionPlan: tenantData.subscriptionPlan,
        capacityTonsPerDay: tenantData.capacityTonsPerDay || 450,
        isActive: tenantData.status === 'Active'
    };
    const response = await axios.put(`${API_URL}/Societes/${dbId}`, body, getAuthHeaders());
    return response.data;
};

// ── Equipment API ──────────────────────────────────────────────────────────────

const mapCriticiteToInt = (c: string) => {
    switch(c) {
        case 'Faible': return 1;
        case 'Moyenne': return 2;
        case 'Haute': return 3;
        case 'Critique': return 4;
        default: return 2;
    }
}

const mapEtatToInt = (e: string) => {
    switch(e) {
        case 'En service': return 1;
        case 'En panne': return 2;
        case 'En maintenance': return 3;
        case 'Hors service': return 4;
        case 'En attente': return 5;
        default: return 1;
    }
}

export const updateEquipmentStatusApi = async (equipmentId: string, newStatus: Equipment['status']): Promise<void> => {
    try {
        // 1. Fetch current DTO
        const res = await axios.get(`${API_URL}/Equipement/${equipmentId}`, getAuthHeaders());
        const dto = res.data;

        // 2. Map back to Entity structure expected by PUT
        const entity = {
            id: dto.id,
            societeId: dto.societeId,
            code: dto.code || '',
            designation: dto.designation || '',
            familleId: dto.familleId || 1,
            localisationId: dto.localisationId,
            marque: dto.marque,
            modele: dto.modele,
            numeroSerie: dto.numeroSerie,
            dateAchat: dto.dateAchat,
            dateMiseEnService: dto.dateMiseEnService,
            dateFinGarantie: dto.dateFinGarantie,
            criticite: mapCriticiteToInt(dto.criticite),
            etat: mapEtatToInt(newStatus), 
            fournisseurId: dto.fournisseurId,
            photoUrl: dto.photoUrl,
            notes: dto.notes
        };

        // 3. Update on backend
        await axios.put(`${API_URL}/Equipement/${equipmentId}`, entity, getAuthHeaders());
    } catch (err) {
        console.error('Failed to update equipment status on backend', err);
    }
};

export const createEquipmentApi = async (equipment: Partial<Equipment>): Promise<Equipment> => {
    const entity = {
        code: equipment.id || `EQ-${Date.now()}`,
        designation: equipment.name || 'Nouvel Équipement',
        familleId: 1, 
        localisationId: equipment.localisationId || 1,
        marque: equipment.brand || '',
        modele: equipment.model || '',
        numeroSerie: equipment.serialNumber || '',
        dateAchat: equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : null,
        dateMiseEnService: equipment.commissionDate ? equipment.commissionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        dateFinGarantie: equipment.endOfWarranty ? equipment.endOfWarranty.split('T')[0] : null,
        criticite: mapCriticiteToInt(equipment.criticality || 'Moyenne'),
        etat: mapEtatToInt(equipment.status || 'En service'),
        fournisseurId: equipment.supplierId ? parseInt(equipment.supplierId, 10) : null,
        photoUrl: equipment.photos?.[0] || '',
        notes: ''
    };
    let response;
    try {
        response = await axios.post(`${API_URL}/Equipement`, entity, getAuthHeaders());
    } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || JSON.stringify(error.response?.data) || error.message);
    }
    const resEntity = response.data;
    
    return {
        id: resEntity.id?.toString(),
        parentId: equipment.parentId,
        name: resEntity.designation || resEntity.Designation,
        category: equipment.category || 'Général',
        subFamily: equipment.subFamily || '',
        brand: resEntity.marque || resEntity.Marque || '',
        model: resEntity.modele || resEntity.Modele || '',
        serialNumber: resEntity.numeroSerie || resEntity.NumeroSerie || '',
        supplierId: equipment.supplierId || '',
        localisationId: equipment.localisationId,
        commissionDate: resEntity.dateMiseEnService || resEntity.DateMiseEnService || new Date().toISOString(),
        criticality: equipment.criticality || 'Moyenne',
        status: equipment.status || 'En service',
        healthIndex: 100,
        lastMaintenance: '',
        nextMaintenance: '',
        hoursCount: 0,
        cycleCount: 0,
        documents: [],
        photos: resEntity.photoUrl ? [resEntity.photoUrl] : (resEntity.PhotoUrl ? [resEntity.PhotoUrl] : []),
        sensors: [],
        spareParts: []
    };
};

export const updateEquipmentApi = async (equipmentId: string, equipment: Partial<Equipment>): Promise<void> => {
    const res = await axios.get(`${API_URL}/Equipement/${equipmentId}`, getAuthHeaders());
    const dto = res.data;

    const entity = {
        id: dto.id,
        societeId: dto.societeId,
        code: equipment.id || dto.code || '',
        designation: equipment.name || dto.designation || '',
        familleId: dto.familleId || 1,
        localisationId: equipment.localisationId || dto.localisationId,
        marque: equipment.brand !== undefined ? equipment.brand : dto.marque,
        modele: equipment.model !== undefined ? equipment.model : dto.modele,
        numeroSerie: equipment.serialNumber !== undefined ? equipment.serialNumber : dto.numeroSerie,
        dateAchat: equipment.purchaseDate !== undefined ? (equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : null) : dto.dateAchat,
        dateMiseEnService: equipment.commissionDate !== undefined ? (equipment.commissionDate ? equipment.commissionDate.split('T')[0] : null) : dto.dateMiseEnService,
        dateFinGarantie: equipment.endOfWarranty !== undefined ? (equipment.endOfWarranty ? equipment.endOfWarranty.split('T')[0] : null) : dto.dateFinGarantie,
        criticite: equipment.criticality ? mapCriticiteToInt(equipment.criticality) : mapCriticiteToInt(dto.criticite),
        etat: equipment.status ? mapEtatToInt(equipment.status) : mapEtatToInt(dto.etat), 
        fournisseurId: equipment.supplierId ? parseInt(equipment.supplierId, 10) : dto.fournisseurId,
        photoUrl: equipment.photos?.[0] || dto.photoUrl,
        notes: dto.notes
    };

    await axios.put(`${API_URL}/Equipement/${equipmentId}`, entity, getAuthHeaders());
};
