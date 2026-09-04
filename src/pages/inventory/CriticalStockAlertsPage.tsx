import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, PackageX, AlertOctagon, Plus, Box,
  CheckCircle2, ArrowRight, ChevronRight
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency } from '../../utils';
import type { Product } from '../../types';

export const CriticalStockAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const products = useInventoryStore(s => s.products);
  const adjustStock = useInventoryStore(s => s.adjustStock);
  const currentUser = useAuthStore(s => s.currentUser);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const oos = products.filter(p => p.status === 'OUT_OF_STOCK');
  const critical = products.filter(p => p.status === 'CRITICAL');

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p);
    const neededAboveCritical = Math.max(0, p.criticalLevel - p.stockAvailable) + 5;
    const suggested = Math.max(neededAboveCritical, p.reorderQuantity || 10, 10);
    setRestockQty(suggested);
  };

  const handlePerformRestock = (qtyToRestock?: number) => {
    if (!selectedProduct) return;
    const qty = qtyToRestock || restockQty || 10;
    adjustStock(
      selectedProduct.id,
      'STOCK_IN',
      qty,
      currentUser?.id || 'admin',
      currentUser?.fullName || 'User',
      `RESTOCK-${Date.now().toString().slice(-4)}`,
      `Restocked from Stock Alerts page (+${qty} ${selectedProduct.unit})`
    );
    const pName = selectedProduct.name;
    const pUnit = selectedProduct.unit;
    setSelectedProduct(null);
    setSuccessNotice(`Matagumpay na nagdagdag ng +${qty} ${pUnit} sa ${pName}!`);
  };

  const handleQuickRestockCard = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    const neededAboveCritical = Math.max(0, p.criticalLevel - p.stockAvailable) + 5;
    const qty = Math.max(neededAboveCritical, p.reorderQuantity || 10, 10);
    adjustStock(
      p.id,
      'STOCK_IN',
      qty,
      currentUser?.id || 'admin',
      currentUser?.fullName || 'User',
      `RESTOCK-${Date.now().toString().slice(-4)}`,
      `Quick restocked from Stock Alerts page (+${qty} ${p.unit})`
    );
    setSuccessNotice(`Matagumpay na nagdagdag ng +${qty} ${p.unit} sa ${p.name}!`);
    if (selectedProduct?.id === p.id) {
      setSelectedProduct(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Stock Alerts"
        subtitle="Out of stock and critical level notifications"
        actions={
          <SkeuoButton
            variant="gold"
            size="sm"
            onClick={() => navigate('/stock-io')}
          >
            <Box size={14} /> Go to Stock In / Out
          </SkeuoButton>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Success Alert Banner */}
        <AnimatePresence>
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-200">{successNotice}</p>
              </div>
              <button
                onClick={() => setSuccessNotice(null)}
                className="text-emerald-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OOS Alert Banner */}
        {oos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-red-500/40 bg-red-500/08 rounded-2xl p-5 shadow-skeuo-card"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertOctagon size={20} className="text-red-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display font-bold text-red-400 text-lg">
                    OUT OF STOCK — {oos.length} Item{oos.length > 1 ? 's' : ''}
                  </h3>
                  <SkeuoLED status="red" size="lg" pulse />
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Immediate restocking required. Pindutin ang kahit anong item para mag-restock.
                </p>
              </div>
            </div>

            {/* Clickable Out of Stock Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {oos.map(p => {
                const suggestedRestock = Math.max(p.reorderQuantity || 10, 10);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProduct(p)}
                    className="bg-black/40 border border-red-500/25 hover:border-red-500/70 hover:bg-black/60 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between shadow-skeuo-card hover:shadow-lg hover:shadow-red-500/10 select-none"
                    title="Pindutin para makita ang details at mag-restock"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-100 group-hover:text-skeuo-gold transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {p.sku} · {p.storageRackId}
                          </p>
                        </div>
                        <SkeuoBadge label="OUT OF STOCK" status="OUT_OF_STOCK" dot />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs mt-3 p-2 bg-black/30 rounded-lg border border-white/05">
                        <div>
                          <p className="text-gray-500 text-[10px]">Stock</p>
                          <p className="text-red-400 font-bold font-mono text-sm">0</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px]">Reorder</p>
                          <p className="text-gray-200 font-mono text-sm">{p.reorderQuantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px]">Cost</p>
                          <p className="text-gray-300 font-mono text-xs truncate">{formatCurrency(p.costPrice)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Restock action footer */}
                    <div className="mt-3 pt-2.5 border-t border-white/06 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400 group-hover:text-skeuo-gold flex items-center gap-0.5 transition-colors">
                        Pindutin para i-restock <ChevronRight size={12} />
                      </span>
                      <button
                        onClick={(e) => handleQuickRestockCard(e, p)}
                        className="text-xs bg-red-500/20 hover:bg-red-500/35 text-red-300 hover:text-red-100 border border-red-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all active:scale-95 shadow-sm"
                        title="Magdagdag agad ng stock"
                      >
                        <Plus size={12} /> Restock (+{suggestedRestock})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Critical Alert Section */}
        {critical.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-amber-500/40 bg-amber-500/05 rounded-2xl p-5 shadow-skeuo-card"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display font-bold text-amber-400 text-lg">
                    CRITICAL STOCK — {critical.length} Item{critical.length > 1 ? 's' : ''}
                  </h3>
                  <SkeuoLED status="amber" size="lg" pulse />
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Stock levels are below critical threshold. Pindutin ang item para mag-restock.
                </p>
              </div>
            </div>

            {/* Clickable Critical Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {critical.map(p => {
                const pct = Math.round((p.stockAvailable / Math.max(p.criticalLevel * 2, 1)) * 100);
                const suggestedRestock = Math.max(p.criticalLevel - p.stockAvailable + 5, p.reorderQuantity || 10, 10);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProduct(p)}
                    className="bg-black/40 border border-amber-500/20 hover:border-amber-500/60 hover:bg-black/60 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between shadow-skeuo-card hover:shadow-lg hover:shadow-amber-500/10 select-none"
                    title="Pindutin para makita ang details at mag-restock"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-100 group-hover:text-skeuo-gold transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {p.sku} · {p.storageRackId}
                          </p>
                        </div>
                        <SkeuoBadge label="CRITICAL" status="CRITICAL" dot />
                      </div>

                      {/* Analog progress bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Stock Level</span>
                          <span className="text-amber-400 font-mono font-bold">
                            {p.stockAvailable} / {p.criticalLevel} (min)
                          </span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden shadow-skeuo-inset">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, pct)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs p-2 bg-black/30 rounded-lg border border-white/05">
                        <div>
                          <p className="text-gray-500 text-[10px]">Reorder Qty</p>
                          <p className="text-gray-200 font-mono text-sm">{p.reorderQuantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px]">Cost Price</p>
                          <p className="text-gray-300 font-mono text-xs truncate">{formatCurrency(p.costPrice)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Restock action footer */}
                    <div className="mt-3 pt-2.5 border-t border-white/06 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400 group-hover:text-skeuo-gold flex items-center gap-0.5 transition-colors">
                        Pindutin para i-restock <ChevronRight size={12} />
                      </span>
                      <button
                        onClick={(e) => handleQuickRestockCard(e, p)}
                        className="text-xs bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 hover:text-amber-100 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all active:scale-95 shadow-sm"
                        title="Magdagdag agad ng stock"
                      >
                        <Plus size={12} /> Restock (+{suggestedRestock})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {oos.length === 0 && critical.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <PackageX size={32} className="text-emerald-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-skeuo-chrome mb-2">
              All Stock Levels Normal
            </h3>
            <p className="text-gray-500 text-sm">
              No critical or out-of-stock items detected.
            </p>
            <SkeuoLED status="green" size="lg" label="All systems operational" className="mt-4" />
          </motion.div>
        )}
      </div>

      {/* Product Restock & Details Modal */}
      {selectedProduct && (
        <SkeuoModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Restock: ${selectedProduct.name}`}
          subtitle={`SKU: ${selectedProduct.sku} · Storage Location: ${selectedProduct.storageRackId}`}
          size="sm"
          footer={
            <>
              <SkeuoButton variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                Cancel
              </SkeuoButton>
              <SkeuoButton
                variant="gold"
                size="sm"
                onClick={() => handlePerformRestock(restockQty)}
              >
                <Plus size={14} /> I-Restock (+{restockQty} {selectedProduct.unit})
              </SkeuoButton>
            </>
          }
        >
          <div className="space-y-4">
            {/* Status overview */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/08 shadow-inner">
              <span className="text-xs text-gray-400 font-medium">Current Stock Status</span>
              <SkeuoBadge label={selectedProduct.status} status={selectedProduct.status} dot />
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Available Stock</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-bold font-mono ${selectedProduct.stockAvailable === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedProduct.stockAvailable}
                  </span>
                  <span className="text-xs text-gray-500">{selectedProduct.unit}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Critical Level</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {selectedProduct.criticalLevel}
                  </span>
                  <span className="text-xs text-gray-500">{selectedProduct.unit}</span>
                </div>
              </div>
            </div>

            {/* Restock Quantity Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Dami ng idadagdag (Quantity to Add) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-lg font-bold font-mono text-skeuo-gold outline-none focus:border-skeuo-gold"
                />
                <span className="text-sm font-semibold text-gray-400 px-2 font-mono">
                  {selectedProduct.unit}
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Presets:</span>
              {[5, 10, 20, 50].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setRestockQty(qty)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                    restockQty === qty
                      ? 'bg-skeuo-gold text-black font-bold border-yellow-600'
                      : 'bg-white/04 border-white/08 text-gray-400 hover:text-white hover:bg-white/08'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>

            {/* Product Meta */}
            <div className="p-3 rounded-xl bg-white/03 border border-white/06 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Unit of Measure:</span>
                <span className="text-gray-200 font-mono font-semibold">{selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost Price:</span>
                <span className="text-gray-200 font-mono">{formatCurrency(selectedProduct.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Standard Reorder Qty:</span>
                <span className="text-gray-200 font-mono font-semibold">
                  {selectedProduct.reorderQuantity} {selectedProduct.unit}
                </span>
              </div>
            </div>

            {/* Go to full stock in/out page link */}
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  navigate('/stock-io', { state: { selectedProductId: selectedProduct.id } });
                  setSelectedProduct(null);
                }}
                className="text-xs text-skeuo-gold hover:text-yellow-300 hover:underline flex items-center gap-1.5 py-1"
              >
                <Box size={13} /> Buksan sa buong Stock In / Out form <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </SkeuoModal>
      )}
    </div>
  );
};
