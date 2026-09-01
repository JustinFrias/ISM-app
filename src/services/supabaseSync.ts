import { supabase, isSupabaseConfigured } from './supabase';
import type { Category, Product, StockMovement, Delivery, Invoice, Expense, ReceivablesPayablesEntry, ActivityLog } from '../types';

export const supabaseDb = {
  // Categories
  async getCategories(): Promise<Category[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      console.warn('Supabase fetch categories error:', error);
      return null;
    }
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description || undefined,
      iconName: c.icon_name || 'Package',
      colorTag: c.color_tag || '#3b82f6',
      createdAt: c.created_at,
    }));
  },

  async saveCategory(cat: Omit<Category, 'id' | 'createdAt'>): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('categories').insert({
      name: cat.name,
      code: cat.code,
      description: cat.description,
      icon_name: cat.iconName,
      color_tag: cat.colorTag,
    }).select('id').single();
    if (error) {
      console.warn('Supabase save category error:', error);
      return null;
    }
    return data?.id || null;
  },

  // Products
  async getProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('products').select(`
      *,
      categories ( name )
    `).order('name');
    if (error) {
      console.warn('Supabase fetch products error:', error);
      return null;
    }
    return data.map((p: any) => ({
      id: p.id,
      categoryId: p.category_id,
      categoryName: p.categories?.name || 'Uncategorized',
      sku: p.sku,
      barcode: p.barcode || '',
      name: p.name,
      description: p.description || '',
      unit: p.unit,
      costPrice: Number(p.cost_price),
      sellingPrice: Number(p.selling_price),
      stockAvailable: Number(p.stock_available),
      stockReserved: Number(p.stock_reserved || 0),
      criticalLevel: Number(p.critical_level),
      reorderQuantity: Number(p.reorder_quantity),
      status: Number(p.stock_available) === 0 ? 'OUT_OF_STOCK' : Number(p.stock_available) <= Number(p.critical_level) ? 'CRITICAL' : 'IN_STOCK',
      storageRackId: p.storage_rack_id,
      expiryDate: p.expiry_date || undefined,
      imageUrl: p.image_url || undefined,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  },

  // Deliveries
  async getDeliveries(): Promise<Delivery[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('deliveries').select(`
      *,
      delivery_items ( * )
    `).order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetch deliveries error:', error);
      return null;
    }
    return data.map((d: any) => ({
      id: d.id,
      deliveryNumber: d.delivery_number,
      userId: d.user_id,
      dispatcherName: d.dispatcher_name,
      recipientName: d.recipient_name,
      recipientAddress: d.recipient_address,
      contactNumber: d.contact_number,
      items: (d.delivery_items || []).map((i: any) => ({
        id: i.id,
        productId: i.product_id,
        productName: i.product_name,
        sku: i.sku,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        totalPrice: Number(i.total_price),
      })),
      totalQuantity: Number(d.total_quantity),
      totalAmount: Number(d.total_amount),
      status: d.status,
      scheduledDate: d.scheduled_date,
      dispatchedDate: d.dispatched_date,
      deliveredDate: d.delivered_date,
      trackingCode: d.tracking_code,
      notes: d.notes,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  },
};
