import React from 'react';
import { motion } from 'framer-motion';
import { PackageX, Trash2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency, formatDate } from '../../utils';
import { v4 as uuidv4 } from 'uuid';

export const ExpiredProductsPage: React.FC = () => {
  const { products, adjustStock } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const today = new Date();
  const expiring30 = products.filter(p =>
    p.expiryDate && new Date(p.expiryDate) > today &&
    new Date(p.expiryDate) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  );
  const expired = products.filter(p => p.status === 'EXPIRED' || (p.expiryDate && new Date(p.expiryDate) < today));

  const handleDispose = (p: typeof products[0]) => {
    if (!currentUser) return;
    adjustStock(p.id, 'EXPIRED_DISPOSAL', p.stockAvailable, currentUser.id, currentUser.fullName, `DISP-${Date.now()}`, 'Expired disposal');
    logAudit(currentUser.id, currentUser.fullName, currentUser.role, 'STOCK_OUT', 'Product', p.id,
      `Expired disposal: ${p.name} (${p.stockAvailable} units)`);
  };

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
                <div key={p.id} className="bg-amber-500/08 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-200">{p.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{p.sku}</p>
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
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-red-500/04 transition-colors">
                  {/* Hazard stamp visual */}
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                    <PackageX size={16} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100">{p.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.sku} · Rack: {p.storageRackId}</p>
                    {p.expiryDate && <p className="text-xs text-red-400/80 mt-0.5">Expired: {formatDate(p.expiryDate)}</p>}
                  </div>
                  <div className="text-center flex-shrink-0">
                    <p className="text-xs text-gray-600">Stock</p>
                    <p className="text-lg font-bold text-red-400 font-mono">{p.stockAvailable}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-2">
                    <SkeuoBadge label="EXPIRED" status="EXPIRED" dot />
                    {p.stockAvailable > 0 && currentUser?.role === 'ADMIN' && (
                      <SkeuoButton variant="danger" size="xs" onClick={() => handleDispose(p)}>
                        <Trash2 size={11} /> Dispose
                      </SkeuoButton>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
