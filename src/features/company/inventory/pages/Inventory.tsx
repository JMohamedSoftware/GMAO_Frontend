import React, { useState, useMemo } from 'react';
import { useGmao } from '@/shared/hooks/useGmao';
import { SparePart } from '@/shared/types/gmao';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  Plus, 
  Boxes,
  Disc,
  Link2,
  Repeat,
  Droplets,
  Cpu,
  Settings,
  Zap,
  Wind,
  Droplet,
  Wrench,
  Container,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  MoreHorizontal
} from 'lucide-react';

import { InventoryStats } from '../components/InventoryStats';
import { InventoryList } from '../components/InventoryList';
import { InventoryDetail } from '../components/InventoryDetail';
import { InventoryModals } from '../components/InventoryModals';

interface InventoryProps {
  onNavigate: (screen: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  'Roulements':   Disc,
  'Joints':       Link2,
  'Courroies':    Repeat,
  'Vannes':       Droplets,
  'Automatisme':  Cpu,
  'Garnitures':   Settings,
  'Électrique':   Zap,
  'Pneumatique':  Wind,
  'Hydraulique':  Droplet,
  'Visserie':     Wrench,
  'Lubrifiants':  Container,
  'Autre':        Package,
};

export const Inventory: React.FC<InventoryProps> = ({ onNavigate }) => {
  const { parts, suppliers, addPartMovement, updatePart, movementLogs } = useGmao();
  const { can } = usePermissions();

  // 3-column navigation state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPartRef, setSelectedPartRef] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  // Stock movement modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movePartRef, setMovePartRef] = useState<string | null>(null);
  const [moveType, setMoveType] = useState<'in' | 'out'>('in');
  const [moveQty, setMoveQty] = useState(1);
  const [moveReason, setMoveReason] = useState('');
  const [moveCategory, setMoveCategory] = useState('Achat');

  const [activeTab, setActiveTab] = useState<'historique'|'ots'|'docs'>('historique');

  // Supplier filter
  const [filterSupplier, setFilterSupplier] = useState('');

  // Accordion state
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRef, setNewRef] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<string>('Roulements');
  const [newSupId, setNewSupId] = useState('');
  const [newStock, setNewStock] = useState(10);
  const [newMin, setNewMin] = useState(5);
  const [newMax, setNewMax] = useState(50);
  const [newPrice, setNewPrice] = useState(25.0);
  const [newLoc, setNewLoc] = useState('');

  // Purchase Order modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPartRef, setOrderPartRef] = useState<string | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);


  // KPIs
  const lowStockParts = parts.filter(p => p.stockCurrent <= p.stockMin);
  const totalValuation = parts.reduce((acc, p) => acc + (p.stockCurrent * p.unitPrice), 0);

  // Grouped parts, filtered globally
  const categories = useMemo(() => {
    const allCats = new Set<string>();
    parts.forEach(p => {
      if (p.category) allCats.add(p.category);
    });
    Object.keys(CATEGORY_ICONS).forEach(c => allCats.add(c));
    return Array.from(allCats);
  }, [parts]);

  const groupedParts = useMemo(() => {
    const filtered = parts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.ref.toLowerCase().includes(search.toLowerCase());
      const matchAlert = !filterAlertOnly || (p.stockCurrent <= p.stockMin);
      const matchSup = !filterSupplier || p.supplierId === filterSupplier;
      return matchSearch && matchAlert && matchSup;
    });

