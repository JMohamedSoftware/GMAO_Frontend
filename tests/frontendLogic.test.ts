import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateUnifiedMaintenanceKpis,
  getWorkOrderDurationHours,
  getWorkOrderCost
} from '../src/shared/services/kpiCalculator.ts';
import { hasScopedPermission, getPermissionScope } from '../src/shared/permissions/index.ts';
import { apiClient } from '../src/shared/services/apiClient.ts';
import {
  mapBackendWorkOrder,
  patchWorkOrderStatusApi
} from '../src/features/company/workOrders/api/workOrder.api.ts';
import {
  mapBackendMovementTypeToUi,
  mapBackendMovementTypeLabel,
  mapBackendMovement,
  createMovementApi
} from '../src/features/company/inventory/api/inventory.api.ts';
import { type Equipment, type Incident, type SparePart, type Technician, type WorkOrder } from '../src/shared/types/gmao.ts';

test('KPI Calculator returns null durations/MTTR/MTBF without fake 120m or 35 defaults', () => {
  const noTimeOt: WorkOrder = {
    id: '10',
    numeroOT: 'OT-2026-10',
    equipmentId: '1',
    title: 'Inspection sans horodatage',
    description: 'Contrôle visuel',
    type: 'Correctif',
    priority: 'Moyenne',
    status: 'Terminé',
    createdDate: '2026-10-01T08:00:00Z',
    durationMinutes: 0,
    partsUsed: [],
    externalCost: 0,
    campaign: 'Campagne 2026'
  };

  assert.equal(getWorkOrderDurationHours(noTimeOt), null);

  const emptyKpis = calculateUnifiedMaintenanceKpis({
    equipments: [],
    workOrders: [noTimeOt],
    incidents: [],
    parts: [],
    technicians: []
  });

  assert.equal(emptyKpis.disponibilitePercent, null);
  assert.equal(emptyKpis.mttrHours, null);
  assert.equal(emptyKpis.mttrMinutes, null);
  assert.equal(emptyKpis.mtbfHours, null);
});

test('KPI Calculator computes AFNOR MTTR, MTBF, Availability and Costs consistently and deduplicates failures', () => {
  const equipments: Equipment[] = [
    { id: '1', code: 'EQ-01', name: 'Évaporateur 1', family: 'Thermique', localization: 'Zone A', manufacturer: 'Alfa', serialNumber: 'SN1', commissionDate: '2022-01-01', criticality: 'Critique', hoursCount: 500, status: 'En service' },
    { id: '2', code: 'EQ-02', name: 'Pompe P2', family: 'Pompage', localization: 'Zone B', manufacturer: 'KSB', serialNumber: 'SN2', commissionDate: '2022-01-01', criticality: 'Majeur', hoursCount: 500, status: 'En panne' }
  ];

  const parts: SparePart[] = [
    { id: '10', ref: 'SKF-6204', name: 'Roulement SKF', category: 'Roulements', supplierId: '1', stockCurrent: 2, stockMin: 5, stockMax: 20, unitPrice: 45, location: 'R1' }
  ];

  const technicians: Technician[] = [
    { id: '7', name: 'Ali', specialty: 'Mécanique', hourlyRate: 30, active: true, role: 'Technicien' }
  ];

  const incidents: Incident[] = [
    { id: '100', equipmentId: '2', reportedBy: '3', date: '2026-10-02T08:00:00Z', description: 'Fuite', symptom: 'Fuite', gravity: 'Haute', status: 'Clos' }
  ];

  const workOrders: WorkOrder[] = [
    {
      id: '21',
      numeroOT: 'OT-21',
      incidentId: '100', // liée à l'incident 100 -> ne doit pas être comptée deux fois
      equipmentId: '2',
      title: 'Réparation fuite',
      description: 'Remplacement roulement',
      type: 'Correctif',
      priority: 'Haute',
      status: 'Clôturé',
      createdDate: '2026-10-02T08:00:00Z',
      startDate: '2026-10-02T09:00:00Z',
      endDate: '2026-10-02T11:00:00Z', // 2h -> labor = 60
      technicianId: '7',
      durationMinutes: 120,
      partsUsed: [{ partRef: 'SKF-6204', quantity: 2 }], // 90
      externalCost: 50,
      campaign: 'Campagne'
    },
    {
      id: '22',
      numeroOT: 'OT-22',
      equipmentId: '1',
      title: 'Correctif direct sans DI',
      description: 'Réglage vanne',
      type: 'Correctif',
      priority: 'Moyenne',
      status: 'Terminé',
      createdDate: '2026-10-03T08:00:00Z',
      durationMinutes: 60, // 1h -> labor = 30
      technicianId: '7',
      partsUsed: [],
      externalCost: 0,
      campaign: 'Campagne'
    }
  ];

  const ot21Cost = getWorkOrderCost(workOrders[0], parts, technicians);
  assert.deepEqual(ot21Cost, { labor: 60, parts: 90, external: 50, total: 200 });

  const kpis = calculateUnifiedMaintenanceKpis({ equipments, workOrders, incidents, parts, technicians });
  assert.equal(kpis.failureCount, 2); // 1 DI + 1 OT correctif sans DI
  assert.equal(kpis.totalDowntimeHours, 3); // 2h + 1h
  assert.equal(kpis.mttrHours, 1.5);
  assert.equal(kpis.mttrMinutes, 90);
  assert.equal(kpis.mtbfHours, (1000 - 3) / 2);
  assert.equal(kpis.disponibilitePercent, 99.7);
  assert.equal(kpis.totalLaborCost, 90);
  assert.equal(kpis.totalPartsCost, 90);
  assert.equal(kpis.totalExternalCost, 50);
  assert.equal(kpis.totalMaintenanceCost, 230);
  assert.equal(kpis.criticalPartsBelowMin, 1);
});

