import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, AlertTriangle, AlertOctagon, PackageX, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { SkeuoLED } from '../skeuomorphic/SkeuoLED';
import { formatDateTime } from '../../utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const products = useInventoryStore(s => s.products);
  const getAlertCounts = useInventoryStore(s => s.getAlertCounts);
  const alerts = getAlertCounts();
  // Filter alert items
  const now = new Date();
  const oosItems = products.filter(p => p.stockAvailable === 0 && !(p.expiryDate && new Date(p.expiryDate) < now));
  const criticalItems = products.filter(p => p.stockAvailable > 0 && p.stockAvailable <= p.criticalLevel && !(p.expiryDate && new Date(p.expiryDate) < now));
  const expiredItems = products.filter(p => p.stockAvailable > 0 && (p.status === 'EXPIRED' || (p.expiryDate && new Date(p.expiryDate) < now)));

  const totalAlerts = oosItems.length + criticalItems.length + expiredItems.length;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <header
      className="flex items-center justify-between px-8 py-4 flex-shrink-0 relative z-30"
      style={{
        background: 'linear-gradient(180deg, rgba(30,33,40,0.95) 0%, rgba(22,25,32,0.98) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left: Title */}
      <div>
        <h1 className="font-brand font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 font-sans">{subtitle}</p>}
      </div>

      {/* Right: Actions + Status + Notifications */}
      <div className="flex items-center gap-4">
        {actions}

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 text-gray-500 text-xs font-mono">
          <Clock size={12} className="text-gray-600" />
          {formatDateTime(new Date().toISOString())}
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(prev => !prev)}
            aria-label="View system alerts"
            className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
              isOpen
                ? 'bg-skeuo-gold/15 border-skeuo-gold/50 text-skeuo-gold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                : 'bg-white/04 border-white/08 hover:bg-white/08 hover:border-white/15 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bell size={17} className={totalAlerts > 0 ? 'text-amber-300 animate-[wiggle_1s_ease-in-out_infinite]' : ''} />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-led-pulse-red shadow-sm">
                {totalAlerts}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown Flyout */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-gradient-to-b from-[#22262f] via-[#1a1d24] to-[#121419] border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(212,175,55,0.2)] overflow-hidden z-50"
              >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-white/08 flex items-center justify-between bg-white/02">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-skeuo-gold" />
                    <span className="font-brand font-bold text-sm text-gray-100">System Notifications</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/06 text-gray-300 text-xs font-mono font-semibold">
                    {totalAlerts} Active
                  </span>
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-white/04">
                  {totalAlerts === 0 ? (
                    <div className="py-10 px-4 text-center">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2 opacity-80" />
                      <p className="text-sm font-semibold text-gray-300">All Stock Levels Normal</p>
                      <p className="text-xs text-gray-500 mt-1">No critical, out of stock, or expired items.</p>
                    </div>
                  ) : (
                    <>
                      {/* Out of Stock Items */}
                      {oosItems.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleNavigate('/alerts')}
                          className="px-4 py-3 hover:bg-red-500/08 transition-colors cursor-pointer flex items-start gap-3 group"
                        >
                          <div className="p-1.5 rounded-lg bg-red-500/15 text-red-400 mt-0.5 flex-shrink-0">
                            <AlertOctagon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-red-300 transition-colors">
                                {p.name}
                              </p>
                              <span className="text-[10px] font-bold text-red-400 font-mono ml-2">OUT OF STOCK</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {p.sku} · Available: 0 {p.unit}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors mt-1" />
                        </div>
                      ))}

                      {/* Critical Stock Items */}
                      {criticalItems.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleNavigate('/alerts')}
                          className="px-4 py-3 hover:bg-amber-500/08 transition-colors cursor-pointer flex items-start gap-3 group"
                        >
                          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5 flex-shrink-0">
                            <AlertTriangle size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-amber-300 transition-colors">
                                {p.name}
                              </p>
                              <span className="text-[10px] font-bold text-amber-400 font-mono ml-2">CRITICAL</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {p.sku} · Stock: {p.stockAvailable} / Min: {p.criticalLevel} {p.unit}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors mt-1" />
                        </div>
                      ))}

                      {/* Expired Items */}
                      {expiredItems.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleNavigate('/expired')}
                          className="px-4 py-3 hover:bg-red-500/08 transition-colors cursor-pointer flex items-start gap-3 group"
                        >
                          <div className="p-1.5 rounded-lg bg-red-500/15 text-red-400 mt-0.5 flex-shrink-0">
                            <PackageX size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-red-300 transition-colors">
                                {p.name}
                              </p>
                              <span className="text-[10px] font-bold text-red-400 font-mono ml-2">EXPIRED</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {p.sku} · Exp: {p.expiryDate || 'Expired'}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors mt-1" />
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Footer Action Links */}
                {totalAlerts > 0 && (
                  <div className="p-2.5 bg-black/40 border-t border-white/06 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/alerts')}
                      className="w-full text-center py-1.5 font-semibold text-skeuo-gold hover:text-amber-200 transition-colors cursor-pointer"
                    >
                      View All Stock Alerts →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status LEDs strip */}
        <div className="hidden md:flex items-center gap-2 bg-black/40 border border-white/06 rounded-xl px-3 py-1.5 shadow-inner">
          <SkeuoLED status={alerts.outOfStock > 0 ? 'red' : 'green'} size="sm" label={alerts.outOfStock > 0 ? 'OOS' : ''} />
          <SkeuoLED status={alerts.critical > 0 ? 'amber' : 'green'} size="sm" label={alerts.critical > 0 ? 'Crit' : ''} />
          <SkeuoLED status={alerts.expired > 0 ? 'red' : 'green'} size="sm" label={alerts.expired > 0 ? 'Exp' : ''} />
        </div>
      </div>
    </header>
  );
};
