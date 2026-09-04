import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Layers, ChevronRight, Package, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { formatCurrency } from '../../utils';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoModal, ConfirmModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput, SkeuoTextarea } from '../../components/skeuomorphic/SkeuoInput';
import { useInventoryStore } from '../../store/useInventoryStore';
import type { Category } from '../../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#d4af37'];

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, products, addCategory, updateCategory, deleteCategory } = useInventoryStore();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [form, setForm] = useState<Partial<Category>>({ colorTag: COLORS[0] });
  const [viewCat, setViewCat] = useState<Category | null>(null);

  const openAdd = () => { setEditCat(null); setForm({ colorTag: COLORS[0] }); setShowModal(true); };
  const openEdit = (c: Category) => { setEditCat(c); setForm(c); setShowModal(true); };

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Categories" subtitle="Manage product category classifications"
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
                transition={{ delay: i * 0.06 }}
                onClick={() => setViewCat(cat)}
                className="skeuo-panel border border-white/08 rounded-2xl p-5 hover:border-white/15 hover:bg-white/02 transition-all group cursor-pointer select-none active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-skeuo-button"
                    style={{ background: `${cat.colorTag}25`, border: `1px solid ${cat.colorTag}40` }}>
                    <Layers size={20} style={{ color: cat.colorTag }} />
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <SkeuoButton variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); openEdit(cat); }}><Edit2 size={12} /></SkeuoButton>
                    <SkeuoButton variant="danger" size="xs" onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id); }}><Trash2 size={12} /></SkeuoButton>
                  </div>
                </div>
                <h3 className="font-display font-bold text-skeuo-chrome text-lg">{cat.name}</h3>
                <p className="text-xs font-mono text-gray-600 mt-0.5">{cat.code}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{cat.description}</p>}
                <div className="mt-4 pt-4 border-t border-white/06 flex items-center justify-between">
                  <span className="text-xs text-gray-600">{count} product{count !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.colorTag, boxShadow: `0 0 6px ${cat.colorTag}` }} />
                    <ChevronRight size={13} className="text-gray-600 group-hover:text-skeuo-gold transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editCat ? 'Edit Category' : 'Add Category'} size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSave}>Save</SkeuoButton>
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

      {/* Category Products Viewer Modal */}
      {viewCat && (() => {
        const catProducts = products.filter(p => p.categoryId === viewCat.id);
        return (
          <SkeuoModal
            isOpen={!!viewCat}
            onClose={() => setViewCat(null)}
            title={viewCat.name}
            subtitle={`${viewCat.code} · ${catProducts.length} product${catProducts.length !== 1 ? 's' : ''}`}
            size="md"
            footer={
              <>
                <SkeuoButton variant="ghost" size="sm" onClick={() => setViewCat(null)}>Close</SkeuoButton>
                <SkeuoButton variant="gold" size="sm" onClick={() => { setViewCat(null); navigate('/inventory'); }}>
                  <Box size={13} /> View in Inventory
                </SkeuoButton>
              </>
            }
          >
            <div className="space-y-2">
              {catProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <Package size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">Walang produkto sa kategoryang ito.</p>
                </div>
              ) : (
                catProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/03 border border-white/06 hover:bg-white/06 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${viewCat.colorTag}20`, border: `1px solid ${viewCat.colorTag}40` }}>
                      <Package size={14} style={{ color: viewCat.colorTag }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-100 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <SkeuoBadge label={p.status} status={p.status} dot />
                      <p className="text-xs text-gray-400 font-mono mt-1">Qty: <span className="text-skeuo-gold font-bold">{p.stockAvailable}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SkeuoModal>
        );
      })()}
    </div>
  );
};
