import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface UnauthorizedPageProps {
  onBack?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
        Accès Restreint (403)
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        Vous n'avez pas les autorisations nécessaires pour accéder à ce module. Contactez l'administrateur de votre entreprise pour obtenir les droits d'accès.
      </p>
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'écran précédent</span>
        </button>
      )}
    </div>
  );
};
