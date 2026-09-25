import React from 'react';
import { Settings2, Wrench, Save, Edit, Plus, Info, History, Calendar, Link, FileText, ClipboardList } from 'lucide-react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { useNavigate } from 'react-router-dom';
import { Equipment as EquipmentType, Localisation, WorkOrder, Incident } from '@/shared/types/gmao';
import { useLocalisations } from '@/shared/hooks/useLocalisations';
import { useGmao } from '@/shared/hooks/useGmao';
import { linkPieceToEquipmentApi, unlinkPieceFromEquipmentApi } from '@/shared/api/dataFetch.api';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';
import { useAppDispatch } from '@/app/hooks';

interface EquipmentDetailsProps {
  activeEquipment: EquipmentType | undefined;
  isAdding: boolean;
  isEditing: boolean;
  formData: Partial<EquipmentType>;
  activeTab: 'info' | 'historique' | 'preventifs' | 'pieces' | 'documents' | 'ot';
  suppliers: any[];
  workOrders?: WorkOrder[];
  incidents?: Incident[];
  onSetFormData: (data: Partial<EquipmentType>) => void;
  onSetActiveTab: (tab: 'info' | 'historique' | 'preventifs' | 'pieces' | 'documents' | 'ot') => void;
  onSetIsEditing: (isEditing: boolean) => void;
  onSave: () => void;
}

