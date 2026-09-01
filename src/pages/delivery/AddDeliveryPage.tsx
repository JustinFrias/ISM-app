import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput, SkeuoSelect, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { formatCurrency, generateDeliveryNumber } from '../../utils';
import type { DeliveryItem } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const AddDeliveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDelivery } = useDeliveryStore();
  const { products, adjustStock } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const [recipient, setRecipient] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('');

  const addItem = () => {
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod || !qty || Number(qty) <= 0) return;
    const existing = items.find(i => i.productId === selectedProduct);
    if (existing) {
      setItems(prev => prev.map(i => i.productId === selectedProduct
        ? { ...i, quantity: i.quantity + Number(qty), totalPrice: (i.quantity + Number(qty)) * i.unitPrice } : i));
    } else {
      setItems(prev => [...prev, {
        id: uuidv4(), productId: prod.id, productName: prod.name, sku: prod.sku,
        quantity: Number(qty), unitPrice: prod.sellingPrice, totalPrice: Number(qty) * prod.sellingPrice,
      }]);
    }
    setSelectedProduct(''); setQty('');
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const total = items.reduce((s, i) => s + i.totalPrice, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || items.length === 0 || !currentUser) return;
    const deliveryNumber = generateDeliveryNumber();

    // Deduct stock
    items.forEach(item => {
      adjustStock(item.productId, 'STOCK_OUT', item.quantity, currentUser.id, currentUser.fullName, deliveryNumber, `Delivery to ${recipient}`);
    });

    const id = addDelivery({
      deliveryNumber,
      userId: currentUser.id,
      dispatcherName: currentUser.fullName,
      recipientName: recipient,
      recipientAddress: address,
      contactNumber: contact,
      items,
      totalQuantity: totalQty,
      totalAmount: total,
      status: 'PENDING',
      scheduledDate: date || new Date().toISOString().split('T')[0],
      trackingCode: `TRK-${Date.now()}`,
      notes,
    });

    logAudit(currentUser.id, currentUser.fullName, currentUser.role, 'DELIVERY_CREATE', 'Delivery', id,
      `Created delivery ${deliveryNumber} to ${recipient} — ${formatCurrency(total)}`);

    navigate('/deliveries');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Add New Delivery" subtitle="Create a dispatch order for products" />
      <div className="flex-1 p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Recipient Info */}
          <div className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-skeuo-chrome mb-4">Recipient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeuoInput label="Recipient Name / Company" id="d-recipient" value={recipient}
                onChange={e => setRecipient(e.target.value)} required />
              <SkeuoInput label="Contact Number" id="d-contact" value={contact}
                onChange={e => setContact(e.target.value)} />
              <div className="md:col-span-2">
                <SkeuoInput label="Delivery Address" id="d-address" value={address}
                  onChange={e => setAddress(e.target.value)} />
              </div>
              <SkeuoInput label="Scheduled Date" id="d-date" type="date" value={date}
                onChange={e => setDate(e.target.value)} />
              <SkeuoTextarea label="Notes" id="d-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </div>

          {/* Add Items */}
          <div className="skeuo-panel border border-white/08 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-skeuo-chrome mb-4">Line Items</h3>
            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <SkeuoSelect value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                  options={[{ value: '', label: '— Select product —' },
                    ...products.filter(p => p.stockAvailable > 0).map(p => ({
                      value: p.id, label: `${p.sku} — ${p.name} (${p.stockAvailable} available)`
                    }))]} />
              </div>
              <div className="w-28">
                <SkeuoInput value={qty} onChange={e => setQty(e.target.value)} type="number" min="1" placeholder="Qty" />
              </div>
              <SkeuoButton type="button" variant="gold" size="md" onClick={addItem}>
                <Plus size={14} /> Add
              </SkeuoButton>
            </div>

            {/* Items table */}
            {items.length > 0 && (
              <div className="border border-white/08 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/08">
                      {['SKU', 'Product', 'Qty', 'Unit Price', 'Total', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left skeuo-label first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id} className={`border-b border-white/04 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                        <td className="px-4 py-2.5 pl-5 font-mono text-xs text-gray-500">{item.sku}</td>
                        <td className="px-4 py-2.5 text-gray-200">{item.productName}</td>
                        <td className="px-4 py-2.5 text-gray-300 font-mono">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-skeuo-gold font-semibold text-xs">{formatCurrency(item.totalPrice)}</td>
                        <td className="px-3 py-2.5 pr-4">
                          <button type="button" onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/03">
                      <td colSpan={3} className="px-5 py-3 text-xs text-gray-500">Total: {totalQty} items</td>
                      <td className="px-4 py-3 skeuo-label">Grand Total</td>
                      <td colSpan={2} className="px-4 py-3 text-skeuo-gold font-display font-bold">{formatCurrency(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <SkeuoButton variant="ghost" type="button" onClick={() => navigate('/deliveries')}>Cancel</SkeuoButton>
            <SkeuoButton type="submit" variant="gold" size="lg" disabled={!recipient || items.length === 0} ledStatus="green">
              <Send size={16} /> Create Delivery
            </SkeuoButton>
          </div>
        </form>
      </div>
    </div>
  );
};
