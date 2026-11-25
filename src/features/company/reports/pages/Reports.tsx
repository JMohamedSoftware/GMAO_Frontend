import React, { useState } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Filter, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Clock,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { calculateUnifiedMaintenanceKpis, getWorkOrderCost, getWorkOrderDurationHours } from '@/shared/services/kpiCalculator';

export const Reports: React.FC = () => {
  const { 
    selectedCampaign, 
    workOrders, 
    equipments, 
    incidents, 
    currentUser, 
    parts, 
    technicians, 
    users,
    campaigns,
    isCampaignClosed,
    campaignWorkOrders,
    campaignIncidents
  } = useGmao();
  const { isChefEquipe, can } = usePermissions();
  
  const [exporting, setExporting] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  
  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    
    try {
      if (format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        // Feuille 1: KPIs
        const kpiData = [
          { Metrique: 'MTBF (Heures)', Valeur: mtbfH !== null ? mtbfH.toFixed(2) : 'N/A' },
          { Metrique: 'MTTR (Minutes)', Valeur: avgMTTR !== null ? avgMTTR.toFixed(2) : 'N/A' },
          { Metrique: 'Disponibilité (%)', Valeur: disponibilite !== null ? disponibilite.toFixed(2) : 'N/A' },
          { Metrique: 'Coût Total (TND)', Valeur: totalCost.toFixed(3) },
          { Metrique: 'Total OTs Terminés', Valeur: completedOTs.length },
        ];
        const wsKPI = XLSX.utils.json_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(wb, wsKPI, 'KPIs');

        // Feuille 2: Work Orders
        const woData = filteredWorkOrders.map(ot => {
          const eq = equipments.find(e => String(e.id) === String(ot.equipmentId));
          const tech = technicians.find(t => String(t.id) === String(ot.technicianId));
          const u = users?.find(user => String(user.id) === String(ot.technicianId));
          const assignedName = tech?.name || u?.name || ot.technicianId || 'Non assigné';

          return {
            ID: ot.id,
            Titre: ot.title,
            Type: ot.type,
            Statut: ot.status,
            Equipement: eq ? `${eq.name} (${eq.code || eq.id})` : ot.equipmentId,
            Assigné_A: assignedName,
            Date_Creation: ot.createdDate,
            Date_Debut: ot.startDate || '',
            Date_Fin: ot.endDate || '',
            Duree_Minutes: ot.durationMinutes
          };
        });
        const wsWO = XLSX.utils.json_to_sheet(woData);
        XLSX.utils.book_append_sheet(wb, wsWO, 'Bons de Travail');

        XLSX.writeFile(wb, `Rapport_GMAO_${selectedCampaign}_${new Date().toISOString().split('T')[0]}.xlsx`);
        
      } else if (format === 'pdf') {
        const element = document.getElementById('report-content');
        if (element) {
          const imgData = await domtoimage.toPng(element, { bgcolor: '#ffffff' });
          
          const img = new Image();
          img.src = imgData;
          await new Promise((resolve) => { img.onload = resolve; });

          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (img.height * pdfWidth) / img.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Rapport_GMAO_${selectedCampaign}_${new Date().toISOString().split('T')[0]}.pdf`);
        }
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Erreur lors de lexport', error);
      alert("Une erreur est survenue lors de l'exportation.");
    } finally {
      setExporting(null);
    }
  };


  const scope = isChefEquipe ? 'mon_equipe' : 'toute_usine';
  
  // Scoped lists strictly according to the selected campaign
  const baseOrders = campaignWorkOrders;
  const baseIncidents = campaignIncidents;

  // Filter WorkOrders based on scope
  const filteredWorkOrders = baseOrders.filter(ot => {
    if (scope === 'toute_usine') return true;
    if (scope === 'mon_equipe') {
      return true; 
    }
    return ot.technicianId === currentUser?.name;
  });

  // Filter Incidents
  const filteredIncidents = baseIncidents.filter(inc => {
    if (scope === 'toute_usine') return true;
    if (scope === 'mon_equipe') return true;
    return inc.reportedBy === currentUser?.name;
  });

  // --- Dynamic Data Computation ---

  // Top Equipments en Panne
  const eqPanneCount: Record<string, number> = {};
  filteredIncidents.forEach(inc => {
    if (inc.equipmentId) {
      eqPanneCount[inc.equipmentId] = (eqPanneCount[inc.equipmentId] || 0) + 1;
    }
  });
  const topEquipmentsData = Object.entries(eqPanneCount)
    .map(([id, count]) => {
      const eq = equipments.find(e => e.id === id);
      return { name: eq ? eq.name : id, pannes: count };
    })
    .sort((a: any, b: any) => b.pannes - a.pannes)
    .slice(0, 5);

  if (topEquipmentsData.length === 0) {
    topEquipmentsData.push({ name: 'Aucune panne', pannes: 0 });
  }

  // Top Techniciens (Résolution directe du nom et avatar)
  const techCount: Record<string, number> = {};
  filteredWorkOrders.filter(ot => ot.status === 'Terminé' || ot.status === 'Clôturé').forEach(ot => {
    if (ot.technicianId) {
      techCount[ot.technicianId] = (techCount[ot.technicianId] || 0) + 1;
    }
  });
  const topTechniciansData = Object.entries(techCount)
    .map(([id, count]) => {
      const tech = technicians.find(t => String(t.id) === String(id));
      const user = users?.find(u => String(u.id) === String(id));
      const resolvedName = tech?.name || user?.name || (isNaN(Number(id)) ? id : `Technicien #${id}`);
      return { 
        id, 
        name: resolvedName, 
        count,
        avatar: tech?.avatar || user?.avatar
      };
    })
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  if (topTechniciansData.length === 0) {
    topTechniciansData.push({ id: '0', name: 'Aucun', count: 0, avatar: undefined });
  }

  // Top Types de Pannes
  const typePanneCount: Record<string, number> = {};
  filteredWorkOrders.filter(ot => ot.type === 'Correctif').forEach(ot => {
    const typeStr = ot.description?.split(' ')[0] || 'Autre';
    typePanneCount[typeStr] = (typePanneCount[typeStr] || 0) + 1;
  });
  const topPannesData = Object.entries(typePanneCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  if (topPannesData.length === 0) {
    topPannesData.push({ type: 'Aucune', count: 0 });
  }

  // Compute unified AFNOR KPIs (exactement alignés avec Dashboard / DashboardKpis)
  const completedOTs = filteredWorkOrders.filter(ot => ot.status === 'Terminé' || ot.status === 'Clôturé');
  const delayedOTs = filteredWorkOrders.filter(ot => ot.status === 'En attente' || ot.status === 'Affecté');
  const cancelledOTs = filteredWorkOrders.filter(ot => (ot.status as string) === 'Annulé');
  const prevOTs = filteredWorkOrders.filter(ot => ot.type === 'Préventif');
  const corrOTs = filteredWorkOrders.filter(ot => ot.type === 'Correctif');

  const unifiedKpis = calculateUnifiedMaintenanceKpis({
    equipments,
    workOrders: filteredWorkOrders,
    incidents: filteredIncidents,
    parts,
    technicians
  });

  const hasIndustrialData = equipments.length > 0 && (filteredWorkOrders.length > 0 || filteredIncidents.length > 0);
  const avgMTTR = unifiedKpis.mttrMinutes;
  const mtbfH = unifiedKpis.mtbfHours;
  const disponibilite = unifiedKpis.disponibilitePercent;
  const totalCost = unifiedKpis.totalMaintenanceCost;
  const stockCritique = unifiedKpis.criticalPartsBelowMin;

  // Real dynamic monthly chart data
  const mainGraphData = React.useMemo(() => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const totalOperatingPerMonth = unifiedKpis.totalOperatingHours > 0 ? unifiedKpis.totalOperatingHours / 6 : 0;
    const buckets: { period: string; arret: number; nbOt: number; cout: number; dispo: number; rawMonth: number; rawYear: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        period: monthNames[d.getMonth()],
        rawMonth: d.getMonth(),
        rawYear: d.getFullYear(),
        arret: 0,
        nbOt: 0,
        cout: 0,
        dispo: totalOperatingPerMonth > 0 ? 100 : (disponibilite ?? 0)
      });
    }

    if (!hasIndustrialData || filteredWorkOrders.length === 0) {
      return buckets;
    }

    filteredWorkOrders.forEach(ot => {
      const d = ot.createdDate ? new Date(ot.createdDate) : new Date();
      const bucket = buckets.find(b => b.rawMonth === d.getMonth() && b.rawYear === d.getFullYear());
      if (bucket) {
        bucket.nbOt += 1;
        const durH = getWorkOrderDurationHours(ot) ?? 0;
        bucket.arret = Math.round((bucket.arret + durH) * 10) / 10;
        if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
          bucket.cout += Math.round(getWorkOrderCost(ot, parts, technicians).total);
        }
      }
    });

    if (totalOperatingPerMonth > 0) {
      buckets.forEach(b => {
        if (b.arret > 0) {
          b.dispo = Math.min(100, Math.max(0, Math.round(((totalOperatingPerMonth - b.arret) / totalOperatingPerMonth) * 1000) / 10));
        }
      });
    }

    return buckets;
  }, [filteredWorkOrders, hasIndustrialData, parts, technicians, unifiedKpis.totalOperatingHours, disponibilite]);

  // Comparatif réel par équipement (sans multiplicateur arbitraire 250 ni valeurs 2025 fictives)
  const campaignCompareData = React.useMemo(() => {
    if (!hasIndustrialData) return [];

    const orderedCampaigns = [...(campaigns || [])].sort((a, b) =>
      String(b.startDate || '').localeCompare(String(a.startDate || ''))
    );
    const prevCampaign = orderedCampaigns.length > 1 ? orderedCampaigns[1] : null;
    const prevOrders = prevCampaign
      ? workOrders.filter(w => String(w.campagneId || '') === String(prevCampaign.id) || w.campaign === prevCampaign.name)
      : [];
    const prevIncidents = prevCampaign
      ? incidents.filter(inc => {
          const day = (inc.reportedDate || '').split('T')[0];
          const sDay = (prevCampaign.startDate || '').split('T')[0];
          const eDay = (prevCampaign.endDate || '').split('T')[0];
          return Boolean(day && sDay && day >= sDay && (!eDay || day <= eDay));
        })
      : [];

    return topEquipmentsData
      .filter(item => item.pannes > 0 && item.name !== 'Aucune panne')
      .slice(0, 5)
      .map(item => {
        const eq = equipments.find(e => e.name === item.name);
        const eqOrders = eq
          ? completedOTs.filter(o => o.equipmentId === eq.id)
          : [];
        const realCostCurrent = Math.round(
          eqOrders.reduce((s, o) => s + getWorkOrderCost(o, parts, technicians).total, 0)
        );
        const pannesPrev = prevCampaign && eq
          ? prevIncidents.filter(i => i.equipmentId === eq.id).length
          : 0;
        const costPrev = prevCampaign && eq
          ? Math.round(
              prevOrders
                .filter(o => o.equipmentId === eq.id && (o.status === 'Terminé' || o.status === 'Clôturé'))
                .reduce((s, o) => s + getWorkOrderCost(o, parts, technicians).total, 0)
            )
          : 0;

        return {
          id: eq?.code || eq?.id || 'EQ',
          name: item.name,
          hasPrevCampaign: !!prevCampaign,
          pannes25: pannesPrev,
          pannes26: item.pannes,
          cost25: costPrev,
          cost26: realCostCurrent
        };
      });
  }, [topEquipmentsData, equipments, hasIndustrialData, completedOTs, parts, technicians, campaigns, workOrders, incidents]);

  // Filter state
  const [filters, setFilters] = useState({
    campagne: selectedCampaign,
    usine: 'Toutes',
    famille: 'Toutes',
    equipement: 'Tous',
    technicien: 'Tous',
    periode: 'Ce mois'
  });

  return (
    <div className="flex flex-col gap-6" id="report-content">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Analyses & Rapports Avancés
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            {isCampaignClosed 
              ? `Rapport d'archive — Performance industrielle et rentabilité de la ${selectedCampaign} (Clôturée)`
              : `Performance industrielle de la ${selectedCampaign} et rentabilité`
            }
          </p>
        </div>

        {/* Export options */}
        <div className="flex gap-2 relative">
          {showSuccessAlert && (
            <div className="absolute top-[-40px] right-0 bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Rapport généré & téléchargé !</span>
            </div>
          )}

          {can(PERMISSIONS.REPORT_EXPORT_PDF) && (
            <button
              onClick={() => handleExport('pdf')}
              disabled={!!exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 dark:bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-custom-sm shadow disabled:opacity-40"
            >
              {exporting === 'pdf' ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Export PDF</span>
            </button>
          )}

          {can(PERMISSIONS.REPORT_EXPORT_EXCEL) && (
            <button
              onClick={() => handleExport('excel')}
              disabled={!!exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-white rounded-custom-sm shadow disabled:opacity-40"
            >
              {exporting === 'excel' ? (
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              )}
              <span>Export Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* === KPI Section === */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${!isChefEquipe ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-4`}>
        {/* MTBF */}
        <div className="glass-panel p-4 rounded-custom-md border border-emerald-500/20 bg-emerald-500/5 shadow-sm flex flex-col gap-2 relative group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">MTBF</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-300">
            {mtbfH !== null ? `${mtbfH.toFixed(0)}h` : '—'}
          </span>
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-[-30px] left-0 bg-slate-800 text-white text-[10px] p-2 rounded z-10 whitespace-nowrap pointer-events-none shadow-lg">
            {hasIndustrialData ? 'Mean Time Between Failures' : 'Données insuffisantes (Aucune panne)'}
          </div>
        </div>

        {/* MTTR */}
        <div className="glass-panel p-4 rounded-custom-md border border-amber-500/20 bg-amber-500/5 shadow-sm flex flex-col gap-2 relative group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">MTTR</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-black text-amber-600 dark:text-amber-300">
            {avgMTTR !== null ? `${avgMTTR.toFixed(0)}min` : '—'}
          </span>
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-[-30px] left-0 bg-slate-800 text-white text-[10px] p-2 rounded z-10 whitespace-nowrap pointer-events-none shadow-lg">
            Mean Time To Repair
          </div>
        </div>

        {/* Disponibilité */}
        <div className="glass-panel p-4 rounded-custom-md border border-primary/20 bg-primary/5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Dispo</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-black text-primary">
            {disponibilite !== null ? `${disponibilite.toFixed(1)}%` : '—'}
          </span>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${disponibilite !== null ? Math.min(100, disponibilite) : 0}%` }} />
          </div>
        </div>

        {/* OTs Clôturés */}
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total OTs</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">
            {filteredWorkOrders.length}
          </span>
          <p className="text-[10px] text-slate-400 mt-auto">Total des ordres</p>
        </div>

        {/* Coût Total (Hidden for Chef d'équipe) */}
        {!isChefEquipe && (
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Coût</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">
            {totalCost.toLocaleString()} <span className="text-xs">TND</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-auto">Dépenses globales</p>
        </div>
        )}

        {/* Stock Critique */}
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Stock Min</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">
            {stockCritique}
          </span>
          <p className="text-[10px] text-slate-400 mt-auto">Pièces sous alerte</p>
        </div>
      </div>

      {/* Breakdown OTs Card */}
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-wrap gap-4 items-center justify-around text-xs font-bold text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Réalisés: {completedOTs.length}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> En retard: {delayedOTs.length}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Annulés: {cancelledOTs.length}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Préventifs: {prevOTs.length} ({Math.round((prevOTs.length / filteredWorkOrders.length) * 100 || 0)}%)</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Correctifs: {corrOTs.length} ({Math.round((corrOTs.length / filteredWorkOrders.length) * 100 || 0)}%)</div>
      </div>

      {/* === Filters === */}
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-primary shrink-0" />
        <select value={filters.campagne} onChange={(e) => setFilters({...filters, campagne: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          {campaigns && campaigns.length > 0 ? (
            campaigns.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)
          ) : (
            <option value={selectedCampaign}>{selectedCampaign}</option>
          )}
        </select>
        <select value={filters.usine} onChange={(e) => setFilters({...filters, usine: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option value="Toutes">Toutes (Localisations)</option>
          {Array.from(new Set(equipments.map(e => e.location || (e.localisation as any)?.nom).filter(Boolean))).map((loc: any) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select value={filters.famille} onChange={(e) => setFilters({...filters, famille: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option value="Toutes">Toutes (Familles)</option>
          {Array.from(new Set(equipments.map(e => e.category).filter(Boolean))).map((fam: any) => (
            <option key={fam} value={fam}>{fam}</option>
          ))}
        </select>
        <select value={filters.equipement} onChange={(e) => setFilters({...filters, equipement: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option value="Tous">Tous (Équipements)</option>
          {equipments.map(eq => <option key={eq.id} value={eq.name}>{eq.name}</option>)}
        </select>
        <select value={filters.technicien} onChange={(e) => setFilters({...filters, technicien: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option value="Tous">Tous (Techniciens)</option>
          {(technicians || []).map(t => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
        <select value={filters.periode} onChange={(e) => setFilters({...filters, periode: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Ce mois</option>
          <option>Ce trimestre</option>
          <option>Cette année</option>
        </select>
      </div>

      {/* === Graphiques === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Évolution Maintenance Chart */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary" />
              Évolution des Indicateurs de Maintenance
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              Analyse mensuelle (Temps d'arrêt, {isChefEquipe ? '' : 'Coût, '}Interventions)
            </p>
          </div>
          
          {!hasIndustrialData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aucune intervention enregistrée</p>
              <p className="text-[10px] text-slate-400 mt-1">Les indicateurs mensuels s'afficheront automatiquement dès la création d'ordres de travail.</p>
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mainGraphData} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#EF4444" fontSize={10} tickLine={false} label={{ value: 'Arrêt (h)', angle: -90, position: 'insideLeft', offset: 10, fill: '#EF4444', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={10} tickLine={false} label={{ value: 'Coût (TND)', angle: 90, position: 'insideRight', offset: 10, fill: '#F59E0B', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '11px' 
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar yAxisId="left" dataKey="arret" name="Temps d'arrêt (h)" fill="#EF4444" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                  {!isChefEquipe && (
                    <Line yAxisId="right" type="monotone" dataKey="cout" name="Coût (TND)" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                  )}
                  <Line yAxisId="left" type="monotone" dataKey="nbOt" name="Nombre d'OT" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Disponibilité Mensuelle */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-secondary" />
              Taux de Disponibilité Mensuel
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              Suivi de la disponibilité opérationnelle sur la campagne
            </p>
          </div>

          {!hasIndustrialData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aucune donnée de disponibilité</p>
              <p className="text-[10px] text-slate-400 mt-1">Le taux de disponibilité se calculera automatiquement à partir des temps d'arrêt et de fonctionnement des machines.</p>
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mainGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis domain={[80, 100]} stroke="#0EA5E9" fontSize={10} tickLine={false} label={{ value: 'Disponibilité (%)', angle: -90, position: 'insideLeft', offset: 15, fill: '#0EA5E9', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '11px' 
                    }} 
                  />
                  <Bar dataKey="dispo" name="Disponibilité (%)" fill="#0EA5E9" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="dispo" name="Tendance" stroke="#0284C7" strokeWidth={2} dot={{ fill: '#0284C7' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* === Top 10 Équipements Critiques === */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown className="w-4.5 h-4.5 text-rose-500" />
            Top 10 Équipements Critiques (Plus grand nombre de pannes)
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {topEquipmentsData.length === 0 || (topEquipmentsData.length === 1 && topEquipmentsData[0].pannes === 0) ? (
            <div className="py-6 text-center text-xs text-slate-400">
              <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-60" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">Aucune panne critique enregistrée</p>
              <p className="text-[11px] text-slate-400">Le parc machine ne présente aucun arrêt critique pour les filtres sélectionnés.</p>
            </div>
          ) : (
            topEquipmentsData.map((eq, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {idx + 1}. {eq.name}
                </span>
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">
                  {eq.pannes} pannes
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Campaign Comparisons Bad actors card list */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Comparatif d'Historique des Pannes : Campagne Précédente vs En cours
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Suivi de l'évolution du taux de défaillance par équipement
            </p>
          </div>
          {!isChefEquipe && campaignCompareData.length > 0 && (
          <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
            Comparatif actif
          </span>
          )}
        </div>

        {campaignCompareData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-bold text-slate-600 dark:text-slate-400">Aucun historique de pannes comparatif disponible</p>
            <p className="text-[11px] text-slate-400 mt-1">L'historique comparatif se construira automatiquement après la première campagne de production.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {campaignCompareData.map(row => {
              const isReduced = row.pannes26 < row.pannes25;

              return (
                <div 
                  key={row.id}
                  className="bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-custom-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold"
                >
                  <div>
                    <span className="text-[9px] font-bold font-mono text-slate-400 block mb-0.5">{row.id}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.name}</h4>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Pannes compare */}
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block uppercase">Pannes</span>
                      <span className="text-slate-700 dark:text-slate-350">
                        {row.hasPrevCampaign ? (
                          <>
                            {row.pannes25} <span className="text-slate-300 dark:text-slate-700">➔</span> <span className={isReduced ? 'text-emerald-500' : 'text-rose-500 font-bold'}>{row.pannes26}</span>
                          </>
                        ) : (
                          <span className="text-rose-500 font-bold">{row.pannes26} panne(s)</span>
                        )}
                      </span>
                    </div>

                    {/* Budget réel */}
                    {!isChefEquipe && (
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block uppercase">Coût Réel</span>
                      <span className="text-slate-700 dark:text-slate-350 font-mono">
                        {row.cost26.toLocaleString()} TND
                      </span>
                    </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* === Historique: Top Pannes & Top Techniciens === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Pannes */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
            Top Pannes Fréquentes
          </div>
          <div className="flex flex-col gap-2">
            {topPannesData.map((panne, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {idx + 1}. {panne.type}
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                  {panne.count} fois
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Techniciens */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
            Top Techniciens (OT Réalisés)
          </div>
          <div className="flex flex-col gap-2">
            {topTechniciansData.map((tech, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-slate-400 w-4">
                    {idx + 1}.
                  </span>
                  {tech.avatar ? (
                    <img src={tech.avatar} alt={tech.name} className="w-6 h-6 rounded-full object-cover border border-white/60 dark:border-slate-700 shadow-xs" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {tech.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                  {tech.count} OT
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