    const groups: Record<string, SparePart[]> = {};
    categories.forEach(c => groups[c] = []);
    filtered.forEach(p => {
      if (groups[p.category]) {
        groups[p.category].push(p);
      }
    });
    return groups;
  }, [parts, categories, search, filterAlertOnly, filterSupplier]);

  // Selected part detail
  const activePart = parts.find(p => p.ref === selectedPartRef);
  const moveModalPart = parts.find(p => p.ref === movePartRef);

  const handleOpenMovement = (partRef: string, type: 'in' | 'out') => {
    setMovePartRef(partRef);
    setMoveType(type);
    setMoveQty(1);
    setMoveReason('');
    setShowMoveModal(true);
  };

  const executeMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movePartRef) return;
    const success = addPartMovement(movePartRef, moveQty, moveType, undefined);
    if (success) {
      // Stock movement is now fully handled in Redux (both stock change and log)
      setShowMoveModal(false);
    } else {
      alert("Erreur: Quantité en stock insuffisante pour effectuer cette sortie.");
    }
  };

  const handleAddNewPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef || !newName || !newSupId) return;
    const newPart: SparePart = {
      ref: newRef.toUpperCase(),
      name: newName,
      category: newCat,
      supplierId: newSupId,
      stockCurrent: newStock,
      stockMin: newMin,
      stockMax: newMax,
      unitPrice: newPrice,
      location: newLoc || 'Étagère Générique'
    };
    updatePart(newPart);
    setNewRef(''); setNewName(''); setNewSupId('');
    setShowAddModal(false);
    setSelectedCategory(newCat);
  };

  const handleEditPart = (partRef: string) => {
    const p = parts.find(x => x.ref === partRef);
    if (!p) return;
    setNewRef(p.ref);
    setNewName(p.name);
    setNewCat(p.category);
    setNewSupId(p.supplierId || '');
    setNewStock(p.stockCurrent);
    setNewMin(p.stockMin);
    setNewMax(p.stockMax);
    setNewPrice(p.unitPrice);
    setNewLoc(p.location || '');
    setShowAddModal(true); // Reuse the add modal
  };

  const handleOpenOrder = (partRef: string) => {
    setOrderPartRef(partRef);
    const p = parts.find(p => p.ref === partRef);
    setOrderQty(p ? Math.max(1, p.stockMax - p.stockCurrent) : 1);
    setOrderSuccess(false);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
    }, 2000);
  };

  const inputCls = "w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-primary";

  return (
    <div className="h-full flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl border border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Gestion des Stocks & Pièces
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Suivi, inventaire et approvisionnement des pièces de rechange
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {can(PERMISSIONS.INVENTORY_CREATE) && (
            <button
              onClick={() => {
                setNewRef(''); setNewName(''); setNewSupId('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle pièce</span>
            </button>
          )}
          
          <button
            onClick={() => handleOpenMovement(selectedPartRef || parts[0]?.ref, 'in')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
            <span>Entrée stock</span>
          </button>
          
          <button
            onClick={() => handleOpenMovement(selectedPartRef || parts[0]?.ref, 'out')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
          >
            <ArrowUpFromLine className="w-4 h-4 text-rose-500" />
            <span>Sortie stock</span>
          </button>
          

        </div>
      </div>

      {/* KPI strip */}
      <InventoryStats parts={parts} />

      {/* Table & Side Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <div className={`transition-all duration-300 w-full ${selectedPartRef ? 'pr-[400px]' : ''}`}>
          <InventoryList
            parts={parts}
            search={search}
            setSearch={setSearch}
            filterSupplier={filterSupplier}
            setFilterSupplier={setFilterSupplier}
            filterAlertOnly={filterAlertOnly}
            setFilterAlertOnly={setFilterAlertOnly}
            suppliers={suppliers}
            categories={categories}
            selectedPartRef={selectedPartRef}
            setSelectedPartRef={setSelectedPartRef}
            CATEGORY_ICONS={CATEGORY_ICONS}
            can={can}
            handleEditPart={handleEditPart}
            handleOpenOrder={handleOpenOrder}
            movementLogs={movementLogs}
          />
        </div>

        {/* Column 2: Part detail (Offcanvas style side panel) */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl transition-transform duration-300 transform ${selectedPartRef ? 'translate-x-0' : 'translate-x-full'}`}>
          <InventoryDetail
            activePart={activePart}
            suppliers={suppliers}
            CATEGORY_ICONS={CATEGORY_ICONS}
            can={can}
            onNavigate={onNavigate}
            handleOpenMovement={handleOpenMovement}
            handleEditPart={handleEditPart}
            handleOpenOrder={handleOpenOrder}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            movementLogs={movementLogs}
            onClose={() => setSelectedPartRef(null)}
          />
        </div>
      </div>

      {/* Modals */}
      <InventoryModals
        showMoveModal={showMoveModal}
        setShowMoveModal={setShowMoveModal}
        moveModalPart={moveModalPart}
        moveType={moveType}
        executeMovement={executeMovement}
        moveQty={moveQty}
        setMoveQty={setMoveQty}
        moveCategory={moveCategory}
        setMoveCategory={setMoveCategory}
        moveReason={moveReason}
        setMoveReason={setMoveReason}
        inputCls={inputCls}
        movePartRef={movePartRef}
        setMovePartRef={setMovePartRef}
        parts={parts}
        categories={categories}

        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        handleAddNewPart={handleAddNewPart}
        newRef={newRef}
        setNewRef={setNewRef}
        newName={newName}
        setNewName={setNewName}
        newCat={newCat}
        setNewCat={setNewCat}
        newSupId={newSupId}
        setNewSupId={setNewSupId}
        suppliers={suppliers}
        newStock={newStock}
        setNewStock={setNewStock}
        newMin={newMin}
        setNewMin={setNewMin}
        newMax={newMax}
        setNewMax={setNewMax}
        newPrice={newPrice}
        setNewPrice={setNewPrice}
        newLoc={newLoc}
        setNewLoc={setNewLoc}

        showOrderModal={showOrderModal}
        setShowOrderModal={setShowOrderModal}
        orderPartRef={orderPartRef}
        handleConfirmOrder={handleConfirmOrder}
        orderSuccess={orderSuccess}
        orderQty={orderQty}
        setOrderQty={setOrderQty}
      />
    </div>
  );
};
