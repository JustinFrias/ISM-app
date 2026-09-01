import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useInventoryStore } from '../../store/useInventoryStore';
import { formatCurrency, formatDateTime } from '../../utils';

export const PrintInventoryReportPage: React.FC = () => {
  const { products, categories } = useInventoryStore();
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const totalValue = products.reduce((s, p) => s + p.stockAvailable * p.costPrice, 0);
  const totalSaleValue = products.reduce((s, p) => s + p.stockAvailable * p.sellingPrice, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Print Inventory Report" subtitle="Generate and print physical inventory sheet"
        actions={
          <div className="flex gap-2 no-print">
            <SkeuoButton variant="metal" size="sm" onClick={handlePrint}>
              <Printer size={14} /> Print Report
            </SkeuoButton>
          </div>
        }
      />
      <div className="flex-1 p-8 flex justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl">
          {/* Paper preview */}
          <div ref={printRef} className="skeuo-paper rounded-xl p-10 text-gray-900">
            {/* Report Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h1 className="font-display font-black text-3xl text-gray-900">SkeuoVault</h1>
                <p className="text-sm text-gray-500 tracking-widest uppercase mt-1">Inventory Management System</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg">INVENTORY REPORT</p>
                <p className="text-xs text-gray-500 mt-1">Generated: {formatDateTime(new Date().toISOString())}</p>
                <p className="text-xs text-gray-500">Total Products: {products.length}</p>
              </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Products</p>
                <p className="font-display font-bold text-2xl">{products.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Cost Value</p>
                <p className="font-display font-bold text-2xl">{formatCurrency(totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Retail Value</p>
                <p className="font-display font-bold text-2xl">{formatCurrency(totalSaleValue)}</p>
              </div>
            </div>

            {/* Products by Category */}
            {categories.map(cat => {
              const catProducts = products.filter(p => p.categoryId === cat.id);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id} className="mb-8">
                  <h2 className="font-display font-bold text-lg mb-3 pb-2 border-b border-gray-200" style={{ color: cat.colorTag }}>
                    {cat.name} ({catProducts.length} items)
                  </h2>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        {['SKU', 'Barcode', 'Name', 'Unit', 'Available', 'Critical', 'Cost', 'Price', 'Status', 'Rack'].map(h => (
                          <th key={h} className="px-2 py-1.5 text-left text-gray-600 font-semibold tracking-wider uppercase text-[10px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {catProducts.map((p, i) => (
                        <tr key={p.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-2 py-1.5 font-mono">{p.sku}</td>
                          <td className="px-2 py-1.5 font-mono">{p.barcode}</td>
                          <td className="px-2 py-1.5 font-medium">{p.name}</td>
                          <td className="px-2 py-1.5">{p.unit}</td>
                          <td className="px-2 py-1.5 font-bold">{p.stockAvailable}</td>
                          <td className="px-2 py-1.5">{p.criticalLevel}</td>
                          <td className="px-2 py-1.5">{formatCurrency(p.costPrice)}</td>
                          <td className="px-2 py-1.5">{formatCurrency(p.sellingPrice)}</td>
                          <td className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              p.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' :
                              p.status === 'CRITICAL' ? 'bg-amber-100 text-amber-700' :
                              p.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' : 'bg-red-200 text-red-800'
                            }`}>{p.status.replace('_', ' ')}</span>
                          </td>
                          <td className="px-2 py-1.5 font-mono">{p.storageRackId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Report Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 flex items-center justify-between text-xs text-gray-400">
              <p>SkeuoVault Inventory Management System — Confidential</p>
              <div className="text-right">
                <div className="w-40 border-t border-gray-400 pt-1 mt-6">
                  <p>Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
