import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SkeuoLED } from '../skeuomorphic/SkeuoLED';
import { cn } from '../../utils';
import { formatDateTime } from '../../utils';

interface HeaderProps { title: string; subtitle?: string; actions?: React.ReactNode; }

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const getAlertCounts = useInventoryStore(s => s.getAlertCounts);
  const currentUser = useAuthStore(s => s.currentUser);
  const alerts = getAlertCounts();
  const totalAlerts = alerts.outOfStock + alerts.critical + alerts.expired;

  return (
    <header className="flex items-center justify-between px-8 py-4 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(30,33,40,0.95) 0%, rgba(22,25,32,0.98) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3)',
      }}>
      {/* Left: Title */}
      <div>
        <h1 className="font-display font-bold text-xl text-skeuo-chrome">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right: Actions + Status */}
      <div className="flex items-center gap-4">
        {actions}

        {/* Clock */}
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

        {/* Status LEDs strip */}
        <div className="hidden md:flex items-center gap-2 bg-black/40 border border-white/06 rounded-lg px-3 py-1.5">
          <SkeuoLED status={alerts.outOfStock > 0 ? 'red' : 'green'} size="sm" />
          <SkeuoLED status={alerts.critical > 0 ? 'amber' : 'green'} size="sm" />
          <SkeuoLED status={alerts.expired > 0 ? 'red' : 'green'} size="sm" />
        </div>
      </div>
    </header>
  );
};
