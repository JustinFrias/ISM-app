import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Truck, DollarSign, FileText, Activity,
  Users, Shield, TrendingUp, AlertTriangle, PackageX, BarChart3,
  Box, LogOut, Layers, ReceiptText, ShoppingCart, Warehouse, X,
} from 'lucide-react';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '../../utils';
import { SkeuoLED } from '../skeuomorphic/SkeuoLED';
import { isClerkConfigured } from '../../services/clerk';
import { BrandLogo } from '../common/BrandLogo';

interface NavSection {
  title: string;
  items: { to: string; label: string; icon: React.ReactNode; adminOnly?: boolean; alertKey?: string }[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard size={16} />, adminOnly: true },
      { to: '/staff', label: 'Staff Dashboard', icon: <Layers size={16} /> },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { to: '/inventory', label: 'Inventory', icon: <Package size={16} /> },
      { to: '/stocks', label: 'Stock Monitoring', icon: <Warehouse size={16} /> },
      { to: '/stock-io', label: 'Stock In / Out', icon: <Box size={16} /> },
      { to: '/categories', label: 'Categories', icon: <Layers size={16} />, adminOnly: true },
      { to: '/products', label: 'Products', icon: <Package size={16} />, adminOnly: true },
      { to: '/expired', label: 'Expired Products', icon: <PackageX size={16} />, alertKey: 'expired' },
      { to: '/alerts', label: 'Stock Alerts', icon: <AlertTriangle size={16} />, alertKey: 'alerts' },
    ],
  },
  {
    title: 'Deliveries',
    items: [
      { to: '/deliveries', label: 'Delivery Reports', icon: <Truck size={16} /> },
      { to: '/add-delivery', label: 'Add Delivery', icon: <ShoppingCart size={16} /> },
      { to: '/received', label: 'Received Products', icon: <ReceiptText size={16} /> },
      { to: '/invoice', label: 'Invoices', icon: <FileText size={16} /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/profit', label: 'Profit Reports', icon: <TrendingUp size={16} />, adminOnly: true },
      { to: '/ledger', label: 'Receivables & Payables', icon: <DollarSign size={16} />, adminOnly: true },
      { to: '/expenses', label: 'Expenses', icon: <BarChart3 size={16} />, adminOnly: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/activity', label: 'Activity Logs', icon: <Activity size={16} />, adminOnly: true },
      { to: '/admin-accounts', label: 'Admin Accounts', icon: <Shield size={16} />, adminOnly: true },
      { to: '/staff-accounts', label: 'Staff Accounts', icon: <Users size={16} />, adminOnly: true },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuthStore();
  const products = useInventoryStore(s => s.products);
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const navigate = useNavigate();
  const clerk = isClerkConfigured ? useClerk() : null;

  // Reactively calculate alert counts so when stock is replenished, the badge immediately disappears
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const alerts = {
    outOfStock: products.filter(p => p.status === 'OUT_OF_STOCK').length,
    critical: products.filter(p => p.status === 'CRITICAL').length,
    expired: products.filter(p => p.status === 'EXPIRED').length,
    expiringSoon: products.filter(p => p.expiryDate && new Date(p.expiryDate) > today && new Date(p.expiryDate) <= in30Days).length,
  };

  const handleLogout = async () => {
    closeSidebar();
    if (isClerkConfigured && clerk) {
      await clerk.signOut();
    }
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-72 md:w-60 flex flex-col z-50 overflow-y-auto transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        )}
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #3d2a1f 0%, #1a120e 40%, #0d0f14 100%)',
          borderRight: '1px solid rgba(212,175,55,0.15)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.6), inset -1px 0 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Logo / Brand Header */}
        <div className="px-4 py-4 border-b border-white/08 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <p className="font-brand font-bold text-gray-100 text-xs leading-snug tracking-tight truncate">
                Inventory System
              </p>
              <p className="text-[10px] text-skeuo-gold font-medium tracking-wider uppercase font-mono">
                Management
              </p>
            </div>
          </div>

          {/* Close button on mobile phones */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/08 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-white/06 flex-shrink-0">
          <div className="flex items-center gap-3 bg-white/04 rounded-xl px-3 py-2.5 border border-white/06">
            {isClerkConfigured ? (
              <UserButton
                afterSignOutUrl="/login"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-full border border-skeuo-gold/40',
                  },
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-skeuo-gold to-skeuo-goldDark flex items-center justify-center flex-shrink-0 text-black font-bold text-xs">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-gray-200 text-xs font-semibold truncate">
                {currentUser?.fullName || 'Active User'}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-skeuo-gold font-semibold tracking-wider uppercase">
                <SkeuoLED status={currentUser?.role === 'ADMIN' ? 'amber' : 'green'} size="sm" pulse />
                {currentUser?.role || 'STAFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navSections.map(section => {
            const visibleItems = section.items.filter(
              item => !item.adminOnly || currentUser?.role === 'ADMIN'
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="px-3 mb-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-700">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin' || item.to === '/staff'}
                      onClick={closeSidebar}
                      className={({ isActive }) => cn('nav-item', isActive && 'active')}
                    >
                      {item.icon}
                      <span className="flex-1 text-[13px]">{item.label}</span>
                      {item.alertKey === 'expired' && alerts.expired > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                          {alerts.expired}
                        </span>
                      )}
                      {item.alertKey === 'alerts' && (alerts.outOfStock + alerts.critical) > 0 && (
                        <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 rounded-full">
                          {alerts.outOfStock + alerts.critical}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/06 flex-shrink-0">
          <motion.button
            whileHover={{ translateX: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full nav-item text-red-400/70 hover:text-red-400 hover:bg-red-500/08"
          >
            <LogOut size={15} />
            <span className="text-[13px]">Sign Out</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
};
