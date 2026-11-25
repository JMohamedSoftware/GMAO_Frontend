import React, { useState, useEffect, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { superAdminApi } from '../api/superAdmin.api';
import { 
  Calendar, Building2, Factory, CheckCircle2, Clock, 
  Archive, AlertTriangle, Search, Filter, RefreshCw, 
  ArrowRight, ExternalLink, ShieldAlert, Sparkles, 
  BarChart3, Layers, ChevronRight, X, FileText
} from 'lucide-react';

interface CampaignItem {
  id: number;
  nom: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  etat: 'EnCours' | 'Cloturee' | 'Planifiee';
  societeId: number;
  societeNom: string;
  societeCode: string;
  otCount: number;
  incidentsCount: number;
  tonnagePrevu?: number | null;
}

interface SuperAdminCampaignsProps {
  selectedTenantId?: string;
}

export const SuperAdminCampaigns: React.FC<SuperAdminCampaignsProps> = ({ selectedTenantId = 'ALL' }) => {
  const { impersonateTenant, tenants } = useGmao();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [dbTenants, setDbTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState<string>(selectedTenantId);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (selectedTenantId) {
      setTenantFilter(selectedTenantId);
    }
  }, [selectedTenantId]);

  useEffect(() => {
    superAdminApi.getTenants().then(data => {
      if (data && data.length > 0) setDbTenants(data);
    }).catch(() => {});
  }, []);

  const allTenantsList = useMemo(() => {
    if (dbTenants.length > 0) {
      return dbTenants.map(t => ({
        id: t.id,
        code: t.codeTenant,
        name: t.nom
      }));
    }
    return (tenants || []).map(t => ({
      id: t.dbId || t.id,
      code: t.id,
      name: t.name
    }));
  }, [dbTenants, tenants]);

  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await superAdminApi.getCampaigns();
      if (data && data.length > 0) {
        setCampaigns(data.map((c: any) => ({
          ...c,
          tonnagePrevu: typeof c.tonnagePrevu === 'number' ? c.tonnagePrevu : null,
          etat: c.etat === 'EnCours' || c.etat === '1' ? 'EnCours' : (c.etat === 'Cloturee' || c.etat === '2' || c.etat === 'Terminee' || c.etat === '3' ? 'Cloturee' : 'Planifiee')
        })));
      } else {
        setCampaigns([]);
      }
    } catch {
      setCampaigns([]);
      setLoadError('Impossible de charger les campagnes depuis le backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = 
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.societeNom.toLowerCase().includes(search.toLowerCase()) ||
        c.dateDebut.includes(search) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

      const matchesTenant = tenantFilter === 'ALL' ||
        String(c.societeId) === tenantFilter ||
        (c.societeCode && c.societeCode.toLowerCase() === tenantFilter.toLowerCase()) ||
        (c.societeNom && c.societeNom.toLowerCase() === tenantFilter.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || c.etat === statusFilter;

      return matchesSearch && matchesTenant && matchesStatus;
    });
  }, [campaigns, search, tenantFilter, statusFilter]);

  const activeCount = campaigns.filter(c => c.etat === 'EnCours').length;
  const closedCount = campaigns.filter(c => c.etat === 'Cloturee').length;
  const totalOts = campaigns.reduce((acc, c) => acc + (c.otCount || 0), 0);
  const tonnageEntries = campaigns.filter(c => typeof c.tonnagePrevu === 'number');
  const totalTonnage = tonnageEntries.reduce((acc, c) => acc + (c.tonnagePrevu || 0), 0);
  const hasTonnageData = tonnageEntries.length > 0;

  const getStatusBadge = (etat: CampaignItem['etat']) => {
    switch (etat) {
      case 'EnCours':
        return {
          label: 'En cours (Active)',
          className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
        };
      case 'Cloturee':
        return {
          label: 'Clôturée (Archive)',
          className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
        };
      default:
        return {
          label: 'Planifiée',
          className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        };
    }
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
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                Campagnes Saisonnières des Usines
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider">
                Multi-Tenants
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Supervision transversale des campagnes de production industrielle multi-usines
            </p>
          </div>
        </div>

        <button
          onClick={fetchCampaigns}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Campagnes Actives ({new Date().getFullYear()})
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {activeCount}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            En pleine production estivale
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Campagnes Archivées
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {closedCount}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Clôturées & verrouillées (Historique)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total OTs Exécutés
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {totalOts}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Bons de travail sous campagnes
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tonnage Total Prévu
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-2">
            {hasTonnageData ? (
              <>
                {(totalTonnage / 1000).toFixed(0)}k <span className="text-xs font-semibold text-slate-400">Tonnes</span>
              </>
            ) : (
              <span className="text-base font-bold text-slate-400">Non disponible</span>
            )}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Capacité globale du parc
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
              placeholder="Rechercher par campagne, usine, année..."
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
            <option value="ALL">Toutes les Usines ({allTenantsList.length})</option>
            {allTenantsList.map(t => (
              <option key={t.id || t.code} value={String(t.id)}>{t.name}</option>
            ))}
          </select>

          {/* Filter Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="EnCours">En cours (Active)</option>
            <option value="Cloturee">Clôturée (Archive)</option>
            <option value="Planifiee">Planifiée</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-400">
          {filteredCampaigns.length} campagne(s) trouvée(s)
        </div>
      </div>

      {/* CAMPAIGNS TABLE */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Campagne</th>
                <th className="py-3.5 px-4">Conserverie / Usine</th>
                <th className="py-3.5 px-4">Période Saisonnière</th>
                <th className="py-3.5 px-4">Activité GMAO</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-slate-400">
                    {loadError || 'Aucune campagne enregistrée en base pour les filtres actuels.'}
                  </td>
                </tr>
              )}
              {filteredCampaigns.map((camp) => {
                const statusBadge = getStatusBadge(camp.etat);

                return (
                  <tr 
                    key={camp.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCampaign(camp)}
                  >
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm group-hover:text-primary transition-colors">
                        {camp.nom}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {camp.description || 'Campagne de transformation agroalimentaire'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                          🏭
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {camp.societeNom}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {camp.societeCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{camp.dateDebut} ➔ {camp.dateFin}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                          {camp.otCount} OTs
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
                          {camp.incidentsCount} Pannes
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            impersonateTenant(String(camp.societeId));
                            showToast(`Connexion à l'espace de ${camp.societeNom}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          title="Se connecter en tant que cette usine"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Espace Usine</span>
                        </button>
                        <button
                          onClick={() => setSelectedCampaign(camp)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedCampaign && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setSelectedCampaign(null)}
        >
          <div 
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    {selectedCampaign.nom}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">
                    {selectedCampaign.societeNom} • {selectedCampaign.societeCode}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Description & Objectif
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {selectedCampaign.description || 'Aucune description spécifique renseignée.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Date de Début</div>
                  <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{selectedCampaign.dateDebut}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Date de Fin</div>
                  <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{selectedCampaign.dateFin}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/40 dark:border-blue-900/40 text-center">
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Bons d'OT</div>
                  <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{selectedCampaign.otCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/40 dark:border-rose-900/40 text-center">
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Pannes Déclarées</div>
                  <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">{selectedCampaign.incidentsCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/40 dark:border-purple-900/40 text-center">
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Capacité Prévue</div>
                  <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">{selectedCampaign.tonnagePrevu ? `${selectedCampaign.tonnagePrevu / 1000}k T` : 'N/C'}</div>
                </div>
              </div>

              {selectedCampaign.etat === 'Cloturee' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                  <Archive className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    Cette campagne est clôturée. Les données sont conservées en mode archive immuable conformément au cahier des charges.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  impersonateTenant(String(selectedCampaign.societeId));
                  showToast(`Connexion à l'espace de ${selectedCampaign.societeNom}`);
                }}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ouvrir l'Espace Usine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