test('mapBackendWorkOrder maps Intervention, durationMinutes=0 default, net partsUsed and statuses accurately', () => {
  const mappedChef = mapBackendWorkOrder({
    id: 42,
    numeroOT: 'OT-2026-042',
    statut: 7,
    priorite: 4,
    typeMaintenance: 1,
    equipementId: 9,
    responsableId: 5,
    description: 'Panne pompe vide',
    instructions: 'Vérifier garniture',
    coutSousTraitance: 180,
    intervention: {
      diagnostic: 'Garniture fissurée',
      solution: 'Remplacement complet',
      observation: '[CHECKLIST:[{"label":"Consignation","done":true}]]',
      tempsPasse: 1.5
    },
    mouvementsStock: [
      { id: 1, pieceId: 3, quantite: 4, type: 2, piece: { reference: 'JOINT-42' } },
      { id: 2, pieceId: 3, quantite: 1, type: 3, piece: { reference: 'JOINT-42' } }
    ]
  });

  assert.equal(mappedChef.status, 'Affecté Chef');
  assert.equal(mappedChef.chefEquipeId, '5');
  assert.equal(mappedChef.priority, 'Critique');
  assert.equal(mappedChef.durationMinutes, 90);
  assert.equal(mappedChef.diagnostic, 'Garniture fissurée');
  assert.equal(mappedChef.solution, 'Remplacement complet');
  assert.match(mappedChef.observation || '', /CHECKLIST/);
  assert.equal(mappedChef.externalCost, 180);
  assert.deepEqual(mappedChef.partsUsed, [{ partRef: 'JOINT-42', quantity: 3 }]);

  const mappedNoTime = mapBackendWorkOrder({
    id: 43,
    statut: 2,
    priorite: 2,
    typeMaintenance: 2,
    equipementId: 9
  });
  assert.equal(mappedNoTime.status, 'En attente');
  assert.equal(mappedNoTime.durationMinutes, 0);
});

test('patchWorkOrderStatusApi sends nested Intervention and preserves instructions & coutSousTraitance', async () => {
  const originalPut = apiClient.put;
  let capturedUrl = '';
  let capturedBody: any = null;

  (apiClient as any).put = async (url: string, body: any) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: {} };
  };

  try {
    const baseOt: WorkOrder = {
      id: '42',
      numeroOT: 'OT-2026-042',
      equipmentId: '9',
      title: 'Remplacement joint',
      description: 'Instructions initiales',
      type: 'Correctif',
      priority: 'Haute',
      status: 'En cours',
      createdDate: '2026-10-05T08:00:00Z',
      durationMinutes: 90,
      partsUsed: [],
      externalCost: 250,
      campaign: '',
      responsableId: 5,
      technicianId: '12'
    };

    await patchWorkOrderStatusApi('42', 'Terminé', baseOt, {
      diagnostic: 'Joint usé',
      solution: 'Changement effectué',
      observation: 'RAS'
    });

    assert.equal(capturedUrl, '/api/OrdresTravail/42');
    assert.equal(capturedBody.statut, 5);
    assert.equal(capturedBody.instructions, 'Instructions initiales');
    assert.equal(capturedBody.coutPieces, null);
    assert.equal(capturedBody.coutSousTraitance, 250);
    assert.deepEqual(capturedBody.intervention, {
      oTId: 42,
      diagnostic: 'Joint usé',
      solution: 'Changement effectué',
      observation: 'RAS',
      tempsPasse: 1.5
    });
  } finally {
    (apiClient as any).put = originalPut;
  }
});