export const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({
  activeEquipment,
  isAdding,
  isEditing,
  formData,
  activeTab,
  suppliers,
  workOrders = [],
  incidents = [],
  onSetFormData,
  onSetActiveTab,
  onSetIsEditing,
  onSave
}) => {
  const { can } = usePermissions();
  const navigate = useNavigate();

  // Handle Create OT
  const handleCreateOT = () => {
    if (activeEquipment) {
      navigate('/company/work-orders', { state: { newWorkOrder: true, equipmentId: activeEquipment.id } });
    } else {
      navigate('/company/work-orders', { state: { newWorkOrder: true } });
    }
  };

  const handlePlanMaintenance = () => {
    onSetActiveTab('preventifs');
  };
  const { tree } = useLocalisations();
  const { equipments, parts } = useGmao();
  const dispatch = useAppDispatch();
  const [selectedPieceId, setSelectedPieceId] = React.useState<string>('');
  const [isLinking, setIsLinking] = React.useState(false);

  const handleLinkPiece = async () => {
    if (!activeEquipment?.id || !selectedPieceId) return;
    setIsLinking(true);
    try {
      await linkPieceToEquipmentApi(activeEquipment.id, selectedPieceId);
      await dispatch(fetchTenantDataAsync()); // Refresh data to get updated spareParts
      setSelectedPieceId('');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'association de la pièce");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkPiece = async (pieceId: string) => {
    if (!activeEquipment?.id) return;
    if (!confirm('Êtes-vous sûr de vouloir retirer cette pièce de cet équipement ?')) return;
    try {
      await unlinkPieceFromEquipmentApi(activeEquipment.id, pieceId);
      await dispatch(fetchTenantDataAsync()); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Erreur lors du détachement de la pièce");
    }
  };

  const flattenTree = (nodes: Localisation[], depth = 0): { id: number; nom: string; depth: number }[] => {
    let result: { id: number; nom: string; depth: number }[] = [];
    nodes.forEach(node => {
      result.push({ id: node.id, nom: node.nom, depth });
      if (node.sousLocalisations) {
        result = result.concat(flattenTree(node.sousLocalisations, depth + 1));
      }
    });
    return result;
  };

  const flatLocalisations = flattenTree(tree);

  const predefinedCategories = ['Chaudières', 'Pompes', 'Compresseurs', 'Moteurs', 'Vannes', 'Groupes Électrogènes', 'Transformateurs'];
  const uniqueCategories = Array.from(new Set([...equipments.map(e => e.category).filter(Boolean), ...predefinedCategories]));
  const uniqueSubFamilies = Array.from(new Set(equipments.map(e => e.subFamily).filter(Boolean)));
  const uniqueBrands = Array.from(new Set(equipments.map(e => e.brand).filter(Boolean)));
  const uniqueModels = Array.from(new Set(equipments.map(e => e.model).filter(Boolean)));

  const equipmentWorkOrders = workOrders.filter(wo => wo.equipmentId === activeEquipment?.id);
  const activeWorkOrders = equipmentWorkOrders.filter(wo => wo.status !== 'Clôturé' && wo.status !== 'Terminé');
  const historyWorkOrders = equipmentWorkOrders.filter(wo => wo.status === 'Clôturé' || wo.status === 'Terminé');

  if (!activeEquipment && !isAdding) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
        <Settings2 className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-bold text-sm">Sélectionnez un équipement dans l'arborescence centrale</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          {isAdding ? 'Nouvel Équipement' : 'Fiche Technique'}
        </h2>
        <div className="flex items-center gap-2">
          {(!isAdding && !isEditing) && (
            <>
              <button onClick={handleCreateOT} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors">
                <Wrench className="w-3.5 h-3.5" /> Créer un OT
              </button>
              <button onClick={handlePlanMaintenance} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-emerald-600 transition-colors">
                <Calendar className="w-3.5 h-3.5" /> Planifier maintenance
              </button>
              <button onClick={() => onSetActiveTab('historique')} className="px-4 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <History className="w-3.5 h-3.5" /> Consulter historique
              </button>
              <button className="px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="leading-none -mt-1 font-bold text-lg">...</span>
              </button>
            </>
          )}

          {(isEditing || isAdding) ? (
            <button onClick={onSave} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-primary/90 shadow-sm transition-colors">
              <Save className="w-3.5 h-3.5" /> Enregistrer
            </button>
          ) : (
            can(PERMISSIONS.EQUIPMENT_UPDATE) && (
            <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-primary/90 shadow-sm transition-colors">
              <Edit className="w-3.5 h-3.5" /> Modifier
            </button>
            )
          )}
        </div>
      </div>

      {/* Form / Details Content */}
      <div className="p-5 flex flex-col gap-6">
        
        {/* Photo & Main Identity */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Image */}
          <div className="w-full xl:w-64 shrink-0">
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
              {(isEditing || isAdding) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1.5 bg-white text-slate-800 rounded text-xs font-bold">Changer l'image</button>
                </div>
              ) : null}
              {((isEditing ? formData.photos : activeEquipment?.photos) || [])[0] ? (
                <img src={((isEditing || isAdding) ? formData.photos : activeEquipment?.photos)?.[0]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Plus className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* En-tête (Identity) */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">En-tête</h3>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Réf. équipement (Code)</label>
              <input type="text" readOnly={!isAdding} value={(isEditing || isAdding) ? formData.id : activeEquipment?.id} onChange={e => onSetFormData({...formData, id: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent font-bold'} outline-none`} />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Désignation (Nom) <span className="text-rose-500">*</span></label>
              <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.name : activeEquipment?.name} onChange={e => onSetFormData({...formData, name: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent font-bold text-primary'} outline-none`} placeholder="Ex: Pompe P-102" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Famille <span className="text-rose-500">*</span></label>
              <input type="text" list="category-list" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.category : activeEquipment?.category} onChange={e => onSetFormData({...formData, category: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent'} outline-none`} placeholder="Ex: Pompes" />
              <datalist id="category-list">
                {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Sous-famille</label>
              <input type="text" list="subfamily-list" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.subFamily : activeEquipment?.subFamily || ''} onChange={e => onSetFormData({...formData, subFamily: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent'} outline-none`} placeholder="Ex: Centrifuges" />
              <datalist id="subfamily-list">
                {uniqueSubFamilies.map(sub => <option key={sub} value={sub} />)}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">État équipement</label>
              <select disabled={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.status : activeEquipment?.status} onChange={e => onSetFormData({...formData, status: e.target.value as any})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent font-bold'} ${activeEquipment?.status === 'En panne' ? 'text-rose-500' : 'text-emerald-500'} outline-none appearance-none`}>
                <option value="En service">En service</option>
                <option value="En maintenance">En maintenance</option>
                <option value="En panne">En panne</option>
                <option value="Hors service">Hors service</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Criticité</label>
              <select disabled={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.criticality : activeEquipment?.criticality} onChange={e => onSetFormData({...formData, criticality: e.target.value as any})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent'} outline-none appearance-none`}>
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
                <option value="Critique">Critique</option>
              </select>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
              Localisation Géographique (Requise)
            </h3>
          </div>
          <div className="col-span-4 md:col-span-2">
            <label className="text-[10px] text-slate-500 font-bold block mb-1">Localisation <span className="text-rose-500">*</span></label>
            <select 
              disabled={!isEditing && !isAdding} 
              value={(isEditing || isAdding) ? formData.localisationId || '' : activeEquipment?.localisationId || ''} 
              onChange={e => onSetFormData({...formData, localisationId: e.target.value ? Number(e.target.value) : undefined})} 
              className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`}
            >
              <option value="">-- Sélectionnez une localisation --</option>
              {flatLocalisations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {'\u00A0'.repeat(loc.depth * 4)}{loc.depth > 0 ? '└ ' : ''}{loc.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs for details */}
        <div className="mt-4">
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto custom-scrollbar pb-1">
            <button onClick={() => onSetActiveTab('info')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <Info className="w-4 h-4" /> Informations
            </button>
            <button onClick={() => onSetActiveTab('historique')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <History className="w-4 h-4" /> Historique
            </button>
            <button onClick={() => onSetActiveTab('preventifs')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'preventifs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <Calendar className="w-4 h-4" /> Préventifs
            </button>
            <button onClick={() => onSetActiveTab('pieces')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pieces' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <Link className="w-4 h-4" /> Pièces
            </button>
            <button onClick={() => onSetActiveTab('documents')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <FileText className="w-4 h-4" /> Documents
            </button>
            <button onClick={() => onSetActiveTab('ot')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'ot' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <ClipboardList className="w-4 h-4" /> OT
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'info' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Marque</label>
                  <input type="text" list="brand-list" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.brand : activeEquipment?.brand} onChange={e => onSetFormData({...formData, brand: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                  <datalist id="brand-list">
                    {uniqueBrands.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Modèle</label>
                  <input type="text" list="model-list" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.model : activeEquipment?.model} onChange={e => onSetFormData({...formData, model: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                  <datalist id="model-list">
                    {uniqueModels.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">N° Série</label>
                  <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.serialNumber : activeEquipment?.serialNumber} onChange={e => onSetFormData({...formData, serialNumber: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Date de mise en service</label>
                  <input type="date" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.commissionDate : activeEquipment?.commissionDate || ''} onChange={e => onSetFormData({...formData, commissionDate: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Garantie</label>
                  <input type="date" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.endOfWarranty : activeEquipment?.endOfWarranty || ''} onChange={e => onSetFormData({...formData, endOfWarranty: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Fournisseur / Mainteneur</label>
                  {(isEditing || isAdding) ? (
                    <select value={formData.supplierId || ''} onChange={e => onSetFormData({...formData, supplierId: e.target.value})} className="w-full text-xs p-1.5 rounded border bg-white dark:bg-slate-800 border-slate-300 outline-none">
                      <option value="">Sélectionner...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" readOnly value={suppliers.find(s => s.id === activeEquipment?.supplierId)?.name || ''} className="w-full text-xs p-1.5 rounded border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 outline-none" />
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Inventaire</label>
                  <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.inventory : activeEquipment?.inventory || ''} onChange={e => onSetFormData({...formData, inventory: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Responsabilité</label>
                  <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.responsibility : activeEquipment?.responsibility || ''} onChange={e => onSetFormData({...formData, responsibility: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Code barre</label>
                  <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.barcode : activeEquipment?.barcode || ''} onChange={e => onSetFormData({...formData, barcode: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none font-mono tracking-tight`} />
                </div>
                <div className="col-span-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mt-2 cursor-pointer w-fit">
                    <input type="checkbox" disabled={!isEditing && !isAdding} checked={!!((isEditing || isAdding) ? formData.gipPresence : activeEquipment?.gipPresence)} onChange={e => onSetFormData({...formData, gipPresence: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4" />
                    Présence GIP
                  </label>
                </div>
              </div>
            )}
            
            {activeTab === 'historique' && (
              <div className="flex flex-col gap-3">
                {historyWorkOrders.length > 0 ? (
                  historyWorkOrders.map(wo => (
                    <div key={wo.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 dark:text-white">{wo.title}</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold">{wo.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{wo.description}</p>
                      <div className="flex gap-4 text-xs text-slate-400 font-bold">
                        <span>Date: {new Date(wo.createdDate).toLocaleDateString()}</span>
                        <span>Type: {wo.type}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 opacity-50">
                    <History className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-600">Aucun historique d'intervention</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preventifs' && (
              <div className="flex flex-col items-center justify-center p-8 opacity-50">
                <Calendar className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-bold text-slate-600">Aucun plan préventif associé</p>
              </div>
            )}

            {activeTab === 'pieces' && (
              <div className="flex flex-col gap-4">
                {/* Formulaire d'association */}
                {!isAdding && can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                  <div className="flex gap-2 items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Associer une pièce du catalogue</label>
                      <select 
                        value={selectedPieceId} 
                        onChange={e => setSelectedPieceId(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 outline-none"
                      >
                        <option value="">-- Sélectionnez une pièce --</option>
                        {parts.map(p => (
                          <option key={p.ref} value={p.ref} disabled={activeEquipment?.spareParts?.includes(p.ref)}>
                            {p.ref} - {p.name} {activeEquipment?.spareParts?.includes(p.ref) ? '(Déjà associée)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handleLinkPiece}
                      disabled={!selectedPieceId || isLinking}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow disabled:opacity-50 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {isLinking ? 'Association...' : 'Associer'}
                    </button>
                  </div>
                )}

                {/* Liste des pièces associées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {activeEquipment?.spareParts && activeEquipment.spareParts.length > 0 ? (
                    activeEquipment.spareParts.map(pieceId => {
                      const pieceDetails = parts.find(p => p.ref === pieceId);
                      return (
                        <div key={pieceId} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                              <Link className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{pieceDetails ? pieceDetails.name : `Pièce inconnue (ID: ${pieceId})`}</p>
                              <p className="text-[10px] text-slate-500">Réf: {pieceId}</p>
                            </div>
                          </div>
                          {!isAdding && can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                            <button 
                              onClick={() => handleUnlinkPiece(pieceId)}
                              className="text-xs text-rose-500 hover:text-rose-600 font-bold px-2 py-1 bg-rose-50 dark:bg-rose-500/10 rounded"
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-8 opacity-50">
                      <Link className="w-12 h-12 text-slate-400 mb-3" />
                      <p className="text-sm font-bold text-slate-600">Aucune pièce de rechange associée</p>
                      <p className="text-xs text-slate-500 mt-1">Sélectionnez une pièce ci-dessus pour l'associer.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="flex flex-col items-center justify-center p-8 opacity-50">
                <FileText className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-bold text-slate-600">Aucun document technique</p>
                <p className="text-xs text-slate-500 mt-1">Notice constructeur, schémas électriques, plans...</p>
              </div>
            )}

            {activeTab === 'ot' && (
              <div className="flex flex-col gap-3">
                {activeWorkOrders.length > 0 ? (
                  activeWorkOrders.map(wo => (
                    <div key={wo.id} className="p-3 bg-white dark:bg-slate-800 border-l-4 border-l-primary border border-slate-200 dark:border-slate-700 rounded shadow-sm text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 dark:text-white">{wo.title}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{wo.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{wo.description}</p>
                      <div className="flex gap-4 text-xs text-slate-400 font-bold">
                        <span>Date: {new Date(wo.createdDate).toLocaleDateString()}</span>
                        <span>Priorité: {wo.priority}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 opacity-50">
                    <ClipboardList className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-600">Aucun Ordre de Travail en cours</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
