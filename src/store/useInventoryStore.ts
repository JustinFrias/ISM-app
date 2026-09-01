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
}

const computeStatus = (p: Product): Product['status'] => {
  if (p.expiryDate && new Date(p.expiryDate) < new Date()) return 'EXPIRED';
  if (p.stockAvailable === 0) return 'OUT_OF_STOCK';
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
        categories: [...state.categories, { ...cat, id: uuidv4(), createdAt: new Date().toISOString() }],
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
        const newProd: Product = {
          ...prod,
          id,
          createdAt: now,
          updatedAt: now,
          status: computeStatus({ ...prod, id, createdAt: now, updatedAt: now, status: 'IN_STOCK' }),
        };
        set(state => ({ products: [...state.products, newProd] }));
        return id;
      },

      updateProduct: (id, updates) => set(state => ({
        products: state.products.map(p => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          return { ...updated, status: computeStatus(updated) };
        }),
      })),

      deleteProduct: (id) => set(state => ({
        products: state.products.filter(p => p.id !== id),
      })),

      adjustStock: (productId, type, quantity, userId, userName, ref, notes) => {
        set(state => {
          const prod = state.products.find(p => p.id === productId);
          if (!prod) return state;
          const delta = ['STOCK_IN', 'RETURN'].includes(type) ? quantity : -quantity;
          const newStock = Math.max(0, prod.stockAvailable + delta);
          const movement: StockMovement = {
            id: uuidv4(),
            productId,
            productName: prod.name,
            sku: prod.sku,
            userId,
            userName,
            type,
            quantity,
            previousStock: prod.stockAvailable,
            currentStock: newStock,
            referenceNumber: ref,
            notes,
            timestamp: new Date().toISOString(),
          };
          const updatedProd = { ...prod, stockAvailable: newStock, updatedAt: new Date().toISOString() };
          return {
            products: state.products.map(p => p.id === productId ? { ...updatedProd, status: computeStatus(updatedProd) } : p),
            movements: [movement, ...state.movements],
          };
        });
      },

      getAlertCounts: () => {
        const prods = get().products;
        const today = new Date();
        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return {
          outOfStock: prods.filter(p => p.status === 'OUT_OF_STOCK').length,
          critical: prods.filter(p => p.status === 'CRITICAL').length,
          expired: prods.filter(p => p.status === 'EXPIRED').length,
          expiringSoon: prods.filter(p => p.expiryDate && new Date(p.expiryDate) > today && new Date(p.expiryDate) <= in30Days).length,
        };
      },
    }),
    { name: 'skeuo-inventory-store' }
  )
);
