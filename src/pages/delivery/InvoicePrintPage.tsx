import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { formatCurrency, formatDate, formatDateTime } from '../../utils';

export const InvoicePrintPage: React.FC = () => {
  const { invoices, updatePaymentStatus } = useDeliveryStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const selected = invoices.find(i => i.id === selectedId) || invoices[0];

  const handleSavePDF = async () => {
    if (!printRef.current || !selected) return;
    setDownloading(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210 mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

      // Safe margins to ensure 100% 1 single page with zero clipping
      const margin = 8; // 8mm margin
      const printableWidth = pdfWidth - (margin * 2);   // 194 mm
      const printableHeight = pdfHeight - (margin * 2); // 281 mm

      const canvasRatio = canvas.width / canvas.height;
      let renderWidth = printableWidth;
      let renderHeight = printableWidth / canvasRatio;

      // Ensure it never exceeds the printable height (guarantees exactly 1 page)
      if (renderHeight > printableHeight) {
        renderHeight = printableHeight;
        renderWidth = printableHeight * canvasRatio;
      }

      // Center perfectly on the bond paper
      const x = (pdfWidth - renderWidth) / 2;
      const y = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
      pdf.save(`Receipt-${selected.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate receipt PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Invoices & Receipts" subtitle="Generate and download official sales invoices & receipts" />
      <div className="flex-1 p-8 flex gap-6 overflow-hidden">
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

        {/* Receipt Full Bondpaper Preview & Download */}
        {selected && (
          <div className="flex-1 overflow-y-auto pb-16 flex flex-col items-center">
            {/* Action Bar */}
            <div className="w-[800px] max-w-full flex items-center justify-between mb-4 no-print">
              <div className="flex items-center gap-3">
                <SkeuoButton variant="gold" size="sm" onClick={handleSavePDF} disabled={downloading}>
                  {downloading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                  {downloading ? 'Downloading Receipt...' : 'Save as PDF (Receipt)'}
                </SkeuoButton>
                {selected.paymentStatus !== 'PAID' && (
                  <SkeuoButton variant="success" size="sm" onClick={() => updatePaymentStatus(selected.id, 'PAID')}>
                    Mark as Paid
                  </SkeuoButton>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">Official Sales Invoice / Receipt Format (A4)</span>
            </div>

            {/* Official Philippine Sales Invoice / Receipt */}
            <div
              ref={printRef}
              className="w-[800px] min-h-[1100px] bg-white text-gray-900 shadow-2xl p-8 flex flex-col justify-between border-2 border-gray-800"
              style={{ fontFamily: 'Arial, Helvetica, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              {/* HEADER SECTION */}
              <div>
                {/* Company Name & BIR Reg Info with Official ISM Logo - Full Width & Paper-Complementary */}
                <div className="border-b-2 border-gray-800 pb-4">
                  <div className="flex items-center justify-between gap-6">
                    {/* Left: Official ISM Logo & Company Branding (Integrated on paper) */}
                    <div className="flex items-center gap-4">
                      {/* Integrated Vector Emblem */}
                      <div className="flex items-center gap-3">
                        <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                          {/* 3D Isometric Crate styled for official white paper letterhead */}
                          <polygon points="32,6 56,19 32,32 8,19" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
                          <polygon points="8,19 32,32 32,58 8,45" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                          <polygon points="32,32 56,19 56,45 32,58" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                          <line x1="32" y1="6" x2="32" y2="32" stroke="#b45309" strokeWidth="2" />
                          <circle cx="32" cy="19" r="2.5" fill="#b45309" />
                        </svg>
                        <div className="flex flex-col">
                          <span className="text-3xl font-black tracking-tight text-gray-950 font-sans leading-none">
                            ISM
                          </span>
                          <span className="text-[10px] font-black tracking-widest text-amber-700 uppercase mt-1 font-mono">
                            LOGISTICS
                          </span>
                        </div>
                      </div>

                      <div className="h-12 w-[1.5px] bg-gray-300 mx-1" />

                      <div className="text-left">
                        <h1 className="text-xl font-black tracking-wide text-gray-950 uppercase font-sans leading-tight">
                          INVENTORY SYSTEM MANAGEMENT
                        </h1>
                        <p className="text-xs font-bold text-gray-800 tracking-wider uppercase mt-0.5">
                          ISM ENTERPRISE LOGISTICS CORP.
                        </p>
                        <p className="text-[11px] text-gray-500 italic mt-0.5">
                          Commercial Logistics & Inventory Solutions
                        </p>
                      </div>
                    </div>

                    {/* Right: Official Tax & Contact Registration Details */}
                    <div className="text-right text-xs space-y-1 flex-shrink-0">
                      <p className="font-bold text-gray-900">
                        VAT Reg. TIN: <span className="font-mono font-black text-gray-950">009-876-543-000-NV</span>
                      </p>
                      <p className="text-[11px] text-gray-600">
                        123 Commerce Avenue, Bonifacio Global City, Taguig City
                      </p>
                      <p className="text-[11px] text-gray-600">
                        Tel: (02) 8888-4762 · Mobile: 0917-888-4762
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Website: www.ismlogistics.ph · Email: billing@ismlogistics.ph
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title & Receipt Number Bar */}
                <div className="flex items-center justify-between border-b-2 border-gray-800 py-2.5 px-2 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-widest text-gray-900 uppercase">
                      SALES INVOICE
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      (OFFICIAL RECEIPT)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">NO.</span>
                    <span className="text-lg font-black font-mono text-red-600 tracking-wider">
                      {selected.invoiceNumber}
                    </span>
                  </div>
                </div>

                {/* Customer & Transaction Info Grid */}
                <div className="border-b-2 border-gray-800 grid grid-cols-12 text-xs">
                  {/* Sold To Column */}
                  <div className="col-span-7 p-3 border-r-2 border-gray-800 space-y-1.5">
                    <div className="flex">
                      <span className="w-24 font-bold text-gray-700 uppercase text-[11px]">SOLD TO:</span>
                      <span className="font-bold text-gray-900 uppercase">{selected.customerName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-bold text-gray-700 uppercase text-[11px]">ADDRESS:</span>
                      <span className="text-gray-800 flex-1">{selected.customerAddress}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-bold text-gray-700 uppercase text-[11px]">TIN:</span>
                      <span className="text-gray-700 font-mono">000-000-000-000</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-bold text-gray-700 uppercase text-[11px]">CONTACT NO:</span>
                      <span className="text-gray-700 font-mono">{selected.customerPhone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Date & Terms Column */}
                  <div className="col-span-5 p-3 space-y-1.5 bg-gray-50/50">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700 uppercase text-[11px]">DATE:</span>
                      <span className="font-bold text-gray-900">{formatDate(selected.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700 uppercase text-[11px]">DUE DATE:</span>
                      <span className="font-semibold text-gray-800">{formatDate(selected.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700 uppercase text-[11px]">TERMS:</span>
                      <span className="font-semibold text-gray-800 uppercase">{selected.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                      <span className="font-bold text-gray-700 uppercase text-[11px]">STATUS:</span>
                      <div className={`inline-flex items-center justify-center h-6 px-2.5 rounded border font-bold text-[11px] uppercase tracking-wider leading-none ${
                        selected.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                          : 'bg-amber-50 text-amber-800 border-amber-500'
                      }`}>
                        {selected.paymentStatus === 'PAID' && <Check size={12} className="mr-1 stroke-[3]" />}
                        <span>{selected.paymentStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINE ITEMS TABLE (AUTHENTIC RECEIPT GRID) */}
                <div className="border-b-2 border-gray-800">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-900 border-b-2 border-gray-800 font-bold uppercase text-[10px]">
                        <th className="py-2 px-2 text-center border-r border-gray-400 w-12">QTY</th>
                        <th className="py-2 px-2 text-center border-r border-gray-400 w-14">UNIT</th>
                        <th className="py-2 px-3 text-left border-r border-gray-400">ARTICLES / DESCRIPTION</th>
                        <th className="py-2 px-2 text-center border-r border-gray-400 w-24">SKU / CODE</th>
                        <th className="py-2 px-3 text-right border-r border-gray-400 w-28">UNIT PRICE</th>
                        <th className="py-2 px-3 text-right w-32">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Active items */}
                      {selected.items.map((item, i) => (
                        <tr key={item.id} className="border-b border-gray-300 text-gray-800">
                          <td className="py-2.5 px-2 text-center font-bold border-r border-gray-400">{item.quantity}</td>
                          <td className="py-2.5 px-2 text-center text-gray-600 border-r border-gray-400">pcs</td>
                          <td className="py-2.5 px-3 font-semibold border-r border-gray-400">{item.productName}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px] text-gray-600 border-r border-gray-400">{item.sku}</td>
                          <td className="py-2.5 px-3 text-right font-mono border-r border-gray-400">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-950">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}

                      {/* Ruled lines to complete official receipt pad height */}
                      {Array.from({ length: Math.max(0, 7 - selected.items.length) }).map((_, idx) => (
                        <tr key={`blank-${idx}`} className="border-b border-gray-200">
                          <td className="py-2.5 border-r border-gray-400">&nbsp;</td>
                          <td className="py-2.5 border-r border-gray-400">&nbsp;</td>
                          <td className="py-2.5 border-r border-gray-400">&nbsp;</td>
                          <td className="py-2.5 border-r border-gray-400">&nbsp;</td>
                          <td className="py-2.5 border-r border-gray-400">&nbsp;</td>
                          <td className="py-2.5">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LOWER SECTION: VAT BREAKDOWN & SETTLEMENT */}
              <div className="pt-4">
                <div className="grid grid-cols-12 gap-4 items-start">
                  {/* Left Column: Settlement & Acknowledgment */}
                  <div className="col-span-6 space-y-3">
                    <div className="border border-gray-400 p-2.5 rounded bg-gray-50 text-[11px] text-gray-700 space-y-1">
                      <p className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">
                        Settlement / Bank Information:
                      </p>
                      <p>Bank: <span className="font-bold">BDO Unibank</span> · Acct: <span className="font-mono font-bold">0012-3456-7890</span></p>
                      <p>GCash / Maya: <span className="font-mono font-bold">0917-888-4762</span></p>
                      <p className="text-[10px] text-gray-500 italic mt-1">
                        Please reference Invoice No. <span className="font-bold text-gray-800">{selected.invoiceNumber}</span> upon payment.
                      </p>
                    </div>

                    <div className="text-[10px] text-gray-600 leading-tight">
                      <p className="font-semibold text-gray-800 uppercase">Acknowledgment & Warranty:</p>
                      <p className="mt-0.5">
                        Received the above described merchandise in good order and condition. In case of legal action arising out of this invoice, parties submit to the courts of Taguig City.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Standard BIR VAT Analysis Box */}
                  <div className="col-span-6 border-2 border-gray-800 text-xs">
                    <div className="flex justify-between py-1 px-3 border-b border-gray-300">
                      <span className="text-gray-700">Total Sales (VAT Inclusive):</span>
                      <span className="font-mono font-semibold">{formatCurrency(selected.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between py-1 px-3 border-b border-gray-300">
                      <span className="text-gray-700">Less: 12% VAT:</span>
                      <span className="font-mono">{formatCurrency(selected.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-1 px-3 border-b border-gray-300">
                      <span className="text-gray-700">Amount: Net of VAT:</span>
                      <span className="font-mono font-semibold">{formatCurrency(selected.subtotal)}</span>
                    </div>
                    {selected.discountAmount > 0 && (
                      <div className="flex justify-between py-1 px-3 border-b border-gray-300 text-red-700">
                        <span>Less: SC/PWD/Promo Discount:</span>
                        <span className="font-mono font-semibold">-{formatCurrency(selected.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 px-3 bg-gray-100 font-bold border-t-2 border-gray-800 text-sm">
                      <span className="uppercase tracking-wider text-gray-950 font-black">TOTAL AMOUNT DUE:</span>
                      <span className="font-mono font-black text-gray-950 text-base">{formatCurrency(selected.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* SIGNATURE SECTION */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                  <div>
                    <div className="border-b-2 border-gray-800 h-8 mb-1 mx-4" />
                    <p className="font-bold text-gray-900 uppercase text-[11px]">Prepared & Authorized By</p>
                    <p className="text-[10px] text-gray-600">Cashier / Authorized Representative</p>
                  </div>
                  <div>
                    <div className="border-b-2 border-gray-800 h-8 mb-1 mx-4" />
                    <p className="font-bold text-gray-900 uppercase text-[11px]">Received the Above Goods</p>
                    <p className="text-[10px] text-gray-600">Customer's Signature over Printed Name / Date</p>
                  </div>
                </div>

                {/* OFFICIAL RECEIPT FOOTER */}
                <div className="border-t border-gray-400 pt-3 mt-6 text-center text-[9px] text-gray-500 space-y-0.5">
                  <p className="font-semibold uppercase tracking-wider text-gray-700">
                    THIS DOCUMENT IS VALID FOR CLAIM OF INPUT TAX · OFFICIAL SALES INVOICE
                  </p>
                  <p>
                    BIR Authority to Print (ATP) No. 0926-789-11202 · 100 Bks. (50x3) 0001 - 5000 · Date Issued: Jan 15, 2026
                  </p>
                  <p className="italic text-gray-400">
                    System Generated by Inventory System Management (ISM) · {formatDateTime(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
