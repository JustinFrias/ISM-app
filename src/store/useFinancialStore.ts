import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Expense, ReceivablesPayablesEntry, MonthlyProfitReport } from '../types';
import { mockExpenses, mockLedger, mockMonthlyReports } from '../services/mockData';

interface FinancialStore {
  expenses: Expense[];
  ledger: ReceivablesPayablesEntry[];
  monthlyReports: MonthlyProfitReport[];
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addLedgerEntry: (entry: Omit<ReceivablesPayablesEntry, 'id' | 'createdAt'>) => void;
  settleLedgerEntry: (id: string, amount: number) => void;
  getTotalExpenses: () => number;
  getTotalReceivables: () => number;
  getTotalPayables: () => number;
  resetToEmpty: () => void;
  seedDemoData: () => void;
}

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      ledger: [],
      monthlyReports: [],

      addExpense: (e) => set(state => ({
        expenses: [{ ...e, id: uuidv4(), createdAt: new Date().toISOString() }, ...state.expenses],
      })),

      deleteExpense: (id) => set(state => ({ expenses: state.expenses.filter(e => e.id !== id) })),

      addLedgerEntry: (entry) => set(state => ({
        ledger: [{ ...entry, id: uuidv4(), createdAt: new Date().toISOString() }, ...state.ledger],
      })),

      settleLedgerEntry: (id, amount) => set(state => ({
        ledger: state.ledger.map(e => {
          if (e.id !== id) return e;
          const paid = e.paidAmount + amount;
          const remaining = Math.max(0, e.totalAmount - paid);
          return { ...e, paidAmount: paid, remainingBalance: remaining, status: remaining === 0 ? 'SETTLED' : 'PARTIALLY_SETTLED' };
        }),
      })),

      getTotalExpenses: () => get().expenses.reduce((s, e) => s + e.amount, 0),
      getTotalReceivables: () => get().ledger.filter(e => e.type === 'RECEIVABLE' && e.status !== 'SETTLED').reduce((s, e) => s + e.remainingBalance, 0),
      getTotalPayables: () => get().ledger.filter(e => e.type === 'PAYABLE' && e.status !== 'SETTLED').reduce((s, e) => s + e.remainingBalance, 0),

      resetToEmpty: () => set({ expenses: [], ledger: [], monthlyReports: [] }),
      seedDemoData: () => set({ expenses: mockExpenses, ledger: mockLedger, monthlyReports: mockMonthlyReports }),
    }),
    { name: 'ism-financial-store-v2' }
  )
);
