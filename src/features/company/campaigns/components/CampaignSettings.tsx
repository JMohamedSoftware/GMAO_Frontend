import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  Archive, 
  AlertCircle, 
  Play, 
  TrendingUp, 
  FileText, 
  Wrench,
  Loader2,
  X
} from 'lucide-react';
import { useGmao } from '@/shared/hooks/useGmao';
import { useAppDispatch } from '@/app/hooks';
import { setSelectedCampaign, fetchTenantDataAsync } from '@/app/gmaoSlice';
import { campaignService } from '../services/campaign.service';
import { EtatCampagne } from '../types/campaign.types';

export const CampaignSettings: React.FC = () => {
  const { campaigns, workOrders, incidents, selectedCampaign } = useGmao();
  const dispatch = useAppDispatch();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const currentYear = new Date().getFullYear();
  const [newNom, setNewNom] = useState(`Campagne ${currentYear + 1}`);
  const [newDateDebut, setNewDateDebut] = useState(`${currentYear + 1}-06-01`);
  const [newDateFin, setNewDateFin] = useState(`${currentYear + 1}-10-31`);
  const [newDescription, setNewDescription] = useState('Saison industrielle de transformation');
  const [newEtat, setNewEtat] = useState<EtatCampagne>(EtatCampagne.EnCours);

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
      await campaignService.create({
        nom: newNom.trim(),
        description: newDescription.trim(),
        dateDebut: newDateDebut,
        dateFin: newDateFin,
        etat: newEtat
      });

      if (newEtat === EtatCampagne.EnCours) {
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
      await campaignService.cloturer(parseInt(camp.id, 10));
      await dispatch(fetchTenantDataAsync());
      showNotification(`La « ${camp.name} » est maintenant clôturée et archivée.`);
    } catch (err: any) {
      console.error(err);
      alert('Impossible de clôturer la campagne. Vérifiez la connexion serveur.');
    }
  };

  const handleActiverCampaign = async (camp: any) => {
    try {
      await campaignService.update(parseInt(camp.id, 10), {
        nom: camp.name,
        dateDebut: camp.startDate,
        dateFin: camp.endDate,
        etat: EtatCampagne.EnCours
      });

      dispatch(setSelectedCampaign(camp.name));
      await dispatch(fetchTenantDataAsync());
      showNotification(`La « ${camp.name} » est maintenant la campagne active.`);
    } catch (err: any) {
      console.error(err);
      alert('Impossible d\'activer la campagne.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Top Notification Banner */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">
              Gestion des Campagnes & Saisons Industrielles
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Planification et suivi des saisons de production : gestion des interventions, consommations de pièces et indicateurs de performance pour chaque campagne.
          </p>
        </div>

        <button
          onClick={() => {
            setNewNom(`Campagne ${new Date().getFullYear() + 1}`);
            setErrorMsg(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Campagne
        </button>
      </div>

      {/* List of campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(campaigns || []).map(camp => {
          const isActive = camp.status === 'En cours' || camp.name === selectedCampaign;
          const isClosed = camp.status === 'Terminée' || (camp.status as string) === 'Clôturée';
          const isPlanned = camp.status === 'Planifiée';

          const campYearMatch = camp.name?.match(/\d{4}/)?.[0];
          const campOts = (workOrders || []).filter(o => {
            if (o.campagneId && camp.id && String(o.campagneId) === String(camp.id)) return true;
            if (o.campaign && o.campaign.toLowerCase() === camp.name.toLowerCase()) return true;
            if (campYearMatch && o.createdDate && o.createdDate.startsWith(campYearMatch)) return true;
            if (camp.startDate && camp.endDate && o.createdDate) {
              const oDay = o.createdDate.split('T')[0];
              const sDay = camp.startDate.split('T')[0];
              const eDay = camp.endDate.split('T')[0];
              if (oDay >= sDay && oDay <= eDay) return true;
            }
            return false;
          });

          const campIncidents = (incidents || []).filter(i => {
            if (i.workOrderId) {
              const linkedOt = (workOrders || []).find(o => o.id === i.workOrderId || o.numeroOT === i.workOrderId);
              if (linkedOt) {
                if (linkedOt.campagneId && camp.id && String(linkedOt.campagneId) === String(camp.id)) return true;
                if (linkedOt.campaign && linkedOt.campaign.toLowerCase() === camp.name.toLowerCase()) return true;
              }
            }
            if (campYearMatch && i.reportedDate && i.reportedDate.startsWith(campYearMatch)) return true;
            if (camp.startDate && camp.endDate && i.reportedDate) {
              const iDay = i.reportedDate.split('T')[0];
              const sDay = camp.startDate.split('T')[0];
              const eDay = camp.endDate.split('T')[0];
              if (iDay >= sDay && iDay <= eDay) return true;
            }
            return false;
          });

          return (
            <div
              key={camp.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-850 dark:to-blue-950/20 border-blue-400/80 dark:border-blue-700/80 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300'
              }`}
            >
              <div>
                {/* Status Badges */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-800 dark:text-white">
                      {camp.name}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isClosed
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      : isPlanned
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  }`}>
                    {camp.status || 'En cours'}
                  </span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {camp.startDate ? new Date(camp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Juin'}
                    {' → '}
                    {camp.endDate ? new Date(camp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Octobre'}
                  </span>
                </div>

                {/* Stats mini grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-150/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Ordres de travail</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{campOts.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Pannes signalées</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{campIncidents.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {!isActive && !isClosed && (
                  <button
                    onClick={() => handleActiverCampaign(camp)}
                    className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    Définir comme active
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={() => handleCloturerCampaign(camp)}
                    className="flex-1 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Archive className="w-3 h-3" />
                    Clôturer la campagne
                  </button>
                )}

                {isClosed && (
                  <button
                    onClick={() => handleActiverCampaign(camp)}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    Réactiver la campagne
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nouvelle Campagne */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Ouvrir une Nouvelle Campagne
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 flex flex-col gap-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nom de la Campagne *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campagne 2027"
                  value={newNom}
                  onChange={e => setNewNom(e.target.value)}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Date de Début
                  </label>
                  <input
                    type="date"
                    required
                    value={newDateDebut}
                    onChange={e => setNewDateDebut(e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Date de Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={newDateFin}
                    onChange={e => setNewDateFin(e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Statut initial
                </label>
                <select
                  value={newEtat}
                  onChange={e => setNewEtat(parseInt(e.target.value, 10) as EtatCampagne)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value={EtatCampagne.EnCours} className="dark:bg-slate-900">En cours (Campagne active immédiate)</option>
                  <option value={EtatCampagne.Planifiee} className="dark:bg-slate-900">Planifiée (Préparation hors-saison)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Description / Objectifs
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Objectif de tonnage, lignes opérationnelles..."
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Lancer la Campagne</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
