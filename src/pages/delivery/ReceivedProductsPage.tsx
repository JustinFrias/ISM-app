import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, Plus } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput, SkeuoSelect, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency } from '../../utils';

interface ReceivedBatch { productId: string; quantity: number; expiryDate?: string; rack: string; ref: string; notes?: string; }

export const ReceivedProductsPage: React.FC = () => {
  const { products, adjustStock } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();
  const [showModal, setShowModal] = useState(false);
  const [batches, setBatches] = useState<ReceivedBatch[]>([]);
  const [form, setForm] = useState<ReceivedBatch>({ productId: '', quantity: 0, rack: '', ref: '' });
  const [committed, setCommitted] = useState(false);

  const addBatch = () => {
    if (!form.productId || form.quantity <= 0 || !form.ref) return;
    setBatches(prev => [...prev, { ...form }]);
    setForm({ productId: '', quantity: 0, rack: '', ref: '' });
    setShowModal(false);
  };

  const commitAll = () => {
    if (!currentUser) return;
    batches.forEach(b => {
      adjustStock(b.productId, 'STOCK_IN', b.quantity, currentUser.id, currentUser.fullName, b.ref, b.notes);
      logAudit(currentUser.id, currentUser.fullName, currentUser.role, 'DELIVERY_RECEIVE', 'Product', b.productId,
        `Received ${b.quantity} units — Ref: ${b.ref}`);
    });
    setCommitted(true);
    setBatches([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Received Products" subtitle="Log inbound shipments and update inventory"
        actions={<SkeuoButton variant="gold" size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Received Batch</SkeuoButton>}
      />
      <div className="flex-1 p-8 space-y-5">
        {committed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
            <PackageCheck size={18} /> All batches committed to inventory successfully!
          </motion.div>
        )}

        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <PackageCheck size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-500">No batches queued. Add received items above.</p>
          </div>
        ) : (
          <>
            <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/06 flex items-center justify-between">
                <h3 className="font-display font-semibold text-skeuo-chrome">Pending Intake Batches ({batches.length})</h3>
                <SkeuoButton variant="success" size="sm" onClick={commitAll} ledStatus="green">
                  <PackageCheck size={14} /> Commit All to Inventory
                </SkeuoButton>
              </div>
              <div className="divide-y divide-white/04">
                {batches.map((b, i) => {
                  const prod = products.find(p => p.id === b.productId);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-6 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <Plus size={16} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-200">{prod?.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{prod?.sku} · Ref: {b.ref} · Rack: {b.rack}</p>
                        {b.expiryDate && <p className="text-xs text-amber-400">Expiry: {b.expiryDate}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold text-lg font-mono">+{b.quantity}</p>
                        <p className="text-xs text-gray-500">{prod?.unit}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)}
        title="Add Received Batch" subtitle="Log an inbound shipment" size="md"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="success" size="sm" onClick={addBatch}>Add Batch</SkeuoButton>
          </>
        }>
        <div className="space-y-4">
          <SkeuoSelect label="Product" id="rb-prod" value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
            options={[{ value: '', label: '— Select product —' }, ...products.map(p => ({ value: p.id, label: `${p.sku} — ${p.name}` }))]} />
          <SkeuoInput label="Quantity Received" id="rb-qty" type="number" min="1" value={form.quantity || ''}
            onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
          <SkeuoInput label="Reference Number (PO #)" id="rb-ref" value={form.ref}
            onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} placeholder="e.g. PO-2026-0999" />
          <SkeuoInput label="Storage Rack" id="rb-rack" value={form.rack}
            onChange={e => setForm(f => ({ ...f, rack: e.target.value }))} placeholder="e.g. A-01" />
          <SkeuoInput label="Expiry Date (if applicable)" id="rb-exp" type="date" value={form.expiryDate || ''}
            onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
          <SkeuoTextarea label="Notes" id="rb-notes" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
        </div>
      </SkeuoModal>
    </div>
  );
};
