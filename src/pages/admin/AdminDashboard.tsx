import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, Truck, DollarSign, AlertTriangle, ArrowRight, ChevronRight, Box, Layers, Plus } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoGauge } from '../../components/skeuomorphic/SkeuoGauge';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { LEDAlertPanel } from '../../components/skeuomorphic/SkeuoLED';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { formatCurrency } from '../../utils';
import type { Product } from '../../types';
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
  const adjustStock = useInventoryStore(s => s.adjustStock);
  const getAlerts = useInventoryStore(s => s.getAlertCounts);
  const monthlyReports = useFinancialStore(s => s.monthlyReports);
  const deliveries = useDeliveryStore(s => s.deliveries);
  const expenses = useFinancialStore(s => s.expenses);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const alerts = getAlerts();
  const latest = monthlyReports[monthlyReports.length - 1];
  const totalStockValue = products.reduce((s, p) => s + p.stockAvailable * p.costPrice, 0);
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING' || d.status === 'DISPATCHED').length;
  const totalExpensesMonth = expenses.slice(0, 5).reduce((s, e) => s + e.amount, 0);
  const inStockPct = Math.round((products.filter(p => p.status === 'IN_STOCK').length / products.length) * 100);

  const chartData = monthlyReports.slice(-6).map(r => ({
    month: r.month.slice(5),
    revenue: Math.round(r.grossRevenue / 1000),
    cogs: Math.round(r.cogs / 1000),
    profit: Math.round(r.netProfit / 1000),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Admin Dashboard" subtitle="Overview of enterprise operations & financial health" />

      <div className="flex-1 p-8 space-y-6">
        {/* Top LED System Status Bar */}
        <LEDAlertPanel outOfStock={alerts.outOfStock} critical={alerts.critical} expired={alerts.expired} />

        {/* KPI Grid */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Stock Value" value={formatCurrency(totalStockValue)} sub={`${products.length} registered products`} icon={<Package size={20} />} trend="up" color="#d4af37" />
          <KPICard label="Monthly Revenue" value={formatCurrency(latest?.grossRevenue || 0)} sub="Gross revenue this month" icon={<DollarSign size={20} />} trend="up" color="#10b981" />
          <KPICard label="Active Deliveries" value={String(pendingDeliveries)} sub="Pending or dispatched" icon={<Truck size={20} />} trend="neutral" color="#3b82f6" />
          <KPICard label="Recent Expenses" value={formatCurrency(totalExpensesMonth)} sub="Recent ledger entries" icon={<AlertTriangle size={20} />} trend="down" color="#f59e0b" />
        </motion.div>

        {/* Charts & Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Profit Trends */}
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-white/08 rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-skeuo-chrome text-base">Financial Trajectory</h3>
                <p className="text-xs text-gray-500 mt-0.5">Revenue vs COGS vs Net Profit (k PHP)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-skeuo-gold"><span className="w-2.5 h-2.5 rounded-sm bg-skeuo-gold inline-block" /> Rev</span>
                <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-gray-500 inline-block" /> COGS</span>
                <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Profit</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1f26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cogs" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Operational Health Gauges */}
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-white/08 rounded-2xl p-6 flex flex-col items-center justify-between">
            <h3 className="font-display font-semibold text-skeuo-chrome text-base self-start mb-4">Operational Health</h3>
            <div className="flex flex-col items-center gap-5">
              <SkeuoGauge value={inStockPct} label="In-Stock Rate" unit="%" warningThreshold={60} criticalThreshold={30} size="md" />
              <SkeuoGauge value={Math.round(latest?.profitMarginPercent || 0)} label="Profit Margin" unit="%" warningThreshold={15} criticalThreshold={5} size="md" />
            </div>
          </motion.div>
        </div>

        {/* Critical Alerts Table / Interactive Section */}
        {(alerts.outOfStock + alerts.critical + alerts.expired) > 0 && (
          <motion.div variants={item} initial="hidden" animate="show"
            className="skeuo-panel border border-red-500/20 rounded-2xl p-4 sm:p-6 shadow-skeuo-vault">
            {/* Header with Clickable Link */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div
                onClick={() => navigate('/alerts')}
                className="flex items-center gap-3 cursor-pointer group select-none"
                title="Pindutin para makita ang lahat ng Stock Alerts"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-led-pulse-red" />
                <h3 className="font-display font-bold text-red-400 text-base group-hover:text-red-300 transition-colors flex items-center gap-2">
                  Immediate Attention Required
                </h3>
                <SkeuoBadge label={String(alerts.outOfStock + alerts.critical + alerts.expired)} variant="metal" />
              </div>

              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-skeuo-gold hover:text-yellow-300 flex items-center gap-1 font-semibold transition-all px-2.5 py-1 rounded-lg bg-white/04 hover:bg-white/08 border border-white/08 active:scale-95"
              >
                View All Alerts <ArrowRight size={13} />
              </button>
            </div>

            {/* Clickable Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.filter(p => p.status !== 'IN_STOCK').slice(0, 6).map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-black/35 border border-white/08 hover:border-red-500/50 hover:bg-black/60 rounded-xl p-3.5 cursor-pointer transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between shadow-skeuo-card hover:shadow-lg"
                  title="Pindutin para makita ang details at mag-restock"
                >
                  <div>
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-skeuo-gold transition-colors">
                        {p.name}
                      </p>
                      <SkeuoBadge label={p.status} status={p.status} dot />
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/06 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Stock: <span className="font-bold text-red-400 font-mono">{p.stockAvailable}</span> / Critical: {p.criticalLevel}
                    </p>
                    <span className="text-[11px] text-skeuo-gold font-medium flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                      Restock <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Product Attention / Restock Modal */}
      {selectedProduct && (
        <SkeuoModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          subtitle={`SKU: ${selectedProduct.sku} · Storage Location: ${selectedProduct.storageRackId}`}
          size="sm"
          footer={
            <>
              <SkeuoButton variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                Close
              </SkeuoButton>
              <SkeuoButton
                variant="success"
                size="sm"
                onClick={() => {
                  if (selectedProduct) {
                    const needed = Math.max(0, selectedProduct.criticalLevel - selectedProduct.stockAvailable) + 5;
                    const restockQty = Math.max(needed, selectedProduct.reorderQuantity || 10, 10);
                    adjustStock(
                      selectedProduct.id,
                      'STOCK_IN',
                      restockQty,
                      'admin',
                      'Admin',
                      `RESTOCK-${Date.now().toString().slice(-4)}`,
                      `Quick restock from Admin Dashboard (+${restockQty} ${selectedProduct.unit})`
                    );
                    setSelectedProduct(null);
                  }
                }}
              >
                <Plus size={14} /> Quick Restock (+{Math.max(selectedProduct.reorderQuantity || 10, 10)})
              </SkeuoButton>
              <SkeuoButton
                variant="gold"
                size="sm"
                onClick={() => {
                  navigate('/stock-io', { state: { selectedProductId: selectedProduct.id } });
                  setSelectedProduct(null);
                }}
              >
                <Box size={14} /> Custom Stock In
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
                  <span className="text-2xl font-bold font-mono text-red-400">{selectedProduct.stockAvailable}</span>
                  <span className="text-xs text-gray-500">{selectedProduct.unit}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Critical Level</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-amber-400">{selectedProduct.criticalLevel}</span>
                  <span className="text-xs text-gray-500">{selectedProduct.unit}</span>
                </div>
              </div>
            </div>

            {/* Product Meta */}
            <div className="p-3 rounded-xl bg-white/03 border border-white/06 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Unit of Measure:</span>
                <span className="text-gray-200 font-mono">{selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost Price:</span>
                <span className="text-gray-200 font-mono">{formatCurrency(selectedProduct.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Selling Price:</span>
                <span className="text-gray-200 font-mono">{formatCurrency(selectedProduct.sellingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reorder Quantity:</span>
                <span className="text-gray-200 font-mono">{selectedProduct.reorderQuantity} {selectedProduct.unit}</span>
              </div>
            </div>

            {/* Action Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-300">Action Needed:</p>
                <p className="text-gray-400 mt-0.5 leading-relaxed">
                  Ubos o kritikal na ang supply ng item na ito. Pindutin ang <strong>"Stock In / Restock"</strong> sa ibaba para magdagdag ng stocks sa warehouse.
                </p>
              </div>
            </div>
          </div>
        </SkeuoModal>
      )}
    </div>
  );
};
