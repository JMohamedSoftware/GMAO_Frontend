import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
        Page ou module introuvable (404)
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        Le module ou l'écran demandé n'existe pas ou a été déplacé. Vérifiez vos autorisations ou retournez au tableau de bord.
      </p>
      {onNavigateHome && (
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Retour au Tableau de Bord</span>
        </button>
      )}
    </div>
  );
};
