import React, { useState } from 'react';
import {
  Layers,
  Package,
  Users,
  Building2,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Check,
  X,
  Crown,
  Cog,
  Wrench,
  FileCheck,
  Boxes,
  ShoppingCart,
  Factory,
  FileText,
  BarChart3,
  Download,
  Plug,
  Headphones,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

interface SuperAdminPlansProps {
  plansConfig?: { Basic: number; Premium?: number; Professional?: number; Enterprise: number };
  setPlansConfig?: React.Dispatch<React.SetStateAction<any>>;
  handleSavePlans?: (e: React.FormEvent) => void;
  showConfigSaved?: boolean;
}

export const SuperAdminPlans: React.FC<SuperAdminPlansProps> = ({
  plansConfig,
  setPlansConfig,
  handleSavePlans,
  showConfigSaved
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<any | null>(null);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 4 Plans matching screenshot
  const [plans, setPlans] = useState([
    {
      id: 'trial',
      name: 'Essai gratuit',
      subtitle: 'Pour découvrir la plateforme',
      priceMonthly: 0,
      priceYearly: 0,
      periodTag: 'Pendant 14 jours',
      isPopular: false,
      colorTheme: 'blue',
      badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      cardBorder: 'border-blue-200/80 dark:border-blue-900/60',
      cardBg: 'bg-white dark:bg-slate-900',
      features: [
        '1 site/usine',
        '5 utilisateurs',
        "Jusqu'à 50 équipements",
        'Modules de base',
        'Support par email'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Pour les petites usines',
      priceMonthly: 99,
      priceYearly: 79,
      periodTag: null,
      isPopular: false,
      colorTheme: 'emerald',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
      cardBorder: 'border-emerald-200/80 dark:border-emerald-900/60',
      cardBg: 'bg-white dark:bg-slate-900',
      features: [
        '1 site/usine',
        '10 utilisateurs',
        "Jusqu'à 200 équipements",
        'Maintenance (préventive/corrective)',
        'Gestion stock (basique)',
        'Rapports standards',
        'Support email'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'Pour les usines en croissance',
      priceMonthly: 199,
      priceYearly: 159,
      periodTag: null,
      isPopular: true,
      colorTheme: 'primary',
      badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      cardBorder: 'border-2 border-primary shadow-lg shadow-primary/10',
      cardBg: 'bg-white dark:bg-slate-900',
      features: [
        "Jusqu'à 5 sites/usines",
        '50 utilisateurs',
        "Jusqu'à 1 000 équipements",
        'Maintenance complète',
        'Stock & achats',
        'Rapports avancés',
        'Gestion fournisseurs',
        'Support prioritaire'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: 'Pour les grands groupes industriels',
      priceMonthly: 'Sur devis',
      priceYearly: 'Sur devis',
      periodTag: null,
      isPopular: false,
      colorTheme: 'purple',
      badgeBg: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
      cardBorder: 'border-purple-200/80 dark:border-purple-900/60',
      cardBg: 'bg-white dark:bg-slate-900',
      features: [
        'Sites illimités',
        'Utilisateurs illimités',
        'Équipements illimités',
        'Toutes les fonctionnalités',
        'Rapports personnalisés',
        'Intégrations API',
        'Support dédié',
        'Accompagnement personnalisé'
      ]
    }
  ]);

  // Comparison matrix features
  const comparisonFeatures = [
    {
      name: 'Gestion des équipements',
      icon: Cog,
      trial: true,
      basic: true,
      professional: true,
      enterprise: true
    },
    {
      name: 'Maintenance préventive',
      icon: Wrench,
      trial: true,
      basic: true,
      professional: true,
      enterprise: true
    },
    {
      name: 'Maintenance corrective (OT)',
      icon: FileCheck,
      trial: true,
      basic: true,
      professional: true,
      enterprise: true
    },
    {
      name: 'Stock & pièces de rechange',
      icon: Boxes,
      trial: true,
      basic: true,
      professional: true,
      enterprise: true
    },
    {
      name: 'Achats & fournisseurs',
      icon: ShoppingCart,
      trial: true,
      basic: true,
      professional: true,
      enterprise: true
    },
    {
      name: 'Multi-sites',
      icon: Factory,
      trial: '1 site',
      basic: '1 site',
      professional: '5 sites',
      enterprise: 'Illimité'
    },
    {
      name: 'Rapports standards',
      icon: FileText,
      trial: true,
      basic: true,
      professional: true,
      enterprise: true
    },
    {
      name: 'Rapports avancés',
      icon: BarChart3,
      trial: false,
      basic: false,
      professional: true,
      enterprise: true
    },
    {
      name: 'Export de données',
      icon: Download,
      trial: false,
      basic: false,
      professional: true,
      enterprise: true
    },
    {
      name: 'API / Intégrations',
      icon: Plug,
      trial: false,
      basic: false,
      professional: true,
      enterprise: true
    },
    {
      name: 'Support',
      icon: Headphones,
      trial: 'Email',
      basic: 'Email',
      professional: 'Prioritaire',
      enterprise: 'Dédié'
    }
  ];

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setPlans(prev => prev.map(p => p.id === selectedPlanForEdit.id ? selectedPlanForEdit : p));
    setSelectedPlanForEdit(null);
    showToast(`Plan ${selectedPlanForEdit.name} mis à jour avec succès`);
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none animate-[fadeIn_0.2s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-[slideIn_0.2s_ease-out]">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* ── TOP HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-850 dark:text-white tracking-tight leading-snug">
              Plans & Offres
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestion des plans d'abonnement de la plateforme SaaS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Subtitle / Slogan */}
          <div className="text-right hidden md:block">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Des offres adaptées à tous
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              les besoins industriels
            </div>
          </div>

          {/* Tomato banner photo slice */}
          <div className="relative h-11 w-32 lg:w-48 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hidden sm:block">
            <img
              src={tomateImg}
              alt="Tomates industrielles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/15" />
          </div>

          {/* Add Plan Button */}
          <button
            onClick={() => setIsAddPlanOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-primary/25 hover:shadow-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un plan</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI CARDS (ROW 1) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Plans actifs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-3 bg-purple-300 dark:bg-purple-700 rounded-full" />
              <span className="w-1 h-4.5 bg-purple-400 dark:bg-purple-600 rounded-full" />
              <span className="w-1 h-6 bg-purple-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Plans actifs
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              4
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +0
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 2: Fonctionnalités */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-2.5 bg-emerald-300 rounded-full" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full" />
              <span className="w-1 h-5.5 bg-emerald-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Fonctionnalités
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              12
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +2
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 3: Entreprises abonnées */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-3 bg-emerald-300 rounded-full" />
              <span className="w-1 h-4.5 bg-emerald-500 rounded-full" />
              <span className="w-1 h-6 bg-emerald-600 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Entreprises abonnées
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              39
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 4: Essais gratuits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-1 h-5.5 bg-rose-500 rounded-full" />
              <span className="w-1 h-4 bg-rose-400 rounded-full" />
              <span className="w-1 h-2.5 bg-rose-300 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Essais gratuits
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              6
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-3 h-3" /> -25%
            </span>
            <span className="text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION: LISTE DES PLANS ──────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Section Header with Interval Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-white">
              Liste des plans
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Mensuel / Annuel toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span>Annuel</span>
                <span className="text-[10px] bg-emerald-500 text-white px-1 py-0.2 rounded-md font-extrabold">-20%</span>
              </button>
            </div>

            {/* Réorganiser button */}
            <button
              onClick={() => showToast('Mode réorganisation des plans activé')}
              className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Réorganiser</span>
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5 items-stretch">
          {plans.map((p) => {
            const isProfessional = p.id === 'professional';
            const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                  p.cardBg
                } ${p.cardBorder}`}
              >
                {/* Popular Pill badge */}
                {isProfessional && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-sm">
                      <Crown className="w-3 h-3 fill-current" />
                      Plus populaire
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Subtitle */}
                  <div className="pr-12">
                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {p.subtitle}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="mt-4 mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {typeof price === 'number' ? `${price} TND` : price}
                      </span>
                      {typeof price === 'number' && (
                        <span className="text-xs text-slate-400 font-medium">/ mois</span>
                      )}
                    </div>
                    {p.periodTag ? (
                      <span className="text-[10px] text-slate-400 block mt-0.5">{p.periodTag}</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-0.5 invisible">placeholder</span>
                    )}
                  </div>

                  {/* Plan actif Pill */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${p.badgeBg}`}>
                      Plan actif
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-650 dark:text-slate-300 text-[11px] font-medium leading-tight">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Button Footer */}
                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                  <button
                    onClick={() => setSelectedPlanForEdit({ ...p })}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM SECTION: COMPARAISON DES FONCTIONNALITÉS ──────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2">
          <Cog className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
          <h3 className="text-sm font-bold text-slate-850 dark:text-white">
            Comparaison des fonctionnalités
          </h3>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 w-1/3">
                  Module / Fonctionnalité
                </th>
                <th className="py-3 px-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl">
                  Essai gratuit
                </th>
                <th className="py-3 px-3 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl">
                  Basic
                </th>
                <th className="py-3 px-3 text-center text-xs font-bold text-blue-800 dark:text-blue-200 bg-blue-100/50 dark:bg-blue-900/30 rounded-t-xl">
                  Professional
                </th>
                <th className="py-3 px-3 text-center text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/20 rounded-t-xl">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-xs">
              {comparisonFeatures.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 flex items-center gap-2 text-slate-750 dark:text-slate-200">
                      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-semibold">{row.name}</span>
                    </td>

                    {/* Essai gratuit col */}
                    <td className="py-2.5 px-3 text-center bg-blue-50/20 dark:bg-blue-950/10">
                      {typeof row.trial === 'boolean' ? (
                        row.trial ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">{row.trial}</span>
                      )}
                    </td>

                    {/* Basic col */}
                    <td className="py-2.5 px-3 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">{row.basic}</span>
                      )}
                    </td>

                    {/* Professional col */}
                    <td className="py-2.5 px-3 text-center bg-blue-100/20 dark:bg-blue-900/10 font-bold">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold">{row.professional}</span>
                      )}
                    </td>

                    {/* Enterprise col */}
                    <td className="py-2.5 px-3 text-center bg-purple-50/20 dark:bg-purple-950/10 font-bold">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: MODIFIER UN PLAN ─────────────────────────────────────────── */}
      {selectedPlanForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePlanEdit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out] flex flex-col gap-4 text-xs"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                Modifier le plan {selectedPlanForEdit.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPlanForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Nom du plan</label>
                <input
                  type="text"
                  value={selectedPlanForEdit.name}
                  onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Sous-titre descriptif</label>
                <input
                  type="text"
                  value={selectedPlanForEdit.subtitle}
                  onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Prix mensuel (TND)</label>
                <input
                  type="text"
                  value={selectedPlanForEdit.priceMonthly}
                  onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, priceMonthly: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Prix annuel remisé (TND/mois)</label>
                <input
                  type="text"
                  value={selectedPlanForEdit.priceYearly}
                  onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, priceYearly: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition"
              >
                Enregistrer le plan
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlanForEdit(null)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: AJOUTER UN PLAN ─────────────────────────────────────────── */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-[zoomIn_0.15s_ease-out] text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Créer un nouveau plan d'abonnement
              </h3>
              <button
                onClick={() => setIsAddPlanOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Nom de l'offre</label>
                <input
                  type="text"
                  placeholder="ex: Startup Agro"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Prix mensuel (TND)</label>
                <input
                  type="number"
                  placeholder="149"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsAddPlanOpen(false);
                  showToast('Nouveau plan créé avec succès !');
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition"
              >
                Créer le plan
              </button>
              <button
                onClick={() => setIsAddPlanOpen(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
