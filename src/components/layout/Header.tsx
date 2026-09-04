import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Menu, AlertTriangle, AlertOctagon, PackageX, ArrowRight, X, CheckCircle2 } from 'lucide-react';
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

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const navigate = useNavigate();
  const products = useInventoryStore(s => s.products);
  const getAlertCounts = useInventoryStore(s => s.getAlertCounts);
  const currentUser = useAuthStore(s => s.currentUser);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const alerts = getAlertCounts();
  const totalAlerts = alerts.outOfStock + alerts.critical + alerts.expired;

  const alertProducts = products.filter(p => p.status !== 'IN_STOCK');

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

  const handleNavigateToAlerts = () => {
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
        {/* Mobile menu trigger */}
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
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-led-pulse-red shadow-lg">
              {totalAlerts}
            </span>
          )}
        </button>

        {/* Status LEDs strip (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-2 bg-black/40 border border-white/06 rounded-lg px-3 py-1.5">
          <SkeuoLED status={alerts.outOfStock > 0 ? 'red' : 'green'} size="sm" />
          <SkeuoLED status={alerts.critical > 0 ? 'amber' : 'green'} size="sm" />
          <SkeuoLED status={alerts.expired > 0 ? 'red' : 'green'} size="sm" />
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
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/08 bg-white/03">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-skeuo-gold" />
                  <span className="font-display font-bold text-sm text-gray-100">
                    Notifications
                  </span>
                  {totalAlerts > 0 ? (
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {totalAlerts} Attention
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      All Good
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-white/06 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-white/04">
                {totalAlerts === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-400/60 mb-2" />
                    <p className="text-sm font-semibold text-gray-300">All systems operational</p>
                    <p className="text-xs text-gray-500 mt-0.5">Walang kritikal o out of stock na produkto.</p>
                  </div>
                ) : (
                  alertProducts.slice(0, 5).map(p => {
                    const isOOS = p.status === 'OUT_OF_STOCK';
                    const isExpired = p.status === 'EXPIRED';

                    return (
                      <div
                        key={p.id}
                        onClick={handleNavigateToAlerts}
                        className="p-3.5 hover:bg-white/04 cursor-pointer transition-colors flex items-start gap-3 group select-none"
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
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer with link */}
              {totalAlerts > 0 && (
                <div className="p-3 border-t border-white/08 bg-black/25">
                  <button
                    onClick={handleNavigateToAlerts}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-skeuo-gold hover:text-yellow-300 py-1.5 rounded-lg hover:bg-white/04 transition-colors"
                  >
                    Tingnan ang lahat sa Stock Alerts ({totalAlerts}) <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
