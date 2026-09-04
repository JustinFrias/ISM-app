import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Clock, Menu, AlertTriangle, AlertOctagon, PackageX,
  ArrowRight, X, CheckCircle2, CheckCheck, Plus
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { SkeuoLED } from '../skeuomorphic/SkeuoLED';
import { SkeuoBadge } from '../skeuomorphic/SkeuoBadge';
import { formatDateTime } from '../../utils';

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

  const handleQuickRestock = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const p = products.find(prod => prod.id === productId);
    const restockQty = p?.reorderQuantity || 10;
    adjustStock(
      productId,
      'STOCK_IN',
      restockQty,
      currentUser?.id || 'admin',
      currentUser?.fullName || 'Admin',
      'REF-QUICK-RESTOCK',
      'Quick restocked from notification banner'
    );
    // Also mark as dismissed so badge clears immediately
    setDismissedIds(prev => Array.from(new Set([...prev, productId])));
  };

  const handleNavigateToAlerts = () => {
    // When visiting alerts page, auto-clear unread
    setDismissedIds(allAlertProducts.map(p => p.id));
    setShowNotifications(false);
    navigate('/alerts');
  };

  return (
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

              {/* Notification Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-white/04">
                {allAlertProducts.length === 0 || (unreadCount === 0 && allAlertProducts.every(p => dismissedIds.includes(p.id))) ? (
                  <div className="py-8 px-4 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-400/70 mb-2" />
                    <p className="text-sm font-semibold text-gray-200">All notifications cleared</p>
                    <p className="text-xs text-gray-500 mt-0.5">Walang bagong unread alerts sa inventory.</p>
                  </div>
                ) : (
                  allAlertProducts.slice(0, 6).map(p => {
                    const isOOS = p.status === 'OUT_OF_STOCK';
                    const isExpired = p.status === 'EXPIRED';
                    const isDismissed = dismissedIds.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 hover:bg-white/04 transition-colors flex items-start gap-3 group select-none ${
                          isDismissed ? 'opacity-50' : 'opacity-100'
                        }`}
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
                            Current Stock: <span className="font-bold text-red-400">{p.stockAvailable}</span> (Critical: {p.criticalLevel})
                          </p>

                          {/* Quick Action Buttons on Notification Item */}
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={(e) => handleQuickRestock(e, p.id)}
                              className="text-[10px] bg-skeuo-gold/15 hover:bg-skeuo-gold/25 border border-skeuo-gold/30 text-skeuo-gold px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors"
                              title="Instantly add stock to resolve alert"
                            >
                              <Plus size={10} /> Restock (+{p.reorderQuantity || 10})
                            </button>

                            {!isDismissed && (
                              <button
                                onClick={(e) => handleDismissSingle(e, p.id)}
                                className="text-[10px] text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-white/06 transition-colors"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer with link */}
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
  );
};
