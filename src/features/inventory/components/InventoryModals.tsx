import React from 'react';
import { Tag, X, Boxes, Package, ArrowDownLeft } from 'lucide-react';
import { SparePart, Supplier } from '../../../types/gmao';

interface InventoryModalsProps {
  showMoveModal: boolean;
  setShowMoveModal: (show: boolean) => void;
  moveModalPart: SparePart | undefined;
  moveType: 'in' | 'out';
  executeMovement: (e: React.FormEvent) => void;
  moveQty: number;
  setMoveQty: (q: number) => void;
  moveCategory: string;
  setMoveCategory: (c: string) => void;
  moveReason: string;
  setMoveReason: (r: string) => void;
  inputCls: string;

  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  handleAddNewPart: (e: React.FormEvent) => void;
  newRef: string;
  setNewRef: (r: string) => void;
  newName: string;
  setNewName: (n: string) => void;
  newCat: string;
  setNewCat: (c: string) => void;
  newSupId: string;
  setNewSupId: (id: string) => void;
  suppliers: Supplier[];
  newStock: number;
  setNewStock: (s: number) => void;
  newMin: number;
  setNewMin: (m: number) => void;
  newMax: number;
  setNewMax: (m: number) => void;
  newPrice: number;
  setNewPrice: (p: number) => void;
  newLoc: string;
  setNewLoc: (l: string) => void;

  showOrderModal: boolean;
  setShowOrderModal: (show: boolean) => void;
  orderPartRef: string | null;
  parts: SparePart[];
  handleConfirmOrder: (e: React.FormEvent) => void;
  orderSuccess: boolean;
  orderQty: number;
  setOrderQty: (q: number) => void;
}

export const InventoryModals: React.FC<InventoryModalsProps> = ({
  showMoveModal, setShowMoveModal, moveModalPart, moveType, executeMovement,
  moveQty, setMoveQty, moveCategory, setMoveCategory, moveReason, setMoveReason, inputCls,
  showAddModal, setShowAddModal, handleAddNewPart, newRef, setNewRef, newName, setNewName,
  newCat, setNewCat, newSupId, setNewSupId, suppliers, newStock, setNewStock, newMin, setNewMin,
  newMax, setNewMax, newPrice, setNewPrice, newLoc, setNewLoc,
  showOrderModal, setShowOrderModal, orderPartRef, parts, handleConfirmOrder, orderSuccess,
  orderQty, setOrderQty
}) => {
  return (
    <>
      {/* Movement modal */}
      {showMoveModal && moveModalPart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" />
                Mouvement : {moveType === 'in' ? 'Entrée' : 'Sortie'}
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="p-1 rounded-full text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={executeMovement} className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-450 block font-mono">{moveModalPart.ref}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{moveModalPart.name}</span>
                <span className="text-[10px] text-slate-400 block mt-1">En stock : {moveModalPart.stockCurrent}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Quantité *</label>
                <input type="number" min={1} required value={moveQty} onChange={e => setMoveQty(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Type de mouvement *</label>
                <select value={moveCategory} onChange={e => setMoveCategory(e.target.value)} className={inputCls + " dark:bg-slate-800 cursor-pointer"}>
                  {moveType === 'in' ? (
                    <>
                      <option value="Achat">⬇ Achat</option>
                      <option value="Retour">⬇ Retour</option>
                    </>
                  ) : (
                    <>
                      <option value="Maintenance Corrective">⬆ Maintenance Corrective</option>
                      <option value="Maintenance Préventive">⬆ Maintenance Préventive</option>
                      <option value="Casse">⬆ Casse</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Justificatif / N° OT *</label>
                <input type="text" required placeholder="Ex: OT-2026-001 ou Livraison" value={moveReason} onChange={e => setMoveReason(e.target.value)} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button type="button" onClick={() => setShowMoveModal(false)} className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold cursor-pointer">Annuler</button>
                <button type="submit" className={`px-5 py-2 text-white rounded font-bold shadow-md cursor-pointer ${moveType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add part modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Boxes className="w-5 h-5 text-primary" />
                Enregistrer un Article de Rechange
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddNewPart} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Référence unique *</label>
                  <input type="text" required placeholder="Ex: REF-BRG-200" value={newRef} onChange={e => setNewRef(e.target.value.toUpperCase())} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Désignation *</label>
                  <input type="text" required placeholder="Ex: Roulement à billes 6205" value={newName} onChange={e => setNewName(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Famille / Catégorie</label>
                  <select value={newCat} onChange={e => setNewCat(e.target.value)} className={inputCls + " dark:bg-slate-800 cursor-pointer"}>
                    <option>Roulements</option>
                    <option>Joints</option>
                    <option>Courroies</option>
                    <option>Vannes</option>
                    <option>Automatisme</option>
                    <option>Garnitures</option>
                    <option>Électrique</option>
                    <option>Pneumatique</option>
                    <option>Hydraulique</option>
                    <option>Visserie</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Fournisseur *</label>
                  <select required value={newSupId} onChange={e => setNewSupId(e.target.value)} className={inputCls + " dark:bg-slate-800 cursor-pointer"}>
                    <option value="">Choisir...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Stock Initial *</label>
                  <input type="number" required min={0} value={newStock} onChange={e => setNewStock(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Seuil Min *</label>
                  <input type="number" required min={1} value={newMin} onChange={e => setNewMin(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Stock Max *</label>
                  <input type="number" required min={1} value={newMax} onChange={e => setNewMax(Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Prix Unitaire (€) *</label>
                  <input type="number" step="0.01" required min={0} value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Localisation Rayon</label>
                  <input type="text" placeholder="Ex: Aisle A - Étagère 2" value={newLoc} onChange={e => setNewLoc(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold cursor-pointer">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md cursor-pointer">Enregistrer l'Article</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {showOrderModal && orderPartRef && (() => {
        const orderPart = parts.find(p => p.ref === orderPartRef);
        const orderSup = orderPart ? suppliers.find(s => s.id === orderPart.supplierId) : null;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
              <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Bon de Commande — {orderPart?.name}
                </h3>
                <button onClick={() => setShowOrderModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleConfirmOrder} className="p-6 flex flex-col gap-4 text-xs">
                {orderSuccess ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <ArrowDownLeft className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p className="font-bold text-emerald-600 text-sm">Bon de commande envoyé !</p>
                    <p className="text-slate-400 text-center">Le fournisseur <strong>{orderSup?.name || 'inconnu'}</strong> a été notifié.</p>
                  </div>
                ) : (
                  <>
                    {orderSup && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Fournisseur</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{orderSup.name}</span>
                        <span className="text-[10px] text-slate-400">{orderSup.email} · {orderSup.phone}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Quantité à commander</label>
                      <input
                        type="number" min={1} required
                        value={orderQty}
                        onChange={e => setOrderQty(Number(e.target.value))}
                        className={inputCls}
                      />
                      {orderPart && (
                        <span className="text-[10px] text-slate-400">
                          Coût estimé : <strong className="text-primary">{(orderQty * orderPart.unitPrice).toFixed(2)} €</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
                      <button type="button" onClick={() => setShowOrderModal(false)} className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold cursor-pointer">Annuler</button>
                      <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md cursor-pointer">Envoyer Commande</button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        );
      })()}
    </>
  );
};
