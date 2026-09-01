import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, User } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { useAuditStore } from '../../store/useAuditStore';
import { formatDateTime } from '../../utils';

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: '#10b981', USER_LOGOUT: '#6b7280', PRODUCT_CREATE: '#3b82f6', PRODUCT_UPDATE: '#8b5cf6',
  PRODUCT_DELETE: '#ef4444', STOCK_IN: '#10b981', STOCK_OUT: '#f59e0b', DELIVERY_CREATE: '#3b82f6',
  DELIVERY_DISPATCH: '#f59e0b', DELIVERY_RECEIVE: '#10b981', INVOICE_GENERATED: '#d4af37',
  EXPENSE_RECORDED: '#ef4444', REPORT_PRINTED: '#6b7280', ACCOUNT_CREATE: '#3b82f6', ACCOUNT_DELETE: '#ef4444',
  CATEGORY_CREATE: '#3b82f6', CATEGORY_UPDATE: '#8b5cf6', CATEGORY_DELETE: '#ef4444',
  STOCK_ADJUST: '#f59e0b', INVOICE_PRINTED: '#d4af37', ACCOUNT_UPDATE: '#8b5cf6',
};

export const ActivityLogsPage: React.FC = () => {
  const { logs } = useAuditStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Activity Logs" subtitle={`${logs.length} audit trail entries — Tamper-proof system log`} />
      <div className="flex-1 p-8">
        <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/06 flex items-center gap-3">
            <Shield size={16} className="text-skeuo-gold" />
            <h3 className="font-display font-semibold text-skeuo-chrome">Chronological Audit Trail</h3>
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
              <Clock size={11} /> Live logging active
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-pulse-green" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[70vh] divide-y divide-white/04">
            {logs.map((log, i) => {
              const color = ACTION_COLORS[log.action] || '#6b7280';
              return (
                <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/02 transition-colors">
                  {/* Action color dot */}
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />

                  {/* Timestamp */}
                  <div className="flex-shrink-0 w-36">
                    <p className="text-[10px] font-mono text-gray-600">{formatDateTime(log.timestamp)}</p>
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-32">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-skeuo-gold to-skeuo-goldDark flex items-center justify-center text-black font-bold text-[9px]">
                      {log.userName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 truncate font-semibold">{log.userName}</p>
                      <SkeuoBadge label={log.userRole} variant={log.userRole === 'ADMIN' ? 'gold' : 'metal'} />
                    </div>
                  </div>

                  {/* Action badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{log.description}</p>
                    <p className="text-[10px] text-gray-600 font-mono">{log.entityName} · {log.entityId.substring(0, 12)}{log.entityId.length > 12 ? '...' : ''}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
