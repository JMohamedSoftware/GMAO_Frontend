import React, { useState, useMemo } from 'react';
import { useGmao } from '../../../hooks/useGmao';
import { SparePart } from '../../../types/gmao';
import { usePermissions } from '../../../hooks/usePermissions';
import { Plus, Boxes } from 'lucide-react';

import { InventoryStats } from '../components/InventoryStats';
import { InventoryList } from '../components/InventoryList';
import { InventoryDetail } from '../components/InventoryDetail';
import { InventoryModals } from '../components/InventoryModals';

interface InventoryProps {
  onNavigate: (screen: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Roulements':   '🔘',
  'Joints':       '🔗',
  'Courroies':    '〰️',
  'Vannes':       '🚰',
  'Automatisme':  '💻',
  'Garnitures':   '⚙️',
  'Électrique':   '⚡',
  'Pneumatique':  '💨',
  'Hydraulique':  '💧',
  'Visserie':     '🔩',
};

export const Inventory: React.FC<InventoryProps> = ({ onNavigate }) => {
  const { parts, suppliers, addPartMovement, updatePart } = useGmao();
  const { canDo } = usePermissions();

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

  // Movements log
  const [movementLogs, setMovementLogs] = useState([
    { id: 'MOV-001', partRef: 'REF-BRG-102', qty: 2, type: 'out', reason: 'OT-2026-001 - Remplacement roulement', date: '2026-07-07T09:35:00', category: 'Maintenance Corrective' },
    { id: 'MOV-002', partRef: 'REF-GASK-EVAP', qty: 10, type: 'in', reason: 'Livraison commande SKF', date: '2026-07-06T14:20:00', category: 'Achat' },
    { id: 'MOV-003', partRef: 'REF-VALV-304', qty: 1, type: 'out', reason: 'OT-2026-003 - Rechange vanne', date: '2026-07-05T09:40:00', category: 'Maintenance Préventive' },
    { id: 'MOV-004', partRef: 'REF-BRG-102', qty: 1, type: 'out', reason: 'Pièce endommagée au montage', date: '2026-07-04T10:00:00', category: 'Casse' }
  ]);

  // KPIs
  const lowStockParts = parts.filter(p => p.stockCurrent <= p.stockMin);
  const totalValuation = parts.reduce((acc, p) => acc + (p.stockCurrent * p.unitPrice), 0);

  // Grouped parts, filtered globally
  const categories = Object.keys(CATEGORY_ICONS);
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

  const handleOpenMovement = (partRef: string, type: 'in' | 'out', e: React.MouseEvent) => {
    e.stopPropagation();
    setMovePartRef(partRef);
    setMoveType(type);
    setMoveQty(1);
    setMoveReason('');
    setShowMoveModal(true);
  };

  const executeMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movePartRef) return;
    const success = addPartMovement(movePartRef, moveQty, moveType);
    if (success) {
      setMovementLogs(prev => [{
        id: `MOV-${String(Date.now()).slice(-3)}`,
        partRef: movePartRef,
        qty: moveQty,
        type: moveType,
        reason: moveReason || (moveType === 'in' ? 'Approvisionnement manuel' : 'Consommation manuelle'),
        date: new Date().toISOString(),
        category: moveCategory
      }, ...prev]);
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
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Gestion des Stocks & Pièces
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Catalogue par famille · {parts.length} références
            </p>
          </div>
        </div>
        {canDo('inventory', 'creer') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Article</span>
          </button>
        )}
      </div>

      {/* KPI strip */}
      <InventoryStats parts={parts} lowStockParts={lowStockParts} totalValuation={totalValuation} />

      {/* 2-column layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Column 1: Filters & Grouped List */}
        <InventoryList
          search={search}
          setSearch={setSearch}
          filterSupplier={filterSupplier}
          setFilterSupplier={setFilterSupplier}
          filterAlertOnly={filterAlertOnly}
          setFilterAlertOnly={setFilterAlertOnly}
          suppliers={suppliers}
          categories={categories}
          groupedParts={groupedParts}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          selectedPartRef={selectedPartRef}
          setSelectedPartRef={setSelectedPartRef}
          CATEGORY_ICONS={CATEGORY_ICONS}
        />

        {/* Column 2: Part detail */}
        <InventoryDetail
          activePart={activePart}
          suppliers={suppliers}
          CATEGORY_ICONS={CATEGORY_ICONS}
          canDo={canDo}
          onNavigate={onNavigate}
          handleOpenMovement={handleOpenMovement}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          movementLogs={movementLogs}
        />
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
        parts={parts}
        handleConfirmOrder={handleConfirmOrder}
        orderSuccess={orderSuccess}
        orderQty={orderQty}
        setOrderQty={setOrderQty}
      />
    </div>
  );
};
