import { Supplier, SparePart, Technician, UserAccount, Equipment, Incident, WorkOrder, Campaign } from '@/shared/types/gmao';


const initialSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'SKF France', contact: 'Jean-Pierre Lemoine', phone: '+33 1 41 88 30 00', email: 'jp.lemoine@skf.com', address: '204 Boulevard de Verdun, Courbevoie', contracts: [{ title: 'Contrat Maintenance Roulements', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Actif', cost: 12000 }], rating: 4.8 },
  { id: 'SUP-002', name: 'Siemens Industrial Solutions', contact: 'Sophie Martin', phone: '+33 821 20 00 21', email: 'sophie.martin@siemens.com', address: '40 Avenue des Fruitiers, Saint-Denis', contracts: [{ title: 'Support Automates PLC Ligne 1 & 2', startDate: '2025-06-01', endDate: '2027-06-01', status: 'Actif', cost: 24000 }], rating: 4.5 },
  { id: 'SUP-003', name: 'Alfa Laval S.A.', contact: 'Marc Dubois', phone: '+33 1 69 59 70 00', email: 'marc.dubois@alfalaval.com', address: 'Espace Lumière, 5 Ruelle des Bouleaux, Saint-Denis', contracts: [{ title: 'Contrat Evaporateurs', startDate: '2026-03-01', endDate: '2027-03-01', status: 'Actif', cost: 35000 }], rating: 4.9 }
];

const initialParts: SparePart[] = [
  { ref: 'REF-BRG-102', name: 'Roulement à billes SKF 6306-2RS', category: 'Roulements', supplierId: 'SUP-001', stockCurrent: 8, stockMin: 15, stockMax: 100, unitPrice: 35.5, location: 'Magasin A - Allée 2', photo: 'https://images.unsplash.com/photo-1634149688402-23f46f497405?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-VALV-304', name: 'Vanne d\'arrêt Inox DN50', category: 'Vannes', supplierId: 'SUP-003', stockCurrent: 3, stockMin: 5, stockMax: 20, unitPrice: 185.0, location: 'Magasin B - Allée 1', photo: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-PLC-S7', name: 'Module E/S Automate Siemens S7-1500', category: 'Automatisme', supplierId: 'SUP-002', stockCurrent: 1, stockMin: 4, stockMax: 8, unitPrice: 650.0, location: 'Armoire Élec - Box 3', photo: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-GASK-EVAP', name: 'Joint EPDM Évaporateur Ø250', category: 'Joints', supplierId: 'SUP-003', stockCurrent: 12, stockMin: 8, stockMax: 40, unitPrice: 28.0, location: 'Magasin A - Allée 4', photo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-PUMP-SEAL', name: 'Garniture mécanique pompe centrifuge', category: 'Garnitures', supplierId: 'SUP-001', stockCurrent: 2, stockMin: 6, stockMax: 15, unitPrice: 120.0, location: 'Magasin B - Allée 3', photo: 'https://images.unsplash.com/photo-1611078709540-5eafb9b65287?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-BELT-COV', name: 'Courroie trapézoïdale convoyeur B-85', category: 'Courroies', supplierId: 'SUP-001', stockCurrent: 6, stockMin: 4, stockMax: 20, unitPrice: 18.5, location: 'Magasin A - Allée 1', photo: 'https://images.unsplash.com/photo-1590487532357-19cb90729352?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-FUSE-63A', name: 'Fusible NH 63A Classe gG', category: 'Électrique', supplierId: 'SUP-002', stockCurrent: 20, stockMin: 10, stockMax: 50, unitPrice: 4.2, location: 'Armoire Élec - Box 1', photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-PNEU-CYL', name: 'Vérin pneumatique ISO 15552 Ø63x200', category: 'Pneumatique', supplierId: 'SUP-003', stockCurrent: 2, stockMin: 3, stockMax: 10, unitPrice: 95.0, location: 'Magasin B - Allée 5', photo: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&auto=format&fit=crop&q=60' }
];

const initialTechnicians: Technician[] = [
  { id: 'TECH-001', name: 'Ahmed Bensaid', role: 'Électromécanicien', qualification: 'Niveau III', skills: ['Pannes moteur', 'Câblage triphasé', 'Soudure TIG'], status: 'Occupé', hourlyRate: 42, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'TECH-002', name: 'Karim Bricole', role: 'Automaticien', qualification: 'Ingénieur', skills: ['Programmation PLC', 'Scada', 'Boucles PID'], status: 'Occupé', hourlyRate: 55, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'TECH-003', name: 'Sami Trabelsi', role: 'Mécanicien', qualification: 'Niveau II', skills: ['Pompes', 'Convoyeurs', 'Graissage'], status: 'Disponible', hourlyRate: 36, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { id: 'TECH-004', name: 'Nour Belhadj', role: 'Électricien industriel', qualification: 'Niveau II', skills: ['Armoires électriques', 'VFD', 'Éclairage'], status: 'Disponible', hourlyRate: 38, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' }
];

const initialUsers: UserAccount[] = [];

const initialEquipments: Equipment[] = [
  {
    id: 'LIGNE-1',
    name: 'Ligne Principale de Production',
    category: 'Ligne',
    subFamily: 'Ligne de Tri et Lavage',
    brand: 'FMC Technologies',
    model: 'Line-2000',
    serialNumber: 'LIG-2022-001',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Atelier Principal',
    responsibility: 'PRODUCTION',
    gipPresence: true,
    purchaseDate: '2022-01-10',
    endOfWarranty: '2027-01-10',
    barcode: '1234567890123',
    inventory: 'INV-2022-10',
    commissionDate: '2022-04-15',
    location: 'Lavage',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 94,
    lastMaintenance: '2026-05-10',
    nextMaintenance: '2026-08-10',
    hoursCount: 14250,
    cycleCount: 320,
    documents: [
      { name: 'Plan global Ligne 1.pdf', type: 'notice', size: '4.2 MB', url: '#' },
    ],
    photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'],
    sensors: [],
    spareParts: []
  },
  {
    id: 'EQ-BOIL-001',
    parentId: 'LIGNE-1',
    name: 'Chaudière Thermique Babcock VAP 3000',
    category: 'Boilers',
    subFamily: 'Chaudière vapeur gaz',
    brand: 'Babcock Wanson',
    model: 'VAP-3000-G',
    serialNumber: 'BW-2022-8947',
    supplierId: 'SUP-002',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Local Technique',
    responsibility: 'TECHNIQUE',
    gipPresence: true,
    purchaseDate: '2022-02-15',
    endOfWarranty: '2026-02-15',
    barcode: '4567891230123',
    inventory: 'INV-2022-11',
    commissionDate: '2022-04-15',
    location: 'Utilités',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 94,
    lastMaintenance: '2026-05-10',
    nextMaintenance: '2026-08-10',
    hoursCount: 14250,
    cycleCount: 320,
    documents: [
      { name: 'Manuel Exploitation VAP3000.pdf', type: 'notice', size: '4.2 MB', url: '#' },
      { name: 'Schéma Électrique VAP_E03.dwg', type: 'electrical', size: '1.8 MB', url: '#' }
    ],
    photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'],
    sensors: [
      { name: 'Pression Vapeur', value: 8.5, unit: 'bar', status: 'normal', history: [8.2, 8.4, 8.5, 8.5, 8.6, 8.5] },
      { name: 'Température Fumées', value: 165.2, unit: '°C', status: 'normal', history: [162.0, 164.5, 165.0, 165.2, 165.8] }
    ],
    spareParts: ['REF-VALV-304', 'REF-SENS-TEMP']
  },
  {
    id: 'EQ-EVAP-001',
    parentId: 'LIGNE-1',
    name: 'Évaporateur Concentrateur AlfaLaval N°1',
    category: 'Evaporators',
    subFamily: 'Concentrateur triple effet',
    brand: 'Alfa Laval',
    model: 'Evap-Tomato-3E',
    serialNumber: 'AL-2021-0021',
    supplierId: 'SUP-003',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Atelier Concentration',
    responsibility: 'PRODUCTION',
    purchaseDate: '2021-05-20',
    barcode: '9876543210123',
    commissionDate: '2021-06-20',
    location: 'Concentration',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 88,
    lastMaintenance: '2026-06-01',
    nextMaintenance: '2026-09-01',
    hoursCount: 18400,
    cycleCount: 185,
    documents: [{ name: 'AlfaLaval Notice Evap.pdf', type: 'notice', size: '6.8 MB', url: '#' }],
    photos: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80'],
    sensors: [
      { name: 'Débit d\'Alimentation', value: 45.0, unit: 't/h', status: 'normal', history: [44.8, 45.0, 45.1, 45.0, 45.0] },
      { name: 'Taux Concentration', value: 28.5, unit: '°Brix', status: 'normal', history: [28.2, 28.4, 28.5, 28.5, 28.6] }
    ],
    spareParts: ['REF-GASK-EVAP', 'REF-VALV-304']
  },
  {
    id: 'EQ-PUMP-104',
    parentId: 'EQ-EVAP-001',
    name: 'Pompe de transfert concentré P-104',
    category: 'Pumps',
    subFamily: 'Pompe centrifuge Inox',
    brand: 'Grundfos',
    model: 'CRN-45',
    serialNumber: 'GR-8899-741',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Atelier Concentration',
    responsibility: 'TECHNIQUE',
    gipPresence: false,
    commissionDate: '2021-06-25',
    location: 'Concentration',
    criticality: 'Moyenne',
    status: 'En panne',
    healthIndex: 45,
    lastMaintenance: '2026-04-18',
    nextMaintenance: '2026-07-18',
    hoursCount: 6850,
    cycleCount: 1240,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Vibrations Palier', value: 1.8, unit: 'mm/s', status: 'normal', history: [1.5, 1.7, 1.8, 1.8, 1.9, 1.8] },
      { name: 'Température Enroulement', value: 58.4, unit: '°C', status: 'normal', history: [56.2, 57.8, 58.1, 58.4, 58.4] }
    ],
    spareParts: ['REF-BRG-102']
  },
  {
    id: 'EQ-CONV-201',
    name: 'Convoyeur d\'inspection visuelle',
    category: 'Conveyors',
    subFamily: 'Bande transporteuse',
    brand: 'Intralox',
    model: 'S800-OpenHinge',
    serialNumber: 'IX-2023-055',
    site: 'USINE DE LINO',
    building: 'BATIMENT SUD',
    floor: 'Usine',
    room: 'Réception',
    responsibility: 'PRODUCTION',
    gipPresence: false,
    commissionDate: '2023-02-10',
    location: 'Tri',
    criticality: 'Haute',
    status: 'En service',
    healthIndex: 98,
    lastMaintenance: '2026-06-12',
    nextMaintenance: '2026-07-12',
    hoursCount: 22400,
    cycleCount: 4500,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Vitesse Tapis', value: 1.2, unit: 'm/s', status: 'normal', history: [1.2, 1.2, 1.2, 1.2, 1.2] },
      { name: 'Intensité Moteur', value: 14.2, unit: 'A', status: 'warning', history: [12.0, 13.5, 14.1, 14.2, 14.5] }
    ],
    spareParts: ['REF-BELT-COV', 'REF-BRG-102']
  },
  {
    id: 'EQ-AUTO-001',
    name: 'Autoclave de Stérilisation Ligne 1',
    category: 'Autoclaves',
    subFamily: 'Autoclave à jet d\'eau surchauffée',
    brand: 'FMC Technologies',
    model: 'Steril-Host-4',
    serialNumber: 'FMC-AC-2021-04',
    site: 'USINE DE LINO',
    building: 'BATIMENT SUD',
    floor: 'Usine',
    room: 'Concentration - Ligne 1',
    responsibility: 'PRODUCTION',
    commissionDate: '2021-09-12',
    location: 'Conditionnement',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 96,
    lastMaintenance: '2026-05-25',
    nextMaintenance: '2026-08-25',
    hoursCount: 8900,
    cycleCount: 2100,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Température Autoclave', value: 121.5, unit: '°C', status: 'normal', history: [120.0, 121.2, 121.5, 121.5, 121.6] },
      { name: 'Pression Interne', value: 2.1, unit: 'bar', status: 'normal', history: [2.0, 2.1, 2.1, 2.1, 2.2] }
    ],
    spareParts: ['REF-VALV-304']
  },
  {
    id: 'EQ-PACK-001',
    name: 'Remplisseuse Aseptique Conditionnement',
    category: 'Packaging lines',
    subFamily: 'Remplisseuse Bag-in-Box',
    brand: 'Krones',
    model: 'AseptFill-200',
    serialNumber: 'KR-2024-88',
    site: 'USINE DE LINO',
    building: 'BATIMENT SUD',
    floor: 'Usine',
    room: 'Conditionnement',
    responsibility: 'PRODUCTION',
    commissionDate: '2024-01-15',
    location: 'Conditionnement',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 92,
    lastMaintenance: '2026-05-28',
    nextMaintenance: '2026-08-28',
    hoursCount: 7420,
    cycleCount: 14520,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Pression Tête Aseptique', value: 5.2, unit: 'bar', status: 'normal', history: [5.0, 5.1, 5.2, 5.2, 5.2] },
      { name: 'Débit Remplissage', value: 8.4, unit: 'l/s', status: 'normal', history: [8.2, 8.4, 8.4, 8.4, 8.5] }
    ],
    spareParts: ['REF-PNEU-CYL', 'REF-GASK-EVAP']
  }
];

