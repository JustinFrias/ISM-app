import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Clock, Menu, AlertTriangle, AlertOctagon, PackageX,
  ArrowRight, X, CheckCircle2, CheckCheck, Plus, ChevronRight, Box
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { SkeuoLED } from '../skeuomorphic/SkeuoLED';
import { SkeuoBadge } from '../skeuomorphic/SkeuoBadge';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { SkeuoModal } from '../skeuomorphic/SkeuoModal';
import { formatDateTime, formatCurrency } from '../../utils';
import type { Product } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const DISMISSED_STORAGE_KEY = 'skeuo_dismissed_notification_ids';

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const navigate = useNavigate();
  const products = useInventoryStore(s => s.products);
  const adjustStock = useInventoryStore(s => s.adjustStock);
  const currentUser = useAuthStore(s => s.currentUser);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAlertProduct, setSelectedAlertProduct] = useState<Product | null>(null);
  const [modalRestockQty, setModalRestockQty] = useState<number>(10);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track dismissed alert IDs in localStorage
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(dismissedIds));
    } catch {
      // ignore
    }
  }, [dismissedIds]);

  // Alert products
  const allAlertProducts = products.filter(p => p.status !== 'IN_STOCK');
  const unreadAlertProducts = allAlertProducts.filter(p => !dismissedIds.includes(p.id));
  const unreadCount = unreadAlertProducts.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleDismissAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allIds = allAlertProducts.map(p => p.id);
    setDismissedIds(allIds);
  };

  const handleDismissSingle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setDismissedIds(prev => Array.from(new Set([...prev, productId])));
  };


  const handleItemClick = (p: Product) => {
    // Mark as read, close dropdown, then navigate to Stock Alerts
    setDismissedIds(prev => Array.from(new Set([...prev, p.id])));
    setShowNotifications(false);
    navigate('/alerts');
  };

  const handleModalRestockConfirm = () => {
    if (!selectedAlertProduct || modalRestockQty <= 0) return;
    adjustStock(
      selectedAlertProduct.id,
      'STOCK_IN',
      modalRestockQty,
      currentUser?.id || 'admin',
      currentUser?.fullName || 'Admin',
      `RESTOCK-${Date.now().toString().slice(-4)}`,
      `Restocked via Notification Modal (+${modalRestockQty} ${selectedAlertProduct.unit})`
    );
    setDismissedIds(prev => Array.from(new Set([...prev, selectedAlertProduct.id])));
    setSuccessToast(`Matagumpay na nadagdagan ng +${modalRestockQty} ${selectedAlertProduct.unit} ang ${selectedAlertProduct.name}!`);
    setSelectedAlertProduct(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleNavigateToAlerts = () => {
    // When visiting alerts page, auto-clear unread
    setDismissedIds(allAlertProducts.map(p => p.id));
    setShowNotifications(false);
    navigate('/alerts');
  };

  return (
    <>
      <header
        className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex-shrink-0 gap-3 relative z-30"
        style={{
          background: 'linear-gradient(180deg, rgba(30,33,40,0.95) 0%, rgba(22,25,32,0.98) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {/* Left: Mobile Hamburger & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl bg-white/05 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors active:scale-95 shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu size={20} className="text-skeuo-gold" />
          </button>

          <div className="min-w-0">
            <h1 className="font-display font-bold text-base sm:text-xl text-skeuo-chrome truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions + Alerts Bell + Clock */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 relative" ref={dropdownRef}>
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* Clock (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-gray-600 text-xs font-mono">
            <Clock size={12} />
            {formatDateTime(new Date().toISOString())}
          </div>

          {/* Clickable Alert Bell Button */}
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
              showNotifications
                ? 'bg-skeuo-gold/15 border-skeuo-gold text-skeuo-gold shadow-skeuo-button'
                : 'bg-white/04 border-white/08 hover:bg-white/08 hover:border-white/15 text-gray-400 hover:text-gray-200'
            }`}
            title="Notifications & Inventory Alerts"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {/* Badge disappears once cleared/dismissed! */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-led-pulse-red shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Status LEDs strip (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 bg-black/40 border border-white/06 rounded-lg px-3 py-1.5">
            <SkeuoLED status={allAlertProducts.some(p => p.status === 'OUT_OF_STOCK') ? 'red' : 'green'} size="sm" />
            <SkeuoLED status={allAlertProducts.some(p => p.status === 'CRITICAL') ? 'amber' : 'green'} size="sm" />
            <SkeuoLED status={allAlertProducts.some(p => p.status === 'EXPIRED') ? 'red' : 'green'} size="sm" />
          </div>

          {/* Notifications Popover Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl skeuo-panel border border-white/10 shadow-2xl overflow-hidden z-50"
                style={{
                  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                {/* Header with Mark as Read Button */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/08 bg-white/03">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-skeuo-gold" />
                    <span className="font-display font-bold text-sm text-gray-100">
                      Notifications
                    </span>
                    {unreadCount > 0 ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {unreadCount} Unread
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        All Clear
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleDismissAll}
                        className="text-[11px] text-gray-400 hover:text-skeuo-gold hover:underline flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded"
                        title="Clear all unread notification badges"
                      >
                        <CheckCheck size={13} /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-white/06 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Notification Items List - shows unread items reactively */}
                <div className="max-h-72 overflow-y-auto divide-y divide-white/04 p-1">
                  {unreadAlertProducts.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-400/80 mb-2" />
                      <p className="text-sm font-semibold text-gray-200">All notifications cleared</p>
                      <p className="text-xs text-gray-500 mt-0.5">Walang bagong unread alerts sa inventory.</p>
                    </div>
                  ) : (
                    unreadAlertProducts.slice(0, 6).map(p => {
                      const isOOS = p.status === 'OUT_OF_STOCK';
                      const isExpired = p.status === 'EXPIRED';
                      const suggestedRestock = Math.max(p.reorderQuantity || 10, 10);

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleItemClick(p)}
                          className="p-3 hover:bg-white/06 hover:border-white/10 border border-transparent rounded-xl transition-all cursor-pointer flex items-start gap-3 group select-none active:scale-[0.99]"
                          title="Pindutin para makita ang detalye at mag-restock"
                          role="button"
                          tabIndex={0}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isOOS
                                ? 'bg-red-500/20 text-red-400'
                                : isExpired
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {isOOS ? (
                              <AlertOctagon size={16} />
                            ) : isExpired ? (
                              <PackageX size={16} />
                            ) : (
                              <AlertTriangle size={16} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-200 truncate group-hover:text-skeuo-gold transition-colors">
                                {p.name}
                              </p>
                              <SkeuoBadge label={p.status} status={p.status} dot />
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono mt-0.5">{p.sku}</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              Current Stock: <span className="font-bold text-red-400 font-mono">{p.stockAvailable}</span> (Critical: {p.criticalLevel})
                            </p>

                            {/* Action on Notification Item */}
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <button
                                onClick={(e) => handleDismissSingle(e, p.id)}
                                className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/06 transition-colors border border-white/08"
                                title="I-dismiss o i-mark as read"
                              >
                                Dismiss
                              </button>

                              <span className="text-[10px] text-gray-500 group-hover:text-skeuo-gold flex items-center gap-0.5 transition-colors">
                                Tingnan ang detalye <ChevronRight size={11} />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer with link to all alerts */}
                <div className="p-3 border-t border-white/08 bg-black/25 flex items-center justify-between">
                  <button
                    onClick={handleNavigateToAlerts}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-skeuo-gold hover:text-yellow-300 py-1.5 rounded-lg hover:bg-white/04 transition-colors"
                  >
                    Tingnan ang lahat sa Stock Alerts ({allAlertProducts.length}) <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-semibold">{successToast}</p>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-400 hover:text-white text-xs ml-auto px-1.5 py-0.5"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Detail & Restock Modal when Notification is clicked */}
      {selectedAlertProduct && (
        <SkeuoModal
          isOpen={!!selectedAlertProduct}
          onClose={() => setSelectedAlertProduct(null)}
          title={`Restock: ${selectedAlertProduct.name}`}
          subtitle={`SKU: ${selectedAlertProduct.sku} · Storage Location: ${selectedAlertProduct.storageRackId}`}
          size="sm"
          footer={
            <>
              <SkeuoButton variant="ghost" size="sm" onClick={() => setSelectedAlertProduct(null)}>
                Close
              </SkeuoButton>
              <SkeuoButton variant="gold" size="sm" onClick={handleModalRestockConfirm}>
                <Plus size={14} /> I-Restock (+{modalRestockQty} {selectedAlertProduct.unit})
              </SkeuoButton>
            </>
          }
        >
          <div className="space-y-4">
            {/* Status Overview */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/08 shadow-inner">
              <span className="text-xs text-gray-400 font-medium">Alert Status</span>
              <SkeuoBadge label={selectedAlertProduct.status} status={selectedAlertProduct.status} dot />
            </div>

            {/* Expired warning if applicable */}
            {selectedAlertProduct.status === 'EXPIRED' && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2.5">
                <PackageX size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-200">Expired Stock Alert:</p>
                  <p className="text-gray-400 mt-0.5 text-[11px] leading-relaxed">
                    Ang produktong ito ay expired na ({selectedAlertProduct.expiryDate}). Ang pag-restock ay magdadagdag ng panibagong sariwang batch at aayusin ang status nito pabalik sa In Stock.
                  </p>
                </div>
              </div>
            )}

            {/* Current vs Critical Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Available Stock</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-bold font-mono ${selectedAlertProduct.stockAvailable === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedAlertProduct.stockAvailable}
                  </span>
                  <span className="text-xs text-gray-500">{selectedAlertProduct.unit}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/06 shadow-inner">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Critical Level</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {selectedAlertProduct.criticalLevel}
                  </span>
                  <span className="text-xs text-gray-500">{selectedAlertProduct.unit}</span>
                </div>
              </div>
            </div>

            {/* Quantity to Add Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Dami ng idadagdag (Quantity to Add) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={modalRestockQty}
                  onChange={(e) => setModalRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-lg font-bold font-mono text-skeuo-gold outline-none focus:border-skeuo-gold"
                />
                <span className="text-sm font-semibold text-gray-400 px-2 font-mono">
                  {selectedAlertProduct.unit}
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Presets:</span>
              {[5, 10, 20, 50].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setModalRestockQty(qty)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                    modalRestockQty === qty
                      ? 'bg-skeuo-gold text-black font-bold border-yellow-600'
                      : 'bg-white/04 border-white/08 text-gray-400 hover:text-white hover:bg-white/08'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>

            {/* Meta */}
            <div className="p-3 rounded-xl bg-white/03 border border-white/06 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Unit of Measure:</span>
                <span className="text-gray-200 font-mono font-semibold">{selectedAlertProduct.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost Price:</span>
                <span className="text-gray-200 font-mono">{formatCurrency(selectedAlertProduct.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reorder Quantity:</span>
                <span className="text-gray-200 font-mono font-semibold">{selectedAlertProduct.reorderQuantity} {selectedAlertProduct.unit}</span>
              </div>
            </div>

            {/* Bottom link to Stock Alerts */}
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedAlertProduct(null);
                  navigate('/alerts');
                }}
                className="text-xs text-skeuo-gold hover:text-yellow-300 hover:underline flex items-center gap-1.5 py-1"
              >
                <Box size={13} /> Buksan sa Stock Alerts Page <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </SkeuoModal>
      )}
    </>
  );
};
