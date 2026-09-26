import React, { useState, useMemo, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';

import { useLocalisations } from '@/shared/hooks/useLocalisations';
import { Equipment as EquipmentType, Localisation } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { Settings2, Plus, Package } from 'lucide-react';
import { GeoTree } from '../components/GeoTree';
import { EquipmentList } from '../components/EquipmentList';
import { EquipmentDetails } from '../components/EquipmentDetails';

interface EquipmentProps {
  selectedEqFromDash: EquipmentType | null;
  onClearSelectedEq: () => void;
  onNavigate: (screen: string) => void;
}

export const Equipment: React.FC<EquipmentProps> = ({ 
  selectedEqFromDash, 
  onNavigate
}) => {
  const { equipments, suppliers, workOrders, incidents, deleteEquipmentsByCategory, deleteEquipment, addEquipment, updateEquipment } = useGmao();
  const { tree: geoTree } = useLocalisations();
  const { can } = usePermissions();
  
  const [search, setSearch] = useState('');
  
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('Toutes');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');

  // Left Panel (Geo) State
  const [geoExpanded, setGeoExpanded] = useState<Set<number>>(new Set());
  const [selectedGeoNode, setSelectedGeoNode] = useState<Localisation | null>(null);

  // Middle Panel (Eq) State
  const [selectedEqId, setSelectedEqId] = useState<string | null>(selectedEqFromDash?.id || null);

  // Right Panel (Form) State
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<EquipmentType>>({});
  const [activeTab, setActiveTab] = useState<'info'|'historique'|'preventifs'|'pieces'|'documents'|'ot'>('info');

  // Helper to get all descendant IDs of a localisation
  const getDescendantLocalisationIds = (locId: number): number[] => {
    const ids = [locId];
    
    // Find node in tree
    const findNode = (nodes: Localisation[]): Localisation | null => {
        for (const n of nodes) {
            if (n.id === locId) return n;
            if (n.sousLocalisations) {
                const found = findNode(n.sousLocalisations);
                if (found) return found;
            }
        }
        return null;
    };

    const node = findNode(geoTree);
    if (!node) return ids;

    const collectDescendants = (n: Localisation) => {
        if (n.sousLocalisations) {
            for (const child of n.sousLocalisations) {
                ids.push(child.id);
                collectDescendants(child);
            }
        }
    };
    collectDescendants(node);

    return ids;
  };

  // 2. Build Filtered Equipment List
  const filteredEquipments = useMemo(() => {
    let filtered = equipments;

    if (selectedGeoNode) {
      const validLocIds = getDescendantLocalisationIds(selectedGeoNode.id);
      filtered = filtered.filter(e => e.localisationId && validLocIds.includes(Number(e.localisationId)));
    }

    if (search) {
      filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (filterCategory !== 'Toutes') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }
    if (filterStatus !== 'Tous') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    return filtered;
  }, [selectedGeoNode, equipments, search, filterCategory, filterStatus, geoTree]);

  // Sync selectedEqFromDash
  useEffect(() => {
    if (selectedEqFromDash) {
      setSelectedEqId(selectedEqFromDash.id);
      
      const eq = selectedEqFromDash;
      if (eq.localisationId) {
        // Find localisation by ID
        const findNode = (nodes: Localisation[]): Localisation | null => {
            for (const n of nodes) {
                if (n.id === eq.localisationId) return n;
                if (n.sousLocalisations) {
                    const found = findNode(n.sousLocalisations);
                    if (found) return found;
                }
            }
            return null;
        };
        const node = findNode(geoTree);
        if (node) {
            setSelectedGeoNode(node);
        }
      }
    }
  }, [selectedEqFromDash, geoTree]);

  const toggleGeoNode = (id: number) => {
    setGeoExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };



  const activeEquipment = equipments.find(e => e.id === selectedEqId);

  const handleSave = async () => {
    try {
      if (isAdding) {
        const addedEq = await addEquipment(formData as any);
        if (addedEq && addedEq.id) {
          setSelectedEqId(addedEq.id);
        }
      } else if (isEditing && selectedEqId) {
        await updateEquipment(selectedEqId, formData);
      }
      setIsAdding(false);
      setIsEditing(false);
    } catch (e: any) {
      console.error(e);
      alert('Erreur lors de l\'enregistrement: ' + (e.message || e.toString()));
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setSelectedEqId(null);
    setFormData({
      id: `EQ-NEW-${Math.floor(Math.random() * 1000)}`,
      name: '',
      category: '',
      status: 'En service',
      criticality: 'Moyenne',
      localisationId: selectedGeoNode ? selectedGeoNode.id : undefined,
      photos: []
    });
  };

  const handleAddNewFromEq = (nodeEq: EquipmentType, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setSelectedEqId(null);
    
    const newEq: Partial<EquipmentType> = {
      id: `EQ-NEW-${Math.floor(Math.random() * 1000)}`,
      status: 'En service',
      criticality: 'Moyenne',
      localisationId: selectedGeoNode ? selectedGeoNode.id : undefined,
      photos: [],
      category: nodeEq.category,
      parentId: nodeEq.id
    };

    setFormData(newEq);
  };

  const handleDeleteEq = (eqId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet équipement et tout son contenu ?`)) {
        deleteEquipment(eqId);
        if (selectedEqId === eqId) setSelectedEqId(null);
      }
  };

  const totalEqs = equipments.length;
  const enService = equipments.filter(e => e.status === 'En service').length;
  const horsService = equipments.filter(e => e.status === 'Hors service' || e.status === 'En panne').length;
  const enMaintenance = equipments.filter(e => e.status === 'En maintenance').length;

  return (
    <div className="h-full flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Settings2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Gestion des Équipements
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Suivi technique, maintenance et performance de vos équipements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {can(PERMISSIONS.EQUIPMENT_CREATE) && (
            <button 
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm hover-lift"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Équipement</span>
            </button>
          )}
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            Importer
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            Exporter
          </button>
          <button className="px-3 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Équipements</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">{totalEqs}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">↑ +12% ce mois</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En Service</p>
            <p className="text-2xl font-black text-emerald-600 leading-none mt-1">{enService}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((enService/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hors Service</p>
            <p className="text-2xl font-black text-rose-600 leading-none mt-1">{horsService}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((horsService/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En Maintenance</p>
            <p className="text-2xl font-black text-purple-600 leading-none mt-1">{enMaintenance}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((enMaintenance/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valeur Estimée</p>
            <p className="text-2xl font-black text-amber-600 leading-none mt-1">{(totalEqs * 15000).toLocaleString('fr-FR')} €</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">Estimative moyenne</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        <GeoTree 
          geoTree={geoTree}
          geoExpanded={geoExpanded}
          selectedGeoNode={selectedGeoNode}
          onToggleNode={toggleGeoNode}
          onSelectNode={setSelectedGeoNode}
        />

        <EquipmentList 
          equipments={filteredEquipments}
          selectedEqId={selectedEqId}
          selectedGeoNode={selectedGeoNode}
          search={search}
          onSearchChange={setSearch}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onSelectEquipment={(eq) => {
            setSelectedEqId(eq.id);
            setIsAdding(false);
            setIsEditing(false);
          }}
        />

        {/* Column 3: Details / Form */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-custom-md border border-slate-200/50 dark:border-slate-800/50 shadow-md overflow-hidden relative">
          <EquipmentDetails 
            activeEquipment={activeEquipment}
            isAdding={isAdding}
            isEditing={isEditing}
            formData={formData}
            activeTab={activeTab}
            suppliers={suppliers}
            workOrders={workOrders}
            incidents={incidents}
            onSetFormData={setFormData}
            onSetActiveTab={setActiveTab}
            onSetIsEditing={setIsEditing}
            onSave={handleSave}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