const initialIncidents: Incident[] = [
  { id: 'DI-2026-001', equipmentId: 'EQ-CONV-201', description: 'Bruit suspect au niveau du palier moteur et échauffement anormal. Odeur de brûlé signalée.', reportedBy: 'Youssef Mansouri (Prod)', reportedDate: '2026-07-06T10:14:00Z', urgency: 'Haute', priority: 'P2', technicianId: 'TECH-001', status: 'Validé' },
  { id: 'DI-2026-002', equipmentId: 'EQ-PUMP-104', description: 'Fuite au niveau de la garniture mécanique pendant la phase de NEP. Débit de fuite estimé à 5 L/h.', reportedBy: 'Karim Gherbi (Resp)', reportedDate: '2026-07-07T08:30:00Z', urgency: 'Critique', priority: 'P1', technicianId: 'TECH-003', status: 'Transformé en OT', workOrderId: 'OT-2026-004' },
  { id: 'DI-2026-003', equipmentId: 'EQ-AUTO-001', description: 'Alarme pression différentielle déclenchée. Filtre colmatage possible sur le circuit vapeur.', reportedBy: 'Ahmed Bensaid (Tech)', reportedDate: '2026-07-07T11:05:00Z', urgency: 'Haute', priority: 'P2', status: 'Nouveau' },
  { id: 'DI-2026-004', equipmentId: 'EQ-BOIL-001', description: 'Voyant défaut brûleur allumé intermittent. L\'équipement fonctionne mais le technicien doit vérifier.', reportedBy: 'Youssef Mansouri (Prod)', reportedDate: '2026-07-08T07:00:00Z', urgency: 'Moyenne', priority: 'P3', technicianId: 'TECH-004', status: 'Nouveau' },
  { id: 'DI-2026-005', equipmentId: 'EQ-EVAP-001', description: 'Chute du taux de concentration Brix observée sur le 3ème effet. Perte de vacuum.', reportedBy: 'Karim Gherbi (Resp)', reportedDate: '2026-07-08T09:45:00Z', urgency: 'Critique', priority: 'P1', status: 'Validé' },
  { id: 'DI-2026-006', equipmentId: 'EQ-PACK-001', description: 'Blocage répété du poussoir d\'ensachage. Arrêt ligne 3 fois en 2h.', reportedBy: 'Youssef Mansouri (Prod)', reportedDate: '2026-07-09T13:20:00Z', urgency: 'Haute', priority: 'P3', status: 'Rejeté' },
  { id: 'DI-2026-007', equipmentId: 'EQ-CONV-201', description: 'Déclenchement disjoncteur moteur M3 sans raison apparente. Réarmement effectué manuellement.', reportedBy: 'Nour Belhadj (Tech)', reportedDate: '2026-07-10T06:55:00Z', urgency: 'Moyenne', priority: 'P3', technicianId: 'TECH-002', status: 'Nouveau' },
  { id: 'DI-2026-008', equipmentId: 'EQ-PACK-001', description: 'Fuite d\'air comprimé mineure sur vérin V2.', reportedBy: 'Ahmed Bensaid (Tech)', reportedDate: '2026-07-05T08:00:00Z', urgency: 'Faible', priority: 'P4', status: 'Clos' }
];