test('Inventory movement mapping supports all 5 backend types and passes numeric oTId only', async () => {
  assert.equal(mapBackendMovementTypeToUi(1), 'in');
  assert.equal(mapBackendMovementTypeToUi(2), 'out');
  assert.equal(mapBackendMovementTypeToUi(3), 'in');
  assert.equal(mapBackendMovementTypeToUi(4), 'out');
  assert.equal(mapBackendMovementTypeToUi(5), 'inventaire');
  assert.equal(mapBackendMovementTypeLabel(4), 'Casse / Rebut');
  assert.equal(mapBackendMovementTypeLabel(5), 'Inventaire physique');

  const mapped = mapBackendMovement({
    id: 7,
    date: '2026-10-10T10:00:00Z',
    pieceId: 12,
    piece: { reference: 'P-12' },
    quantite: 5,
    type: 5,
    motif: 'Ajustement inventaire',
    oTId: 88
  });
  assert.equal(mapped.type, 'inventaire');
  assert.equal(mapped.typeCode, 5);
  assert.equal(mapped.otId, '88');
  assert.equal(mapped.partRef, 'P-12');

  const originalPost = apiClient.post;
  const capturedPayloads: any[] = [];
  (apiClient as any).post = async (_url: string, body: any) => {
    capturedPayloads.push(body);
    return { data: { id: 99, stockApres: 10 } };
  };

  try {
    await createMovementApi({
      pieceId: '12',
      qty: 4,
      type: 'out',
      typeCode: 4,
      otId: 'Consommation atelier', // texte libre -> ne doit pas être envoyé comme oTId
      reason: 'Pièce cassée',
      userId: '3'
    });
    assert.equal(capturedPayloads[0].type, 4);
    assert.equal(capturedPayloads[0].oTId, null);
    assert.equal(capturedPayloads[0].motif, 'Pièce cassée');

    await createMovementApi({
      pieceId: '12',
      qty: 10,
      type: 'inventaire',
      typeCode: 5,
      otId: '45',
      reason: 'Inventaire annuel',
      userId: '3'
    });
    assert.equal(capturedPayloads[1].type, 5);
    assert.equal(capturedPayloads[1].oTId, 45);
  } finally {
    (apiClient as any).post = originalPost;
  }
});

test('hasScopedPermission enforces TEAM isolation using equipeId and falls back cleanly', () => {
  const teamPerms = ['WORKORDER_VIEW_TEAM'];
  assert.equal(getPermissionScope(teamPerms, 'WORKORDER_VIEW'), 'TEAM');

  // Même équipe que la ressource -> autorisé même si non propriétaire
  assert.equal(hasScopedPermission(teamPerms, 'WORKORDER_VIEW', [15], 10, [3], 3), true);

  // Équipe différente et non propriétaire -> refusé
  assert.equal(hasScopedPermission(teamPerms, 'WORKORDER_VIEW', [15], 10, [4], 3), false);

  // equipeId manquant (undefined) et non propriétaire -> refusé
  assert.equal(hasScopedPermission(teamPerms, 'WORKORDER_VIEW', [15], 10, [3], undefined), false);

  // OWN: propriétaire autorisé, collègue d'équipe refusé
  const ownPerms = ['WORKORDER_UPDATE_OWN'];
  assert.equal(hasScopedPermission(ownPerms, 'WORKORDER_UPDATE', [10], 10, [3], 3), true);
  assert.equal(hasScopedPermission(ownPerms, 'WORKORDER_UPDATE', [15], 10, [3], 3), false);
});
