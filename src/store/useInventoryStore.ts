import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Category, Product, StockMovement, MovementType } from '../types';
import { mockCategories, mockProducts, mockStockMovements } from '../services/mockData';

interface InventoryStore {
  categories: Category[];
  products: Product[];
  movements: StockMovement[];

  // Category CRUD
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => boolean;

  // Product CRUD
  addProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Stock movements
  adjustStock: (productId: string, type: MovementType, quantity: number, userId: string, userName: string, ref: string, notes?: string) => void;

  // Computed
  getAlertCounts: () => { outOfStock: number; critical: number; expired: number; expiringSoon: number };

  // Data Management
  resetToEmpty: () => void;
  seedDemoData: () => void;
}

const computeStatus = (p: Product): Product['status'] => {
  if (p.stockAvailable === 0) return 'OUT_OF_STOCK';
  if (p.expiryDate && new Date(p.expiryDate) < new Date()) return 'EXPIRED';
  if (p.stockAvailable <= p.criticalLevel) return 'CRITICAL';
  return 'IN_STOCK';
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      categories: mockCategories,
      products: mockProducts,
      movements: mockStockMovements,

      addCategory: (cat) => set(state => ({
        categories: [...(state.categories.length > 0 ? state.categories : mockCategories), { ...cat, id: uuidv4(), createdAt: new Date().toISOString() }],
      })),

      updateCategory: (id, updates) => set(state => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
      })),

      deleteCategory: (id) => {
        const hasProducts = get().products.some(p => p.categoryId === id);
        if (hasProducts) return false;
        set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
        return true;
      },

      addProduct: (prod) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const fullProd: Product = {
          ...prod,
          id,
          status: prod.stockAvailable === 0 ? 'OUT_OF_STOCK' : prod.stockAvailable <= prod.criticalLevel ? 'CRITICAL' : 'IN_STOCK',
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ products: [fullProd, ...state.products] }));
        return id;
      },

      updateProduct: (id, updates) => set(state => ({
        products: state.products.map(p => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          return { ...updated, status: computeStatus(updated) };
        }),
      })),

      deleteProduct: (id) => set(state => ({ products: state.products.filter(p => p.id !== id) })),

      adjustStock: (productId, type, quantity, userId, userName, ref, notes) => {
        const prod = get().products.find(p => p.id === productId);
        if (!prod) return;

        let newAvailable = prod.stockAvailable;
        if (type === 'STOCK_IN' || type === 'RETURN') newAvailable += quantity;
        if (type === 'STOCK_OUT' || type === 'DAMAGED' || type === 'EXPIRED_DISPOSAL') {
          newAvailable = Math.max(0, newAvailable - quantity);
        }
        if (type === 'ADJUSTMENT') newAvailable = quantity;

        const movement: StockMovement = {
          id: uuidv4(),
          productId,
          productName: prod.name,
          sku: prod.sku,
          type,
          quantity,
          previousStock: prod.stockAvailable,
          currentStock: newAvailable,
          referenceNumber: ref,
          notes,
          userId,
          userName,
          timestamp: new Date().toISOString(),
        };

        set(state => {
          const isStockIn = type === 'STOCK_IN' || type === 'RETURN';
          const updatedProducts = state.products.map(p => {
            if (p.id !== productId) return p;
            const isDisposal = type === 'EXPIRED_DISPOSAL';
            const updated = {
              ...p,
              stockAvailable: newAvailable,
              expiryDate: isDisposal ? undefined : p.expiryDate,
              updatedAt: new Date().toISOString(),
            };
            return { ...updated, status: computeStatus(updated) };
          });

          // Purge past EXPIRED_DISPOSAL logs for this product once fresh stock is added
          const updatedMovements = isStockIn
            ? [movement, ...state.movements.filter(m => !(m.productId === productId && m.type === 'EXPIRED_DISPOSAL'))]
            : [movement, ...state.movements];

          return {
            movements: updatedMovements,
            products: updatedProducts,
          };
        });
      },

      getAlertCounts: () => {
        const products = get().products;
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const oos = products.filter(p => p.stockAvailable === 0 && !(p.expiryDate && new Date(p.expiryDate) < now));
        const crit = products.filter(p => p.stockAvailable > 0 && p.stockAvailable <= p.criticalLevel && !(p.expiryDate && new Date(p.expiryDate) < now));
        const exp = products.filter(p => p.stockAvailable > 0 && p.expiryDate && new Date(p.expiryDate) < now);
        const expSoon = products.filter(p => p.stockAvailable > 0 && p.expiryDate && new Date(p.expiryDate) >= now && new Date(p.expiryDate) <= thirtyDays);

        return {
          outOfStock: oos.length,
          critical: crit.length,
          expired: exp.length,
          expiringSoon: expSoon.length,
        };
      },

      resetToEmpty: () => set({ categories: [], products: [], movements: [] }),
      seedDemoData: () => set({ categories: mockCategories, products: mockProducts, movements: mockStockMovements }),
    }),
    { name: 'ism-inventory-store-v2' }
  )
);
