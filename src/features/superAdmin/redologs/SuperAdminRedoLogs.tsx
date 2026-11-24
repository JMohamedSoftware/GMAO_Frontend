import React, { useState, useEffect, useCallback } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import {
  superAdminApi,
  RedoLogsOverviewDto,
  RedoLogRecordDto,
  PitrCapabilitiesDto,
  PagedRedoLogsResponseDto
} from '../api/superAdmin.api';
import {
  RotateCcw, History, AlertTriangle, ShieldCheck, CheckCircle2,
  Search, Filter, RefreshCw, Download, User, Building2, Layers,
  X, Clock, Database, Terminal, Shield, ChevronLeft, ChevronRight,
  Eye, Link2, Info
} from 'lucide-react';

interface SuperAdminRedoLogsProps {
  selectedTenantId?: string;
}

const formatBytes = (bytes?: number | null): string => {
  if (bytes === null || bytes === undefined) return 'N/D';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
};

const getCdcBadgeStyle = (status?: string) => {
  switch (status) {
    case 'ActiveStreaming':
    case 'Streaming':
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400 animate-pulse',
        label: 'Streaming pgoutput Actif'
      };
    case 'Ready':
      return {
        bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
        dot: 'bg-cyan-400',
        label: 'Prêt (pgoutput vérifié)'
      };
    case 'Disabled':
    case 'NotConfigured':
    case 'DisabledByConfig':
      return {
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        dot: 'bg-amber-400',
        label: status === 'NotConfigured' ? 'Non configuré' : 'Désactivé (Configuration)'
      };
    case 'IncompatibleWalLevel':
    case 'PermissionDenied':
    case 'NotSupported':
    case 'NetworkBlocked':
    case 'Error':
      return {
        bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
        dot: 'bg-rose-400',
        label: status === 'IncompatibleWalLevel'
          ? 'wal_level != logical'
          : status === 'PermissionDenied'
            ? 'Privilège REPLICATION manquant'
            : status
      };
    default:
      return {
        bg: 'bg-slate-700/60 border-slate-600 text-slate-300',
        dot: 'bg-slate-400',
        label: status || 'Non initialisé'
      };
  }
};

const getOpBadgeClass = (op: string) => {
  const upper = op.toUpperCase();
  if (upper === 'CREATE' || upper === 'INSERT')
    return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
  if (upper === 'UPDATE' || upper === 'STATUS_CHANGE')
    return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
  if (upper === 'DELETE')
    return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
  if (upper === 'COMPENSATE')
    return 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
};

