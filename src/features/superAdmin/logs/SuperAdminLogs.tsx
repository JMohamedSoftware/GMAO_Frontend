import React, { useState, useMemo, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { superAdminApi } from '../api/superAdmin.api';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  Download,
  RotateCcw,
  RefreshCw,
  Building2,
  Cpu,
  Layers,
  Terminal,
  FileCode,
  Globe,
  Lock,
  X,
  Check
} from 'lucide-react';

export interface EnterpriseLogEntry {
  id: string;
  traceId: string;
  dateTime: string;
  userName: string;
  userRole: string;
  companyName: string;
  action: string;
  niveau: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY';
  categorie: 'Auth' | 'Sécurité' | 'Billing' | 'Système' | 'Tenant' | 'GMAO';
  status: 'Succès' | 'Échec' | 'Avertissement';
  ipAddress: string | null;
  browser: string | null;
  endpoint: string | null;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | null;
  statusCode: number;
  latencyMs: number | null;
  details: string;
  payloadJson?: string;
}

interface SuperAdminLogsProps {
  selectedTenantId?: string;
}

export const SuperAdminLogs: React.FC<SuperAdminLogsProps> = ({ selectedTenantId = 'ALL' }) => {
  const { tenants } = useGmao();

  const [companyFilter, setCompanyFilter] = useState<string>(selectedTenantId);
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payload Inspector Drawer State
  const [inspectedLog, setInspectedLog] = useState<EnterpriseLogEntry | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    if (selectedTenantId) {
      setCompanyFilter(selectedTenantId);
    }
  }, [selectedTenantId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyJson = (jsonString?: string) => {
    if (!jsonString) return;
    navigator.clipboard.writeText(jsonString);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const [logsList, setLogsList] = useState<EnterpriseLogEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchLogs = async (showNotification = false) => {
    setIsSyncing(true);
    setLoadError(null);
    try {
      const data = await superAdminApi.getLogs();
      if (data && data.length > 0) {
        const mapped: EnterpriseLogEntry[] = data.map((j: any, idx: number) => ({
          id: String(j.id || `log-${idx + 1}`),
          traceId: j.traceId || `audit-${j.id || idx + 1}`,
          dateTime: j.dateTime || (j.dateHeure ? new Date(j.dateHeure).toISOString().replace('T', ' ').slice(0, 19) : 'Non renseigné'),
          userName: j.userName || j.userNom || 'Système',
          userRole: j.userRole || 'Non renseigné',
          companyName: j.companyName || j.societeNom || 'Plateforme Centrale',
          action: j.action || 'Opération Système',
          niveau: (j.niveau || (j.statut === 'Échec' ? 'SECURITY' : 'INFO')) as any,
          categorie: (j.categorie || 'Système') as any,
          status: (j.status || j.statut || 'Succès') as any,
          ipAddress: j.ipAddress || j.adresseIp || null,
          browser: j.browser || j.navigateur || null,
          endpoint: j.endpoint || null,
          httpMethod: (j.httpMethod || null) as any,
          statusCode: j.statusCode ?? (j.statut === 'Échec' ? 403 : 200),
          latencyMs: typeof j.latencyMs === 'number' ? j.latencyMs : null,
          details: j.details || '',
          payloadJson: j.payloadJson || JSON.stringify(j, null, 2)
        }));
        setLogsList(mapped);
      } else {
        setLogsList([]);
      }
      if (showNotification) showToast('Journaux d’audit synchronisés avec PostgreSQL');
    } catch {
      setLogsList([]);
      setLoadError('Impossible de charger les journaux d’audit depuis le backend.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logsList.filter(log => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        log.traceId.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.companyName.toLowerCase().includes(q) ||
        (log.endpoint || '').toLowerCase().includes(q) ||
        (log.ipAddress || '').toLowerCase().includes(q);

      const matchCompany =
        companyFilter === 'ALL' ||
        log.companyName.toLowerCase().includes(companyFilter.toLowerCase()) ||
        (tenants?.some(t => String(t.id) === companyFilter && log.companyName.toLowerCase().includes(t.name.toLowerCase())));

      const matchLevel = levelFilter === 'ALL' || log.niveau === levelFilter;
      const matchCategory = categoryFilter === 'ALL' || log.categorie === categoryFilter;

      return matchSearch && matchCompany && matchLevel && matchCategory;
    });
  }, [logsList, searchTerm, companyFilter, levelFilter, categoryFilter, tenants]);

  // Paginated records
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  // Export JSON Audit Log
  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `enterprise_security_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Journal d’audit JSON exporté');
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'POST': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'PUT': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'DELETE': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case 'SECURITY':
      case 'ERROR':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-[fadeIn_0.2s_ease-out]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 animate-[slideIn_0.2s_ease-out]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP COMPACT ENTERPRISE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Journal de Sécurité & Audit Trail Enterprise
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                LIVE AUDIT STREAM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Traçabilité cryptographique, adresses IP, empreintes d'appareils, requêtes HTTP et métriques de latence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
          <button
            onClick={handleExportAuditJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-xs"
            title="Exporter l'audit trail en JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fetchLogs(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* FILTER & PARTITIONING BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher Trace ID, IP, acteur, route, détail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* SÉLECTEUR SOCIÉTÉ (ALL + PAR SOCIÉTÉ) */}
          <div className="relative min-w-[200px]">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">🌐 Toutes les Sociétés (Cluster Global)</option>
              {tenants?.map(t => (
                <option key={t.id} value={String(t.name)}>
                  🏭 {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Niveau */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Tous les Niveaux</option>
            <option value="INFO">INFO (Normal)</option>
            <option value="WARNING">WARNING (Alerte)</option>
            <option value="SECURITY">SECURITY (Sécurité)</option>
            <option value="ERROR">ERROR (Erreur)</option>
          </select>

          {/* Filter Catégorie */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes Catégories</option>
            <option value="Auth">Auth & Sessions</option>
            <option value="Sécurité">Sécurité & Pare-feu</option>
            <option value="GMAO">GMAO & Maintenance</option>
            <option value="Billing">Facturation & Plans</option>
            <option value="Système">Système & Tâches</option>
          </select>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500">
          {filteredLogs.length} événements tracés
        </div>
      </div>

      {/* DENSE ENTERPRISE AUDIT TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-black uppercase text-slate-400">
                <th className="py-3 px-3.5">Horodatage & Trace ID</th>
                <th className="py-3 px-3.5">Événement / Action</th>
                <th className="py-3 px-3.5">Société & Acteur</th>
                <th className="py-3 px-3.5">Adresse IP & Client</th>
                <th className="py-3 px-3.5">Endpoint & Requête HTTP</th>
                <th className="py-3 px-3.5">Statut & Latence</th>
                <th className="py-3 px-3.5 text-right">Inspecteur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 px-4 text-center text-slate-400">
                    {loadError || 'Aucun journal d’audit disponible pour les filtres sélectionnés.'}
                  </td>
                </tr>
              )}
              {paginatedLogs.map((log) => {
                const isFailed = log.status === 'Échec' || log.statusCode >= 400;

                return (
                  <tr
                    key={log.id}
                    onClick={() => setInspectedLog(log)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Timestamp & Trace ID */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                        {log.dateTime}
                      </div>
                      <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                        {log.traceId}
                      </div>
                    </td>

                    {/* Action & Category */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{log.action}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${getLevelBadge(log.niveau)}`}>
                          {log.niveau}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{log.categorie}]
                        </span>
                      </div>
                    </td>

                    {/* Company & User */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {log.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{log.userName}</span>
                        <span className="text-slate-350 dark:text-slate-600">•</span>
                        <span className="text-[10px] font-mono text-slate-400">{log.userRole}</span>
                      </div>
                    </td>

                    {/* IP & Browser */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{log.ipAddress || 'Non disponible'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5" title={log.browser || 'Non disponible'}>
                        {log.browser || 'Non disponible'}
                      </div>
                    </td>

                    {/* Endpoint & HTTP Method */}
                    <td className="py-3 px-3.5 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {log.httpMethod ? (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${getMethodBadge(log.httpMethod)}`}>
                            {log.httpMethod}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-200 dark:border-slate-700 text-slate-400">
                            AUDIT
                          </span>
                        )}
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[190px]" title={log.endpoint || 'Non disponible'}>
                          {log.endpoint || 'Non disponible'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[210px] mt-0.5 font-sans" title={log.details}>
                        {log.details}
                      </div>
                    </td>

                    {/* Status & Latency */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                          isFailed
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                        }`}>
                          {log.statusCode} {log.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {log.latencyMs != null ? `${log.latencyMs} ms` : 'Latence N/D'}
                      </div>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedLog(log);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <FileCode className="w-3 h-3 text-blue-500" />
                        <span>JSON</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Page {currentPage} sur {totalPages} ({filteredLogs.length} entrées au total)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RAW PAYLOAD INSPECTOR MODAL / SLIDE-OVER */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 flex flex-col gap-4 animate-[slideUp_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Inspecteur d'Audit Événement • {inspectedLog.action}
                  </h3>
                  <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                    Trace ID: {inspectedLog.traceId} • {inspectedLog.dateTime}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Acteur</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{inspectedLog.userName}</div>
                <div className="text-[10px] text-slate-400">{inspectedLog.userRole}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Entreprise</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{inspectedLog.companyName}</div>
                <div className="text-[10px] text-slate-400">{inspectedLog.categorie}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Réseau & IP</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{inspectedLog.ipAddress || 'Non disponible'}</div>
                <div className="text-[10px] text-slate-400 truncate">{inspectedLog.browser || 'Non disponible'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-sans">HTTP / Temps</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {inspectedLog.httpMethod || 'AUDIT'} {inspectedLog.statusCode}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  {inspectedLog.latencyMs != null ? `${inspectedLog.latencyMs} ms` : 'Non disponible'}
                </div>
              </div>
            </div>

            {/* Description Details */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200">
              <span className="font-bold">Description de l'action : </span>
              {inspectedLog.details}
            </div>

            {/* Raw JSON Code block */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                <span>PAYLOAD JSON BRUT (REQUEST & METADATA) :</span>
                <button
                  onClick={() => handleCopyJson(inspectedLog.payloadJson)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-sans font-bold transition cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copié !' : 'Copier JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
                {inspectedLog.payloadJson || JSON.stringify(inspectedLog, null, 2)}
              </pre>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
