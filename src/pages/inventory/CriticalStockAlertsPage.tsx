import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle, PackageX, AlertOctagon, Box, Plus, CheckCircle2,
  ArrowRight, Layers, Sparkles, ChevronRight, Warehouse
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';
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
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const oos = products.filter(p => p.status === 'OUT_OF_STOCK');
  const critical = products.filter(p => p.status === 'CRITICAL');

  const openRestockModal = (p: Product) => {
    setSelectedProduct(p);
    const neededAboveCritical = Math.max(0, p.criticalLevel - p.stockAvailable) + 5;
    const suggested = Math.max(neededAboveCritical, p.reorderQuantity || 10, 10);
    setRestockQty(suggested);
  };

  const handlePerformRestock = () => {
    if (!selectedProduct || restockQty <= 0) return;

    adjustStock(
      selectedProduct.id,
      'STOCK_IN',
      restockQty,
      currentUser?.id || 'admin',
      currentUser?.fullName || 'Authorized Admin',
      `RESTOCK-${Date.now().toString().slice(-4)}`,
      `Quick restock via Stock Alerts page (+${restockQty} ${selectedProduct.unit})`
    );

    const productName = selectedProduct.name;
    setSelectedProduct(null);
    setSuccessToast(`Matagumpay na nadagdagan ng +${restockQty} stock ang ${productName}!`);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Stock Alerts"
        subtitle="Out of stock and critical level notifications"
        actions={
          <SkeuoButton variant="gold" size="sm" onClick={() => navigate('/stock-io')}>
            <Box size={14} /> Go to Stock In / Out
          </SkeuoButton>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Success Toast / Notification Banner */}
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-sm font-semibold">{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs px-2 py-1">
              ✕
            </button>
          </motion.div>
        )}

        {/* OOS Alert Banner */}
        {oos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-red-500/40 bg-red-500/08 rounded-2xl p-5 shadow-skeuo-vault"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertOctagon size={20} className="text-red-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold text-red-400 text-lg">
                      OUT OF STOCK — {oos.length} Item{oos.length > 1 ? 's' : ''}
                    </h3>
                    <SkeuoLED status="red" size="lg" pulse />
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Pindutin ang alinmang item sa ibaba para mag-restock agad at maibalik ang fulfillment.
                  </p>
                </div>
              </div>
            </div>

            {/* Clickable Out of Stock Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {oos.map(p => (
                <div
                  key={p.id}
                  onClick={() => openRestockModal(p)}
                  className="bg-black/40 border border-red-500/25 hover:border-red-500/60 hover:bg-black/60 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between shadow-skeuo-card hover:shadow-lg"
                  title="Pindutin para mag-restock agad"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-100 group-hover:text-skeuo-gold transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          {p.sku} · {p.storageRackId}
                        </p>
                      </div>
                      <SkeuoBadge label="OUT OF STOCK" status="OUT_OF_STOCK" dot />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs mt-3 bg-white/03 p-2 rounded-lg border border-white/05">
                      <div>
                        <p className="text-gray-500 text-[10px]">Stock</p>
                        <p className="text-red-400 font-bold font-mono text-sm">0</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px]">Reorder</p>
                        <p className="text-gray-300 font-mono font-medium">{p.reorderQuantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px]">Cost</p>
                        <p className="text-gray-300 font-mono text-[11px] font-medium">{formatCurrency(p.costPrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Restock Prompt Button */}
                  <div className="mt-3 pt-2.5 border-t border-white/06 flex items-center justify-between text-xs text-skeuo-gold">
                    <span className="font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <Plus size={13} /> Quick Restock Now
                    </span>
                    <ChevronRight size={13} className="text-gray-500 group-hover:text-skeuo-gold transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Critical Alert Section */}
        {critical.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-amber-500/40 bg-amber-500/05 rounded-2xl p-5 shadow-skeuo-vault"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-amber-400 text-lg">
                    CRITICAL STOCK — {critical.length} Item{critical.length > 1 ? 's' : ''}
                  </h3>
                  <SkeuoLED status="amber" size="lg" pulse />
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  Mababa sa critical threshold ang mga sumusunod. Pindutin para madagdagan ang imbentaryo.
                </p>
              </div>
            </div>

            {/* Clickable Critical Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {critical.map(p => {
                const pct = Math.round((p.stockAvailable / Math.max(p.criticalLevel * 2, 1)) * 100);
                return (
                  <div
                    key={p.id}
                    onClick={() => openRestockModal(p)}
                    className="bg-black/40 border border-amber-500/25 hover:border-amber-500/50 hover:bg-black/60 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between shadow-skeuo-card hover:shadow-lg"
                    title="Pindutin para mag-restock agad"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-100 group-hover:text-skeuo-gold transition-colors">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {p.sku} · {p.storageRackId}
                          </p>
                        </div>
                        <SkeuoBadge label="CRITICAL" status="CRITICAL" dot />
                      </div>

                      {/* Analog progress bar */}
                      <div className="space-y-1.5 mb-3 bg-white/03 p-2 rounded-lg border border-white/05">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 text-[11px]">Stock Level</span>
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

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 text-[10px]">Reorder Qty</p>
                          <p className="text-gray-300 font-mono font-medium">{p.reorderQuantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px]">Cost Price</p>
                          <p className="text-gray-300 font-mono font-medium text-[11px]">{formatCurrency(p.costPrice)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Restock Prompt Button */}
                    <div className="mt-3 pt-2.5 border-t border-white/06 flex items-center justify-between text-xs text-skeuo-gold">
                      <span className="font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <Plus size={13} /> Quick Restock Now
                      </span>
                      <ChevronRight size={13} className="text-gray-500 group-hover:text-skeuo-gold transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State when all stocks are healthy */}
        {oos.length === 0 && critical.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-2xl border border-white/06 p-8"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-gray-200">All Stock Levels Healthy</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">
              Walang out of stock o kritikal na mga produkto sa warehouse sa kasalukuyan.
            </p>
            <div className="mt-5">
              <SkeuoButton variant="gold" size="sm" onClick={() => navigate('/inventory')}>
                <Warehouse size={14} /> View All Inventory
              </SkeuoButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Restock Modal */}
      {selectedProduct && (
        <SkeuoModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Restock: ${selectedProduct.name}`}
          subtitle={`SKU: ${selectedProduct.sku} · Rack: ${selectedProduct.storageRackId}`}
          size="sm"
          footer={
            <>
              <SkeuoButton variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                Cancel
              </SkeuoButton>
              <SkeuoButton variant="gold" size="sm" onClick={handlePerformRestock}>
                <Plus size={14} /> Add {restockQty} {selectedProduct.unit} to Stock
              </SkeuoButton>
            </>
          }
        >
          <div className="space-y-4">
            {/* Status & Available */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/08">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Current Stock</span>
                <span className={`text-xl font-bold font-mono ${selectedProduct.stockAvailable === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  {selectedProduct.stockAvailable} {selectedProduct.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/08">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Critical Threshold</span>
                <span className="text-xl font-bold font-mono text-gray-200">
                  {selectedProduct.criticalLevel} {selectedProduct.unit}
                </span>
              </div>
            </div>

            {/* Quantity Input */}
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
            <div className="flex items-center gap-2">
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

            {/* Info notice */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-200">Instant Update:</p>
                <p className="text-gray-400 mt-0.5 leading-relaxed">
                  Kapag pinindot ang button, awtomatikong magiging <strong>{selectedProduct.stockAvailable + restockQty} {selectedProduct.unit}</strong> ang stock at mawawala na ito sa out of stock list!
                </p>
              </div>
            </div>
          </div>
        </SkeuoModal>
      )}
    </div>
  );
};
