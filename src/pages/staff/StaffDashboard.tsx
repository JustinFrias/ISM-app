import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, TrendingUp, AlertTriangle, Box, BarChart3, ClipboardList } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, formatDate } from '../../utils';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

export const StaffDashboard: React.FC = () => {
  const products = useInventoryStore(s => s.products);
  const movements = useInventoryStore(s => s.movements);
  const deliveries = useDeliveryStore(s => s.deliveries);
  const currentUser = useAuthStore(s => s.currentUser);
  const getAlerts = useInventoryStore(s => s.getAlertCounts);
  const alerts = getAlerts();

  const todayDeliveries = deliveries.filter(d => d.status === 'PENDING' || d.status === 'DISPATCHED');
  const recentMovements = movements.slice(0, 5);
  const criticalItems = products.filter(p => p.status === 'CRITICAL' || p.status === 'OUT_OF_STOCK').slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={`Welcome, ${currentUser?.fullName}`} subtitle="Your operational workspace for today" />
      <div className="flex-1 p-8 space-y-6">

        {/* Quick Stats Row */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: products.length, icon: <Package size={18} />, color: '#3b82f6' },
            { label: 'Pending Deliveries', value: todayDeliveries.length, icon: <Truck size={18} />, color: '#f59e0b' },
            { label: 'Critical Stock', value: alerts.critical + alerts.outOfStock, icon: <AlertTriangle size={18} />, color: '#ef4444' },
            { label: "Today's Movements", value: recentMovements.length, icon: <BarChart3 size={18} />, color: '#10b981' },
          ].map(stat => (
            <motion.div key={stat.label} variants={item}
              className="skeuo-panel border border-white/08 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="font-display font-bold text-xl text-skeuo-chrome">{stat.value}</p>
                <p className="skeuo-label">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Stock Movements */}
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/06 flex items-center gap-3">
              <Box size={16} className="text-skeuo-gold" />
              <h3 className="font-display font-semibold text-skeuo-chrome">Recent Stock Movements</h3>
            </div>
            <div className="divide-y divide-white/04">
              {recentMovements.map((mv, i) => (
                <motion.div key={mv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-6 py-3.5 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {mv.type.includes('IN') || mv.type === 'RETURN' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{mv.productName}</p>
                    <p className="text-xs text-gray-500 font-mono">{mv.referenceNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {mv.type === 'STOCK_IN' || mv.type === 'RETURN' ? '+' : '-'}{mv.quantity}
                    </p>
                    <p className="text-[10px] text-gray-600">{formatDate(mv.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Deliveries */}
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/06 flex items-center gap-3">
              <Truck size={16} className="text-skeuo-gold" />
              <h3 className="font-display font-semibold text-skeuo-chrome">Active Deliveries</h3>
            </div>
            <div className="divide-y divide-white/04">
              {todayDeliveries.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <ClipboardList size={32} className="mx-auto text-gray-700 mb-2" />
                  <p className="text-gray-600 text-sm">No active deliveries</p>
                </div>
              ) : todayDeliveries.map((del, i) => (
                <motion.div key={del.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{del.recipientName}</p>
                    <p className="text-xs text-gray-500 font-mono">{del.deliveryNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <SkeuoBadge label={del.status} status={del.status} dot />
                    <p className="text-xs text-gray-600">{formatCurrency(del.totalAmount)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Critical Stock Alerts */}
        {criticalItems.length > 0 && (
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-led-pulse-amber" />
              <h3 className="font-display font-semibold text-amber-400">Stock Attention Required</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {criticalItems.map(p => (
                <div key={p.id} className="bg-black/30 border border-white/06 rounded-xl p-3 space-y-1">
                  <SkeuoBadge label={p.status} status={p.status} dot />
                  <p className="text-xs font-semibold text-gray-200 truncate mt-1">{p.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                  <p className="text-xs text-gray-400">Qty: <strong>{p.stockAvailable}</strong></p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