export const SuperAdminRedoLogs: React.FC<SuperAdminRedoLogsProps> = ({ selectedTenantId = 'ALL' }) => {
  const { tenants } = useGmao();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'PITR'>('LOGS');
  const [overview, setOverview] = useState<RedoLogsOverviewDto | null>(null);
  const [pagedLogs, setPagedLogs] = useState<PagedRedoLogsResponseDto | null>(null);
  const [pitrInfo, setPitrInfo] = useState<PitrCapabilitiesDto | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Server-side query filters
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [tenantFilter, setTenantFilter] = useState<string>(selectedTenantId || 'ALL');
  const [tableFilter, setTableFilter] = useState<string>('ALL');
  const [operationFilter, setOperationFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState<string>('');
  const [txSearch, setTxSearch] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  // Inspection / Compensation modals
  const [inspectedRow, setInspectedRow] = useState<RedoLogRecordDto | null>(null);
  const [compensateTarget, setCompensateTarget] = useState<RedoLogRecordDto | null>(null);
  const [isCompensating, setIsCompensating] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (selectedTenantId) {
      setTenantFilter(selectedTenantId);
      setPage(1);
    }
  }, [selectedTenantId]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const numericTenant = Number(tenantFilter);
      const resolvedSocieteId =
        tenantFilter === 'ALL'
          ? undefined
          : !Number.isNaN(numericTenant) && numericTenant > 0
            ? numericTenant
            : tenants.find((t) => String(t.id) === tenantFilter)?.dbId;

      const [ov, logs] = await Promise.all([
        superAdminApi.getRedoLogsOverview(),
        superAdminApi.getRedoLogs({
          source: sourceFilter,
          societeId: resolvedSocieteId,
          tableName: tableFilter !== 'ALL' ? tableFilter : undefined,
          operation: operationFilter !== 'ALL' ? operationFilter : undefined,
          userSearch: userSearch.trim() || undefined,
          transactionId: txSearch.trim() || undefined,
          search: search.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          pageSize
        })
      ]);
      setOverview(ov);
      setPagedLogs(logs);
    } catch (err: any) {
      setApiError(err?.message || 'Impossible de charger la télémétrie PostgreSQL CDC / Audit Trail.');
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, tenantFilter, tableFilter, operationFilter, userSearch, txSearch, search, fromDate, toDate, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'PITR' && !pitrInfo) {
      superAdminApi.getPitrCapabilities().then(setPitrInfo).catch((err: any) => {
        showToast('error', err?.message || 'Impossible de charger les capacités PITR Supabase.');
      });
    }
  }, [activeTab, pitrInfo]);

  const handleConfirmCompensate = async () => {
    if (!compensateTarget) return;
    setIsCompensating(true);
    try {
      const result = await superAdminApi.compensateAuditEntry(compensateTarget.numericId);
      if (result.success) {
        showToast('success', result.message);
        setCompensateTarget(null);
        await fetchData();
      } else {
        showToast('error', `${result.message} (HTTP ${result.httpStatusCode})`);
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Erreur lors de la compensation métier.');
    } finally {
      setIsCompensating(false);
    }
  };

  const handleExportCsv = () => {
    const rows = pagedLogs?.items || [];
    if (rows.length === 0) {
      showToast('error', 'Aucune ligne à exporter sur cette page.');
      return;
    }
    const escape = (val: string | number | boolean | null | undefined) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'EventKey', 'Source', 'TimestampUtc', 'Societe', 'Table', 'RecordId',
      'Operation', 'Label', 'UserName', 'UserRole', 'TransactionId', 'LSN', 'Compensated'
    ];
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.eventKey, r.source, r.timestampUtc, r.societeName, r.tableName, r.recordId,
          r.operation, r.businessLabel, r.userName, r.userRole, r.transactionId, r.lsn, r.isCompensated
        ].map(escape).join(',')
      )
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmao-redologs-page-${pagedLogs?.page || 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cdc = overview?.cdcWorker;
  const cdcBadge = getCdcBadgeStyle(cdc?.status);
  const items = pagedLogs?.items || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-md">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-start gap-2.5 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-100'
              : 'bg-rose-950 border-rose-700 text-rose-100'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Header + Real CDC Worker Status Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Supervision PostgreSQL WAL / CDC & Audit Trail Transactionnel
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${cdcBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${cdcBadge.dot}`} />
                {cdcBadge.label}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Journal réel corrélé par <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-xs">TransactionId (xid)</code> entre
              l&apos;interceptor atomique <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-xs">AuditSaveChangesInterceptor</code> et
              le flux de réplication logique <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-xs">pgoutput</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'LOGS' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Audit & Flux CDC
            </button>
            <button
              onClick={() => setActiveTab('PITR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'PITR' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Backup & PITR Supabase
            </button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 font-semibold">wal_level</div>
            <div className="text-slate-100 font-mono font-bold mt-0.5">{cdc?.walLevel || 'Non sondé'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 font-semibold">Slot Replication</div>
            <div className="text-slate-100 font-mono font-bold mt-0.5 truncate" title={cdc?.slotName}>{cdc?.slotName || '—'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 font-semibold">Publication</div>
            <div className="text-slate-100 font-mono font-bold mt-0.5 truncate" title={cdc?.publicationName}>{cdc?.publicationName || '—'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 font-semibold">Dernier LSN lu</div>
            <div className="text-cyan-300 font-mono font-bold mt-0.5">{cdc?.lastConsumedLsn || 'Aucun'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 font-semibold">Lag / WAL retenu</div>
            <div className="text-slate-100 font-mono font-bold mt-0.5">
              {formatBytes(cdc?.replicationLagBytes)} / {formatBytes(cdc?.retainedWalBytes)}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 font-semibold">Statut WAL</div>
            <div className="text-slate-100 font-mono font-bold mt-0.5">{cdc?.walStatus || (cdc?.slotActive ? 'active' : 'inactif')}</div>
          </div>
        </div>

        {/* Status Reason & Operational Alerts */}
        {(cdc?.statusReason || (cdc?.alerts && cdc.alerts.length > 0)) && (
          <div className="relative z-10 mt-4 space-y-2">
            {cdc?.statusReason && (
              <div className="text-xs bg-slate-950/70 border border-slate-700/80 text-slate-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Diagnostic Worker :</strong> {cdc.statusReason}</span>
              </div>
            )}
            {cdc?.alerts?.map((al, idx) => (
              <div key={idx} className="text-xs bg-amber-950/60 border border-amber-700/50 text-amber-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{al}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'PITR' ? (
        /* TAB 2 : SUPABASE PITR RUNBOOK */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Récupération PostgreSQL (PITR) vs Annulation Applicative
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {pitrInfo?.walSemantics || 'Le Write-Ahead Log (WAL) garantit la durabilité ACID et la récupération après sinistre (PITR). Une base multi-tenant partagée ne peut jamais être "rembobinée" transaction par transaction via le WAL brut.'}
              </p>
            </div>
          </div>

          {pitrInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pitrInfo.plans.map((p) => (
                  <div key={p.plan} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Offre Supabase {p.plan}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {pitrInfo.projectRef}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Backups automatiques :</strong> {p.autoBackups}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>PITR (Point-in-Time Recovery) :</strong> {p.pitr}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">{p.notes}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Procédure de restauration PITR en environnement isolé (Staging)
                </h4>
                <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {pitrInfo.isolationProcedure.map((step, i) => (
                    <li key={i} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </div>
      ) : (
        /* TAB 1 : AUDIT TRAIL & CDC LOGS */
        <>
          {/* Real KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Audit Trail Atomique</span>
                <History className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {overview?.totalAuditEvents ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">{overview?.eventsLast24h ?? 0} sur les dernières 24h</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Événements WAL / CDC</span>
                <Terminal className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {overview?.totalCdcEvents ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Décodage logique pgoutput</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Transactions (XID)</span>
                <Link2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {overview?.distinctTransactionsCount ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Transactions PostgreSQL validées</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Compensations Métier</span>
                <RotateCcw className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {overview?.compensationsCount ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Actions inverses tracées</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-cyan-600" />
                Filtres multi-critères serveur
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Exporter CSV
                </button>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-cyan-600 text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">Audit Trail + WAL CDC</option>
                  <option value="AUDIT_TRAIL">Audit Trail Applicatif uniquement</option>
                  <option value="CDC_WAL">PostgreSQL WAL (pgoutput) uniquement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Société (Tenant)</label>
                <select
                  value={tenantFilter}
                  onChange={(e) => { setTenantFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">Toutes les sociétés</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={String(t.dbId ?? t.id)}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Table / Entité</label>
                <select
                  value={tableFilter}
                  onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">Toutes les tables</option>
                  {(overview?.availableTables || []).map((tbl) => (
                    <option key={tbl} value={tbl}>{tbl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Opération</label>
                <select
                  value={operationFilter}
                  onChange={(e) => { setOperationFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">Toutes opérations</option>
                  <option value="CREATE">CREATE</option>
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="STATUS_CHANGE">STATUS_CHANGE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="COMPENSATE">COMPENSATE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Utilisateur</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => { setUserSearch(e.target.value); setPage(1); }}
                    placeholder="Nom utilisateur..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Transaction XID</label>
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => { setTxSearch(e.target.value); setPage(1); }}
                  placeholder="ex: 10294"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">De / À (UTC)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                    className="px-2 py-2 text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                    className="px-2 py-2 text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Recherche texte / ID</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Libellé, ID, LSN..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Error State */}
          {apiError && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">Horodatage & Source</th>
                    <th className="py-3 px-4 font-bold">Opération & Entité</th>
                    <th className="py-3 px-4 font-bold">Société</th>
                    <th className="py-3 px-4 font-bold">Acteur</th>
                    <th className="py-3 px-4 font-bold">XID / LSN PostgreSQL</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Chargement des événements réels depuis PostgreSQL...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Aucun événement réel ne correspond aux critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    items.map((row) => (
                      <tr key={row.eventKey} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(row.timestampUtc).toLocaleString()}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.source === 'PostgreSQL_WAL_pgoutput'
                                ? 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {row.source}
                            </span>
                            {row.hasWalCorrelation && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                WAL corrélé
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getOpBadgeClass(row.operation)}`}>
                              {row.operation}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-400" />
                              {row.tableName}#{row.recordId}
                            </span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 max-w-sm">
                            {row.businessLabel}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {row.societeName}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{row.userName || 'PostgreSQL WAL'}</div>
                          {row.userRole && <div className="text-[11px] text-slate-500">{row.userRole}</div>}
                        </td>

                        <td className="py-3 px-4 align-top font-mono text-[11px] whitespace-nowrap">
                          <div className="text-slate-800 dark:text-slate-200">
                            xid: <span className="font-bold">{row.transactionId || '—'}</span>
                          </div>
                          {row.lsn && (
                            <div className="text-cyan-600 dark:text-cyan-400 mt-0.5">lsn: {row.lsn}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setInspectedRow(row)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Inspecter avant / après"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {row.isCompensated ? (
                              <span className="px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[11px] font-bold">
                                Compensé
                              </span>
                            ) : row.canCompensate ? (
                              <button
                                onClick={() => setCompensateTarget(row)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-[11px] inline-flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> Compenser
                              </button>
                            ) : (
                              <span
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold"
                                title={row.compensationNote || 'Action non compensable automatiquement'}
                              >
                                Protégé
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div>
                Page <strong>{pagedLogs?.page ?? 1}</strong> sur <strong>{pagedLogs?.totalPages ?? 1}</strong> —{' '}
                <strong>{pagedLogs?.totalCount ?? 0}</strong> enregistrement(s)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={(pagedLogs?.page ?? 1) <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                </button>
                <button
                  disabled={(pagedLogs?.page ?? 1) >= (pagedLogs?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 inline-flex items-center gap-1"
                >
                  Suivant <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Inspect Diff Modal */}
      {inspectedRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Détails de l&apos;événement {inspectedRow.eventKey} ({inspectedRow.tableName}#{inspectedRow.recordId})
                </h3>
                <p className="text-xs text-slate-500">
                  XID: {inspectedRow.transactionId || '—'} · LSN: {inspectedRow.lsn || '—'} · CorrelationId: {inspectedRow.correlationId || '—'}
                </p>
              </div>
              <button onClick={() => setInspectedRow(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <div className="font-bold text-rose-600 mb-1.5">Avant (OldValues)</div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 overflow-x-auto font-mono text-[11px] whitespace-pre-wrap">
                  {inspectedRow.oldValuesJson || 'null'}
                </pre>
              </div>
              <div>
                <div className="font-bold text-emerald-600 mb-1.5">Après (NewValues)</div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 overflow-x-auto font-mono text-[11px] whitespace-pre-wrap">
                  {inspectedRow.newValuesJson || 'null'}
                </pre>
              </div>
              {inspectedRow.compensationNote && (
                <div className="md:col-span-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                  <strong>Politique de compensation :</strong> {inspectedRow.compensationNote}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controlled Compensation Modal */}
      {compensateTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Exécuter une action compensatoire métier
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cette opération crée une nouvelle écriture transactionnelle restaurant les champs autorisés de{' '}
                  <strong>{compensateTarget.tableName}#{compensateTarget.recordId}</strong> après vérification de dérive optimiste (HTTP 409 en cas de modification concurrente).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div><strong>Société :</strong> {compensateTarget.societeName}</div>
              <div><strong>Champs ciblés :</strong> {compensateTarget.changedProperties || 'Voir payload JSON'}</div>
              <div><strong>XID original :</strong> <span className="font-mono">{compensateTarget.transactionId || '—'}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCompensateTarget(null)}
                disabled={isCompensating}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmCompensate}
                disabled={isCompensating}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isCompensating ? 'Exécution en cours...' : 'Confirmer la compensation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
