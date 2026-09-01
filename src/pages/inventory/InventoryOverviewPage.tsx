import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Package, Filter } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoModal, ConfirmModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput, SkeuoSelect } from '../../components/skeuomorphic/SkeuoInput';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, getStatusBg } from '../../utils';
import type { Product, UnitOfMeasure } from '../../types';

const UNITS: UnitOfMeasure[] = ['PCS', 'BOX', 'PACK', 'KG', 'LTR', 'MTR', 'SET', 'BAG'];

export const InventoryOverviewPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useInventoryStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCat, setFilterCat] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchCat = filterCat === 'ALL' || p.categoryId === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  const openAdd = () => { setEditProduct(null); setForm({}); setShowModal(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setForm(p); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.sku) return;
    if (editProduct) {
      updateProduct(editProduct.id, form);
    } else {
      addProduct({
        categoryId: form.categoryId || categories[0]?.id || '',
        sku: form.sku || '',
        barcode: form.barcode || '',
        name: form.name || '',
        unit: (form.unit as UnitOfMeasure) || 'PCS',
        costPrice: Number(form.costPrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        stockAvailable: Number(form.stockAvailable) || 0,
        stockReserved: 0,
        criticalLevel: Number(form.criticalLevel) || 5,
        reorderQuantity: Number(form.reorderQuantity) || 10,
        storageRackId: form.storageRackId || 'A-01',
        expiryDate: form.expiryDate,
        description: form.description,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Inventory Management" subtitle={`${filtered.length} of ${products.length} products`}
        actions={isAdmin && <SkeuoButton variant="gold" size="sm" onClick={openAdd}><Plus size={14} /> Add Product</SkeuoButton>}
      />
      <div className="flex-1 p-8 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <SkeuoInput placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)}
              prefix={<Search size={13} />} />
          </div>
          <SkeuoSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Status' },
              { value: 'IN_STOCK', label: 'In Stock' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
              { value: 'EXPIRED', label: 'Expired' },
            ]} />
          <SkeuoSelect value={filterCat} onChange={e => setFilterCat(e.target.value)}
            options={[{ value: 'ALL', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
        </div>

        {/* Table */}
        <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/08">
                  {['SKU', 'Product Name', 'Category', 'Unit', 'Available', 'Cost', 'Price', 'Status', ...(isAdmin ? ['Actions'] : [])].map(h => (
                    <th key={h} className="px-4 py-3 text-left skeuo-label first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/04 hover:bg-white/03 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}`}>
                    <td className="px-4 py-3 pl-6 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-200 font-medium">{p.name}</p>
                        {p.expiryDate && <p className="text-[10px] text-gray-600">Exp: {p.expiryDate}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.categoryName}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold font-mono ${p.stockAvailable === 0 ? 'text-red-400' : p.stockAvailable <= p.criticalLevel ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.stockAvailable}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatCurrency(p.costPrice)}</td>
                    <td className="px-4 py-3 text-skeuo-gold font-semibold text-xs">{formatCurrency(p.sellingPrice)}</td>
                    <td className="px-4 py-3"><SkeuoBadge label={p.status.replace('_', ' ')} status={p.status} /></td>
                    {isAdmin && (
                      <td className="px-4 py-3 pr-6">
                        <div className="flex items-center gap-2">
                          <SkeuoButton variant="ghost" size="xs" onClick={() => openEdit(p)}><Edit2 size={12} /></SkeuoButton>
                          <SkeuoButton variant="danger" size="xs" onClick={() => setDeleteId(p.id)}><Trash2 size={12} /></SkeuoButton>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-600">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    No products match your filters.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSave}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </SkeuoButton>
          </>
        }>
        <div className="grid grid-cols-2 gap-4">
          <SkeuoInput label="Product Name" id="pname" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <SkeuoInput label="SKU" id="psku" value={form.sku || ''} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
          <SkeuoInput label="Barcode" id="pbarcode" value={form.barcode || ''} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
          <SkeuoSelect label="Category" id="pcat" value={form.categoryId || ''} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            options={categories.map(c => ({ value: c.id, label: c.name }))} />
          <SkeuoSelect label="Unit" id="punit" value={form.unit || 'PCS'} onChange={e => setForm(f => ({ ...f, unit: e.target.value as UnitOfMeasure }))}
            options={UNITS.map(u => ({ value: u, label: u }))} />
          <SkeuoInput label="Storage Rack" id="prack" value={form.storageRackId || ''} onChange={e => setForm(f => ({ ...f, storageRackId: e.target.value }))} />
          <SkeuoInput label="Cost Price (₱)" id="pcost" type="number" value={form.costPrice ?? ''} onChange={e => setForm(f => ({ ...f, costPrice: Number(e.target.value) }))} prefix="₱" />
          <SkeuoInput label="Selling Price (₱)" id="psell" type="number" value={form.sellingPrice ?? ''} onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))} prefix="₱" />
          <SkeuoInput label="Stock Available" id="pstock" type="number" value={form.stockAvailable ?? ''} onChange={e => setForm(f => ({ ...f, stockAvailable: Number(e.target.value) }))} />
          <SkeuoInput label="Critical Level" id="pcrit" type="number" value={form.criticalLevel ?? ''} onChange={e => setForm(f => ({ ...f, criticalLevel: Number(e.target.value) }))} />
          <SkeuoInput label="Reorder Quantity" id="preorder" type="number" value={form.reorderQuantity ?? ''} onChange={e => setForm(f => ({ ...f, reorderQuantity: Number(e.target.value) }))} />
          <SkeuoInput label="Expiry Date" id="pexpiry" type="date" value={form.expiryDate || ''} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
        </div>
      </SkeuoModal>

      {/* Delete Confirm */}
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteProduct(deleteId)}
        title="Delete Product" message="Are you sure you want to permanently delete this product? This cannot be undone."
        confirmLabel="Delete" isDanger />
    </div>
  );
};
