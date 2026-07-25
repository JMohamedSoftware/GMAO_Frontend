import React, { useState, useMemo, useEffect } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { useEquipements } from '@/shared/hooks/useEquipements';
import { useLocalisations } from '@/shared/hooks/useLocalisations';
import { Equipment as EquipmentType, Localisation } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { Settings2, Plus } from 'lucide-react';
import { GeoTree } from '../components/GeoTree';
import { EqTree, EqNode } from '../components/EqTree';
import { EquipmentDetails } from '../components/EquipmentDetails';

interface EquipmentProps {
  selectedEqFromDash: EquipmentType | null;
  onClearSelectedEq: () => void;
  onNavigate: (screen: string) => void;
}

export const Equipment: React.FC<EquipmentProps> = ({ 
  selectedEqFromDash, 
}) => {
  const { suppliers, deleteEquipmentsByCategory } = useGmao();
  const { equipments, deleteEquipment } = useEquipements();
  const { tree: geoTree } = useLocalisations();
  const { can } = usePermissions();
  
  const [search, setSearch] = useState('');
  
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [filterCriticality, setFilterCriticality] = useState<string>('Toutes');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');

  // Left Panel (Geo) State
  const [geoExpanded, setGeoExpanded] = useState<Set<number>>(new Set());
  const [selectedGeoNode, setSelectedGeoNode] = useState<Localisation | null>(null);

  // Middle Panel (Eq) State
  const [eqExpanded, setEqExpanded] = useState<Set<string>>(new Set());
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

  // 2. Build Equipment Tree
  const eqTree = useMemo(() => {
    if (!selectedGeoNode) return [];
    
    const validLocIds = getDescendantLocalisationIds(selectedGeoNode.id);

    let filtered = equipments.filter(e => e.localisationId && validLocIds.includes(e.localisationId));

    if (search) {
      filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (filterCriticality !== 'Toutes') {
      filtered = filtered.filter(e => e.criticality === filterCriticality);
    }
    if (filterStatus !== 'Tous') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    const root: EqNode[] = [];
    const categories = Array.from(new Set(filtered.map(e => e.category).filter(Boolean)));
    
    customCategories.forEach(c => {
        if (!categories.includes(c)) categories.push(c);
    });

    categories.forEach(category => {
      const isCustomCat = customCategories.includes(category);
      const catNode: EqNode = { id: `cat-${category}`, name: category, type: 'category', children: [], isCustom: isCustomCat };
      
      const topEqs = filtered.filter(e => e.category === category && !e.parentId);
      
      const buildEqHierarchy = (eq: EquipmentType): EqNode => {
        const node: EqNode = { id: eq.id, name: eq.name, type: 'equipment', children: [], equipmentRef: eq };
        const children = equipments.filter(e => e.parentId === eq.id);
        children.forEach(child => {
          node.children.push(buildEqHierarchy(child));
        });
        return node;
      };

      topEqs.forEach(eq => {
        catNode.children.push(buildEqHierarchy(eq));
      });

      root.push(catNode);
    });

    if (categories.length > 0) {
      setEqExpanded(prev => {
        const newSet = new Set(prev);
        categories.forEach(c => newSet.add(`cat-${c}`));
        return newSet;
      });
    }

    return root;
  }, [selectedGeoNode, equipments, search, filterCriticality, filterStatus, customCategories, geoTree]);

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

  const toggleEqNode = (id: string) => {
    setEqExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const activeEquipment = equipments.find(e => e.id === selectedEqId);

  const handleSave = () => {
    setIsAdding(false);
    setIsEditing(false);
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

  const handleAddNewFromEq = (node: EqNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setSelectedEqId(null);
    
    const newEq: Partial<EquipmentType> = {
      id: `EQ-NEW-${Math.floor(Math.random() * 1000)}`,
      status: 'En service',
      criticality: 'Moyenne',
      localisationId: selectedGeoNode ? selectedGeoNode.id : undefined,
      photos: [],
    };

    if (node.type === 'category') {
      newEq.category = node.name;
    } else if (node.type === 'equipment' && node.equipmentRef) {
      newEq.category = node.equipmentRef.category;
      newEq.parentId = node.equipmentRef.id;
    }

    setFormData(newEq);
  };

  const handleDeleteEqNode = (node: EqNode, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${node.name} et tout son contenu ?`)) {
          if (node.type === 'category') {
              if (node.isCustom) {
                  setCustomCategories(prev => prev.filter(c => c !== node.name));
              } else {
                  deleteEquipmentsByCategory(node.name);
              }
          } else if (node.type === 'equipment' && node.equipmentRef) {
              deleteEquipment(node.equipmentRef.id);
              if (selectedEqId === node.equipmentRef.id) setSelectedEqId(null);
          }
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Gestion des Équipements
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Vue géographique et technique
            </p>
          </div>
        </div>
        {can(PERMISSIONS.EQUIPMENT_CREATE) && (
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau</span>
        </button>
        )}
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        <GeoTree 
          geoTree={geoTree}
          geoExpanded={geoExpanded}
          selectedGeoNode={selectedGeoNode}
          onToggleNode={toggleGeoNode}
          onSelectNode={setSelectedGeoNode}
        />

        <EqTree 
          eqTree={eqTree}
          eqExpanded={eqExpanded}
          selectedEqId={selectedEqId}
          selectedGeoNode={selectedGeoNode}
          search={search}
          onSearchChange={setSearch}
          filterCriticality={filterCriticality}
          onFilterCriticalityChange={setFilterCriticality}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onToggleNode={toggleEqNode}
          onSelectEquipment={(eq) => {
            setSelectedEqId(eq.id);
            setIsAdding(false);
            setIsEditing(false);
          }}
          onAddNewFromEq={handleAddNewFromEq}
          onDeleteEqNode={handleDeleteEqNode}
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
            onSetFormData={setFormData}
            onSetActiveTab={setActiveTab}
            onSetIsEditing={setIsEditing}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};
