import React from 'react';
import { Settings, Globe, Save, Bell } from 'lucide-react';
import { PERMISSIONS } from '@/shared/permissions';

interface AdminSettingsProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  emailAlerts: boolean;
  setEmailAlerts: (val: boolean) => void;
  handleSaveSettings: (e: React.FormEvent) => void;
  can: (permission: any) => boolean;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  language,
  setLanguage,
  emailAlerts,
  setEmailAlerts,
  handleSaveSettings,
  can
}) => {
  return (
    <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
      <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4">
        <Settings className="w-4.5 h-4.5 text-amber-500" />
        Préférences Système
      </h3>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 text-xs font-semibold">
        {/* Language */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            Langue Interface
          </label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`flex-1 py-2 rounded-lg font-bold border transition cursor-pointer ${
                language === 'fr' 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-650 hover:border-slate-300'
              }`}
            >
              Français (FR)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2 rounded-lg font-bold border transition cursor-pointer ${
                language === 'en' 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-650 hover:border-slate-300'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Alert notifications routes */}
        <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
          <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 mb-1">
            <Bell className="w-3.5 h-3.5" />
            Canaux d'Alerte Automatiques
          </label>
          
          <label className="flex items-center justify-between cursor-pointer py-1.5 border-b border-slate-50 dark:border-slate-905">
            <span className="text-slate-650 dark:text-slate-350">Notifications E-mail</span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!can(PERMISSIONS.USER_UPDATE)}
          className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow flex items-center justify-center gap-1.5 hover-lift mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </form>
    </div>
  );
};
