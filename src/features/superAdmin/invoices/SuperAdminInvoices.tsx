import React, { useState, useMemo, useEffect } from 'react';
import { superAdminApi } from '../api/superAdmin.api';
import { REAL_DB_INVOICES } from '../constants/realTenantsData';
import {
  Receipt,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText,
  RotateCcw,
  Edit,
  Trash2,
  Share2,
  Printer,
  DollarSign,
  TrendingUp,
  Layers,
  Building2,
  ExternalLink,
  Coins,
  Check,
  X,
  CreditCard
} from 'lucide-react';
import tomateImg from '@/shared/assets/images/tomate.jpg';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  company: string;
  logo: string;
  plan: 'Professional' | 'Basic' | 'Enterprise';
  planBadgeColor: string;
  amount: string;
  amountHT: string;
  tva: string;
  amountTotal: string;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  status: 'Payée' | 'En attente' | 'En retard' | 'Annulée';
  statusBadgeColor: string;
  paymentMethod: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  period: string;
}

export const SuperAdminInvoices: React.FC = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvoirModalOpen, setIsAvoirModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 10 invoices matching screenshot
  const [invoices, setInvoices] = useState<InvoiceItem[]>(REAL_DB_INVOICES as any);

  // Selected invoice for detail preview
  const selectedInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];
  }, [invoices, selectedInvoiceId]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.contact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      const matchPlan = planFilter === 'All' || inv.plan === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [invoices, searchTerm, statusFilter, planFilter]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCheckboxes(filteredInvoices.map(i => i.id));
    } else {
      setSelectedCheckboxes([]);
    }
  };

  const handleToggleCheckbox = (id: string) => {
    setSelectedCheckboxes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Monthly Revenue data (Bar chart)
  const monthlyRevenueData = [
    { month: 'Jan', val: 4.8 },
    { month: 'Fév', val: 5.4 },
    { month: 'Mar', val: 6.8 },
    { month: 'Avr', val: 7.2 },
    { month: 'Mai', val: 7.9 },
    { month: 'Juin', val: 8.5 },
    { month: 'Juil', val: 9.1 },
    { month: 'Août', val: 9.8 },
    { month: 'Sep', val: 10.4 },
    { month: 'Oct', val: 11.8 },
    { month: 'Nov', val: 13.2 },
    { month: 'Déc', val: 14.6 }
  ];

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['N° Facture,Entreprise,Plan,Montant,Date émission,Date échéance,Statut']
        .concat(
          filteredInvoices.map(
            i => `"${i.invoiceNumber}","${i.company}","${i.plan}","${i.amount}","${i.issueDate}","${i.dueDate}","${i.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `factures_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fichier CSV exporté avec succès');
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchInvoices = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await superAdminApi.getInvoices();
      if (data && data.length > 0) {
        const mapped: InvoiceItem[] = data.map((inv, idx) => ({
          id: String(inv.id),
          invoiceNumber: inv.numeroFacture || `FAC-2026-${String(idx + 1).padStart(4, '0')}`,
          company: inv.societeNom || 'Société Client',
          logo: inv.societeNom.toLowerCase().includes('tomate') ? '🍅' : (inv.societeNom.toLowerCase().includes('sicam') ? '🥫' : '🏭'),
          plan: inv.plan?.includes('Enterprise') ? 'Enterprise' : (inv.plan?.includes('Starter') ? 'Basic' : 'Professional'),
          planBadgeColor: inv.plan?.includes('Enterprise')
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
            : (inv.plan?.includes('Starter')
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900'),
          amount: `${Number(inv.montantTTC).toLocaleString('fr-FR')} TND`,
          amountHT: `${Number(inv.montantHT).toLocaleString('fr-FR')} TND`,
          tva: `${Math.round(inv.montantHT * 0.19).toLocaleString('fr-FR')} TND`,
          amountTotal: `${Number(inv.montantTTC).toLocaleString('fr-FR')} TND`,
          issueDate: new Date(inv.dateEmission).toLocaleDateString('fr-FR'),
          dueDate: new Date(inv.dateEcheance).toLocaleDateString('fr-FR'),
          paymentDate: inv.datePaiement ? new Date(inv.datePaiement).toLocaleDateString('fr-FR') : undefined,
          status: (inv.statut as any) || 'Payée',
          statusBadgeColor: inv.statut === 'Payée'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
            : (inv.statut === 'En attente'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'),
          paymentMethod: inv.methodePaiement || 'Virement bancaire',
          contact: 'Direction Financière',
          email: 'finance@societe.tn',
          phone: '+216 71 000 000',
          address: 'Tunisie',
          period: inv.periode || 'Mars 2026'
        }));
        setInvoices(mapped);
        if (showNotification) showToast('Factures synchronisées avec PostgreSQL .NET');
      }
    } catch (err) {
      console.warn('[Invoices] Utilisation des données locales:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalInvoicesCount = invoices.length;
  const paidInvoicesCount = invoices.filter(i => i.status === 'Payée').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'En attente').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'En retard').length;

  const totalRevenue = invoices.reduce((acc, i) => {
    const num = parseFloat(i.amount.replace(/[^0-9.]/g, '')) || 0;
    return acc + num;
  }, 0);

  const paidPercent = totalInvoicesCount > 0 ? Math.round((paidInvoicesCount / totalInvoicesCount) * 100) : 0;
  const pendingPercent = totalInvoicesCount > 0 ? Math.round((pendingInvoicesCount / totalInvoicesCount) * 100) : 0;
  const overduePercent = totalInvoicesCount > 0 ? Math.round((overdueInvoicesCount / totalInvoicesCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out] relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 animate-[slideIn_0.2s_ease-out]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP BANNER */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Left branding */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shadow-inner">
            <Receipt className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Facturation
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Gestion des factures et des paiements de la plateforme SaaS
            </p>
          </div>
        </div>

        {/* Right tomato image banner & Period widget */}
        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
          <div className="relative h-14 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center shadow-inner px-4 bg-slate-900/10 dark:bg-slate-950/50">
            <img
              src={tomateImg}
              alt="Industrial Plant"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-slate-900/90 dark:via-slate-900/70" />
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Période
              </div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                01/01/2026 - 31/12/2026
              </div>
            </div>
          </div>

          {/* Synchronize button */}
          <button
            onClick={() => fetchInvoices(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Synchroniser avec PostgreSQL .NET"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenus totaux */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalRevenue.toLocaleString('fr-FR')} TND
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Revenus facturés
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ↑ 100%
                </span>
                <span className="text-[9px] text-slate-400">données réelles</span>
              </div>
            </div>
          </div>
          {/* Blue mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-blue-200 dark:bg-blue-900 rounded-t" />
            <span className="w-2.5 h-4 bg-blue-300 dark:bg-blue-800 rounded-t" />
            <span className="w-2.5 h-5 bg-blue-400 dark:bg-blue-700 rounded-t" />
            <span className="w-2.5 h-6 bg-blue-500 dark:bg-blue-600 rounded-t" />
            <span className="w-2.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-t" />
          </div>
        </div>

        {/* KPI 2: Factures payées */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {paidInvoicesCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Factures payées
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {paidPercent}%
                </span>
                <span className="text-[9px] text-slate-400">du total</span>
              </div>
            </div>
          </div>
          {/* Green mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-4 bg-emerald-200 dark:bg-emerald-900 rounded-t" />
            <span className="w-2.5 h-5 bg-emerald-300 dark:bg-emerald-800 rounded-t" />
            <span className="w-2.5 h-6 bg-emerald-400 dark:bg-emerald-700 rounded-t" />
            <span className="w-2.5 h-7 bg-emerald-500 dark:bg-emerald-600 rounded-t" />
            <span className="w-2.5 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-t" />
          </div>
        </div>

        {/* KPI 3: En attente de paiement */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {pendingInvoicesCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                En attente de paiement
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                  {pendingPercent}%
                </span>
                <span className="text-[9px] text-slate-400">en cours</span>
              </div>
            </div>
          </div>
          {/* Orange mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-3 bg-amber-200 dark:bg-amber-900 rounded-t" />
            <span className="w-2.5 h-5 bg-amber-300 dark:bg-amber-800 rounded-t" />
            <span className="w-2.5 h-4 bg-amber-400 dark:bg-amber-700 rounded-t" />
            <span className="w-2.5 h-6 bg-amber-500 dark:bg-amber-600 rounded-t" />
            <span className="w-2.5 h-5 bg-amber-600 dark:bg-amber-500 rounded-t" />
          </div>
        </div>

        {/* KPI 4: En retard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {overdueInvoicesCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                En retard
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                  {overduePercent}%
                </span>
                <span className="text-[9px] text-slate-400">à relancer</span>
              </div>
            </div>
          </div>
          {/* Red mini sparkline chart */}
          <div className="w-16 h-8 flex items-end gap-1 px-1">
            <span className="w-2.5 h-5 bg-rose-200 dark:bg-rose-900 rounded-t" />
            <span className="w-2.5 h-4 bg-rose-300 dark:bg-rose-800 rounded-t" />
            <span className="w-2.5 h-3 bg-rose-400 dark:bg-rose-700 rounded-t" />
            <span className="w-2.5 h-6 bg-rose-500 dark:bg-rose-600 rounded-t" />
            <span className="w-2.5 h-7 bg-rose-600 dark:bg-rose-500 rounded-t" />
          </div>
        </div>
      </div>

      {/* MIDDLE CHARTS ROW: 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Revenus mensuels */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Revenus mensuels
              </h3>
            </div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Bar chart canvas */}
          <div className="h-44 flex items-end justify-between gap-1 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 relative">
            {/* Horizontal guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 pr-2">
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between">
                <span>15K</span>
              </div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between">
                <span>10K</span>
              </div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 flex justify-between">
                <span>5K</span>
              </div>
              <div className="flex justify-between">
                <span>0</span>
              </div>
            </div>

            {monthlyRevenueData.map(item => {
              const heightPercent = (item.val / 15) * 100;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group relative z-10">
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold pointer-events-none whitespace-nowrap z-20">
                    {item.val}K TND
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[18px] bg-blue-500 group-hover:bg-blue-600 rounded-t transition-all"
                  />
                  <span className="text-[9px] font-semibold text-slate-400">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: Répartition des plans (Donut) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-black text-slate-800 dark:text-white">
              Répartition des plans
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                />
                {/* Professional: 52% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="3.5"
                  strokeDasharray="52 48"
                  strokeDashoffset="0"
                />
                {/* Basic: 27% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeDasharray="27 73"
                  strokeDashoffset="-52"
                />
                {/* Enterprise: 13% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="3.5"
                  strokeDasharray="13 87"
                  strokeDashoffset="-79"
                />
                {/* Essai gratuit: 8% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="8 92"
                  strokeDashoffset="-92"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                  48
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Entreprises</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex flex-col gap-2 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Professional</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">52% (25)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Basic</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">27% (13)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Enterprise</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">13% (6)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Essai gratuit</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">8% (4)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 3: Statut des paiements (Donut) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Statut des paiements
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center gap-1">
                <span>↓</span> Payée
              </span>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                />
                {/* Payées: 87% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeDasharray="87 13"
                  strokeDashoffset="0"
                />
                {/* En attente: 6% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="6 94"
                  strokeDashoffset="-87"
                />
                {/* En retard: 6% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="3.5"
                  strokeDasharray="6 94"
                  strokeDashoffset="-93"
                />
                {/* Annulées: 1% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#94A3B8"
                  strokeWidth="3.5"
                  strokeDasharray="1 99"
                  strokeDashoffset="-99"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                  {totalInvoicesCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Factures</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex flex-col gap-2 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Payées</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">{paidPercent}% ({paidInvoicesCount})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">En attente</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">{pendingPercent}% ({pendingInvoicesCount})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">En retard</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">{overduePercent}% ({overdueInvoicesCount})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">En retard</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">6% (3)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Annulées</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">1% (1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM WORKSPACE: TABLE (LEFT) + DETAILS PANEL (RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LISTE DES FACTURES (8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with search & filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  Liste des factures
                </h2>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une facture, une entreprise..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {/* Status select */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                  >
                    <option value="All">Tous les statuts</option>
                    <option value="Payée">Payée</option>
                    <option value="En attente">En attente</option>
                    <option value="En retard">En retard</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Plan select */}
                <div className="relative">
                  <select
                    value={planFilter}
                    onChange={e => setPlanFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                  >
                    <option value="All">Tous les plans</option>
                    <option value="Professional">Professional</option>
                    <option value="Basic">Basic</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Date select */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer"
                  >
                    <option value="All">Toutes les dates</option>
                    <option value="Septembre 2026">Septembre 2026</option>
                    <option value="Août 2026">Août 2026</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Export button */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Invoices table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedCheckboxes.length > 0 &&
                          selectedCheckboxes.length === filteredInvoices.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">N° Facture</th>
                    <th className="py-3 px-3">Entreprise</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Montant</th>
                    <th className="py-3 px-3">Date d'émission</th>
                    <th className="py-3 px-3">Date d'échéance</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredInvoices.map(invoice => {
                    const isSelected = invoice.id === selectedInvoice.id;
                    const isChecked = selectedCheckboxes.includes(invoice.id);

                    return (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td
                          className="py-3 px-3 text-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCheckbox(invoice.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{invoice.logo}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {invoice.company}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${invoice.planBadgeColor}`}
                          >
                            {invoice.plan}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {invoice.amount}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {invoice.issueDate}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {invoice.dueDate}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${invoice.statusBadgeColor}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td
                          className="py-3 px-3 text-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(invoice.id);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filteredInvoices.length > 0 ? `1-${filteredInvoices.length}` : '0'} sur {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-600/30"
              >
                1
              </button>
              <button
                disabled={true}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="ml-3 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DÉTAILS DE LA FACTURE (4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-800 dark:text-white">
              Détails de la facture
            </h3>
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${selectedInvoice.statusBadgeColor}`}
              >
                <Check className="w-3 h-3" />
                {selectedInvoice.status}
              </span>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invoice card */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                {selectedInvoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Émise le {selectedInvoice.issueDate}
              </div>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => showToast(`Téléchargement de ${selectedInvoice.invoiceNumber}.pdf`)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={() => setIsSendEmailModalOpen(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Envoyer par email</span>
            </button>
          </div>

          {/* Informations entreprise */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                Informations entreprise
              </h4>
              <button
                onClick={() => showToast(`Ouverture de la fiche ${selectedInvoice.company}`)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                Voir la fiche
              </button>
            </div>

            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-xl">{selectedInvoice.logo}</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                {selectedInvoice.company}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Contact principal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Téléphone</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Adresse</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-right">{selectedInvoice.address}</span>
              </div>
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Détails du paiement
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plan</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer">{selectedInvoice.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Période</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.period}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Montant HT</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.amountHT}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">TVA (19%)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.tva}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-800 dark:text-white">Montant total</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{selectedInvoice.amountTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Méthode de paiement</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.paymentMethod}</span>
              </div>
              {selectedInvoice.paymentDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Date de paiement</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedInvoice.paymentDate}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Statut</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedInvoice.statusBadgeColor}`}>
                  {selectedInvoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Actions
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => showToast(`Facture ${selectedInvoice.invoiceNumber} renvoyée`)}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                <span>Renvoyer la facture</span>
              </button>
              <button
                onClick={() => showToast(`Reçu téléchargé pour ${selectedInvoice.invoiceNumber}`)}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Télécharger reçu</span>
              </button>
              <button
                onClick={() => setIsAvoirModalOpen(true)}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>Créer avoir</span>
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <Edit className="w-3.5 h-3.5 text-amber-500" />
                <span>Modifier</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Confirmer l'annulation de la facture ${selectedInvoice.invoiceNumber} ?`)) {
                    setInvoices(prev =>
                      prev.map(i =>
                        i.id === selectedInvoice.id
                          ? { ...i, status: 'Annulée', statusBadgeColor: 'bg-rose-50 text-rose-700' }
                          : i
                      )
                    );
                    showToast('Facture annulée');
                  }
                }}
                className="col-span-2 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Annuler</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: MODIFIER LA FACTURE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Modifier {selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Statut de la facture
                </label>
                <select
                  value={selectedInvoice.status}
                  onChange={e => {
                    const nextStatus = e.target.value as InvoiceItem['status'];
                    const nextColor =
                      nextStatus === 'Payée'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : nextStatus === 'En attente'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
                    setInvoices(prev =>
                      prev.map(i =>
                        i.id === selectedInvoice.id
                          ? { ...i, status: nextStatus, statusBadgeColor: nextColor }
                          : i
                      )
                    );
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                >
                  <option value="Payée">Payée</option>
                  <option value="En attente">En attente</option>
                  <option value="En retard">En retard</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Méthode de paiement
                </label>
                <input
                  type="text"
                  value={selectedInvoice.paymentMethod}
                  onChange={e => {
                    setInvoices(prev =>
                      prev.map(i =>
                        i.id === selectedInvoice.id ? { ...i, paymentMethod: e.target.value } : i
                      )
                    );
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  showToast('Modifications enregistrées');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRÉER UN AVOIR */}
      {isAvoirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Créer un avoir pour {selectedInvoice.invoiceNumber}
              </h3>
              <button onClick={() => setIsAvoirModalOpen(false)} className="p-1 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Un avoir partiel ou total sera généré pour l’entreprise {selectedInvoice.company}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Montant de l'avoir (TND)
              </label>
              <input
                type="text"
                defaultValue={selectedInvoice.amountTotal}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAvoirModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setIsAvoirModalOpen(false);
                  showToast(`Avoir généré avec succès pour ${selectedInvoice.company}`);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
              >
                Générer l'avoir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENVOYER PAR EMAIL */}
      {isSendEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Envoyer la facture par email
              </h3>
              <button onClick={() => setIsSendEmailModalOpen(false)} className="p-1 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destinataire
              </label>
              <input
                type="email"
                defaultValue={selectedInvoice.email}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsSendEmailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setIsSendEmailModalOpen(false);
                  showToast(`Facture envoyée à ${selectedInvoice.email}`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
