import React from 'react';
import { motion } from 'framer-motion';
import { Truck, BarChart3, Package } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { formatCurrency } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const TotalProductsDeliveryPage: React.FC = () => {
  const { deliveries } = useDeliveryStore();

  const totalItems = deliveries.reduce((s, d) => s + d.totalQuantity, 0);
  const totalValue = deliveries.reduce((s, d) => s + d.totalAmount, 0);
  const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;
  const pending = deliveries.filter(d => d.status === 'PENDING').length;
  const dispatched = deliveries.filter(d => d.status === 'DISPATCHED').length;

  // Per-delivery bar chart
  const chartData = deliveries.map(d => ({
    number: d.deliveryNumber.split('-').pop(),
    items: d.totalQuantity,
    value: d.totalAmount / 1000,
    status: d.status,
  }));

  const statusColors: Record<string, string> = {
    DELIVERED: '#10b981', DISPATCHED: '#3b82f6', PENDING: '#f59e0b', CANCELLED: '#ef4444', RETURNED: '#8b5cf6',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Total Products Delivery" subtitle="Cumulative delivery metrics and item volumes" />
      <div className="flex-1 p-8 space-y-6">
        {/* Odometer-style counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Deliveries', value: deliveries.length, icon: <Truck size={20} />, color: '#d4af37' },
            { label: 'Total Items Shipped', value: totalItems, icon: <Package size={20} />, color: '#3b82f6' },
            { label: 'Total Revenue', value: formatCurrency(totalValue), icon: <BarChart3 size={20} />, color: '#10b981', isString: true },
            { label: 'Completed', value: delivered, icon: <Truck size={20} />, color: '#10b981' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
              className="skeuo-panel border border-white/08 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <motion.p className="font-display font-black text-3xl text-skeuo-chrome"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.2 }}>
                {stat.isString ? stat.value : (
                  <motion.span initial={{ innerHTML: '0' } as any}
                    animate={{ innerHTML: String(stat.value) } as any}
                    transition={{ duration: 0.8, ease: 'easeOut' }}>
                    {stat.value}
                  </motion.span>
                )}
              </motion.p>
              <p className="skeuo-label mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Status distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-skeuo-chrome mb-5">Delivery Volume by Order</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1c1f26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                <Bar dataKey="items" radius={[4,4,0,0]} name="Items">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={statusColors[entry.status] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-skeuo-chrome mb-5">Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(statusColors).map(([status, color]) => {
                const count = deliveries.filter(d => d.status === status).length;
                const pct = deliveries.length > 0 ? (count / deliveries.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color }}>{status}</span>
                      <span className="text-gray-500 font-mono">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden shadow-skeuo-inset">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                        className="h-full rounded-full" style={{ background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
