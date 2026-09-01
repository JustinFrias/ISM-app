import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Truck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoInput, SkeuoSelect, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { SkeuoModal } from '../../components/skeuomorphic/SkeuoModal';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency, formatDate, generateDeliveryNumber } from '../../utils';
import type { DeliveryItem, DeliveryStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const DeliveryReportsPage: React.FC = () => {
  const { deliveries, addDelivery, updateDeliveryStatus } = useDeliveryStore();
  const { products } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const filtered = statusFilter === 'ALL' ? deliveries : deliveries.filter(d => d.status === statusFilter);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Delivery Reports" subtitle="All shipment records and status tracking"
        actions={
          <div className="flex gap-2">
            <SkeuoSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'DISPATCHED', label: 'Dispatched' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]} />
            <SkeuoButton variant="gold" size="sm" onClick={() => navigate('/add-delivery')}>
              <Plus size={14} /> Add Delivery
            </SkeuoButton>
          </div>
        }
      />
      <div className="flex-1 p-8">
        <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/08">
                  {['Delivery #', 'Recipient', 'Dispatcher', 'Items', 'Total', 'Scheduled', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left skeuo-label first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((del, i) => (
                  <motion.tr key={del.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/04 hover:bg-white/03 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                    <td className="px-4 py-3 pl-6 font-mono text-xs text-skeuo-gold">{del.deliveryNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-200 font-medium">{del.recipientName}</p>
                      <p className="text-[10px] text-gray-600">{del.contactNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{del.dispatcherName}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{del.totalQuantity} pcs</td>
                    <td className="px-4 py-3 font-semibold text-gray-200 text-xs">{formatCurrency(del.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(del.scheduledDate)}</td>
                    <td className="px-4 py-3"><SkeuoBadge label={del.status} status={del.status} /></td>
                    <td className="px-4 py-3 pr-6">
                      <div className="flex items-center gap-2">
                        {del.status === 'PENDING' && (
                          <SkeuoButton variant="success" size="xs" onClick={() => updateDeliveryStatus(del.id, 'DISPATCHED')}>
                            Dispatch
                          </SkeuoButton>
                        )}
                        {del.status === 'DISPATCHED' && (
                          <SkeuoButton variant="gold" size="xs" onClick={() => updateDeliveryStatus(del.id, 'DELIVERED', new Date().toISOString())}>
                            Confirm Delivery
                          </SkeuoButton>
                        )}
                        <SkeuoButton variant="ghost" size="xs" onClick={() => navigate(`/invoice`)}>
                          <FileText size={11} />
                        </SkeuoButton>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
