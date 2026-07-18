import React from 'react';
import { Tenant } from '@/shared/types/gmao';
import { Sparkles, Building2, ExternalLink, Ban, Check, X } from 'lucide-react';

interface SuperAdminTenantsProps {
  pendingRequests: Tenant[];
  registeredTenants: Tenant[];
  approveTenant: (id: string) => void;
  suspendTenant: (id: string) => void;
  impersonateTenant: (id: string) => void;
  onShowCreateWizard: () => void;
}

export const SuperAdminTenants: React.FC<SuperAdminTenantsProps> = ({
  pendingRequests,
  registeredTenants,
  approveTenant,
  suspendTenant,
  impersonateTenant,
  onShowCreateWizard
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm border-l-4 border-l-amber-500">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
            Demandes d'Onboarding à valider ({pendingRequests.length})
          </h3>
          <div className="flex flex-col gap-3">
            {pendingRequests.map(r => (
              <div key={r.id} className="p-4 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-custom-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{r.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Domaine: <span className="font-mono">{r.domain}</span> • Admin: <span className="font-mono">{r.adminEmail}</span></p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">Plan demandé: {r.subscriptionPlan}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => approveTenant(r.id)} className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow cursor-pointer"><Check className="w-4 h-4" /><span>Approuver & Créer</span></button>
                  <button onClick={() => suspendTenant(r.id)} className="flex items-center gap-1 px-4 py-2 bg-slate-205 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"><X className="w-4 h-4" /><span>Rejeter</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tenants Registry */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-primary" />
            Répertoire des Espaces SaaS Actifs
          </h3>
          <button onClick={onShowCreateWizard} className="bg-primary hover:bg-primary/95 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1.5 shadow cursor-pointer transition hover-lift">
            <Sparkles className="w-3.5 h-3.5" /> Créer
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {registeredTenants.map(t => (
            <div key={t.id} className="p-4 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-custom-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
              <div>
                <span className="text-[9px] text-slate-400 block font-mono">{t.id}</span>
                <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{t.name}</h4>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{t.domain} • {t.adminEmail}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center"><span className="text-[9px] text-slate-400 block uppercase font-bold">Plan</span><span className="text-primary font-bold">{t.subscriptionPlan}</span></div>
                <div className="text-center"><span className="text-[9px] text-slate-400 block uppercase font-bold">Statut</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{t.status === 'Active' ? 'Actif' : 'Suspendu'}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => impersonateTenant(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-primary/95 text-[10px] cursor-pointer"><ExternalLink className="w-3.5 h-3.5" /><span>Accéder</span></button>
                  <button onClick={() => suspendTenant(t.id)} className={`p-1.5 border rounded-lg shadow-sm cursor-pointer ${t.status === 'Active' ? 'border-slate-200 text-slate-450 hover:bg-rose-50 hover:text-rose-500' : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'}`} title={t.status === 'Active' ? 'Suspendre' : 'Activer'}><Ban className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
