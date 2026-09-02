import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, PackageX, AlertOctagon, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency } from '../../utils';
import type { Product } from '../../types';

export const CriticalStockAlertsPage: React.FC = () => {
  const { products, adjustStock } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const oos = products.filter(p => p.status === 'OUT_OF_STOCK');
  const critical = products.filter(p => p.status === 'CRITICAL');

  // Restock Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<string>('');
  const [refNumber, setRefNumber] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const openRestockModal = (p: Product) => {
    setSelectedProduct(p);
    setRestockQty(String(p.reorderQuantity || 10));
    setRefNumber(`RESTOCK-PO-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleConfirmRestock = () => {
    if (!selectedProduct || !restockQty || !refNumber || !currentUser) return;
    const qty = Number(restockQty);
    if (qty <= 0) return;

    adjustStock(
      selectedProduct.id,
      'STOCK_IN',
      qty,
      currentUser.id,
      currentUser.fullName,
      refNumber,
      `Quick restock alert resolution for ${selectedProduct.sku}`
    );

    logAudit(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'STOCK_IN',
      'Product',
      selectedProduct.id,
      `Restocked ${qty} units for ${selectedProduct.name} (${selectedProduct.sku})`
    );

    setSuccessMsg(`Successfully added ${qty} units to ${selectedProduct.name}!`);
    setTimeout(() => {
      setSuccessMsg('');
      setSelectedProduct(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Stock Alerts" subtitle="Out of stock and critical level notifications — Click any card to Restock" />

      <div className="flex-1 p-8 space-y-6">
        {/* Out of Stock Section */}
        {oos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-red-500/40 bg-red-500/08 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <AlertOctagon size={20} className="text-red-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-red-400 text-lg">OUT OF STOCK — {oos.length} Item{oos.length > 1 ? 's' : ''}</h3>
                  <SkeuoLED status="red" size="lg" pulse />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Click any card below to open the quick restock panel.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {oos.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openRestockModal(p)}
                  className="bg-black/50 border border-red-500/30 hover:border-red-400/80 rounded-xl p-4 cursor-pointer transition-all shadow-md hover:shadow-red-500/20 group relative overflow-hidden"
                >
                  {/* Glowing hover light */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/05 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-100 group-hover:text-red-300 transition-colors">{p.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{p.sku} · Rack: {p.storageRackId}</p>
                    </div>
                    <SkeuoBadge label="OUT OF STOCK" status="OUT_OF_STOCK" dot />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-3.5 mb-3">
                    <div><p className="text-gray-500 text-[10px]">Stock</p><p className="text-red-400 font-bold font-mono text-base">0</p></div>
                    <div><p className="text-gray-500 text-[10px]">Reorder Qty</p><p className="text-gray-300 font-mono font-semibold">{p.reorderQuantity}</p></div>
                    <div><p className="text-gray-500 text-[10px]">Cost Price</p><p className="text-gray-300 font-mono text-[11px]">{formatCurrency(p.costPrice)}</p></div>
                  </div>

                  <div className="pt-2.5 border-t border-white/06 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-red-400 font-medium group-hover:underline">Click to Restock</span>
                    <SkeuoButton variant="danger" size="xs" className="pointer-events-none">
                      <RefreshCw size={11} className="mr-1 group-hover:rotate-180 transition-transform duration-500" /> Restock Now
                    </SkeuoButton>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Critical Stock Section */}
        {critical.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="border border-amber-500/40 bg-amber-500/05 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-amber-400 text-lg">CRITICAL STOCK — {critical.length} Item{critical.length > 1 ? 's' : ''}</h3>
                  <SkeuoLED status="amber" size="lg" pulse />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Stock levels are below threshold. Click any card to apply stock adjustment.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {critical.map(p => {
                const pct = Math.round((p.stockAvailable / Math.max(p.criticalLevel * 2, 1)) * 100);
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openRestockModal(p)}
                    className="bg-black/50 border border-amber-500/25 hover:border-amber-400/80 rounded-xl p-4 cursor-pointer transition-all shadow-md hover:shadow-amber-500/20 group relative overflow-hidden"
                  >
                    {/* Glowing hover light */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/05 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-100 group-hover:text-amber-300 transition-colors">{p.name}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{p.sku} · Rack: {p.storageRackId}</p>
                      </div>
                      <SkeuoBadge label="CRITICAL" status="CRITICAL" dot />
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Stock Level</span>
                        <span className="text-amber-400 font-mono font-bold">{p.stockAvailable} / {p.criticalLevel} (min)</span>
                      </div>
                      <div className="h-2 bg-black/60 rounded-full overflow-hidden shadow-skeuo-inset border border-white/06">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div><p className="text-gray-500 text-[10px]">Reorder Qty</p><p className="text-gray-300 font-mono font-semibold">{p.reorderQuantity}</p></div>
                      <div><p className="text-gray-500 text-[10px]">Cost Price</p><p className="text-gray-300 font-mono text-[11px]">{formatCurrency(p.costPrice)}</p></div>
                    </div>

                    <div className="pt-2.5 border-t border-white/06 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 font-medium group-hover:underline">Click to Restock</span>
                      <SkeuoButton variant="gold" size="xs" className="pointer-events-none">
                        <RefreshCw size={11} className="mr-1 group-hover:rotate-180 transition-transform duration-500" /> Restock
                      </SkeuoButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state when no alerts */}
        {oos.length === 0 && critical.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <PackageX size={32} className="text-emerald-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-skeuo-chrome mb-2">All Stock Levels Operational</h3>
            <p className="text-gray-500 text-sm">No critical or out-of-stock items detected in inventory.</p>
            <SkeuoLED status="green" size="lg" label="Inventory Status Optimal" className="mt-4" />
          </motion.div>
        )}
      </div>

      {/* Interactive Quick Restock Modal */}
      {selectedProduct && (
        <SkeuoModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Restock Product — ${selectedProduct.name}`}
          subtitle={`SKU: ${selectedProduct.sku} · Storage Rack: ${selectedProduct.storageRackId}`}
          size="md"
          footer={
            successMsg ? null : (
              <>
                <SkeuoButton variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </SkeuoButton>
                <SkeuoButton
                  variant="gold"
                  size="sm"
                  onClick={handleConfirmRestock}
                  ledStatus="green"
                >
                  <RefreshCw size={14} className="mr-1" /> Confirm Restock
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
              {/* Product Info Card */}
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/08 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Current Stock</p>
                  <p className={`font-bold font-mono text-sm ${selectedProduct.stockAvailable === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedProduct.stockAvailable} units
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Min Critical Level</p>
                  <p className="font-bold font-mono text-sm text-gray-300">
                    {selectedProduct.criticalLevel} units
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Recommended Reorder</p>
                  <p className="font-bold font-mono text-sm text-skeuo-gold">
                    {selectedProduct.reorderQuantity} units
                  </p>
                </div>
              </div>

              <SkeuoInput
                label="Restock Quantity to Add"
                id="restock-qty"
                type="number"
                min="1"
                value={restockQty}
                onChange={e => setRestockQty(e.target.value)}
                required
              />

              <SkeuoInput
                label="Reference PO / Adjustment Number"
                id="restock-ref"
                value={refNumber}
                onChange={e => setRefNumber(e.target.value)}
                required
              />
            </div>
          )}
        </SkeuoModal>
      )}
    </div>
  );
};
