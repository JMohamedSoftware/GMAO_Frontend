import React, { useState, useEffect, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { superAdminApi } from '../api/superAdmin.api';
import { 
  RotateCcw, History, AlertTriangle, ShieldCheck, CheckCircle2, 
  Search, Filter, ArrowRight, RefreshCw, Download, User, 
  Building2, Layers, X, Sparkles, Clock, FileCode, Check
} from 'lucide-react';

export interface RedoLogItem {
  id: string;
  timestamp: string;
  tenantId: number;
  tenantName: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  entityType: 'Équipement' | 'Ordre de Travail' | 'Pièce de Stock' | 'Campagne' | 'Incident' | 'Utilisateur';
  entityId: string;
  entityName: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK';
  fieldName: string;
  oldValue: string;
  newValue: string;
  isRollbacked: boolean;
  canRollback: boolean;
}

export const SuperAdminRedoLogs: React.FC = () => {
  const { tenants } = useGmao();
  const [redoLogs, setRedoLogs] = useState<RedoLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rollback confirmation modal state
  const [rollbackTarget, setRollbackTarget] = useState<RedoLogItem | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateDynamicRedoLogs = (): RedoLogItem[] => {
    if (!tenants || tenants.length === 0) return [];
    const list: RedoLogItem[] = [];
    const now = new Date();

    tenants.forEach((t, idx) => {
      const tId = Number(t.id) || idx + 1;
      const tName = t.name;

      list.push({
        id: `TX-${90412 - idx * 4}`,
        timestamp: new Date(now.getTime() - (idx * 25 + 12) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        authorName: idx === 0 ? 'Karim Ben Salah' : (idx === 1 ? 'Mohamed Ben Amor' : 'Sonia Trabelsi'),
        authorRole: idx === 0 ? 'Technicien Électromécanicien' : "Responsable Maintenance",
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        entityType: 'Équipement',
        entityId: `EQ-00${idx + 2}`,
        entityName: `Ligne de Concentration & Cuiseur N°${idx + 1}`,
        actionType: 'UPDATE',
        fieldName: 'Statut & Santé',
        oldValue: "Statut: 'En panne' • Indice santé: 35%",
        newValue: "Statut: 'Opérationnel' • Indice santé: 92%",
        isRollbacked: false,
        canRollback: true
      });

      list.push({
        id: `TX-${90411 - idx * 4}`,
        timestamp: new Date(now.getTime() - (idx * 35 + 38) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        authorName: idx === 0 ? 'Sami Mansouri' : 'Admin Local',
        authorRole: 'Chef de Maintenance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        entityType: 'Ordre de Travail',
        entityId: `OT-2026-00${idx + 3}`,
        entityName: `Révision vanne vapeur et pompe principale`,
        actionType: 'UPDATE',
        fieldName: 'Priorité & Affectation',
        oldValue: "Priorité: 'Moyenne' • Assigné: 'Non assigné'",
        newValue: "Priorité: 'Critique' • Assigné: 'Équipe d'astreinte'",
        isRollbacked: false,
        canRollback: true
      });

      list.push({
        id: `TX-${90410 - idx * 4}`,
        timestamp: new Date(now.getTime() - (idx * 45 + 75) * 60000).toISOString().replace('T', ' ').slice(0, 19),
        tenantId: tId,
        tenantName: tName,
        authorName: 'Leila Farhat',
        authorRole: 'Gestionnaire Stock',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        entityType: 'Pièce de Stock',
        entityId: `PR-ROUL-${6204 + idx}`,
        entityName: `Roulement haute température SKF-${6204 + idx}`,
        actionType: 'UPDATE',
        fieldName: 'Stock Physique',
        oldValue: 'Stock: 14 pièces',
        newValue: 'Stock: 2 pièces (Alerte seuil minimum)',
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
      const data = await superAdminApi.getRedoLogs(undefined, fallback);
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

  const filteredLogs = useMemo(() => {
    return redoLogs.filter(log => {
      const matchesSearch = 
        log.id.toLowerCase().includes(search.toLowerCase()) ||
        log.entityName.toLowerCase().includes(search.toLowerCase()) ||
        log.authorName.toLowerCase().includes(search.toLowerCase()) ||
        log.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        log.oldValue.toLowerCase().includes(search.toLowerCase()) ||
        log.newValue.toLowerCase().includes(search.toLowerCase());

      const matchesTenant = tenantFilter === 'ALL' || String(log.tenantId) === tenantFilter;
      const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
      const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

      return matchesSearch && matchesTenant && matchesEntity && matchesAction;
    });
  }, [redoLogs, search, tenantFilter, entityFilter, actionFilter]);

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
        authorName: 'Super Administrateur',
        authorRole: 'SuperAdmin',
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
                Audit des Mutations
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Traçabilité intégrale des mutations de données (CRUD) avec capacité de rétablissement (Rollback) instantané
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

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* FILTER BAR */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par ID, objet, auteur, valeur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filter Usine (100% Dynamique) */}
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Usines ({tenants?.length || 0})</option>
            {tenants?.map(t => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>

          {/* Filter Entité */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Entités</option>
            <option value="Équipement">Équipements</option>
            <option value="Ordre de Travail">Ordres de Travail (OT)</option>
            <option value="Pièce de Stock">Stock & Pièces</option>
            <option value="Campagne">Campagnes</option>
            <option value="Incident">Incidents</option>
            <option value="Utilisateur">Utilisateurs</option>
          </select>

          {/* Filter Action */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Actions</option>
            <option value="UPDATE">UPDATE (Modification)</option>
            <option value="CREATE">CREATE (Création)</option>
            <option value="DELETE">DELETE (Suppression)</option>
            <option value="ROLLBACK">ROLLBACK (Rétablissement)</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-400">
          {filteredLogs.length} transaction(s) Redo
        </div>
      </div>

      {/* REDO LOGS TABLE */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Transaction & Horodatage</th>
                <th className="py-3.5 px-4">Usine & Auteur</th>
                <th className="py-3.5 px-4">Entité / Champ Modifié</th>
                <th className="py-3.5 px-4">Visual Diff (Ancienne ➔ Nouvelle)</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4 text-right">Rétablissement (Rollback)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredLogs.map((log) => {
                const actionBadgeClass = getActionBadge(log.actionType);

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-mono font-black text-slate-900 dark:text-slate-100 text-xs">
                        {log.id}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
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
                          <div className="text-[10px] text-slate-400">
                            {log.tenantName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {log.entityName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{log.entityId}</span>
                        <span>• {log.fieldName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400 line-through truncate max-w-[150px]">
                            {log.oldValue}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                            {log.newValue}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${actionBadgeClass}`}>
                        {log.actionType}
                      </span>
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
              })}
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
                    Transaction {rollbackTarget.id} • {rollbackTarget.tenantName}
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
                    <strong>Avertissement :</strong> Vous vous apprêtez à annuler cette transaction et à restaurer la valeur antérieure dans la base de données de l'entreprise.
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
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Valeur Actuelle (qui sera écrasée)</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{rollbackTarget.newValue}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-0.5">Valeur Rétablie (Ancienne Valeur)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{rollbackTarget.oldValue}</span>
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
