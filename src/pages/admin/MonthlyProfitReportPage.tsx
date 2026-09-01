import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoGauge } from '../../components/skeuomorphic/SkeuoGauge';
import { useFinancialStore } from '../../store/useFinancialStore';
import { formatCurrency } from '../../utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

export const MonthlyProfitReportPage: React.FC = () => {
  const { monthlyReports } = useFinancialStore();
  const [selected, setSelected] = useState(monthlyReports.length - 1);
  const report = monthlyReports[selected];

  const chartData = monthlyReports.map(r => ({
    month: r.month.slice(5),
    revenue: r.grossRevenue / 1000,
    profit: r.netProfit / 1000,
    expenses: r.totalExpenses / 1000,
    margin: r.profitMarginPercent,
  }));

  const metrics = report ? [
    { label: 'Gross Revenue', value: formatCurrency(report.grossRevenue), color: '#3b82f6', trend: 'up' as const },
    { label: 'Cost of Goods Sold', value: formatCurrency(report.cogs), color: '#ef4444', trend: 'down' as const },
    { label: 'Gross Profit', value: formatCurrency(report.grossProfit), color: '#10b981', trend: 'up' as const },
    { label: 'Total Expenses', value: formatCurrency(report.totalExpenses), color: '#f59e0b', trend: 'down' as const },
    { label: 'Net Profit', value: formatCurrency(report.netProfit), color: report.netProfit > 0 ? '#10b981' : '#ef4444', trend: report.netProfit > 0 ? 'up' as const : 'down' as const },
    { label: 'Profit Margin', value: `${report.profitMarginPercent.toFixed(2)}%`, color: '#d4af37', trend: 'up' as const },
  ] : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Monthly Profit Report" subtitle="Financial performance overview by month" />
      <div className="flex-1 p-8 space-y-6">
        {/* Month selector */}
        <div className="flex gap-2 flex-wrap">
          {monthlyReports.map((r, i) => (
            <motion.button key={r.month} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(i)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                selected === i ? 'bg-metallic-gold text-black border-transparent shadow-skeuo-button' : 'bg-white/04 text-gray-400 border-white/08 hover:border-white/20'
              }`}>
              {r.month}
            </motion.button>
          ))}
        </div>

        {report && (
          <>
            {/* KPI Cards */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {metrics.map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="skeuo-panel border border-white/08 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    {m.trend === 'up' ? <TrendingUp size={12} style={{ color: m.color }} /> : <TrendingDown size={12} style={{ color: m.color }} />}
                    <span className="skeuo-label">{m.label}</span>
                  </div>
                  <p className="font-display font-bold text-lg text-skeuo-chrome" style={{ color: m.color }}>{m.value}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area Chart */}
              <div className="lg:col-span-2 skeuo-panel border border-white/08 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-skeuo-chrome mb-1">Revenue vs Profit Trend</h3>
                <p className="skeuo-label mb-4">6-month trend (₱ thousands)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1c1f26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} formatter={(v: number) => `₱${v}k`} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#profGrad)" strokeWidth={2} name="Profit" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Profit Margin Gauge */}
              <div className="skeuo-panel border border-white/08 rounded-2xl p-6 flex flex-col items-center justify-center">
                <h3 className="font-display font-semibold text-skeuo-chrome mb-4 self-start">Profit Margin</h3>
                <SkeuoGauge value={Math.max(0, report.profitMarginPercent)} maxValue={40} label={`${report.month} Margin`} unit="%" warningThreshold={15} criticalThreshold={5} size="lg" />
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs w-full">
                  <div className="bg-black/30 rounded-xl p-3 text-center border border-white/06">
                    <p className="text-gray-600">Deliveries</p>
                    <p className="font-bold text-gray-200 font-mono text-lg">{report.totalDeliveriesCompleted}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 text-center border border-white/06">
                    <p className="text-gray-600">Stock Value</p>
                    <p className="font-bold text-gray-200 font-mono text-sm">{formatCurrency(report.totalStockValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
