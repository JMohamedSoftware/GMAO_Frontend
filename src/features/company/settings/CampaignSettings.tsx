import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { useAppDispatch } from '@/app/hooks';
import { fetchTenantDataAsync, setSelectedCampaign } from '@/app/gmaoSlice';
import { apiClient } from '@/shared/services/apiClient';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Archive, 
  Play, 
  Clock, 
  AlertCircle, 
  Loader2, 
  X,
  FileCheck,
  TrendingUp
} from 'lucide-react';

export const CampaignSettings: React.FC = () => {
  const { campaigns, selectedCampaign, workOrders } = useGmao();
  const dispatch = useAppDispatch();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New campaign form state
  const currentYear = new Date().getFullYear();
  const [newNom, setNewNom] = useState(`Campagne ${currentYear + 1}`);
  const [newDateDebut, setNewDateDebut] = useState(`${currentYear + 1}-06-01`);
  const [newDateFin, setNewDateFin] = useState(`${currentYear + 1}-10-31`);
  const [newDescription, setNewDescription] = useState('Saison industrielle de transformation');
  const [newEtat, setNewEtat] = useState<number>(2); // 2 = EnCours, 1 = Planifiee

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient.post('/api/Campagnes', {
        nom: newNom.trim(),
        description: newDescription.trim(),
        dateDebut: newDateDebut,
        dateFin: newDateFin,
        etat: newEtat
      });

      // If created as active, update Redux selected campaign
      if (newEtat === 2) {
        dispatch(setSelectedCampaign(newNom.trim()));
      }

      await dispatch(fetchTenantDataAsync());
      setIsAddModalOpen(false);
      showNotification(`La ${newNom.trim()} a été créée avec succès.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Erreur lors de la création de la campagne.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloturerCampaign = async (camp: any) => {
    if (!window.confirm(`Confirmez-vous la clôture et l'archivage de la « ${camp.name} » ? Toutes ses données d'interventions seront figées pour cette saison.`)) {
      return;
    }

    try {
      await apiClient.put(`/api/Campagnes/${camp.id}`, {
        id: parseInt(camp.id, 10),
        nom: camp.name,
        dateDebut: camp.startDate,
        dateFin: camp.endDate,
        etat: 3 // 3 = Cloturee / Terminee
      });

      await dispatch(fetchTenantDataAsync());
      showNotification(`La « ${camp.name} » est maintenant clôturée et archivée.`);
    } catch (err: any) {
      console.error(err);
      alert('Impossible de clôturer la campagne. Vérifiez la connexion serveur.');
    }
  };

  const handleActiverCampaign = async (camp: any) => {
    try {
      await apiClient.put(`/api/Campagnes/${camp.id}`, {
        id: parseInt(camp.id, 10),
        nom: camp.name,
        dateDebut: camp.startDate,
        dateFin: camp.endDate,
        etat: 2 // 2 = EnCours
      });

      dispatch(setSelectedCampaign(camp.name));
      await dispatch(fetchTenantDataAsync());
      showNotification(`La « ${camp.name} » est maintenant la campagne active.`);
    } catch (err: any) {
      console.error(err);
      alert("Impossible d'activer la campagne.");
    }
  };

  // Helper count work orders per campaign
  const getWorkOrdersCount = (campaignName: string) => {
    return workOrders.filter(w => w.campaign && w.campaign.toLowerCase() === campaignName.toLowerCase()).length;
  };

  return (
    <div className="flex flex-col gap-5 mt-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-primary" />
            Gestion des Saisons et Campagnes Industrielles
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
            Organisation annuelle par campagne de production (tomate / agroalimentaire) et archivage historique
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Campagne</span>
        </button>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active campaign overview banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Saison active sélectionnée
            </span>
            <h4 className="text-base font-black text-slate-850 dark:text-white">
              {selectedCampaign || 'Campagne 2026'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-650 dark:text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <FileCheck className="w-4 h-4 text-primary" />
            <span>{getWorkOrdersCount(selectedCampaign || 'Campagne 2026')} OTs enregistrés</span>
          </div>
        </div>
      </div>

      {/* Campaigns list table */}
      <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-200/60 dark:border-slate-800/60">
              <tr>
                <th className="p-3.5 pl-4">Nom de la Campagne</th>
                <th className="p-3.5">Période (Début ➔ Fin)</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5">Ordres de Travail</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 font-medium">
              {(!campaigns || campaigns.length === 0) ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-bold text-slate-600 dark:text-slate-400">Aucune campagne configurée</p>
                    <p className="text-[11px] text-slate-400 mt-1">Cliquez sur « Nouvelle Campagne » pour démarrer la saison.</p>
                  </td>
                </tr>
              ) : (
                campaigns.map(camp => {
                  const isCurrentActive = camp.name === selectedCampaign || camp.status === 'En cours';
                  const otCount = getWorkOrdersCount(camp.name);

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-850 dark:text-white text-xs">
                            {camp.name}
                          </span>
                          {isCurrentActive && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                              Active
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-350">
                        {camp.startDate ? new Date(camp.startDate).toLocaleDateString('fr-FR') : '—'} 
                        <span className="text-slate-400 mx-1.5">➔</span> 
                        {camp.endDate ? new Date(camp.endDate).toLocaleDateString('fr-FR') : '—'}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          camp.status === 'En cours'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                            : camp.status === 'Terminée'
                              ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                              : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
                        }`}>
                          {camp.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-bold">
                        {otCount} OT{otCount > 1 ? 's' : ''}
                      </td>

                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          {camp.status !== 'En cours' && (
                            <button
                              onClick={() => handleActiverCampaign(camp)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                              title="Activer cette campagne"
                            >
                              <Play className="w-3 h-3" />
                              <span>Activer</span>
                            </button>
                          )}

                          {camp.status === 'En cours' && (
                            <button
                              onClick={() => handleCloturerCampaign(camp)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                              title="Clôturer et archiver la campagne"
                            >
                              <Archive className="w-3 h-3" />
                              <span>Clôturer</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouvelle Campagne */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-primary" />
                Démarrer une Nouvelle Campagne
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 flex flex-col gap-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Nom de la Campagne *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campagne 2027"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date Début *</label>
                  <input
                    type="date"
                    required
                    value={newDateDebut}
                    onChange={(e) => setNewDateDebut(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date Fin *</label>
                  <input
                    type="date"
                    required
                    value={newDateFin}
                    onChange={(e) => setNewDateFin(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Statut initial</label>
                <select
                  value={newEtat}
                  onChange={(e) => setNewEtat(parseInt(e.target.value, 10))}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
                >
                  <option value={2}>En cours (Activer immédiatement)</option>
                  <option value={1}>Planifiée (À venir)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Notes ou objectifs de la saison..."
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Enregistrement...' : 'Créer la Campagne'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
