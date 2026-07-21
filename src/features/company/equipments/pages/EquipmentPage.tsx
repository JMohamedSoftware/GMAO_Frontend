import React, { useState, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { useEquipements } from '@/shared/hooks/useEquipements';
import { Equipment as EquipmentType } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { Settings2, Plus } from 'lucide-react';
import { GeoTree, GeoNode } from '../components/GeoTree';
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
  const { suppliers, deleteEquipmentsByLocation, deleteEquipmentsByCategory } = useGmao();
  const { equipments, loading, deleteEquipment } = useEquipements();
  const { canDo } = usePermissions();
  
  const [search, setSearch] = useState('');
  
  // Custom added nodes via prompt
  const [customGeoNodes, setCustomGeoNodes] = useState<{id: string, name: string, type: string, parentId?: string}[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [filterCriticality, setFilterCriticality] = useState<string>('Toutes');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');

  // Left Panel (Geo) State
  const [geoExpanded, setGeoExpanded] = useState<Set<string>>(new Set(['USINE DE LINO', 'USINE DE LINO-BATIMENT SUD']));
  const [selectedGeoNode, setSelectedGeoNode] = useState<GeoNode | null>(null);

  // Middle Panel (Eq) State
  const [eqExpanded, setEqExpanded] = useState<Set<string>>(new Set());
  const [selectedEqId, setSelectedEqId] = useState<string | null>(selectedEqFromDash?.id || null);

  // Right Panel (Form) State
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<EquipmentType>>({});
  const [activeTab, setActiveTab] = useState<'info'|'historique'|'preventifs'|'pieces'|'documents'|'ot'>('info');

  // 1. Build Geographical Tree
  const geoTree = useMemo(() => {
    const root: GeoNode[] = [];
    const sites = Array.from(new Set(equipments.map(e => e.site).filter(Boolean))) as string[];
    customGeoNodes.filter(n => n.type === 'site').forEach(n => {
        if (!sites.includes(n.name)) sites.push(n.name);
    });

    sites.forEach(site => {
      const isCustomSite = customGeoNodes.some(n => n.type === 'site' && n.name === site);
      const siteNode: GeoNode = { id: site, name: site, type: 'site', children: [], isCustom: isCustomSite };
      const siteEqs = equipments.filter(e => e.site === site);
      
      const buildings = Array.from(new Set(siteEqs.map(e => e.building).filter(Boolean))) as string[];
      customGeoNodes.filter(n => n.type === 'building' && n.parentId === siteNode.id).forEach(n => {
          if (!buildings.includes(n.name)) buildings.push(n.name);
      });

      buildings.forEach(building => {
        const isCustomBuilding = customGeoNodes.some(n => n.type === 'building' && n.name === building && n.parentId === siteNode.id);
        const buildNode: GeoNode = { id: `${site}-${building}`, name: building, type: 'building', children: [], isCustom: isCustomBuilding, parentId: siteNode.id };
        const buildEqs = siteEqs.filter(e => e.building === building);
        
        const floors = Array.from(new Set(buildEqs.map(e => e.floor).filter(Boolean))) as string[];
        customGeoNodes.filter(n => n.type === 'floor' && n.parentId === buildNode.id).forEach(n => {
            if (!floors.includes(n.name)) floors.push(n.name);
        });

        floors.forEach(floor => {
          const isCustomFloor = customGeoNodes.some(n => n.type === 'floor' && n.name === floor && n.parentId === buildNode.id);
          const floorNode: GeoNode = { id: `${site}-${building}-${floor}`, name: floor, type: 'floor', children: [], isCustom: isCustomFloor, parentId: buildNode.id };
          const floorEqs = buildEqs.filter(e => e.floor === floor);
          
          const rooms = Array.from(new Set(floorEqs.map(e => e.room).filter(Boolean))) as string[];
          customGeoNodes.filter(n => n.type === 'room' && n.parentId === floorNode.id).forEach(n => {
              if (!rooms.includes(n.name)) rooms.push(n.name);
          });

          rooms.forEach(room => {
            const isCustomRoom = customGeoNodes.some(n => n.type === 'room' && n.name === room && n.parentId === floorNode.id);
            const roomNode: GeoNode = { id: `${site}-${building}-${floor}-${room}`, name: room, type: 'room', children: [], isCustom: isCustomRoom, parentId: floorNode.id };
            floorNode.children.push(roomNode);
          });
          buildNode.children.push(floorNode);
        });
        siteNode.children.push(buildNode);
      });
      root.push(siteNode);
    });
    return root;
  }, [equipments, customGeoNodes]);

  // 2. Build Equipment Tree
  const eqTree = useMemo(() => {
    if (!selectedGeoNode) return [];
    
    let filtered = equipments.filter(e => {
      if (selectedGeoNode.type === 'site') return e.site === selectedGeoNode.name;
      if (selectedGeoNode.type === 'building') return e.building === selectedGeoNode.name;
      if (selectedGeoNode.type === 'floor') return e.floor === selectedGeoNode.name;
      if (selectedGeoNode.type === 'room') return e.room === selectedGeoNode.name;
      return false;
    });

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
  }, [selectedGeoNode, equipments, search, filterCriticality, filterStatus, customCategories]);

  // Sync selectedEqFromDash
  React.useEffect(() => {
    if (selectedEqFromDash) {
      setSelectedEqId(selectedEqFromDash.id);
      
      const eq = selectedEqFromDash;
      if (eq.room) {
        setSelectedGeoNode({ id: `${eq.site}-${eq.building}-${eq.floor}-${eq.room}`, name: eq.room, type: 'room', children: [] });
      } else if (eq.site) {
        setSelectedGeoNode({ id: eq.site, name: eq.site, type: 'site', children: [] });
      }
    }
  }, [selectedEqFromDash]);

  const toggleGeoNode = (id: string) => {
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

  const handleAddGeo = () => {
      let node = selectedGeoNode;
      if (!node) {
          const firstSite = geoTree[0];
          if (firstSite) {
              node = firstSite;
          } else {
              const name = window.prompt("Nom du nouveau Site / Usine :");
              if (name && name.trim() !== '') {
                  setCustomGeoNodes(prev => [...prev, {
                      id: `site-${name}`,
                      name: name,
                      type: 'site',
                      isCustom: true
                  }]);
              }
              return;
          }
      }
      
      const typeNames: Record<string, string> = {
          'site': 'Bâtiment',
          'building': 'Étage / Niveau',
          'floor': 'Local / Ligne',
          'room': 'Sous-local'
      };
      const nextType = typeNames[node.type];
      if (nextType) {
          const name = window.prompt(`Nom du nouveau ${nextType} dans ${node.name} :`);
          if (name && name.trim() !== '') {
              let nextTypeKey = 'building';
              if (node.type === 'building') nextTypeKey = 'floor';
              if (node.type === 'floor') nextTypeKey = 'room';
              if (node.type === 'room') nextTypeKey = 'subroom';

              setCustomGeoNodes(prev => [...prev, {
                  id: `${node.id}-${name}`,
                  name: name,
                  type: nextTypeKey,
                  parentId: node.id,
                  isCustom: true
              }]);
              
              setGeoExpanded(prev => new Set(prev).add(node!.id));
          }
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
      site: selectedGeoNode?.type === 'site' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[0] || '',
      building: selectedGeoNode?.type === 'building' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[1] || '',
      floor: selectedGeoNode?.type === 'floor' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[2] || '',
      room: selectedGeoNode?.type === 'room' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[3] || '',
      photos: []
    });
  };

  const handleAddNewFromGeo = (node: GeoNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const typeNames: Record<string, string> = {
        'site': 'Bâtiment',
        'building': 'Étage / Niveau',
        'floor': 'Local / Ligne',
        'room': 'Sous-local'
    };
    const nextType = typeNames[node.type];
    if (nextType) {
        const name = window.prompt(`Nom du nouveau ${nextType} dans ${node.name} :`);
        if (name && name.trim() !== '') {
            let nextTypeKey = 'building';
            if (node.type === 'building') nextTypeKey = 'floor';
            if (node.type === 'floor') nextTypeKey = 'room';
            if (node.type === 'room') nextTypeKey = 'subroom';

            setCustomGeoNodes(prev => [...prev, {
                id: `${node.id}-${name}`,
                name: name,
                type: nextTypeKey,
                parentId: node.id
            }]);
            
            setGeoExpanded(prev => new Set(prev).add(node.id));
        }
    }
  };

  const handleAddNewFromEq = (node: EqNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setSelectedEqId(null);
    
    const newEq: Partial<EquipmentType> = {
      id: `EQ-NEW-${Math.floor(Math.random() * 1000)}`,
      status: 'En service',
      criticality: 'Moyenne',
      photos: [],
    };
    
    if (selectedGeoNode) {
        if (selectedGeoNode.type === 'site') newEq.site = selectedGeoNode.name;
        if (selectedGeoNode.type === 'building') { newEq.site = selectedGeoNode.id.split('-')[0]; newEq.building = selectedGeoNode.name; }
        if (selectedGeoNode.type === 'floor') { newEq.site = selectedGeoNode.id.split('-')[0]; newEq.building = selectedGeoNode.id.split('-')[1]; newEq.floor = selectedGeoNode.name; }
        if (selectedGeoNode.type === 'room') { newEq.site = selectedGeoNode.id.split('-')[0]; newEq.building = selectedGeoNode.id.split('-')[1]; newEq.floor = selectedGeoNode.id.split('-')[2]; newEq.room = selectedGeoNode.name; }
    }

    if (node.type === 'category') {
      newEq.category = node.name;
    } else if (node.type === 'equipment' && node.equipmentRef) {
      newEq.category = node.equipmentRef.category;
      newEq.parentId = node.equipmentRef.id;
    }

    setFormData(newEq);
  };

  const handleDeleteGeoNode = (node: GeoNode, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${node.name} et tout son contenu ?`)) {
          if (node.isCustom) {
              setCustomGeoNodes(prev => prev.filter(n => n.id !== node.id));
          } else {
              const parts = node.id.split('-');
              deleteEquipmentsByLocation(node.type as any, parts[0], parts[1], parts[2], parts[3]);
          }
          if (selectedGeoNode?.id === node.id) setSelectedGeoNode(null);
      }
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
        {canDo('equipment', 'creer') && (
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
          onAddGeo={handleAddGeo}
          onAddNewFromGeo={handleAddNewFromGeo}
          onDeleteGeoNode={handleDeleteGeoNode}
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
