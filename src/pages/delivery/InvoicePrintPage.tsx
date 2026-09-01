import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { formatCurrency, formatDate, formatDateTime } from '../../utils';

export const InvoicePrintPage: React.FC = () => {
  const { invoices, updatePaymentStatus } = useDeliveryStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const selected = invoices.find(i => i.id === selectedId) || invoices[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Invoices & Print" subtitle="Generate and print delivery invoices" />
      <div className="flex-1 p-8 flex gap-6">
        {/* Invoice List */}
        <div className="w-72 flex-shrink-0 space-y-2 overflow-y-auto no-print">
          <p className="skeuo-label px-1 mb-3">Select Invoice</p>
          {invoices.map(inv => (
            <motion.button key={inv.id} whileHover={{ x: 2 }} onClick={() => setSelectedId(inv.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                (selected?.id === inv.id)
                  ? 'bg-skeuo-gold/10 border-skeuo-gold/40 text-skeuo-gold'
                  : 'skeuo-panel border-white/06 text-gray-400 hover:border-white/15'
              }`}>
              <p className="font-mono text-xs font-bold">{inv.invoiceNumber}</p>
              <p className="text-sm font-medium mt-0.5">{inv.customerName}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-bold">{formatCurrency(inv.grandTotal)}</span>
                <SkeuoBadge label={inv.paymentStatus} status={inv.paymentStatus} dot />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Invoice Print Preview */}
        {selected && (
          <div className="flex-1">
            <div className="flex gap-3 mb-4 no-print">
              <SkeuoButton variant="metal" size="sm" onClick={handlePrint}>
                <Printer size={14} /> Print Invoice
              </SkeuoButton>
              {selected.paymentStatus !== 'PAID' && (
                <SkeuoButton variant="success" size="sm" onClick={() => updatePaymentStatus(selected.id, 'PAID')}>
                  Mark as Paid
                </SkeuoButton>
              )}
            </div>

            {/* Dot-matrix style invoice */}
            <div ref={printRef}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="skeuo-paper rounded-xl max-w-2xl font-mono text-gray-900 overflow-hidden">
                {/* Header section */}
                <div className="bg-gray-900 text-gray-100 px-8 py-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="font-display font-black text-2xl text-skeuo-gold">Inventory System Management</h1>
                      <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">ISM Enterprise Logistics</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg tracking-wider">INVOICE</p>
                      <p className="text-skeuo-gold font-mono font-bold">{selected.invoiceNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Perforated separator */}
                <div className="h-3 bg-gray-50 border-y border-dashed border-gray-300" />

                {/* Bill To / Invoice Info */}
                <div className="px-8 py-5 grid grid-cols-2 gap-6 bg-white">
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-gray-400 mb-1">Bill To</p>
                    <p className="font-bold text-sm">{selected.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{selected.customerAddress}</p>
                    {selected.customerPhone && <p className="text-xs text-gray-500">{selected.customerPhone}</p>}
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">Issue Date:</span><span className="font-semibold">{formatDate(selected.issueDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Due Date:</span><span className="font-semibold">{formatDate(selected.dueDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Payment:</span><span className="font-semibold">{selected.paymentMethod}</span></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <SkeuoBadge label={selected.paymentStatus} status={selected.paymentStatus} dot />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="px-8 bg-white">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-y border-gray-200">
                        <th className="py-2 px-2 text-left text-gray-600 uppercase tracking-wider font-bold text-[9px]">Item</th>
                        <th className="py-2 px-2 text-left text-gray-600 uppercase tracking-wider font-bold text-[9px]">SKU</th>
                        <th className="py-2 px-2 text-center text-gray-600 uppercase tracking-wider font-bold text-[9px]">Qty</th>
                        <th className="py-2 px-2 text-right text-gray-600 uppercase tracking-wider font-bold text-[9px]">Unit</th>
                        <th className="py-2 px-2 text-right text-gray-600 uppercase tracking-wider font-bold text-[9px]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((item, i) => (
                        <tr key={item.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="py-2 px-2 font-medium">{item.productName}</td>
                          <td className="py-2 px-2 text-gray-400">{item.sku}</td>
                          <td className="py-2 px-2 text-center">{item.quantity}</td>
                          <td className="py-2 px-2 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-2 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
                  <div className="max-w-xs ml-auto space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
                    {selected.discountAmount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-{formatCurrency(selected.discountAmount)}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">VAT ({selected.taxRate}%)</span><span>{formatCurrency(selected.taxAmount)}</span></div>
                    <div className="flex justify-between font-display font-black text-lg border-t border-gray-300 pt-2 mt-2">
                      <span>GRAND TOTAL</span><span className="text-gray-900">{formatCurrency(selected.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="h-3 bg-gray-50 border-y border-dashed border-gray-300" />
                <div className="px-8 py-4 bg-gray-900 text-gray-500 text-[9px] text-center">
                  <p>Thank you for your business · Inventory System Management (ISM)</p>
                  <p className="mt-0.5">Printed: {formatDateTime(new Date().toISOString())}</p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
