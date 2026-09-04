import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageX, Trash2, ChevronRight, AlertTriangle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency, formatDate } from '../../utils';
import type { Product } from '../../types';

export const ExpiredProductsPage: React.FC = () => {
  const { products, adjustStock } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const today = new Date();
  const expiring30 = products.filter(p =>
    p.expiryDate && new Date(p.expiryDate) > today &&
    new Date(p.expiryDate) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  );
  const expired = products.filter(p => p.status === 'EXPIRED' || (p.expiryDate && new Date(p.expiryDate) < today));

  const handleDispose = (p: Product, fromModal = false) => {
    if (!currentUser) return;
    adjustStock(p.id, 'EXPIRED_DISPOSAL', p.stockAvailable, currentUser.id, currentUser.fullName, `DISP-${Date.now()}`, 'Expired disposal');
    logAudit(currentUser.id, currentUser.fullName, currentUser.role, 'STOCK_OUT', 'Product', p.id,
      `Expired disposal: ${p.name} (${p.stockAvailable} units)`);
    if (fromModal) {
      setSuccessMsg(`Matagumpay na na-dispose ang ${p.name}!`);
      setTimeout(() => { setSuccessMsg(null); setSelectedProduct(null); }, 1800);
    }
  };

  const handleOpen = (p: Product) => { setSelectedProduct(p); setSuccessMsg(null); };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Expired Products" subtitle="Manage expired and expiring-soon inventory" />
      <div className="flex-1 p-8 space-y-6">
        {/* Expiring Soon */}
        {expiring30.length > 0 && (
          <div className="skeuo-panel border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-led-pulse-amber" />
              <h3 className="font-display font-semibold text-amber-400">Expiring Within 30 Days ({expiring30.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiring30.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleOpen(p)}
                  className="bg-amber-500/08 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/12 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] group select-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-200 group-hover:text-skeuo-gold transition-colors truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{p.sku}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-amber-400 font-semibold">Expires: {formatDate(p.expiryDate!)}</span>
                    <span className="text-gray-400">Qty: {p.stockAvailable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired Items */}
        <div className="skeuo-panel border border-red-500/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/06 flex items-center gap-3">
            <PackageX size={16} className="text-red-400" />
            <h3 className="font-display font-semibold text-red-400">Expired Items ({expired.length})</h3>
            <span className="text-xs text-gray-600">— Requires disposal action</span>
          </div>
          {expired.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <PackageX size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No expired items found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/04">
              {expired.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleOpen(p)}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-red-500/08 cursor-pointer transition-all duration-200 active:scale-[0.99] group select-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0 border border-red-500/30 group-hover:border-red-400/60 transition-colors">
                    <PackageX size={16} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100 group-hover:text-skeuo-gold transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.sku} · Rack: {p.storageRackId}</p>
                    {p.expiryDate && <p className="text-xs text-red-400/80 mt-0.5">Expired: {formatDate(p.expiryDate)}</p>}
                  </div>
                  <div className="text-center flex-shrink-0">
                    <p className="text-xs text-gray-600">Stock</p>
                    <p className="text-lg font-bold text-red-400 font-mono">{p.stockAvailable}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <SkeuoBadge label="EXPIRED" status="EXPIRED" dot />
                    <span className="text-[10px] text-gray-500 group-hover:text-skeuo-gold flex items-center gap-0.5 transition-colors">
                      Pindutin <ChevronRight size={11} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail / Dispose Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <SkeuoModal
            isOpen={!!selectedProduct}
            onClose={() => { setSelectedProduct(null); setSuccessMsg(null); }}
            title={selectedProduct.name}
            subtitle={`SKU: ${selectedProduct.sku} · Rack: ${selectedProduct.storageRackId}`}
            size="sm"
            footer={
              successMsg ? undefined : (
                <>
                  <SkeuoButton variant="ghost" size="sm" onClick={() => { setSelectedProduct(null); setSuccessMsg(null); }}>
                    Close
                  </SkeuoButton>
                  {selectedProduct.stockAvailable > 0 && currentUser?.role === 'ADMIN' && (
                    <SkeuoButton variant="danger" size="sm" onClick={() => handleDispose(selectedProduct, true)}>
                      <Trash2 size={13} /> Dispose ({selectedProduct.stockAvailable} units)
                    </SkeuoButton>
                  )}
                </>
              )
            }
          >
            <div className="space-y-4">
              {successMsg ? (
                <div className="py-8 text-center space-y-3">
                  <PackageX size={40} className="mx-auto text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-300">{successMsg}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/08 shadow-inner">
                    <span className="text-xs text-gray-400 font-medium">Status</span>
                    <SkeuoBadge label={selectedProduct.status} status={selectedProduct.status} dot />
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-red-300">
                        {selectedProduct.status === 'EXPIRED'
                          ? `Expired: ${formatDate(selectedProduct.expiryDate!)}`
                          : `Expiring: ${formatDate(selectedProduct.expiryDate!)}`}
                      </p>
                      <p className="text-gray-400 mt-0.5 leading-relaxed">
                        {selectedProduct.status === 'EXPIRED'
                          ? 'Ang produktong ito ay expired na. Kailangan itong i-dispose para maayos ang inventory.'
                          : 'Malapit na mag-expire ang produktong ito. Planuhin ang maagang paggamit o pagbebenta.'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Stock Available</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold font-mono text-red-400">{selectedProduct.stockAvailable}</span>
                        <span className="text-xs text-gray-500">{selectedProduct.unit}</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Cost Price</span>
                      <span className="text-lg font-bold font-mono text-gray-200 mt-1 block">{formatCurrency(selectedProduct.costPrice)}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/03 border border-white/06 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="text-gray-200 font-mono">{selectedProduct.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Selling Price:</span>
                      <span className="text-gray-200 font-mono">{formatCurrency(selectedProduct.sellingPrice)}</span>
                    </div>
                  </div>
                  {selectedProduct.stockAvailable > 0 && currentUser?.role === 'ADMIN' && (
                    <div className="p-3 rounded-xl bg-red-500/08 border border-red-500/25 text-xs text-red-300 flex items-start gap-2">
                      <Trash2 size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <p>I-click ang <strong className="text-red-200">Dispose</strong> para permanenteng alisin ang {selectedProduct.stockAvailable} {selectedProduct.unit} mula sa inventory.</p>
                    </div>
                  )}
                  {currentUser?.role !== 'ADMIN' && (
                    <div className="p-3 rounded-xl bg-gray-500/08 border border-gray-500/20 text-xs text-gray-400 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-gray-500 shrink-0 mt-0.5" />
                      <p>Ang disposal ay para lamang sa mga <strong className="text-gray-300">Admin</strong>.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </SkeuoModal>
        )}
      </AnimatePresence>
    </div>
  );
};
