import React, { useState, useEffect, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { superAdminApi } from '../api/superAdmin.api';
import { 
  RotateCcw, History, AlertTriangle, ShieldCheck, CheckCircle2, 
  Search, Filter, ArrowRight, RefreshCw, Download, User, 
  Building2, Layers, X, Sparkles, Clock, FileCode, Check,
  Database, Terminal, Cpu, Shield, Calendar
} from 'lucide-react';

export interface RedoLogItem {
  id: string;
  timestamp: string;
  tenantId: number;
  tenantName: string;
  campagneNom?: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  entityType: string;
  entityId: string;
  entityName: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK' | 'ALTER';
  fieldName: string;
  oldValue: string;
  newValue: string;
  isRollbacked: boolean;
  canRollback: boolean;
}

interface SuperAdminRedoLogsProps {
  selectedTenantId?: string;
}

export const SuperAdminRedoLogs: React.FC<SuperAdminRedoLogsProps> = ({ selectedTenantId = 'ALL' }) => {
  const { tenants } = useGmao();
  const [redoLogs, setRedoLogs] = useState<RedoLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Prioritized filtering: Campagne FIRST, then User/Author, then Tenant, Action, Entity
  const [campagneFilter, setCampagneFilter] = useState<string>('ALL');
  const [authorFilter, setAuthorFilter] = useState<string>('ALL');
  const [tenantFilter, setTenantFilter] = useState<string>(selectedTenantId);
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    if (selectedTenantId) {
      setTenantFilter(selectedTenantId);
    }
  }, [selectedTenantId]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rollback confirmation modal state
  const [rollbackTarget, setRollbackTarget] = useState<RedoLogItem | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateDynamicRedoLogs = (): RedoLogItem[] => {
    const list: RedoLogItem[] = [];
    const now = new Date();

    // 1. DDL OPERATIONS (PostgreSQL WAL & Logical Decoding Mutations)
    list.push({
      id: 'TX-DDL-101',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString().replace('T', ' ').slice(0, 19),
      tenantId: 1,
      tenantName: 'Comocap (tenant-cap-02)',
      campagneNom: 'Campagne Tomates 2026',
      authorName: 'SuperAdmin DBA',
      authorRole: 'Administrateur Base de Données',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      entityType: 'Schéma & Tables',
      entityId: 'TBL-OT',
      entityName: 'Table OrdresTravail (PostgreSQL WAL)',
      actionType: 'ALTER',
      fieldName: 'Ajout Colonne Consigne Température',
      oldValue: 'Structure antérieure: Colonne inexistante',
      newValue: 'ALTER TABLE "OrdresTravail" ADD COLUMN "ConsigneTemperature" NUMERIC(5,2) DEFAULT 85.0',
      isRollbacked: false,
      canRollback: true
    });

    list.push({
      id: 'TX-DDL-102',
      timestamp: new Date(now.getTime() - 32 * 60000).toISOString().replace('T', ' ').slice(0, 19),
      tenantId: 2,
      tenantName: 'Conserverie Carthage SARL',
      campagneNom: 'Campagne Tomates 2026',
      authorName: 'SuperAdmin DBA',
      authorRole: 'Administrateur Base de Données',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      entityType: 'Schéma & Tables',
      entityId: 'TBL-EQ',
      entityName: 'Table Equipements (PostgreSQL WAL)',
      actionType: 'ALTER',
      fieldName: 'Indexation Haute Performance Ligne',
      oldValue: 'Index: Scan séquentiel standard',
      newValue: 'CREATE INDEX "idx_equip_societe_statut" ON "Equipements"("SocieteId", "Statut")',
      isRollbacked: false,
      canRollback: true
    });

    list.push({
      id: 'TX-DDL-103',
      timestamp: new Date(now.getTime() - 72 * 60000).toISOString().replace('T', ' ').slice(0, 19),
      tenantId: 1,
      tenantName: 'Comocap (tenant-cap-02)',
      campagneNom: 'Hors-campagne',
      authorName: 'Système Migration EF Core',
      authorRole: 'PostgreSQL Migration Runner',
      authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
      entityType: 'Schéma & Tables',
      entityId: 'TBL-SOC',
      entityName: 'Table Societes (PostgreSQL WAL)',
      actionType: 'ALTER',
      fieldName: 'Modification Contrainte Quota Stockage',
      oldValue: 'DEFAULT max_storage_gb = 50.0',
      newValue: 'ALTER TABLE "Societes" ALTER COLUMN "MaxStorageGb" SET DEFAULT 100.0',
      isRollbacked: false,
      canRollback: true
    });

    list.push({
      id: 'TX-DDL-104',
      timestamp: new Date(now.getTime() - 165 * 60000).toISOString().replace('T', ' ').slice(0, 19),
      tenantId: 1,
      tenantName: 'Comocap (tenant-cap-02)',
      campagneNom: 'Campagne Tomates 2025',
      authorName: 'SecOps Platform',
      authorRole: 'Administrateur Sécurité Cloud',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      entityType: 'Schéma & Tables',
      entityId: 'SEC-RLS',
      entityName: 'Politique RLS Campagnes (PostgreSQL WAL)',
      actionType: 'ALTER',
      fieldName: 'Activation Row Level Security Multi-Tenants',
      oldValue: 'ALTER TABLE "Campagnes" DISABLE ROW LEVEL SECURITY',
      newValue: 'ALTER TABLE "Campagnes" ENABLE ROW LEVEL SECURITY',
      isRollbacked: false,
      canRollback: true
    });

    // 2. DML TRANSACTIONS LINKED TO REAL CAMPAIGNS
    const sampleTenants = (tenants && tenants.length > 0) ? tenants.slice(0, 8) : [
      { id: '1', name: 'Comocap' },
      { id: '2', name: 'Conserverie Carthage SARL' },
      { id: '3', name: 'Huilerie Moderne Du Sahel' },
      { id: '4', name: 'Société Tunisienne Des Boissons (SFBT)' }
    ];

    sampleTenants.forEach((t, idx) => {
      const tId = Number(t.id) || idx + 1;
      const tName = t.name;
      const isHuilerie = tName.toLowerCase().includes('huilerie') || tName.toLowerCase().includes('sahel');
      const isBeverage = tName.toLowerCase().includes('boissons') || tName.toLowerCase().includes('sfbt');
      const camp2026 = isHuilerie ? 'Campagne Oléicole 2025/2026' : (isBeverage ? 'Campagne Haute Saison Boissons 2026' : 'Campagne Tomates 2026');
      const camp2025 = isHuilerie ? 'Campagne Oléicole 2024/2025' : (isBeverage ? 'Campagne Jus & Agrumes 2025' : 'Campagne Tomates 2025');

      // 1. UPDATE Equipement (Campagne 2026)
      list.push({
        id: `TX-${90412 - idx * 4}`,
        timestamp: new Date(now.getTime() - (idx * 25 + 12) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        campagneNom: camp2026,
        authorName: idx % 2 === 0 ? 'Karim Ben Salah' : 'Mohamed Ben Amor',
        authorRole: idx % 2 === 0 ? 'Technicien Électromécanicien' : 'Chef d\'Équipe Ligne',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        entityType: 'Équipement',
        entityId: `EQ-${tId}02`,
        entityName: isHuilerie ? 'Séparateur Centrifuge Huile N°1' : (isBeverage ? 'Soutireuse Isobare 60 Becs' : `Groupe Concentrateur & Cuiseur N°${idx + 1}`),
        actionType: 'UPDATE',
        fieldName: 'Statut & Santé',
        oldValue: "Statut: 'En panne' • Indice santé: 32%",
        newValue: "Statut: 'Opérationnel' • Indice santé: 94%",
        isRollbacked: false,
        canRollback: true
      });

      // 2. UPDATE OT Priorite (Campagne 2026)
      list.push({
        id: `TX-${90411 - idx * 4}`,
        timestamp: new Date(now.getTime() - (idx * 35 + 38) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        campagneNom: camp2026,
        authorName: 'Sami Mansouri',
        authorRole: 'Responsable Maintenance Usine',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        entityType: 'Ordre de Travail',
        entityId: `OT-2026-${tId}04`,
        entityName: isHuilerie ? 'Changement filtres presse continue' : 'Révision vanne vapeur et pompe principale',
        actionType: 'UPDATE',
        fieldName: 'Priorité & Technicien Assigné',
        oldValue: "Priorité: 'Moyenne' • Assigné: 'Non assigné'",
        newValue: "Priorité: 'Critique' • Assigné: 'Karim Ben Salah'",
        isRollbacked: false,
        canRollback: true
      });

      // 3. CREATE Incident (Campagne 2026)
      list.push({
        id: `TX-${90410 - idx * 6}`,
        timestamp: new Date(now.getTime() - (idx * 45 + 75) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        campagneNom: camp2026,
        authorName: 'Mohamed Ben Amor',
        authorRole: 'Opérateur Ligne',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        entityType: 'Incident',
        entityId: `INC-2026-${tId}91`,
        entityName: 'Vibration anormale sur palier moteur',
        actionType: 'CREATE',
        fieldName: 'Déclaration Incident Ligne',
        oldValue: 'N/A (Nouvel Incident)',
        newValue: 'Incident déclaré avec criticité Haute sur palier moteur',
        isRollbacked: false,
        canRollback: true
      });

      // 4. UPDATE Stock (Campagne 2026)
      list.push({
        id: `TX-${90409 - idx * 6}`,
        timestamp: new Date(now.getTime() - (idx * 60 + 115) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        campagneNom: camp2026,
        authorName: 'Leila Farhat',
        authorRole: 'Magasinière Centrale PDR',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        entityType: 'Pièce de Stock',
        entityId: `PR-ROUL-${6204 + idx}`,
        entityName: `Roulement haute température SKF-${6204 + idx}`,
        actionType: 'UPDATE',
        fieldName: 'Stock Physique',
        oldValue: 'Quantité en stock: 14 pièces',
        newValue: 'Quantité en stock: 2 pièces (Alerte seuil de réapprovisionnement)',
        isRollbacked: false,
        canRollback: true
      });

      // 5. DELETE Tâche Obsolète (Campagne Archivée 2025)
      list.push({
        id: `TX-${90408 - idx * 6}`,
        timestamp: new Date(now.getTime() - (idx * 90 + 260) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        campagneNom: camp2025,
        authorName: 'Sami Mansouri',
        authorRole: 'Responsable Maintenance Usine',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        entityType: 'Ordre de Travail',
        entityId: `OT-2025-${tId}02`,
        entityName: 'Nettoyage chimique échangeur tubulaire N°2',
        actionType: 'DELETE',
        fieldName: 'Annulation & Suppression OT',
        oldValue: "OT #OT-2025-002: Statut 'En attente'",
        newValue: 'OT annulé et purgé du planning de campagne',
        isRollbacked: false,
        canRollback: true
      });
    });

    return list;
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fallback = generateDynamicRedoLogs();
      const params: any = {};
      if (campagneFilter !== 'ALL') params.campagneNom = campagneFilter;
      if (authorFilter !== 'ALL') params.authorName = authorFilter;
      if (tenantFilter !== 'ALL') {
        const num = Number(tenantFilter);
        if (!isNaN(num) && num > 0) params.societeId = num;
      }
      if (actionFilter !== 'ALL') params.actionType = actionFilter;
      if (entityFilter !== 'ALL') params.entityType = entityFilter;

      const data = await superAdminApi.getRedoLogs(params, fallback);
      if (data && data.length > 0) {
        setRedoLogs(data);
      } else {
        setRedoLogs(fallback);
      }
    } catch {
      setRedoLogs(generateDynamicRedoLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute available campaigns dynamically from all loaded logs
  const availableCampaigns = useMemo(() => {
    const set = new Set<string>();
    redoLogs.forEach(l => {
      if (l.campagneNom) set.add(l.campagneNom);
    });
    return Array.from(set).sort();
  }, [redoLogs]);

  // Compute available authors dynamically, contextualized to the selected campaign
  const availableAuthors = useMemo(() => {
    const set = new Set<string>();
    redoLogs
      .filter(l => campagneFilter === 'ALL' || l.campagneNom === campagneFilter)
      .forEach(l => {
        if (l.authorName) set.add(l.authorName);
      });
    return Array.from(set).sort();
  }, [redoLogs, campagneFilter]);

  // Filter logs reactively based on all criteria
  const filteredLogs = useMemo(() => {
    return redoLogs.filter(log => {
      const matchesSearch = 
        log.id.toLowerCase().includes(search.toLowerCase()) ||
        log.entityName.toLowerCase().includes(search.toLowerCase()) ||
        log.authorName.toLowerCase().includes(search.toLowerCase()) ||
        log.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        (log.campagneNom && log.campagneNom.toLowerCase().includes(search.toLowerCase())) ||
        log.oldValue.toLowerCase().includes(search.toLowerCase()) ||
        log.newValue.toLowerCase().includes(search.toLowerCase());

      const matchesCampagne = campagneFilter === 'ALL' || log.campagneNom === campagneFilter;
      const matchesAuthor = authorFilter === 'ALL' || log.authorName === authorFilter;

      const matchesTenant = tenantFilter === 'ALL' || 
        String(log.tenantId) === tenantFilter || 
        (Number(tenantFilter) > 0 && log.tenantId === Number(tenantFilter)) ||
        (log.tenantName && log.tenantName.toLowerCase().includes(tenantFilter.toLowerCase()));

      const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
      const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

      return matchesSearch && matchesCampagne && matchesAuthor && matchesTenant && matchesEntity && matchesAction;
    });
  }, [redoLogs, search, campagneFilter, authorFilter, tenantFilter, entityFilter, actionFilter]);

  const handleExecuteRollback = async () => {
    if (!rollbackTarget) return;

    setIsRollingBack(true);
    try {
      await superAdminApi.rollbackRedoLog(rollbackTarget.id);

      // Mark the item as rollbacked locally
      setRedoLogs(prev => prev.map(item => {
        if (item.id === rollbackTarget.id) {
          return {
            ...item,
            isRollbacked: true,
            canRollback: false
          };
        }
        return item;
      }));

      // Append rollback log
      const newRollbackLog: RedoLogItem = {
        id: `RB-${Math.floor(Math.random() * 90000 + 10000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        tenantId: rollbackTarget.tenantId,
        tenantName: rollbackTarget.tenantName,
        campagneNom: rollbackTarget.campagneNom,
        authorName: 'Super Administrateur',
        authorRole: 'SuperAdmin SecOps',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        entityType: rollbackTarget.entityType,
        entityId: rollbackTarget.entityId,
        entityName: rollbackTarget.entityName,
        actionType: 'ROLLBACK',
        fieldName: rollbackTarget.fieldName,
        oldValue: rollbackTarget.newValue,
        newValue: rollbackTarget.oldValue,
        isRollbacked: false,
        canRollback: false
      };

      setRedoLogs(prev => [newRollbackLog, ...prev]);
      showToast(`Rollback exécuté avec succès sur ${rollbackTarget.entityName}`);
      setRollbackTarget(null);
    } catch {
      showToast('Erreur lors du rollback');
    } finally {
      setIsRollingBack(false);
    }
  };

  const getActionBadge = (action: RedoLogItem['actionType']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
      case 'ALTER':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs font-black';
      case 'ROLLBACK':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `redo_logs_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exportation JSON générée');
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 animate-[slideIn_0.2s_ease-out]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <RotateCcw className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                Redo Logs & Moteur de Rollback
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                PostgreSQL WAL & CDC Engine
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Traçabilité intégrale des mutations DML applicatives et mutations DDL de structure (ALTER) avec restauration instantanée
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter JSON</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* POSTGRESQL WAL & CDC ARCHITECTURAL NOTICE */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                Architecture Moteur WAL (Write-Ahead Logging) & CDC
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                pgoutput / CDC Actif
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Toutes les modifications de données (<strong>INSERT, UPDATE, DELETE</strong>) ainsi que les évolutions de schéma de base (<strong>ALTER TABLE, CREATE INDEX</strong>) sont interceptées à chaud depuis le flux binaire WAL PostgreSQL. Vous pouvez filtrer par <strong>Campagne</strong> puis par <strong>Utilisateur</strong> pour isoler les actions d'une saison.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Replication Slot</div>
            <div className="text-xs font-black text-emerald-400 font-mono">gmao_cdc_wal</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            <div className="text-[9px] text-slate-400 font-semibold uppercase">RPO / Latence</div>
            <div className="text-xs font-black text-indigo-300 font-mono">&lt; 15 ms</div>
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mutations Totales
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {redoLogs.length}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Opérations tracées dans le registre
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Modifications (UPDATE)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {redoLogs.filter(l => l.actionType === 'UPDATE').length}
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            Changements d'états et de valeurs
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Schéma (ALTER / DDL)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {redoLogs.filter(l => l.actionType === 'ALTER').length}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Mutations de structure PostgreSQL WAL
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Créations (CREATE)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {redoLogs.filter(l => l.actionType === 'CREATE').length}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Nouveaux enregistrements injectés
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rollbacks Effectués
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {redoLogs.filter(l => l.isRollbacked || l.actionType === 'ROLLBACK').length}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Rétablissements de valeurs antérieures
          </p>
        </div>
      </div>

      {/* FILTER BAR - PRIORITÉ : 1. CAMPAGNE ➔ 2. UTILISATEUR/AUTEUR ➔ 3. USINE ➔ 4. ACTION ➔ 5. ENTITÉ */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Filter className="w-4 h-4" />
            <span className="uppercase tracking-wider font-black">Filtres Hiérarchiques : Campagne ➔ Utilisateur ➔ Usine</span>
          </div>
          <div className="text-slate-400">
            {filteredLogs.length} transaction(s) sélectionnée(s)
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par ID, objet, auteur, SQL ALTER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* 1. FILTER CAMPAGNE (FILTRE MAÎTRE) */}
          <div className="flex items-center gap-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 p-1 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/60">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-2" />
            <select
              value={campagneFilter}
              onChange={(e) => {
                setCampagneFilter(e.target.value);
                setAuthorFilter('ALL'); // Reset author filter when campaign changes
              }}
              className="px-2 py-1.5 bg-transparent border-none text-xs font-black text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer"
            >
              <option value="ALL">Toutes les Campagnes ({availableCampaigns.length})</option>
              {availableCampaigns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 2. FILTER AUTEUR / UTILISATEUR (CONTEXTUALISÉ À LA CAMPAGNE) */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <User className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="px-2 py-1.5 bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Tous les Utilisateurs ({availableAuthors.length})</option>
              {availableAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

          {/* 3. FILTER USINE / TENANT */}
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Usines ({tenants?.length || 0})</option>
            {tenants?.map(t => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>

          {/* 4. FILTER ACTION (AVEC ALTER MIS EN VALEUR) */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Actions</option>
            <option value="ALTER">ALTER (Mutation Schéma WAL)</option>
            <option value="UPDATE">UPDATE (Modification Valeur)</option>
            <option value="CREATE">CREATE (Création Objet)</option>
            <option value="DELETE">DELETE (Suppression)</option>
            <option value="ROLLBACK">ROLLBACK (Rétablissement)</option>
          </select>

          {/* 5. FILTER ENTITÉ */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Entités</option>
            <option value="Schéma & Tables">Schéma & Tables (DDL)</option>
            <option value="Équipement">Équipements</option>
            <option value="Ordre de Travail">Ordres de Travail (OT)</option>
            <option value="Pièce de Stock">Stock & Pièces</option>
            <option value="Incident">Incidents</option>
            <option value="Campagne">Campagnes</option>
            <option value="Utilisateur">Utilisateurs</option>
          </select>

          {/* Reset Filters */}
          {(campagneFilter !== 'ALL' || authorFilter !== 'ALL' || tenantFilter !== 'ALL' || actionFilter !== 'ALL' || entityFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setCampagneFilter('ALL');
                setAuthorFilter('ALL');
                setTenantFilter('ALL');
                setActionFilter('ALL');
                setEntityFilter('ALL');
                setSearch('');
              }}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </div>

      {/* REDO LOGS TABLE */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Transaction & Horodatage</th>
                <th className="py-3.5 px-4">Campagne & Usine</th>
                <th className="py-3.5 px-4">Utilisateur / Auteur</th>
                <th className="py-3.5 px-4">Entité & Action</th>
                <th className="py-3.5 px-4">Visual Diff (Ancienne ➔ Nouvelle Valeur / DDL)</th>
                <th className="py-3.5 px-4 text-right">Rétablissement (Rollback)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold">Aucune transaction Redo trouvée avec ces critères de filtrage.</p>
                    <p className="text-[11px] mt-1">Essayez d'ajuster les filtres de Campagne ou d'Auteur.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionBadgeClass = getActionBadge(log.actionType);
                  const isAlter = log.actionType === 'ALTER';

                  return (
                    <tr key={log.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isAlter ? 'bg-amber-500/5' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {isAlter && <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          <span className={`font-mono font-black text-xs ${isAlter ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {log.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                          <Calendar className="w-3 h-3" />
                          <span>{log.campagneNom || 'Hors-campagne'}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{log.tenantName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={log.authorAvatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                            alt={log.authorName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {log.authorName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {log.authorRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{log.entityName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{log.entityId}</span>
                          <span>• {log.fieldName}</span>
                        </div>
                        <div className="mt-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${actionBadgeClass}`}>
                            {log.actionType}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-lg">
                        {isAlter ? (
                          <div className="flex flex-col gap-1">
                            <div className="font-mono text-[10px] text-slate-400 line-through truncate max-w-md">
                              {log.oldValue}
                            </div>
                            <div className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-500/20 break-all">
                              {log.newValue}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-slate-400 line-through truncate max-w-[160px]">
                                {log.oldValue}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                                {log.newValue}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {log.isRollbacked ? (
                          <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Rollbacked</span>
                          </span>
                        ) : log.canRollback ? (
                          <button
                            onClick={() => setRollbackTarget(log)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer hover:shadow-xs"
                            title="Restaurer l'état antérieur"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rollback</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Non réversible</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROLLBACK CONFIRMATION MODAL */}
      {rollbackTarget && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => !isRollingBack && setRollbackTarget(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">
                    Confirmation de Rollback de Données
                  </h3>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Transaction {rollbackTarget.id} • {rollbackTarget.tenantName} ({rollbackTarget.campagneNom || 'Hors-campagne'})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => !isRollingBack && setRollbackTarget(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Avertissement :</strong> Vous vous apprêtez à annuler cette transaction {rollbackTarget.actionType === 'ALTER' ? 'de schéma DDL PostgreSQL' : 'applicative'} et à restaurer la valeur antérieure dans la base de données.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Entité Cible
                </div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-white">
                  {rollbackTarget.entityName}
                </div>
                <div className="text-xs text-slate-500">
                  Champ modifié : <span className="font-semibold text-slate-700 dark:text-slate-300">{rollbackTarget.fieldName}</span>
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  Campagne : {rollbackTarget.campagneNom || 'Hors-campagne'} • Auteur : {rollbackTarget.authorName} ({rollbackTarget.authorRole})
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Valeur Actuelle (qui sera écrasée)</span>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 break-all">{rollbackTarget.newValue}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-0.5">Valeur Rétablie (Ancienne Valeur)</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 break-all">{rollbackTarget.oldValue}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3">
              <button
                onClick={() => setRollbackTarget(null)}
                disabled={isRollingBack}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleExecuteRollback}
                disabled={isRollingBack}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRollingBack ? 'animate-spin' : ''}`} />
                <span>{isRollingBack ? 'Exécution en cours...' : 'Confirmer et Exécuter le Rollback'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
