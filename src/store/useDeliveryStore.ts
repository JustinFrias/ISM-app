import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Delivery, Invoice } from '../types';
import { mockDeliveries, mockInvoices } from '../services/mockData';

interface DeliveryStore {
  deliveries: Delivery[];
  invoices: Invoice[];
  addDelivery: (d: Omit<Delivery, 'id' | 'createdAt'>) => string;
  updateDeliveryStatus: (id: string, status: Delivery['status'], deliveredDate?: string) => void;
  addInvoice: (inv: Omit<Invoice, 'id'>) => string;
  updatePaymentStatus: (id: string, status: Invoice['paymentStatus'], paidAmount?: number) => void;
}

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set) => ({
      deliveries: mockDeliveries,
      invoices: mockInvoices,

      addDelivery: (d) => {
        const id = uuidv4();
        set(state => ({ deliveries: [{ ...d, id, createdAt: new Date().toISOString() }, ...state.deliveries] }));
        return id;
      },

      updateDeliveryStatus: (id, status, deliveredDate) => set(state => ({
        deliveries: state.deliveries.map(d => d.id === id ? { ...d, status, deliveredDate } : d),
      })),

      addInvoice: (inv) => {
        const id = uuidv4();
        set(state => ({ invoices: [{ ...inv, id }, ...state.invoices] }));
        return id;
      },

      updatePaymentStatus: (id, status) => set(state => ({
        invoices: state.invoices.map(i => i.id === id ? { ...i, paymentStatus: status } : i),
      })),
    }),
    { name: 'skeuo-delivery-store' }
  )
);
