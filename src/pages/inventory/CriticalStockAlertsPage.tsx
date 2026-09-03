import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, PackageX, AlertOctagon } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { useInventoryStore } from '../../store/useInventoryStore';
import { formatCurrency } from '../../utils';

export const CriticalStockAlertsPage: React.FC = () => {
  const products = useInventoryStore(s => s.products);
  const oos = products.filter(p => p.status === 'OUT_OF_STOCK');
  const critical = products.filter(p => p.status === 'CRITICAL');

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Stock Alerts" subtitle="Out of stock and critical level notifications" />
      <div className="flex-1 p-8 space-y-6">
        {/* OOS Alert Banner */}
        {oos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-red-500/40 bg-red-500/08 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertOctagon size={20} className="text-red-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-red-400 text-lg">OUT OF STOCK — {oos.length} Item{oos.length > 1 ? 's' : ''}</h3>
                  <SkeuoLED status="red" size="lg" pulse />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Immediate restocking required to resume fulfillment.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {oos.map(p => (
                <div key={p.id} className="bg-black/40 border border-red-500/25 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-100">{p.name}</p>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">{p.sku} · {p.storageRackId}</p>
                    </div>
                    <SkeuoBadge label="OUT OF STOCK" status="OUT_OF_STOCK" dot />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div><p className="text-gray-600">Stock</p><p className="text-red-400 font-bold font-mono">0</p></div>
                    <div><p className="text-gray-600">Reorder</p><p className="text-gray-300 font-mono">{p.reorderQuantity}</p></div>
                    <div><p className="text-gray-600">Cost</p><p className="text-gray-300 font-mono text-[10px]">{formatCurrency(p.costPrice)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Critical Alert Section */}
        {critical.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="border border-amber-500/40 bg-amber-500/05 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-amber-400 text-lg">CRITICAL STOCK — {critical.length} Item{critical.length > 1 ? 's' : ''}</h3>
                  <SkeuoLED status="amber" size="lg" pulse />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Stock levels are below critical threshold — plan restocking soon.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {critical.map(p => {
                const pct = Math.round((p.stockAvailable / Math.max(p.criticalLevel * 2, 1)) * 100);
                return (
                  <div key={p.id} className="bg-black/40 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-100">{p.name}</p>
                        <p className="text-xs text-gray-600 font-mono mt-0.5">{p.sku} · {p.storageRackId}</p>
                      </div>
                      <SkeuoBadge label="CRITICAL" status="CRITICAL" dot />
                    </div>
                    {/* Analog progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Stock Level</span>
                        <span className="text-amber-400 font-mono font-bold">{p.stockAvailable} / {p.criticalLevel} (min)</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden shadow-skeuo-inset">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div><p className="text-gray-600">Reorder Qty</p><p className="text-gray-300 font-mono">{p.reorderQuantity}</p></div>
                      <div><p className="text-gray-600">Cost Price</p><p className="text-gray-300 font-mono text-[10px]">{formatCurrency(p.costPrice)}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {oos.length === 0 && critical.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <PackageX size={32} className="text-emerald-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-skeuo-chrome mb-2">All Stock Levels Normal</h3>
            <p className="text-gray-500 text-sm">No critical or out-of-stock items detected.</p>
            <SkeuoLED status="green" size="lg" label="All systems operational" className="mt-4" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
