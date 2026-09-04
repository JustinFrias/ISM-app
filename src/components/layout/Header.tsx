import React from 'react';
import { Bell, Clock, Menu } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { SkeuoLED } from '../skeuomorphic/SkeuoLED';
import { cn } from '../../utils';
import { formatDateTime } from '../../utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const getAlertCounts = useInventoryStore(s => s.getAlertCounts);
  const currentUser = useAuthStore(s => s.currentUser);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);
  const alerts = getAlertCounts();
  const totalAlerts = alerts.outOfStock + alerts.critical + alerts.expired;

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex-shrink-0 gap-3"
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

      {/* Right: Actions + Alerts + Clock */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Clock (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-gray-600 text-xs font-mono">
          <Clock size={12} />
          {formatDateTime(new Date().toISOString())}
        </div>

        {/* Alert bell */}
        <button className="relative p-2 rounded-lg bg-white/04 border border-white/08 hover:bg-white/08 transition-colors">
          <Bell size={16} className="text-gray-400" />
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-led-pulse-red">
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
      </div>
    </header>
  );
};
