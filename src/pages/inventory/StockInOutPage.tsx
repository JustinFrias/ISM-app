import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, History, RefreshCw } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput, SkeuoSelect, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatDateTime } from '../../utils';
import type { MovementType } from '../../types';

import { SkeuoSearchableSelect, SearchableOption } from '../../components/skeuomorphic/SkeuoSearchableSelect';

export const StockInOutPage: React.FC = () => {
  const { products, movements, adjustStock } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const [productId, setProductId] = useState('');
  const [type, setType] = useState<MovementType>('STOCK_IN');
  const [quantity, setQuantity] = useState('');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const selectedProduct = products.find(p => p.id === productId);

  const productOptions: SearchableOption[] = products.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: p.sku,
    badge: `${p.stockAvailable} available`,
    badgeColor: p.stockAvailable === 0 ? 'red' : p.stockAvailable <= p.criticalLevel ? 'amber' : 'emerald',
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || !ref || !currentUser) return;
    adjustStock(productId, type, Number(quantity), currentUser.id, currentUser.fullName, ref, notes);
    logAudit(currentUser.id, currentUser.fullName, currentUser.role, type === 'STOCK_IN' ? 'STOCK_IN' : 'STOCK_OUT',
      'Product', productId, `${type} ${quantity} units — ${selectedProduct?.name}`, { ref, notes });
    setDone(true);
    setTimeout(() => { setDone(false); setQuantity(''); setRef(''); setNotes(''); }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Stock In / Out" subtitle="Adjust stock quantities with a reference number" />
      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adjustment Form */}
          <div className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-bold text-skeuo-chrome mb-5">Stock Adjustment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <SkeuoSearchableSelect
                label="Product"
                id="sa-product"
                value={productId}
                onChange={setProductId}
                options={productOptions}
                placeholder="Search product by SKU or name..."
                required
              />

              {/* Type selectors — physical lever switches */}
              <div>
                <label className="skeuo-label block mb-2">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'EXPIRED_DISPOSAL'] as MovementType[]).map(t => (
                    <motion.button key={t} type="button" whileTap={{ scale: 0.96 }}
                      onClick={() => setType(t)}
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
                        type === t
                          ? t === 'STOCK_IN' || t === 'RETURN' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-skeuo-led-green'
                            : 'bg-red-500/20 border-red-500/50 text-red-300 shadow-skeuo-led-red'
                          : 'bg-white/04 border-white/08 text-gray-500 hover:border-white/15'
                      }`}>
                      {t === 'STOCK_IN' || t === 'RETURN' ? <ArrowUpCircle size={13} /> : <ArrowDownCircle size={13} />}
                      {t.replace('_', ' ')}
                    </motion.button>
                  ))}
                </div>
              </div>

              <SkeuoInput label="Quantity" id="sa-qty" type="number" min="1" value={quantity}
                onChange={e => setQuantity(e.target.value)} required />
              <SkeuoInput label="Reference Number (PO/SO/ADJ)" id="sa-ref" value={ref}
                onChange={e => setRef(e.target.value)} placeholder="e.g. PO-2026-1234" required />
              <SkeuoTextarea label="Notes" id="sa-notes" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional remarks..." rows={2} />

              <SkeuoButton type="submit" variant={type === 'STOCK_IN' || type === 'RETURN' ? 'success' : 'danger'}
                size="md" className="w-full" isLoading={false}
                ledStatus={type === 'STOCK_IN' || type === 'RETURN' ? 'green' : 'red'}>
                {done ? '✓ Adjustment Recorded!' : `Apply ${type.replace('_', ' ')}`}
              </SkeuoButton>
            </form>

            {/* Current product info */}
            {selectedProduct && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 bg-black/30 border border-white/08 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-200">{selectedProduct.name}</p>
                  <SkeuoBadge label={selectedProduct.status.replace('_', ' ')} status={selectedProduct.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-gray-600">Available</p><p className="font-bold text-skeuo-chrome font-mono">{selectedProduct.stockAvailable}</p></div>
                  <div><p className="text-gray-600">Critical Level</p><p className="font-bold text-amber-400 font-mono">{selectedProduct.criticalLevel}</p></div>
                  <div><p className="text-gray-600">Rack</p><p className="font-bold text-gray-300 font-mono">{selectedProduct.storageRackId}</p></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Movement History */}
          <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/06 flex items-center gap-3">
              <History size={16} className="text-skeuo-gold" />
              <h3 className="font-display font-semibold text-skeuo-chrome">Recent Movement History</h3>
            </div>
            <div className="overflow-y-auto max-h-[480px] divide-y divide-white/04">
              {movements
                .filter(mv => {
                  if (mv.type === 'EXPIRED_DISPOSAL') {
                    const prod = products.find(p => p.id === mv.productId);
                    if (prod && prod.stockAvailable > 0) return false;
                  }
                  return true;
                })
                .slice(0, 20)
                .map((mv, i) => (
                <motion.div key={mv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="px-6 py-3 flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">{mv.productName}</p>
                    <p className="text-[10px] text-gray-600 font-mono">{mv.type.replace('_', ' ')} · {mv.referenceNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold font-mono ${mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? '+' : '-'}{mv.quantity}
                    </p>
                    <p className="text-[10px] text-gray-600">{formatDateTime(mv.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
