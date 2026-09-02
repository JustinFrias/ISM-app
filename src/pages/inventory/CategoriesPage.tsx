import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Layers, Package, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoModal, ConfirmModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useInventoryStore } from '../../store/useInventoryStore';
import { formatCurrency } from '../../utils';
import type { Category, Product } from '../../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#d4af37'];

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, products, addCategory, updateCategory, deleteCategory } = useInventoryStore();

  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [form, setForm] = useState<Partial<Category>>({ colorTag: COLORS[0] });

  // Selected Category View Modal State
  const [viewCat, setViewCat] = useState<Category | null>(null);

  const openAdd = () => { setEditCat(null); setForm({ colorTag: COLORS[0] }); setShowModal(true); };
  const openEdit = (c: Category, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditCat(c);
    setForm(c);
    setShowModal(true);
  };
  const openDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteId(id);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    if (editCat) {
      updateCategory(editCat.id, form);
    } else {
      addCategory({ name: form.name!, code: form.code!, description: form.description, iconName: 'Package', colorTag: form.colorTag || COLORS[0] });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const ok = deleteCategory(id);
    if (!ok) setDeleteError('Cannot delete a category that has products assigned.');
    setDeleteId(null);
  };

  const catProducts = viewCat ? products.filter(p => p.categoryId === viewCat.id) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Categories" subtitle="Manage product category classifications — Click any category to view products"
        actions={<SkeuoButton variant="gold" size="sm" onClick={openAdd}><Plus size={14} /> Add Category</SkeuoButton>} />
      <div className="flex-1 p-8">
        {deleteError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex justify-between">
            {deleteError}
            <button onClick={() => setDeleteError('')} className="text-red-300 hover:text-red-100">×</button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setViewCat(cat)}
                className="skeuo-panel border border-white/08 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden shadow-lg"
                style={{
                  boxShadow: `0 10px 30px -10px ${cat.colorTag}15`,
                }}
              >
                {/* Accent indicator glow */}
                <div
                  className="absolute top-0 inset-x-0 h-1 transition-all opacity-80 group-hover:opacity-100"
                  style={{ backgroundColor: cat.colorTag, boxShadow: `0 0 12px ${cat.colorTag}` }}
                />

                <div className="flex items-start justify-between mb-4 pt-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-skeuo-button transition-transform group-hover:scale-105"
                    style={{ background: `${cat.colorTag}25`, border: `1px solid ${cat.colorTag}50` }}>
                    <Layers size={20} style={{ color: cat.colorTag }} />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <SkeuoButton variant="ghost" size="xs" onClick={(e) => openEdit(cat, e)} title="Edit Category">
                      <Edit2 size={12} />
                    </SkeuoButton>
                    <SkeuoButton variant="danger" size="xs" onClick={(e) => openDelete(cat.id, e)} title="Delete Category">
                      <Trash2 size={12} />
                    </SkeuoButton>
                  </div>
                </div>

                <h3 className="font-brand font-bold text-skeuo-chrome text-lg group-hover:text-white transition-colors">{cat.name}</h3>
                <p className="text-xs font-mono text-skeuo-gold mt-0.5 font-semibold">{cat.code}</p>
                {cat.description && <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">{cat.description}</p>}

                <div className="mt-4 pt-4 border-t border-white/06 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-medium">{count} product{count !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-skeuo-gold group-hover:underline flex items-center gap-1 font-semibold">
                    View Items <ArrowRight size={12} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* View Category Items Modal */}
      {viewCat && (
        <SkeuoModal
          isOpen={!!viewCat}
          onClose={() => setViewCat(null)}
          title={`Category: ${viewCat.name}`}
          subtitle={`Code: ${viewCat.code} · ${catProducts.length} Product(s) Listed`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <SkeuoButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  const catId = viewCat.id;
                  setViewCat(null);
                  openEdit(categories.find(c => c.id === catId)!);
                }}
              >
                <Edit2 size={13} className="mr-1" /> Edit Category
              </SkeuoButton>

              <div className="flex items-center gap-2">
                <SkeuoButton variant="ghost" size="sm" onClick={() => setViewCat(null)}>
                  Close
                </SkeuoButton>
                <SkeuoButton
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    setViewCat(null);
                    navigate('/inventory');
                  }}
                >
                  Go to Full Inventory →
                </SkeuoButton>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {viewCat.description && (
              <p className="text-xs text-gray-400 bg-black/40 p-3 rounded-xl border border-white/06">
                {viewCat.description}
              </p>
            )}

            {catProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Package size={36} className="mx-auto mb-2 opacity-40 text-skeuo-gold" />
                <p className="text-sm font-semibold text-gray-300">No products in this category yet</p>
                <p className="text-xs text-gray-500 mt-1">Add products to this category in the Inventory page.</p>
              </div>
            ) : (
              <div className="border border-white/08 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-black/50 border-b border-white/08 text-gray-400">
                      <th className="px-3.5 py-2.5 text-left font-mono">SKU</th>
                      <th className="px-3.5 py-2.5 text-left">Product Name</th>
                      <th className="px-3.5 py-2.5 text-right font-mono">Available</th>
                      <th className="px-3.5 py-2.5 text-right font-mono">Price</th>
                      <th className="px-3.5 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/04">
                    {catProducts.map(p => (
                      <tr key={p.id} className="hover:bg-white/03 transition-colors">
                        <td className="px-3.5 py-2.5 font-mono text-gray-500">{p.sku}</td>
                        <td className="px-3.5 py-2.5 font-semibold text-gray-200">{p.name}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-gray-100">
                          {p.stockAvailable} {p.unit}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-skeuo-gold font-semibold">
                          {formatCurrency(p.sellingPrice)}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <SkeuoBadge label={p.status.replace('_', ' ')} status={p.status} dot />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SkeuoModal>
      )}

      {/* Add / Edit Category Modal */}
      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editCat ? 'Edit Category' : 'Add Category'} size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSave}>Save Category</SkeuoButton>
          </>
        }>
        <div className="space-y-4">
          <SkeuoInput label="Category Name" id="cname" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <SkeuoInput label="Code" id="ccode" value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
          <SkeuoTextarea label="Description" id="cdesc" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div>
            <label className="skeuo-label block mb-2">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, colorTag: c }))}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.colorTag === c ? 'white' : 'transparent',
                    boxShadow: form.colorTag === c ? `0 0 8px ${c}` : 'none' }} />
              ))}
            </div>
          </div>
        </div>
      </SkeuoModal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Category" message="Delete this category? Products in this category must be reassigned first." isDanger />
    </div>
  );
};
