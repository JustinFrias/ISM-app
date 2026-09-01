import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = '₱') =>
  `${currency}${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_STOCK': case 'DELIVERED': case 'SETTLED': case 'PAID': return 'text-emerald-400';
    case 'CRITICAL': case 'DISPATCHED': case 'PARTIALLY_SETTLED': case 'PARTIAL': return 'text-amber-400';
    case 'OUT_OF_STOCK': case 'CANCELLED': case 'OVERDUE': case 'UNPAID': return 'text-red-400';
    case 'EXPIRED': return 'text-red-600';
    case 'PENDING': case 'OPEN': return 'text-sky-400';
    case 'RETURNED': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

export const getStatusBg = (status: string) => {
  switch (status) {
    case 'IN_STOCK': case 'DELIVERED': case 'SETTLED': case 'PAID': return 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300';
    case 'CRITICAL': case 'DISPATCHED': case 'PARTIALLY_SETTLED': case 'PARTIAL': return 'bg-amber-400/15 border-amber-400/30 text-amber-300';
    case 'OUT_OF_STOCK': case 'CANCELLED': case 'OVERDUE': case 'UNPAID': return 'bg-red-500/15 border-red-500/30 text-red-300';
    case 'EXPIRED': return 'bg-red-900/30 border-red-700/40 text-red-400';
    case 'PENDING': case 'OPEN': return 'bg-sky-500/15 border-sky-500/30 text-sky-300';
    case 'RETURNED': return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
    default: return 'bg-gray-500/15 border-gray-500/30 text-gray-400';
  }
};

export const generateSKU = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export const generateBarcode = () =>
  `89${Math.floor(Math.random() * 10000000000).toString().padStart(11, '0')}`;

export const generateInvoiceNumber = () =>
  `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

export const generateDeliveryNumber = () =>
  `DLV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
