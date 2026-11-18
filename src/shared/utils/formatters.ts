/**
 * ============================================================================
 * UTILITAIRES PARTAGÉS : Formatage des Dates, Devises et Chiffres
 * ============================================================================
 * Fournit des fonctions centralisées pour éviter la duplication de formatage
 * dans les différents composants et modules de l'application.
 */

/**
 * Formate une date ISO ou timestamp au format français lisible (ex: "18 nov. 2026")
 */
export const formatDateFr = (
  dateStr?: string | null, 
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', options || {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

/**
 * Formate une date avec heure (ex: "18/11/2026 14:30")
 */
export const formatDateTimeFr = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
};

/**
 * Formate un montant en Dinars Tunisiens (TND) ou Euros
 */
export const formatCurrency = (amount: number, currency: string = 'TND'): string => {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

/**
 * Formate un nombre d'heures (ex: "1 250 h")
 */
export const formatOperatingHours = (hours?: number | null): string => {
  if (hours === undefined || hours === null) return '0 h';
  return `${hours.toLocaleString('fr-FR')} h`;
};
