import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ReceiptText } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoModal, ConfirmModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput, SkeuoSelect, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, formatDate } from '../../utils';
import type { Expense, ExpenseCategory } from '../../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CAT_COLORS: Record<ExpenseCategory, string> = {
  UTILITIES: '#3b82f6', LOGISTICS: '#f59e0b', SALARIES: '#8b5cf6',
  EQUIPMENT_MAINTENANCE: '#ec4899', WAREHOUSE_SUPPLIES: '#10b981', MARKETING: '#ef4444', MISCELLANEOUS: '#6b7280',
};

export const ExpensesManagementPage: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useFinancialStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Expense>>({ category: 'MISCELLANEOUS' });

  const handleSave = () => {
    if (!form.title || !form.amount || !currentUser) return;
    addExpense({
      authorizedByUserId: currentUser.id, authorizerName: currentUser.fullName,
      category: form.category as ExpenseCategory || 'MISCELLANEOUS',
      title: form.title!, description: form.description, amount: Number(form.amount),
      expenseDate: form.expenseDate || new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
    setForm({ category: 'MISCELLANEOUS' });
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat = Object.entries(CAT_COLORS).map(([cat, color]) => ({
    name: cat.replace('_', ' '), value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0), color,
  })).filter(c => c.value > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Expenses Management" subtitle={`Total expenses: ${formatCurrency(total)}`}
        actions={<SkeuoButton variant="gold" size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Record Expense</SkeuoButton>}
      />
      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-skeuo-chrome mb-1">By Category</h3>
            <p className="skeuo-label mb-4">Expense distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCat} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {byCat.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1c1f26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {byCat.map(c => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-gray-400">{c.name}</span></div>
                  <span className="font-semibold text-gray-300">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense List */}
          <div className="lg:col-span-2 skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/06">
              <h3 className="font-display font-semibold text-skeuo-chrome">All Expenses</h3>
            </div>
            <div className="overflow-y-auto max-h-96 divide-y divide-white/04">
              {expenses.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="px-6 py-3.5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${CAT_COLORS[e.category as ExpenseCategory]}20`, color: CAT_COLORS[e.category as ExpenseCategory] }}>
                    <ReceiptText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{e.title}</p>
                    <p className="text-[10px] text-gray-600">{e.category.replace('_', ' ')} · {formatDate(e.expenseDate)} · {e.authorizerName}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-red-400 font-mono">{formatCurrency(e.amount)}</p>
                    <SkeuoButton variant="danger" size="xs" onClick={() => setDeleteId(e.id)}><Trash2 size={11} /></SkeuoButton>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-white/08 flex justify-between items-center">
              <span className="skeuo-label">Total Expenses</span>
              <span className="font-display font-bold text-red-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Expense" size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSave}>Save Expense</SkeuoButton>
          </>
        }>
        <div className="space-y-4">
          <SkeuoInput label="Title" id="exp-title" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <SkeuoSelect label="Category" id="exp-cat" value={form.category || 'MISCELLANEOUS'} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
            options={Object.keys(CAT_COLORS).map(k => ({ value: k, label: k.replace('_', ' ') }))} />
          <SkeuoInput label="Amount (₱)" id="exp-amt" type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} prefix="₱" />
          <SkeuoInput label="Expense Date" id="exp-date" type="date" value={form.expenseDate || ''} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} />
          <SkeuoTextarea label="Description" id="exp-desc" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
        </div>
      </SkeuoModal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteExpense(deleteId)}
        title="Delete Expense" message="Delete this expense record? This cannot be undone." isDanger />
    </div>
  );
};
