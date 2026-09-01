import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, DollarSign } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput, SkeuoSelect } from '../../components/skeuomorphic/SkeuoInput';
import { useFinancialStore } from '../../store/useFinancialStore';
import { formatCurrency, formatDate } from '../../utils';
import type { ReceivablesPayablesEntry } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const ReceivablesPayablesPage: React.FC = () => {
  const { ledger, addLedgerEntry, settleLedgerEntry, getTotalReceivables, getTotalPayables } = useFinancialStore();
  const [tab, setTab] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [showModal, setShowModal] = useState(false);
  const [settleId, setSettleId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [form, setForm] = useState<Partial<ReceivablesPayablesEntry>>({ type: 'RECEIVABLE' });

  const entries = ledger.filter(e => e.type === tab);
  const totalRec = getTotalReceivables();
  const totalPay = getTotalPayables();

  const handleAdd = () => {
    if (!form.partyName || !form.totalAmount) return;
    addLedgerEntry({
      partyName: form.partyName!, partyType: form.partyType || 'CUSTOMER',
      type: tab, invoiceOrPoRef: form.invoiceOrPoRef || '',
      totalAmount: Number(form.totalAmount), paidAmount: 0,
      remainingBalance: Number(form.totalAmount), status: 'OPEN',
      dueDate: form.dueDate || new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
    setForm({ type: 'RECEIVABLE' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Receivables & Payables" subtitle="Accounts ledger and outstanding balances"
        actions={<SkeuoButton variant="gold" size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Entry</SkeuoButton>}
      />
      <div className="flex-1 p-8 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="skeuo-panel border border-emerald-500/20 rounded-2xl p-5">
            <p className="skeuo-label mb-1">Total Receivables (Outstanding)</p>
            <p className="font-display font-black text-3xl text-emerald-400">{formatCurrency(totalRec)}</p>
            <p className="text-xs text-gray-600 mt-1">Money owed to us by customers</p>
          </div>
          <div className="skeuo-panel border border-red-500/20 rounded-2xl p-5">
            <p className="skeuo-label mb-1">Total Payables (Outstanding)</p>
            <p className="font-display font-black text-3xl text-red-400">{formatCurrency(totalPay)}</p>
            <p className="text-xs text-gray-600 mt-1">Money we owe to suppliers</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {(['RECEIVABLE', 'PAYABLE'] as const).map(t => (
            <motion.button key={t} whileTap={{ scale: 0.96 }} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                tab === t
                  ? t === 'RECEIVABLE' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-red-500/15 border-red-500/40 text-red-300'
                  : 'bg-white/04 border-white/08 text-gray-500 hover:border-white/20'
              }`}>
              {t === 'RECEIVABLE' ? '📥 Receivables' : '📤 Payables'}
            </motion.button>
          ))}
        </div>

        {/* Ledger Table */}
        <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/08">
                  {['Party', 'Reference', 'Total', 'Paid', 'Balance', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left skeuo-label first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/04 hover:bg-white/03 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                    <td className="px-4 py-3 pl-6">
                      <p className="text-gray-200 font-medium">{e.partyName}</p>
                      <p className="text-[10px] text-gray-600 uppercase">{e.partyType}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.invoiceOrPoRef}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs font-semibold">{formatCurrency(e.totalAmount)}</td>
                    <td className="px-4 py-3 text-emerald-400 text-xs font-semibold">{formatCurrency(e.paidAmount)}</td>
                    <td className="px-4 py-3 font-bold text-xs">
                      <span className={e.remainingBalance > 0 ? tab === 'RECEIVABLE' ? 'text-emerald-400' : 'text-red-400' : 'text-gray-500'}>
                        {formatCurrency(e.remainingBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(e.dueDate)}</td>
                    <td className="px-4 py-3"><SkeuoBadge label={e.status.replace('_', ' ')} status={e.status === 'SETTLED' ? 'DELIVERED' : e.status === 'OPEN' ? 'PENDING' : 'DISPATCHED'} /></td>
                    <td className="px-4 py-3 pr-6">
                      {e.remainingBalance > 0 && (
                        <SkeuoButton variant="success" size="xs" onClick={() => { setSettleId(e.id); setSettleAmount(''); }}>
                          <CheckCircle size={11} /> Settle
                        </SkeuoButton>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Ledger Entry" size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleAdd}>Save</SkeuoButton>
          </>
        }>
        <div className="space-y-4">
          <SkeuoSelect label="Type" id="le-type" value={form.type || 'RECEIVABLE'} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
            options={[{ value: 'RECEIVABLE', label: 'Receivable (Customer Owes Us)' }, { value: 'PAYABLE', label: 'Payable (We Owe Supplier)' }]} />
          <SkeuoInput label="Party Name" id="le-party" value={form.partyName || ''} onChange={e => setForm(f => ({ ...f, partyName: e.target.value }))} />
          <SkeuoInput label="Invoice / PO Ref" id="le-ref" value={form.invoiceOrPoRef || ''} onChange={e => setForm(f => ({ ...f, invoiceOrPoRef: e.target.value }))} />
          <SkeuoInput label="Total Amount (₱)" id="le-amt" type="number" value={form.totalAmount || ''} onChange={e => setForm(f => ({ ...f, totalAmount: Number(e.target.value) }))} prefix="₱" />
          <SkeuoInput label="Due Date" id="le-due" type="date" value={form.dueDate || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
      </SkeuoModal>

      {/* Settle Modal */}
      <SkeuoModal isOpen={!!settleId} onClose={() => setSettleId(null)} title="Record Payment" size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setSettleId(null)}>Cancel</SkeuoButton>
            <SkeuoButton variant="success" size="sm" onClick={() => { settleId && settleLedgerEntry(settleId, Number(settleAmount)); setSettleId(null); }}>
              Confirm Payment
            </SkeuoButton>
          </>
        }>
        <SkeuoInput label="Amount Paid (₱)" id="settle-amt" type="number" value={settleAmount}
          onChange={e => setSettleAmount(e.target.value)} prefix="₱" />
      </SkeuoModal>
    </div>
  );
};
