import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { 
  Search, Settings, Wrench, AlertTriangle, Cpu, Users, FileText, Package, 
  ArrowRight, ShieldCheck, Moon, Sun, PlusCircle, Calendar, Truck, 
  Flame, CheckCircle2, X, Sparkles, Boxes, AlertOctagon
} from 'lucide-react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onDeclareIncident: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'danger' | 'warning' | 'success' | 'info' | 'default';
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  screen?: string;
  action?: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onNavigate, onDeclareIncident }) => {
  const { 
    equipments, 
    workOrders, 
    incidents, 
    parts, 
    suppliers, 
    darkMode, 
    toggleDarkMode,
    isCampaignClosed 
  } = useGmao();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Keep selected item scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector('[data-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Base navigation pages
  const navigationPages: MenuItem[] = useMemo(() => [
    { id: 'nav-dash', name: 'Dashboard Principal', subtitle: 'Indicateurs clés, métriques TRG & alertes en direct', screen: 'dashboard', icon: Cpu, category: 'Pages & Modules' },
    { id: 'nav-equip', name: 'Registre des Équipements', subtitle: 'Arborescence des machines, lignes & fiches techniques', screen: 'equipment', icon: Wrench, category: 'Pages & Modules' },
    { id: 'nav-prev', name: 'Maintenance Préventive', subtitle: 'Plans systématiques, échéancier & gammes de révision', screen: 'preventive', icon: Calendar, category: 'Pages & Modules' },
    { id: 'nav-corr', name: 'Kanban des Incidents (Correctif)', subtitle: 'Pannes déclarées, diagnostic & urgences terrain', screen: 'corrective', icon: AlertTriangle, category: 'Pages & Modules' },
    { id: 'nav-wo', name: 'Ordres de Travail (Bons OT)', subtitle: 'Suivi des interventions, affectations & clôtures', screen: 'workorders', icon: Settings, category: 'Pages & Modules' },
    { id: 'nav-stock', name: 'Gestion des Stocks & Magasin', subtitle: 'Pièces de rechange, seuils minimas & mouvements', screen: 'inventory', icon: Package, category: 'Pages & Modules' },
    { id: 'nav-supp', name: 'Registre des Fournisseurs', subtitle: 'Sous-traitants, prestataires & contacts SAV', screen: 'suppliers', icon: Truck, category: 'Pages & Modules' },
    { id: 'nav-rep', name: 'Statistiques & Rapports', subtitle: 'MTBF, MTTR, Pareto des pannes & exports Excel', screen: 'reports', icon: FileText, category: 'Pages & Modules' },
    { id: 'nav-admin', name: 'Administration & Rôles', subtitle: 'Gestion des accès, campagnes & configurations', screen: 'admin', icon: ShieldCheck, category: 'Pages & Modules' },
  ], []);

  // Quick actions
  const quickActions: MenuItem[] = useMemo(() => [
    {
      id: 'act-incident',
      name: 'Déclarer une panne machine (Incident urgent)',
      subtitle: isCampaignClosed ? 'Verrouillé en mode archive' : 'Signaler un arrêt ou dysfonctionnement sur ligne',
      badge: 'Urgent',
      badgeType: 'danger',
      icon: AlertTriangle,
      category: 'Actions Rapides',
      action: () => {
        if (!isCampaignClosed) {
          onClose();
          onDeclareIncident();
        }
      }
    },
    {
      id: 'act-new-ot',
      name: 'Créer un Ordre de Travail (OT)',
      subtitle: 'Initier un bon d\'intervention corrective ou préventive',
      badge: 'Action',
      badgeType: 'info',
      icon: PlusCircle,
      category: 'Actions Rapides',
      action: () => {
        onNavigate('workorders');
        onClose();
      }
    },
    {
      id: 'act-plan-prev',
      name: 'Planifier un entretien préventif',
      subtitle: 'Ajouter une gamme d\'entretien périodique au calendrier',
      badge: 'Calendrier',
      badgeType: 'success',
      icon: Calendar,
      category: 'Actions Rapides',
      action: () => {
        onNavigate('preventive');
        onClose();
      }
    },
    {
      id: 'act-stock-alert',
      name: 'Vérifier les ruptures de stock',
      subtitle: 'Accéder aux articles de stock en rupture ou seuil critique',
      badge: 'Magasin',
      badgeType: 'warning',
      icon: Package,
      category: 'Actions Rapides',
      action: () => {
        onNavigate('inventory');
        onClose();
      }
    },
    {
      id: 'act-dark-mode',
      name: darkMode ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre',
      subtitle: 'Changer le thème visuel de l\'interface GMAO',
      badge: 'Affichage',
      badgeType: 'default',
      icon: darkMode ? Sun : Moon,
      category: 'Actions Rapides',
      action: () => {
        toggleDarkMode();
      }
    }
  ], [isCampaignClosed, darkMode, onClose, onDeclareIncident, onNavigate, toggleDarkMode]);

  // Active emergencies (machines currently down or critical OTs)
  const activeEmergencies: MenuItem[] = useMemo(() => {
    const list: MenuItem[] = [];

    // Broken equipments
    const brokenEquips = equipments.filter(eq => eq.status === 'En panne' || eq.criticality === 'Critique').slice(0, 3);
    brokenEquips.forEach(eq => {
      list.push({
        id: `emerg-eq-${eq.id}`,
        name: `Panne Machine: ${eq.name}`,
        subtitle: `Code: ${eq.code || eq.id} • Emplacement: ${eq.localisation?.nom || eq.location || 'Usine'}`,
        badge: eq.status === 'En panne' ? 'Arrêt Machine' : 'Critique',
        badgeType: 'danger',
        icon: Flame,
        category: 'Pannes & Alertes Actives',
        screen: `equipment-detail:${eq.id}`
      });
    });

    // Ongoing critical work orders
    const urgentOTs = workOrders.filter(ot => (ot.priority === 'Critique' || ot.priority === 'Haute') && ot.status !== 'Terminé' && ot.status !== 'Clôturé').slice(0, 2);
    urgentOTs.forEach(ot => {
      list.push({
        id: `emerg-ot-${ot.id}`,
        name: `Intervention en cours: ${ot.numeroOT || ot.id}`,
        subtitle: `${ot.title} • Statut: ${ot.status}`,
        badge: ot.priority,
        badgeType: 'warning',
        icon: AlertOctagon,
        category: 'Pannes & Alertes Actives',
        screen: `workorder-detail:${ot.id}`
      });
    });

    return list;
  }, [equipments, workOrders]);

  // Dynamic search results across ALL domains
  const searchResults: MenuItem[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      // Default view when input is empty
      const list: MenuItem[] = [];
      list.push(...quickActions);
      if (activeEmergencies.length > 0) {
        list.push(...activeEmergencies);
      }
      list.push(...navigationPages);
      return list;
    }

    const results: MenuItem[] = [];

    // 1. Equipments & Machines (matching name, code, brand, serial, localisation)
    const matchedEquip = equipments.filter(eq => 
      (eq.name && eq.name.toLowerCase().includes(q)) ||
      (eq.code && eq.code.toLowerCase().includes(q)) ||
      (eq.id && String(eq.id).toLowerCase().includes(q)) ||
      (eq.brand && eq.brand.toLowerCase().includes(q)) ||
      (eq.model && eq.model.toLowerCase().includes(q)) ||
      (eq.location && eq.location.toLowerCase().includes(q)) ||
      (eq.localisation?.nom && eq.localisation.nom.toLowerCase().includes(q))
    ).slice(0, 5).map(eq => {
      const isDown = eq.status === 'En panne';
      return {
        id: `eq-${eq.id}`,
        name: eq.name,
        subtitle: `Code: ${eq.code || eq.id} • ${eq.brand || 'Marque N/C'} • ${eq.localisation?.nom || eq.location || 'Atelier'}`,
        badge: isDown ? 'En panne' : (eq.status || 'Opérationnel'),
        badgeType: isDown ? ('danger' as const) : ('success' as const),
        icon: Wrench,
        category: 'Équipements & Machines',
        screen: `equipment-detail:${eq.id}`
      };
    });
    results.push(...matchedEquip);

    // 2. Work Orders (OT)
    const matchedOTs = workOrders.filter(ot => 
      (ot.numeroOT && ot.numeroOT.toLowerCase().includes(q)) ||
      (ot.id && String(ot.id).toLowerCase().includes(q)) ||
      (ot.title && ot.title.toLowerCase().includes(q)) ||
      (ot.description && ot.description.toLowerCase().includes(q)) ||
      (ot.type && ot.type.toLowerCase().includes(q))
    ).slice(0, 5).map(ot => {
      const isCrit = ot.priority === 'Critique';
      return {
        id: `ot-${ot.id}`,
        name: `${ot.numeroOT || ot.id}: ${ot.title}`,
        subtitle: `Statut: ${ot.status} • Type: ${ot.type} • Assigné: ${ot.technicianId || ot.assignedBy || 'Équipe maintenance'}`,
        badge: ot.priority,
        badgeType: isCrit ? ('danger' as const) : ot.priority === 'Haute' ? ('warning' as const) : ('info' as const),
        icon: Settings,
        category: 'Ordres de Travail (OT)',
        screen: `workorder-detail:${ot.id}`
      };
    });
    results.push(...matchedOTs);

    // 3. Incidents & Pannes (DI)
    const matchedIncidents = incidents.filter(inc => 
      (inc.id && String(inc.id).toLowerCase().includes(q)) ||
      (inc.description && inc.description.toLowerCase().includes(q)) ||
      (inc.reportedBy && inc.reportedBy.toLowerCase().includes(q)) ||
      (inc.urgency && inc.urgency.toLowerCase().includes(q))
    ).slice(0, 4).map(inc => {
      return {
        id: `inc-${inc.id}`,
        name: `Panne DI: ${inc.description.slice(0, 55)}${inc.description.length > 55 ? '...' : ''}`,
        subtitle: `Déclaré par: ${inc.reportedBy || 'Opérateur'} • Urgence: ${inc.urgency}`,
        badge: inc.urgency,
        badgeType: (inc.urgency === 'Critique' || inc.urgency === 'Haute') ? ('danger' as const) : ('warning' as const),
        icon: AlertTriangle,
        category: 'Pannes & Incidents Signalés',
        screen: `incident-detail:${inc.id}`
      };
    });
    results.push(...matchedIncidents);

    // 4. Spare Parts (Stock & Magasin)
    const matchedParts = parts.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.ref && p.ref.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q))
    ).slice(0, 5).map(p => {
      const isLow = p.stockCurrent <= p.stockMin;
      return {
        id: `part-${p.id || p.ref}`,
        name: `${p.name} (Réf: ${p.ref})`,
        subtitle: `Rayon: ${p.location || 'Magasin'} • Catégorie: ${p.category || 'Rechange'} • Prix: ${p.unitPrice ? p.unitPrice + ' TND' : 'N/C'}`,
        badge: isLow ? `Stock Bas: ${p.stockCurrent}` : `En Stock: ${p.stockCurrent}`,
        badgeType: isLow ? ('danger' as const) : ('success' as const),
        icon: Boxes,
        category: 'Pièces de Rechange (Stock)',
        screen: 'inventory'
      };
    });
    results.push(...matchedParts);

    // 5. Suppliers
    const matchedSuppliers = suppliers.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.contact && s.contact.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    ).slice(0, 3).map(s => {
      return {
        id: `supp-${s.id}`,
        name: `Fournisseur: ${s.name}`,
        subtitle: `Contact: ${s.contact || 'SAV'} • Tél: ${s.phone || 'N/C'} • Email: ${s.email || 'N/C'}`,
        badge: 'Partenaire',
        badgeType: 'info' as const,
        icon: Truck,
        category: 'Fournisseurs & Prestataires',
        screen: 'suppliers'
      };
    });
    results.push(...matchedSuppliers);

    // 6. Navigation pages matching search query
    const matchedPages = navigationPages.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.subtitle && p.subtitle.toLowerCase().includes(q))
    ).slice(0, 4);
    results.push(...matchedPages);

    // 7. Quick actions matching search query
    const matchedActions = quickActions.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.subtitle && a.subtitle.toLowerCase().includes(q))
    ).slice(0, 3);
    results.push(...matchedActions);

    return results;
  }, [search, quickActions, activeEmergencies, navigationPages, equipments, workOrders, incidents, parts, suppliers]);

  if (!isOpen) return null;

  const handleSelect = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.screen) {
      onNavigate(item.screen);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    }
  };

  // Group items by category preserving insertion order
  const categories: string[] = [];
  searchResults.forEach(item => {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });

  const getBadgeStyle = (type?: MenuItem['badgeType']) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'warning':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'success':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'info':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-start justify-center pt-[10vh] px-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out] flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-3">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 border-none outline-none placeholder-slate-400 dark:placeholder-slate-500 text-base font-medium"
            placeholder="Rechercher partout: machine, OT-001, pièce de stock, panne, fournisseur..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setSelectedIndex(0); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors mr-2"
              title="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-slate-200/70 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 font-mono font-bold shrink-0 border border-slate-300/60 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[460px] custom-scrollbar"
        >
          {searchResults.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Aucun résultat pour « {search} »
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Essayez un nom de machine, une référence de pièce, un numéro d'OT ou une action rapide.
              </p>
            </div>
          ) : (
            <div>
              {categories.map((category) => {
                const categoryItems = searchResults.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="mb-4 last:mb-1">
                    <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        {category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                        {categoryItems.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {categoryItems.map((item) => {
                        const absoluteIndex = searchResults.indexOf(item);
                        const isSelected = absoluteIndex === selectedIndex;
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.id}
                            data-selected={isSelected}
                            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 dark:shadow-primary/10' 
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-primary group-hover:bg-primary/10'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs sm:text-sm font-bold truncate ${
                                    isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                                  }`}>
                                    {item.name}
                                  </span>

                                  {item.badge && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-all ${
                                      isSelected 
                                        ? 'bg-white/25 text-white' 
                                        : getBadgeStyle(item.badgeType)
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>

                                {item.subtitle && (
                                  <p className={`text-[11px] truncate mt-0.5 ${
                                    isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90 shrink-0 ml-3 pl-2 border-l border-white/20 animate-[fadeIn_0.1s_ease-out]">
                                <span className="hidden sm:inline">Ouvrir</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & keyboard shortcuts */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">↑↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">↵</kbd>
              <span>Ouvrir</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">ESC</kbd>
              <span>Fermer</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span>POMODORO Recherche Universelle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
