import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, Truck, DollarSign, AlertTriangle, Plus, Database, Sparkles, Layers } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoGauge } from '../../components/skeuomorphic/SkeuoGauge';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { LEDAlertPanel } from '../../components/skeuomorphic/SkeuoLED';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { formatCurrency } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } } };

interface KPICardProps { label: string; value: string; sub?: string; icon: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; color: string; }

const KPICard: React.FC<KPICardProps> = ({ label, value, sub, icon, trend, color }) => (
  <motion.div variants={item}
    className="skeuo-panel border border-white/08 rounded-2xl p-5 hover:border-skeuo-gold/20 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
        </div>
      )}
    </div>
    <p className="font-display font-bold text-2xl text-skeuo-chrome group-hover:text-skeuo-gold transition-colors">{value}</p>
    <p className="skeuo-label mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
  </motion.div>
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const products = useInventoryStore(s => s.products);
  const getAlerts = useInventoryStore(s => s.getAlertCounts);
  const seedDemo = useInventoryStore(s => s.seedDemoData);
  const resetEmpty = useInventoryStore(s => s.resetToEmpty);
  const monthlyReports = useFinancialStore(s => s.monthlyReports);
  const deliveries = useDeliveryStore(s => s.deliveries);
  const expenses = useFinancialStore(s => s.expenses);

  const alerts = getAlerts();
  const latest = monthlyReports[monthlyReports.length - 1];
  const totalStockValue = products.reduce((s, p) => s + p.stockAvailable * p.costPrice, 0);
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING' || d.status === 'DISPATCHED').length;
  const inStockPct = products.length > 0 ? Math.round((products.filter(p => p.status === 'IN_STOCK').length / products.length) * 100) : 100;

  const chartData = monthlyReports.slice(-6).map(r => ({
    month: r.month.slice(5),
    revenue: r.grossRevenue / 1000,
    profit: r.netProfit / 1000,
    expenses: r.totalExpenses / 1000,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Admin Command Center"
        subtitle="Full system overview and executive metrics"
        actions={
          <div className="flex items-center gap-2">
            {products.length === 0 ? (
              <SkeuoButton variant="ghost" size="xs" onClick={seedDemo}>
                <Sparkles size={12} className="text-skeuo-gold" />
                Load Sample Data
              </SkeuoButton>
            ) : (
              <SkeuoButton variant="ghost" size="xs" onClick={resetEmpty}>
                <Database size={12} className="text-red-400" />
                Reset to Empty
              </SkeuoButton>
            )}
            <SkeuoButton variant="gold" size="sm" onClick={() => navigate('/inventory')}>
              <Plus size={14} /> Add Product
            </SkeuoButton>
          </div>
        }
      />
      <div className="flex-1 p-8 space-y-6">
        {/* Alert LED Panel */}
        <LEDAlertPanel outOfStock={alerts.outOfStock} critical={alerts.critical} expired={alerts.expired} />

        {/* Empty State Welcome Card */}
        {products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="skeuo-panel border border-skeuo-gold/30 rounded-3xl p-8 text-center relative overflow-hidden bg-gradient-to-b from-[#22262f] via-[#1a1d24] to-[#121419]"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-skeuo-gold/15 border border-skeuo-gold/40 flex items-center justify-center mx-auto text-skeuo-gold shadow-skeuo-button">
                <Package size={28} />
              </div>
              <h2 className="font-brand font-bold text-2xl text-gray-100">
                Fresh Inventory Workspace Ready
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your inventory is currently empty and waiting for your items. Start by creating categories and adding your real products, or load sample data anytime for testing.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <SkeuoButton variant="gold" size="md" onClick={() => navigate('/inventory')}>
                  <Plus size={16} /> Add First Product
                </SkeuoButton>
                <SkeuoButton variant="metal" size="md" onClick={() => navigate('/categories')}>
                  <Layers size={16} /> Manage Categories
                </SkeuoButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* KPI Grid */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard label="Total Products" value={String(products.length)} icon={<Package size={18} />}
            trend="up" color="#3b82f6" sub={`${products.filter(p => p.status === 'IN_STOCK').length} in stock`} />
          <KPICard label="Stock Value" value={formatCurrency(totalStockValue)} icon={<DollarSign size={18} />}
            trend="up" color="#d4af37" sub="Cost valuation" />
          <KPICard label="Monthly Revenue" value={formatCurrency(latest?.grossRevenue || 0)} icon={<TrendingUp size={18} />}
            trend="up" color="#10b981" sub={latest?.month || 'Current'} />
          <KPICard label="Net Profit" value={formatCurrency(latest?.netProfit || 0)} icon={<TrendingUp size={18} />}
            trend={latest && latest.netProfit > 0 ? 'up' : 'neutral'} color="#8b5cf6" sub={latest ? `${latest.profitMarginPercent.toFixed(1)}% margin` : '0% margin'} />
          <KPICard label="Pending Deliveries" value={String(pendingDeliveries)} icon={<Truck size={18} />}
            trend="neutral" color="#f59e0b" sub="In transit or awaiting" />
          <KPICard label="Active Alerts" value={String(alerts.outOfStock + alerts.critical + alerts.expired)}
            icon={<AlertTriangle size={18} />} color="#ef4444" sub="Requires attention" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div variants={item} initial="hidden" animate="show"
            className="lg:col-span-2 skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-bold text-skeuo-chrome mb-1">Financial Performance</h3>
            <p className="skeuo-label mb-5">Revenue, Profit & Expenses (₱ thousands)</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1c1f26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
                    formatter={(v: number) => `₱${v}k`}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} opacity={0.8} name="Revenue" />
                  <Bar dataKey="profit" fill="#10b981" radius={[4,4,0,0]} opacity={0.85} name="Profit" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} opacity={0.7} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-500 text-xs border border-dashed border-white/08 rounded-xl">
                <TrendingUp size={24} className="text-gray-600 mb-2" />
                <p>Financial charts will populate as deliveries and sales are recorded.</p>
              </div>
            )}
          </motion.div>

          {/* Analog Gauges */}
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-bold text-skeuo-chrome mb-1">Stock Health</h3>
            <p className="skeuo-label mb-4">Real-time gauges</p>
            <div className="flex flex-col items-center gap-5">
              <SkeuoGauge value={inStockPct} label="In-Stock Rate" unit="%" warningThreshold={60} criticalThreshold={30} size="md" />
              <SkeuoGauge value={Math.round(latest?.profitMarginPercent || 0)} label="Profit Margin" unit="%" warningThreshold={15} criticalThreshold={5} size="md" />
            </div>
          </motion.div>
        </div>

        {/* Critical Alerts Table */}
        {(alerts.outOfStock + alerts.critical + alerts.expired) > 0 && (
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-led-pulse-red" />
              <h3 className="font-display font-bold text-red-400">Immediate Attention Required</h3>
              <SkeuoBadge label={String(alerts.outOfStock + alerts.critical + alerts.expired)} variant="metal" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {products.filter(p => p.status !== 'IN_STOCK').slice(0, 6).map(p => (
                <div key={p.id} className="bg-black/30 border border-white/06 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-200 truncate">{p.name}</p>
                    <SkeuoBadge label={p.status} status={p.status} dot />
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                  <p className="text-xs text-gray-400 mt-1">Stock: <span className="font-bold text-gray-200">{p.stockAvailable}</span> / Critical: {p.criticalLevel}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
