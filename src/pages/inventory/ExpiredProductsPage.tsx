import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PackageX, Trash2, Calendar, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency, formatDate } from '../../utils';
import type { Product } from '../../types';

export const ExpiredProductsPage: React.FC = () => {
  const { products, adjustStock, updateProduct, deleteProduct } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const today = new Date();
  const expiring30 = products.filter(p =>
    p.stockAvailable > 0 &&
    p.expiryDate && new Date(p.expiryDate) > today &&
    new Date(p.expiryDate) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  );
  const expired = products.filter(p =>
    p.stockAvailable > 0 &&
    (p.status === 'EXPIRED' || (p.expiryDate && new Date(p.expiryDate) < today))
  );

  // Disposal / Action Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<'dispose' | 'extend' | 'restock'>('dispose');
  const [newExpiryDate, setNewExpiryDate] = useState<string>('');
  const [restockQty, setRestockQty] = useState<string>('20');
  const [disposeNotes, setDisposeNotes] = useState<string>('Expired product disposal action');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const openActionModal = (p: Product, defaultAction: 'dispose' | 'extend' | 'restock' = 'dispose') => {
    setSelectedProduct(p);
    setActionType(defaultAction);
    setNewExpiryDate(p.expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setRestockQty(String(p.reorderQuantity || 20));
    setDisposeNotes(`Expired disposal for ${p.sku}`);
  };

  const handleExecuteAction = () => {
    if (!selectedProduct || !currentUser) return;

    if (actionType === 'dispose') {
      const currentQty = selectedProduct.stockAvailable > 0 ? selectedProduct.stockAvailable : 1;
      adjustStock(
        selectedProduct.id,
        'EXPIRED_DISPOSAL',
        currentQty,
        currentUser.id,
        currentUser.fullName,
        `DISP-${Date.now().toString().slice(-6)}`,
        disposeNotes
      );
      // Clear old expired date and set status to OUT_OF_STOCK so it stays in catalog for restocking
      updateProduct(selectedProduct.id, { expiryDate: undefined, status: 'OUT_OF_STOCK' });
      logAudit(
        currentUser.id,
        currentUser.fullName,
        currentUser.role,
        'STOCK_OUT',
        'Product',
        selectedProduct.id,
        `Disposed expired batch: ${selectedProduct.name} (${currentQty} units)`
      );
      setSuccessMsg(`✓ Disposed expired batch for ${selectedProduct.name}. Status updated to Out of Stock (ready for restocking).`);
    } else if (actionType === 'extend') {
      updateProduct(selectedProduct.id, { expiryDate: newExpiryDate });
      logAudit(
        currentUser.id,
        currentUser.fullName,
        currentUser.role,
        'PRODUCT_UPDATE',
        'Product',
        selectedProduct.id,
        `Updated expiry date to ${newExpiryDate} for ${selectedProduct.name}`
      );
      setSuccessMsg(`✓ Expiry date updated to ${newExpiryDate}!`);
    } else if (actionType === 'restock') {
      const qty = Number(restockQty);
      if (qty > 0) {
        adjustStock(
          selectedProduct.id,
          'STOCK_IN',
          qty,
          currentUser.id,
          currentUser.fullName,
          `RESTOCK-${Date.now().toString().slice(-6)}`,
          'Fresh batch restock'
        );
        if (newExpiryDate) {
          updateProduct(selectedProduct.id, { expiryDate: newExpiryDate });
        }
        logAudit(
          currentUser.id,
          currentUser.fullName,
          currentUser.role,
          'STOCK_IN',
          'Product',
          selectedProduct.id,
          `Restocked ${qty} fresh units for ${selectedProduct.name}`
        );
        setSuccessMsg(`✓ Added ${qty} fresh units to ${selectedProduct.name}!`);
      }
    }

    setTimeout(() => {
      setSuccessMsg('');
      setSelectedProduct(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Expired Products" subtitle="Manage expired & expiring inventory — Click any row or card for actions" />
      <div className="flex-1 p-8 space-y-6">

        {/* Expiring Soon (30 Days) */}
        {expiring30.length > 0 && (
          <div className="skeuo-panel border border-amber-500/30 bg-amber-500/05 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-led-pulse-amber" />
              <h3 className="font-display font-semibold text-amber-400 text-lg">Expiring Within 30 Days ({expiring30.length})</h3>
              <span className="text-xs text-gray-500 font-mono">— Click card to manage</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiring30.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openActionModal(p, 'extend')}
                  className="bg-amber-500/10 border border-amber-500/25 hover:border-amber-400 rounded-xl p-4 cursor-pointer transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-100 group-hover:text-amber-300 transition-colors">{p.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{p.sku} · Rack: {p.storageRackId}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      EXPIRING SOON
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-white/06 text-xs">
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(p.expiryDate!)}
                    </span>
                    <span className="text-gray-300 font-mono font-bold">Qty: {p.stockAvailable}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Expired Items */}
        <div className="skeuo-panel border border-red-500/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/06 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PackageX size={18} className="text-red-400 animate-pulse" />
              <h3 className="font-display font-semibold text-red-400 text-lg">Expired Items ({expired.length})</h3>
              <span className="text-xs text-gray-500 font-mono">— Click any row below to Dispose or Restock</span>
            </div>
          </div>

          {expired.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <PackageX size={36} className="mx-auto mb-2 opacity-30 text-emerald-400" />
              <p className="text-sm font-semibold text-gray-300">No expired items in inventory.</p>
              <p className="text-xs text-gray-500 mt-1">All product expiration dates are valid and up to date.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/04">
              {expired.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => openActionModal(p, 'dispose')}
                  className="px-6 py-4 flex items-center gap-4 cursor-pointer transition-all group"
                >
                  {/* Hazard emblem */}
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 group-hover:bg-red-500/25 flex items-center justify-center flex-shrink-0 border border-red-500/30 transition-colors">
                    <PackageX size={18} className="text-red-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100 group-hover:text-red-300 transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.sku} · Rack: {p.storageRackId}</p>
                    {p.expiryDate && (
                      <p className="text-xs text-red-400/90 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar size={11} /> Expired: {formatDate(p.expiryDate)}
                      </p>
                    )}
                  </div>

                  <div className="text-center flex-shrink-0 px-4">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Stock</p>
                    <p className="text-xl font-bold text-red-400 font-mono">{p.stockAvailable}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SkeuoBadge label="EXPIRED" status="EXPIRED" dot />
                    <SkeuoButton variant="danger" size="xs" className="pointer-events-none group-hover:shadow-skeuo-led-red">
                      <Trash2 size={12} /> Dispose
                    </SkeuoButton>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action / Disposal Modal */}
      {selectedProduct && (
        <SkeuoModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Expired Item Action — ${selectedProduct.name}`}
          subtitle={`SKU: ${selectedProduct.sku} · Storage Rack: ${selectedProduct.storageRackId} · Expired: ${selectedProduct.expiryDate ? formatDate(selectedProduct.expiryDate) : 'N/A'}`}
          size="md"
          footer={
            successMsg ? null : (
              <>
                <SkeuoButton variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </SkeuoButton>
                <SkeuoButton
                  variant={actionType === 'dispose' ? 'danger' : 'gold'}
                  size="sm"
                  onClick={handleExecuteAction}
                  ledStatus={actionType === 'dispose' ? 'red' : 'green'}
                >
                  {actionType === 'dispose' && <><Trash2 size={13} className="mr-1" /> Dispose {selectedProduct.stockAvailable} Units</>}
                  {actionType === 'extend' && <><Calendar size={13} className="mr-1" /> Update Expiry Date</>}
                  {actionType === 'restock' && <><RefreshCw size={13} className="mr-1" /> Restock Fresh Batch</>}
                </SkeuoButton>
              </>
            )
          }
        >
          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-emerald-400 animate-bounce" />
              <p className="text-base font-semibold text-emerald-300">{successMsg}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Info Badge */}
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Expired Stock Level</p>
                  <p className="text-red-400 font-bold font-mono text-base">{selectedProduct.stockAvailable} {selectedProduct.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-medium">Cost Value</p>
                  <p className="text-skeuo-gold font-mono font-semibold">{formatCurrency(selectedProduct.costPrice * selectedProduct.stockAvailable)}</p>
                </div>
              </div>

              {/* Action Selection Tabs */}
              <div>
                <label className="skeuo-label block mb-2">Select Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('dispose')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      actionType === 'dispose'
                        ? 'bg-red-500/20 border-red-500/60 text-red-300 shadow-skeuo-led-red'
                        : 'bg-white/04 border-white/08 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Trash2 size={15} />
                    Dispose Stock
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('extend')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      actionType === 'extend'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-skeuo-led-amber'
                        : 'bg-white/04 border-white/08 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Calendar size={15} />
                    Extend Date
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('restock')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      actionType === 'restock'
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-skeuo-led-green'
                        : 'bg-white/04 border-white/08 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <RefreshCw size={15} />
                    Restock Batch
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs based on Action */}
              {actionType === 'dispose' && (
                <SkeuoInput
                  label="Disposal Reason / Notes"
                  id="disp-notes"
                  value={disposeNotes}
                  onChange={e => setDisposeNotes(e.target.value)}
                  placeholder="e.g. Expired past shelf life — damaged disposal"
                />
              )}

              {actionType === 'extend' && (
                <SkeuoInput
                  label="New Expiration Date"
                  id="new-exp-date"
                  type="date"
                  value={newExpiryDate}
                  onChange={e => setNewExpiryDate(e.target.value)}
                  required
                />
              )}

              {actionType === 'restock' && (
                <div className="space-y-3">
                  <SkeuoInput
                    label="Fresh Batch Restock Quantity"
                    id="restock-qty"
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={e => setRestockQty(e.target.value)}
                    required
                  />
                  <SkeuoInput
                    label="New Batch Expiry Date"
                    id="new-exp-batch"
                    type="date"
                    value={newExpiryDate}
                    onChange={e => setNewExpiryDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </SkeuoModal>
      )}
    </div>
  );
};
