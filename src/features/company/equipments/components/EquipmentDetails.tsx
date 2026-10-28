import React from 'react';
import { Settings2, Wrench, Save, Edit, Plus, Info, History, Calendar, Link as LinkIcon, FileText, ClipboardList, ShieldCheck, Building2, Tag, Layers, MapPin, AlertTriangle, Upload, Download, Trash2, Eye, Loader2, X } from 'lucide-react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { Equipment as EquipmentType, Localisation, WorkOrder, Incident } from '@/shared/types/gmao';
import { useLocalisations } from '@/shared/hooks/useLocalisations';
import { useGmao } from '@/shared/hooks/useGmao';
import { linkPieceToEquipmentApi, unlinkPieceFromEquipmentApi, uploadDocumentApi, deleteDocumentApi } from '@/shared/api/dataFetch.api';
import { fetchTenantDataAsync } from '@/app/gmaoSlice';
import { useAppDispatch } from '@/app/hooks';
import { usePreventive } from '@/features/company/preventive/hooks/usePreventive';

interface EquipmentDetailsProps {
  activeEquipment: EquipmentType | undefined;
  isAdding: boolean;
  isEditing: boolean;
  formData: Partial<EquipmentType>;
  activeTab: 'informations' | 'historique' | 'preventifs' | 'pieces' | 'documents' | 'ot';
  suppliers: any[];
  workOrders?: WorkOrder[];
  incidents?: Incident[];
  onSetFormData: (data: Partial<EquipmentType>) => void;
  onSetActiveTab: (tab: 'informations' | 'historique' | 'preventifs' | 'pieces' | 'documents' | 'ot') => void;
  onSetIsEditing: (isEditing: boolean) => void;
  onSave: () => void;
  onNavigate: (screen: string) => void;
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
  onSave,
  onNavigate
}) => {
  const { can } = usePermissions();

  // Handle Create OT
  const handleCreateOT = () => {
    if (activeEquipment) {
      onNavigate(`workorder-new:${activeEquipment.id}`);
    } else {
      onNavigate('workorders');
    }
  };

  const handlePlanMaintenance = () => {
    onSetActiveTab('preventifs');
  };
  const { tree } = useLocalisations();
  const { equipments, parts, technicians } = useGmao();
  const dispatch = useAppDispatch();
  const [selectedPieceId, setSelectedPieceId] = React.useState<string>('');
  const [isLinking, setIsLinking] = React.useState(false);

  // DOCUMENTS STATE & HANDLERS
  const [isUploadingDoc, setIsUploadingDoc] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [docType, setDocType] = React.useState<string>('notice');
  const [docName, setDocName] = React.useState<string>('');
  const [isSubmittingDoc, setIsSubmittingDoc] = React.useState(false);
  const [deletingDocId, setDeletingDocId] = React.useState<number | null>(null);
  const [docError, setDocError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
      setDocError(null);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEquipment?.id) {
      setDocError("Veuillez d'abord enregistrer l'équipement.");
      return;
    }
    if (!uploadFile) {
      setDocError("Veuillez sélectionner un fichier.");
      return;
    }

    setIsSubmittingDoc(true);
    setDocError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', docType);
      formData.append('nom', docName || uploadFile.name);
      formData.append('equipementId', activeEquipment.id);

      await uploadDocumentApi(formData);
      await dispatch(fetchTenantDataAsync());
      setIsUploadingDoc(false);
      setUploadFile(null);
      setDocName('');
      setDocType('notice');
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setDocError(err.response?.data?.message || err.response?.data || "Erreur lors de l'envoi du document.");
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId?: number) => {
    if (!docId) return;
    if (!window.confirm("Voulez-vous vraiment supprimer ce document ?")) return;
    setDeletingDocId(docId);
    try {
      await deleteDocumentApi(docId);
      await dispatch(fetchTenantDataAsync());
    } catch (err: any) {
      console.error('Error deleting document:', err);
      alert("Erreur lors de la suppression du document.");
    } finally {
      setDeletingDocId(null);
    }
  };

  const getDocBadge = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('notice') || t.includes('manuel')) {
      return { label: 'Notice / Manuel', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' };
    }
    if (t.includes('schema') || t.includes('electrical') || t.includes('électrique')) {
      return { label: 'Schéma électrique', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' };
    }
    if (t.includes('plan') || t.includes('mechanical') || t.includes('mécanique')) {
      return { label: 'Plan mécanique', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' };
    }
    if (t.includes('photo') || t.includes('image')) {
      return { label: 'Photo / Visuel', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' };
    }
    if (t.includes('rapport')) {
      return { label: 'Rapport technique', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' };
    }
    if (t.includes('certificat')) {
      return { label: 'Certificat', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' };
    }
    return { label: 'Document technique', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  };

  // PREVENTIVE PLANS (Real backend integration)
  const { plans, loadPlans } = usePreventive();

  React.useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const activeEquipmentPlans = React.useMemo(() => {
    if (!activeEquipment?.id) return [];
    return plans.filter(p => p.equipementId?.toString() === activeEquipment.id.toString());
  }, [plans, activeEquipment?.id]);

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
  const historyWorkOrders = equipmentWorkOrders.filter(wo => wo.status === 'Clôturé' || wo.status === 'Terminé').sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

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
      {/* Toolbar (Only for editing/adding mode) */}
      {(isEditing || isAdding) && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            {isAdding ? 'Nouvel Équipement' : 'Modifier Fiche Technique'}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 shadow-sm transition-colors h-11">
              <Save className="w-3.5 h-3.5" /> Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Form / Details Content */}
      <div className="p-5 flex flex-col gap-6">
        

        {(!isEditing && !isAdding) && (
          <div className="flex flex-col gap-6">
            <div className="flex gap-6 mb-2">
              {/* Left: Images */}
              <div className="w-[230px] shrink-0 flex flex-col gap-2">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                  {activeEquipment?.photos?.[0] ? (
                    <img src={activeEquipment.photos[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Plus className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {activeEquipment?.photos?.slice(1).map((photo, i) => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                      <img src={photo} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="aspect-square bg-blue-50 border border-blue-200 border-dashed rounded-lg flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100 transition-colors">
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">Ajouter</span>
                  </div>
                </div>
              </div>
              
              {/* Right: Info */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{activeEquipment?.code ? `Code : ${activeEquipment.code}` : ''}</span>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mt-1">{activeEquipment?.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">

                    {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                      <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-700 h-10">
                        <Edit className="w-3.5 h-3.5" /> Modifier
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${
                    activeEquipment?.status === 'En service'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : activeEquipment?.status === 'En maintenance'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse'
                  }`}>
                    {activeEquipment?.status === 'En service' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : activeEquipment?.status === 'En maintenance' ? (
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {activeEquipment?.status || 'En service'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-y-6 gap-x-4 mt-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Settings2 className="w-3.5 h-3.5" /> Famille</label>
                    <div className="text-[15px] font-bold text-slate-900">{activeEquipment?.category || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Layers className="w-3.5 h-3.5" /> Sous-famille</label>
                    <div className="text-[15px] font-bold text-slate-900">{activeEquipment?.subFamily || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Tag className="w-3.5 h-3.5" /> Marque</label>
                    <div className="text-[15px] font-bold text-slate-900">{activeEquipment?.brand || '-'}</div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Modèle</label>
                    <div className="text-[15px] font-bold text-slate-900">{activeEquipment?.model || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">N° Série</label>
                    <div className="text-[15px] font-bold text-slate-900">{activeEquipment?.serialNumber || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Année</label>
                    <div className="text-[15px] font-bold text-slate-900">{activeEquipment?.commissionDate ? new Date(activeEquipment.commissionDate).getFullYear() : '-'}</div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5" /> Emplacement</label>
                    <div className="text-[15px] font-bold text-slate-900 truncate pr-2">{flatLocalisations.find(l => l.id === activeEquipment?.localisationId)?.nom || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Building2 className="w-3.5 h-3.5" /> Localisation</label>
                    <div className="text-[15px] font-bold text-slate-900 truncate pr-2">
                      {(() => {
                        const loc = flatLocalisations.find(l => l.id === activeEquipment?.localisationId);
                        return loc ? loc.nom : '-';
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Criticité</label>
                    <div className={`text-[15px] font-bold ${activeEquipment?.criticality === 'Critique' ? 'text-rose-600' : 'text-slate-900'}`}>{activeEquipment?.criticality || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(isEditing || isAdding) && (
          <div className="flex gap-5">
            {/* LEFT: Identité + Localisation */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Card: Informations générales */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Settings2 className="w-4 h-4 text-primary" /> Informations générales
                </h3>
                <div className="grid grid-cols-[140px_1fr] gap-y-4 text-[13px]">
                  <label className="text-slate-500 font-medium self-center">Code équipement</label>
                  <input type="text" readOnly={!isAdding} value={(isEditing || isAdding) ? formData.id || '' : activeEquipment?.id || ''} onChange={e => onSetFormData({...formData, id: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />

                  <label className="text-slate-500 font-medium self-center">Désignation <span className="text-rose-500">*</span></label>
                  <input type="text" value={(isEditing || isAdding) ? formData.name || '' : activeEquipment?.name || ''} onChange={e => onSetFormData({...formData, name: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" placeholder="Ex: Pompe P-102" />

                  <label className="text-slate-500 font-medium self-center">Famille <span className="text-rose-500">*</span></label>
                  <input type="text" list="category-list" value={(isEditing || isAdding) ? formData.category || '' : activeEquipment?.category || ''} onChange={e => onSetFormData({...formData, category: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" placeholder="Ex: Pompes" />
                  <datalist id="category-list">{uniqueCategories.map(cat => <option key={cat} value={cat} />)}</datalist>

                  <label className="text-slate-500 font-medium self-center">Sous-famille</label>
                  <input type="text" list="subfamily-list" value={(isEditing || isAdding) ? formData.subFamily || '' : activeEquipment?.subFamily || ''} onChange={e => onSetFormData({...formData, subFamily: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" placeholder="Ex: Centrifuges" />
                  <datalist id="subfamily-list">{uniqueSubFamilies.map(sub => <option key={sub} value={sub} />)}</datalist>

                  <label className="text-slate-500 font-medium self-start mt-1.5">Description</label>
                  <textarea value={(isEditing || isAdding) ? (formData as any).description || '' : (activeEquipment as any)?.description || ''} onChange={e => onSetFormData({...formData, description: e.target.value} as any)} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800 resize-none h-20" placeholder="Description de l'équipement..." />

                  <label className="text-slate-500 font-medium self-center">Statut</label>
                  <select value={(isEditing || isAdding) ? formData.status || '' : activeEquipment?.status || ''} onChange={e => onSetFormData({...formData, status: e.target.value as any})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800 appearance-none">
                    <option value="En service">En service</option>
                    <option value="En maintenance">En maintenance</option>
                    <option value="En panne">En panne</option>
                    <option value="Hors service">Hors service</option>
                  </select>

                  <label className="text-slate-500 font-medium self-center">Criticité</label>
                  <select value={(isEditing || isAdding) ? formData.criticality || '' : activeEquipment?.criticality || ''} onChange={e => onSetFormData({...formData, criticality: e.target.value as any})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800 appearance-none">
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
              </div>

              {/* Card: Localisation */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Building2 className="w-4 h-4 text-primary" /> Localisation
                </h3>
                <div className="grid grid-cols-[140px_1fr] gap-y-4 text-[13px]">
                  <label className="text-slate-500 font-medium self-center">Emplacement <span className="text-rose-500">*</span></label>
                  <select value={(isEditing || isAdding) ? formData.localisationId || '' : activeEquipment?.localisationId || ''} onChange={e => onSetFormData({...formData, localisationId: e.target.value ? Number(e.target.value) : undefined})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800 appearance-none">
                    <option value="">-- Sélectionnez --</option>
                    {flatLocalisations.map(loc => (
                      <option key={loc.id} value={loc.id}>{'\u00A0'.repeat(loc.depth * 3)}{loc.depth > 0 ? '└ ' : ''}{loc.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT: Détails techniques + Photo */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Card: Photo */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Tag className="w-4 h-4 text-primary" /> Photo équipement
                </h3>
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group cursor-pointer">
                  {((isEditing || isAdding) ? formData.photos : activeEquipment?.photos)?.[0] ? (
                    <img src={((isEditing || isAdding) ? formData.photos : activeEquipment?.photos)?.[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Plus className="w-8 h-8" />
                      <span className="text-xs font-bold">Ajouter une photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold shadow">Changer l'image</button>
                  </div>
                </div>
              </div>

              {/* Card: Détails techniques */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <ClipboardList className="w-4 h-4 text-primary" /> Détails techniques
                </h3>
                <div className="grid grid-cols-[140px_1fr] gap-y-4 text-[13px]">
                  <label className="text-slate-500 font-medium self-center">Marque</label>
                  <input type="text" list="brand-list" value={(isEditing || isAdding) ? formData.brand || '' : activeEquipment?.brand || ''} onChange={e => onSetFormData({...formData, brand: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />
                  <datalist id="brand-list">{uniqueBrands.map(b => <option key={b} value={b} />)}</datalist>

                  <label className="text-slate-500 font-medium self-center">Modèle</label>
                  <input type="text" list="model-list" value={(isEditing || isAdding) ? formData.model || '' : activeEquipment?.model || ''} onChange={e => onSetFormData({...formData, model: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />
                  <datalist id="model-list">{uniqueModels.map(m => <option key={m} value={m} />)}</datalist>

                  <label className="text-slate-500 font-medium self-center">N° Série</label>
                  <input type="text" value={(isEditing || isAdding) ? formData.serialNumber || '' : activeEquipment?.serialNumber || ''} onChange={e => onSetFormData({...formData, serialNumber: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />

                  <label className="text-slate-500 font-medium self-center">Mise en service</label>
                  <input type="date" value={(isEditing || isAdding) ? formData.commissionDate || '' : activeEquipment?.commissionDate || ''} onChange={e => onSetFormData({...formData, commissionDate: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />

                  <label className="text-slate-500 font-medium self-center">Garantie</label>
                  <input type="date" value={(isEditing || isAdding) ? formData.endOfWarranty || '' : activeEquipment?.endOfWarranty || ''} onChange={e => onSetFormData({...formData, endOfWarranty: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />

                  <label className="text-slate-500 font-medium self-center">Fournisseur</label>
                  <select value={(isEditing || isAdding) ? formData.supplierId || '' : activeEquipment?.supplierId || ''} onChange={e => onSetFormData({...formData, supplierId: e.target.value})} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800 appearance-none">
                    <option value="">Sélectionner...</option>
                    {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>

                  <label className="text-slate-500 font-medium self-center">Inventaire</label>
                  <input type="text" value={(isEditing || isAdding) ? (formData as any).inventory || '' : (activeEquipment as any)?.inventory || ''} onChange={e => onSetFormData({...formData, inventory: e.target.value} as any)} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />

                  <label className="text-slate-500 font-medium self-center">Responsabilité</label>
                  <input type="text" value={(isEditing || isAdding) ? (formData as any).responsibility || '' : (activeEquipment as any)?.responsibility || ''} onChange={e => onSetFormData({...formData, responsibility: e.target.value} as any)} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800" />

                  <label className="text-slate-500 font-medium self-center">Code barre</label>
                  <input type="text" value={(isEditing || isAdding) ? (formData as any).barcode || '' : (activeEquipment as any)?.barcode || ''} onChange={e => onSetFormData({...formData, barcode: e.target.value} as any)} className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-800 font-mono tracking-tight" />

                  <div className="col-span-2 mt-2">
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer w-fit">
                      <input type="checkbox" checked={!!((isEditing || isAdding) ? (formData as any).gipPresence : (activeEquipment as any)?.gipPresence)} onChange={e => onSetFormData({...formData, gipPresence: e.target.checked} as any)} className="rounded text-primary focus:ring-primary w-4 h-4 border-slate-300" />
                      Présence GIP
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs for details */}
        <div className="mt-4">
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto custom-scrollbar pb-1">

            <button onClick={() => onSetActiveTab('informations')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'informations' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <ClipboardList className="w-4 h-4" /> Informations
            </button>
            <button onClick={() => onSetActiveTab('historique')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <History className="w-4 h-4" /> Historique
            </button>
            <button onClick={() => onSetActiveTab('preventifs')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'preventifs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <Calendar className="w-4 h-4" /> Préventifs{activeEquipmentPlans.length ? ` (${activeEquipmentPlans.length})` : ''}
            </button>
            <button onClick={() => onSetActiveTab('pieces')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pieces' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <LinkIcon className="w-4 h-4" /> Pièces
            </button>
            <button onClick={() => onSetActiveTab('documents')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <FileText className="w-4 h-4" /> Documents{activeEquipment?.documents?.length ? ` (${activeEquipment.documents.length})` : ''}
            </button>
            <button onClick={() => onSetActiveTab('ot')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'ot' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <ClipboardList className="w-4 h-4" /> OT
            </button>
          </div>

          {/* Tab Content */}
          <div>
          
            {activeTab === 'informations' && (
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Date d'achat</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{activeEquipment?.purchaseDate ? new Date(activeEquipment.purchaseDate).toLocaleDateString('fr-FR') : '-'}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Fin garantie</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{activeEquipment?.endOfWarranty ? new Date(activeEquipment.endOfWarranty).toLocaleDateString('fr-FR') : '-'}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Fournisseur</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        {suppliers.find(s => s.id === activeEquipment?.supplierId)?.name || activeEquipment?.supplierId || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Code barre</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 font-mono tracking-tight">{activeEquipment?.barcode || '-'}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Inventaire</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{activeEquipment?.inventory || '-'}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Responsabilité</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{activeEquipment?.responsibility || '-'}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Présence GIP</label>
                      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        {activeEquipment?.gipPresence ? <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Oui</span> : <span className="text-slate-400">Non</span>}
                      </div>
                    </div>
                  </div>
              </div>
            )}
            
            {activeTab === 'historique' && (
              <div className="flex flex-col gap-3">
                {historyWorkOrders.length > 0 ? (
                  <div className="flex flex-col gap-3">
                  {historyWorkOrders.map(wo => (
                    <div key={wo.id} className="p-4 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{wo.id}</span>
                          <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{wo.title}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wo.status === 'Terminé' || wo.status === 'Clôturé' ? 'bg-emerald-100 text-emerald-700' :
                          wo.status === 'En cours' ? 'bg-rose-100 text-rose-700' :
                          wo.status === 'En attente' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{wo.status}</span>
                      </div>
                      {wo.description && <p className="text-xs text-slate-500 leading-relaxed">{wo.description}</p>}
                      <div className="flex gap-4 text-[11px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-700 pt-2 mt-1">
                        <span>📅 {new Date(wo.createdDate).toLocaleDateString('fr-FR')}</span>
                        <span>🔧 {wo.type}</span>
                        {wo.priority && <span className={(wo.priority as string) === 'Urgente' ? 'text-rose-500' : ''}>⚡ {wo.priority}</span>}
                        {wo.durationMinutes ? <span>⏱️ {Math.floor(wo.durationMinutes / 60)}h {wo.durationMinutes % 60}m</span> : null}
                      </div>

                      {/* Diagnostic & Solution */}
                      {(wo.diagnostic || wo.solution) && (
                        <div className="flex flex-col gap-1 mt-1">
                          {wo.diagnostic && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/10 px-2 py-1.5 rounded border border-amber-100 dark:border-amber-900/30">
                              <span className="font-bold text-amber-700 dark:text-amber-500 block mb-0.5">Diagnostic:</span>
                              {wo.diagnostic}
                            </div>
                          )}
                          {wo.solution && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                              <span className="font-bold text-emerald-700 dark:text-emerald-500 block mb-0.5">Solution:</span>
                              {wo.solution}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Technician info */}
                      {wo.technicianId && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded mt-1 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold">Intervenant:</span> {technicians.find(t => t.id === wo.technicianId)?.name || 'Inconnu'}
                        </div>
                      )}
                      
                      {/* Parts used info */}
                      {wo.partsUsed && wo.partsUsed.length > 0 && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded mt-1 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold block mb-1">Pièces utilisées:</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {wo.partsUsed.map((p, idx) => {
                              const partDetails = parts.find(part => part.ref === p.partRef);
                              return (
                                <li key={idx}>
                                  <span className="font-bold">{p.quantity}x</span> {partDetails ? partDetails.name : p.partRef}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 opacity-50">
                    <History className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-600">Aucun historique d'intervention</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preventifs' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Plans préventifs associés
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {activeEquipmentPlans.length}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Interventions périodiques et gammes de maintenance programmées pour cet équipement.
                    </p>
                  </div>
                  {can(PERMISSIONS.PREVENTIVE_CREATE) && (
                    <button
                      onClick={() => {
                        if (activeEquipment?.id) {
                          onNavigate(`preventive-new:${activeEquipment.id}`);
                        } else {
                          onNavigate('preventive');
                        }
                      }}
                      className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Créer un plan
                    </button>
                  )}
                </div>

                {activeEquipmentPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeEquipmentPlans.map(prev => (
                      <div
                        key={prev.id}
                        className="p-4 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary/40 rounded-xl shadow-sm flex flex-col justify-between gap-3 group transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              PRV-{prev.id.toString().padStart(3, '0')}
                            </span>
                            <p className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
                              {prev.titre}
                            </p>
                            {prev.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {prev.description}
                              </p>
                            )}
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prev.actif !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {prev.actif !== false ? 'Actif' : 'Inactif'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            🔄 Tous les {prev.frequence} {prev.uniteMesure || 'jours'}
                          </span>
                          {prev.prochaineDate && (
                            <span>
                              📅 Prochaine: <strong className="text-primary">{new Date(prev.prochaineDate).toLocaleDateString('fr-FR')}</strong>
                            </span>
                          )}
                          <button
                            onClick={() => onNavigate('preventive')}
                            className="text-xs font-bold text-primary hover:underline ml-auto cursor-pointer"
                          >
                            Voir dans Préventif →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <Calendar className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Aucun plan préventif associé</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Vous n'avez pas encore configuré de gammes de maintenance préventive pour cet équipement.
                    </p>
                    {can(PERMISSIONS.PREVENTIVE_CREATE) && (
                      <button
                        onClick={() => {
                          if (activeEquipment?.id) {
                            onNavigate(`preventive-new:${activeEquipment.id}`);
                          } else {
                            onNavigate('preventive');
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Créer un plan préventif
                      </button>
                    )}
                  </div>
                )}
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
                        {parts.map(p => {
                          const isAlreadyLinked = activeEquipment?.spareParts?.some(sp => sp === p.id || sp === p.ref);
                          return (
                            <option key={p.id || p.ref} value={p.id || p.ref} disabled={isAlreadyLinked}>
                              {p.ref} - {p.name} {isAlreadyLinked ? '(Déjà associée)' : ''}
                            </option>
                          );
                        })}
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
                      const pieceDetails = parts.find(p => p.id === pieceId || p.ref === pieceId);
                      return (
                        <div key={pieceId} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                              <LinkIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {pieceDetails ? pieceDetails.name : `Pièce (${pieceId})`}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Réf: {pieceDetails ? pieceDetails.ref : pieceId}
                              </p>
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
                      <LinkIcon className="w-12 h-12 text-slate-400 mb-3" />
                      <p className="text-sm font-bold text-slate-600">Aucune pièce de rechange associée</p>
                      <p className="text-xs text-slate-500 mt-1">Sélectionnez une pièce ci-dessus pour l'associer.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="flex flex-col gap-4">
                {/* Header with Title and Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Documents & Notices techniques
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {activeEquipment?.documents?.length || 0}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Notices constructeur, schémas électriques, plans et certificats associés à cet équipement.
                    </p>
                  </div>
                  {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                    <button
                      onClick={() => {
                        setIsUploadingDoc(!isUploadingDoc);
                        setDocError(null);
                      }}
                      className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
                    >
                      {isUploadingDoc ? <X className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                      {isUploadingDoc ? 'Fermer' : 'Ajouter un document'}
                    </button>
                  )}
                </div>

                {/* Upload Form Box */}
                {isUploadingDoc && (
                  <form
                    onSubmit={handleUploadDocument}
                    className="p-5 bg-white dark:bg-slate-850 rounded-xl border border-primary/30 dark:border-primary/30 shadow-md flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Importer un document technique
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsUploadingDoc(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {docError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{docError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* File Picker */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Fichier (PDF, Image, Schéma, DWG, Docx - Max 30 Mo) *
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.dwg,.txt,.zip"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-6 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all ${
                            uploadFile
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <Upload className={`w-8 h-8 mb-2 ${uploadFile ? 'text-primary' : 'text-slate-400'}`} />
                          {uploadFile ? (
                            <div className="text-center">
                              <p className="text-xs font-bold text-primary">{uploadFile.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {(uploadFile.size / (1024 * 1024)).toFixed(2)} Mo · Cliquez pour changer de fichier
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Cliquez pour choisir un fichier depuis votre appareil
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Notice constructeur, schéma électrique ou plan technique
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Nom du document (Titre d'affichage)
                        </label>
                        <input
                          type="text"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="Ex: Notice Constructeur Moteur 5.5kW"
                          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Document Type */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Type de document
                        </label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                        >
                          <option value="notice">📘 Notice / Manuel constructeur</option>
                          <option value="schema">⚡ Schéma électrique</option>
                          <option value="plan">📐 Plan mécanique / P&ID</option>
                          <option value="photo">🖼️ Photo / Visuel technique</option>
                          <option value="rapport">📑 Rapport de maintenance</option>
                          <option value="certificat">📜 Certificat de conformité</option>
                          <option value="autre">📄 Autre document</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsUploadingDoc(false)}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={!uploadFile || isSubmittingDoc}
                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                      >
                        {isSubmittingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {isSubmittingDoc ? 'Envoi en cours...' : 'Enregistrer le document'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Documents List */}
                {(!activeEquipment?.documents || activeEquipment.documents.length === 0) ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Aucun document technique</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Notice constructeur, schémas électriques, plans de maintenance...
                    </p>
                    {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                      <button
                        onClick={() => setIsUploadingDoc(true)}
                        className="mt-4 px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Importer un premier document
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeEquipment.documents.map((doc, idx) => {
                      const badge = getDocBadge(doc.type);
                      return (
                        <div
                          key={doc.id || idx}
                          className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/40 shadow-sm transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-1" title={doc.name}>
                                  {doc.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {doc.size}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {can(PERMISSIONS.EQUIPMENT_UPDATE) && doc.id && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                disabled={deletingDocId === doc.id}
                                title="Supprimer ce document"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                              >
                                {deletingDocId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <span className="text-[10px] text-slate-400">
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Ouvrir
                              </a>
                              <a
                                href={doc.url}
                                download={doc.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                title="Télécharger"
                              >
                                <Download className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ot' && (
              <div className="flex flex-col gap-3">
                {activeWorkOrders.length > 0 ? (
                  activeWorkOrders.map(wo => (
                    <div key={wo.id} className="p-4 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{wo.id}</span>
                          <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{wo.title}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wo.status === 'En cours' ? 'bg-rose-100 text-rose-700' :
                          wo.status === 'En attente' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{wo.status}</span>
                      </div>
                      {wo.description && <p className="text-xs text-slate-500 leading-relaxed">{wo.description}</p>}
                      <div className="flex gap-4 text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-2 mt-1">
                        <span>📅 {new Date(wo.createdDate).toLocaleDateString('fr-FR')}</span>
                        <span>🔧 {wo.type}</span>
                        {wo.priority && <span className={(wo.priority as string) === 'Urgente' ? 'text-rose-500' : ''}>⚡ {wo.priority}</span>}
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

        {(!isAdding && !isEditing) && (
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
             <button onClick={handleCreateOT} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
                <Wrench className="w-4 h-4" /> Créer un OT
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