const initialWorkOrders: WorkOrder[] = [
  {
    id: 'OT-2026-001', equipmentId: 'EQ-BOIL-001',
    title: 'Inspection de sécurité brûleur chaudière',
    description: 'Visite réglementaire trimestrielle. Contrôle d\'étanchéité des vannes gaz et test des sécurités pressostats.',
    type: 'Préventif', priority: 'Haute', status: 'Terminé',
    createdDate: '2026-06-15T08:00:00Z', startDate: '2026-06-20T08:00:00Z', endDate: '2026-06-20T12:00:00Z',
    technicianId: 'TECH-001', assignedBy: 'Karim Gherbi',
    durationMinutes: 240, partsUsed: [{ partRef: 'REF-VALV-304', quantity: 1 }], externalCost: 0,
    campaign: 'Campagne 2026',
    diagnostic: 'Brûleur en bon état. Étanchéité vérifiée. Remplacement vanne gaz DN50 préventif.',
    solution: 'Remplacement vanne + test étanchéité au détecteur gaz. Remis en service.',
    signature: 'signed'
  },
  {
    id: 'OT-2026-002', equipmentId: 'EQ-EVAP-001',
    title: 'Remplacement des joints d\'étanchéité porte évaporateur',
    description: 'Remplacement suite à perte d\'efficacité du vide au 3ème effet. Remplacer les joints alimentaires.',
    type: 'Correctif', priority: 'Haute', status: 'En cours',
    createdDate: '2026-07-05T09:12:00Z', startDate: '2026-07-05T14:00:00Z',
    technicianId: 'TECH-002', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [{ partRef: 'REF-GASK-EVAP', quantity: 4 }], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-003', equipmentId: 'EQ-PACK-001',
    title: 'Révision trimestrielle remplisseuse aseptique',
    description: 'Contrôle de toutes les têtes de remplissage, nettoyage des buses, vérification des joints toriques.',
    type: 'Préventif', priority: 'Moyenne', status: 'Affecté',
    createdDate: '2026-07-08T07:30:00Z',
    technicianId: 'TECH-003', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-004', equipmentId: 'EQ-PUMP-104',
    title: 'Remplacement garniture mécanique pompe P-104',
    description: 'Fuite détectée sur garniture lors phase NEP. Pompe à isoler et remplacer la garniture mécanique.',
    type: 'Correctif', priority: 'Critique', status: 'En cours',
    createdDate: '2026-07-07T09:00:00Z', startDate: '2026-07-07T14:00:00Z',
    technicianId: 'TECH-001', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [{ partRef: 'REF-PUMP-SEAL', quantity: 1 }], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-005', equipmentId: 'EQ-CONV-201',
    title: 'Remplacement courroie convoyeur tri visuel',
    description: 'Courroie présentant des craquèlements et une élongation anormale. Remplacement préventif.',
    type: 'Préventif', priority: 'Moyenne', status: 'En attente',
    createdDate: '2026-07-09T10:00:00Z',
    assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-006', equipmentId: 'EQ-AUTO-001',
    title: 'Contrôle alarme pression différentielle autoclave',
    description: 'Vérification filtre vapeur et calibrage pressostat différentiel suite à alarme répétée.',
    type: 'Correctif', priority: 'Haute', status: 'Affecté',
    createdDate: '2026-07-10T08:00:00Z',
    technicianId: 'TECH-004', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-007', equipmentId: 'EQ-BOIL-001',
    title: 'Nettoyage tubes chaudière – curage préventif',
    description: 'Détartrage chimique des tubes chaudière en préparation de la haute saison.',
    type: 'Préventif', priority: 'Faible', status: 'Terminé',
    createdDate: '2026-06-01T07:00:00Z', startDate: '2026-06-03T07:00:00Z', endDate: '2026-06-03T15:00:00Z',
    technicianId: 'TECH-003', assignedBy: 'Karim Gherbi',
    durationMinutes: 480, partsUsed: [], externalCost: 320,
    campaign: 'Campagne 2026',
    diagnostic: 'Dépôts tartreux importants dans les tubes. Curage nécessaire.',
    solution: 'Curage à l\'acide citrique dilué + rinçage eau déminéralisée. Résultat conforme.',
    signature: 'signed'
  },
  {
    id: 'OT-2026-008', equipmentId: 'EQ-EVAP-001',
    title: 'Réglage boucle PID concentration Brix',
    description: 'Dérive du Brix en sortie évaporateur. Recalage des paramètres PID automate.',
    type: 'Curatif', priority: 'Haute', status: 'En attente',
    createdDate: '2026-07-10T11:30:00Z',
    assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  }
];

const initialCampaigns: Campaign[] = [
  { id: 'CAMP-2025', name: 'Campagne Tomates 2025', startDate: '2025-07-01', endDate: '2025-10-15', status: 'Terminée' },
  { id: 'CAMP-2026', name: 'Campagne Tomates 2026', startDate: '2026-07-01', endDate: '2026-10-15', status: 'En cours' }
];

export { initialSuppliers, initialParts, initialTechnicians, initialUsers, initialEquipments, initialIncidents, initialWorkOrders, initialCampaigns };
